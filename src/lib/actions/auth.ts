"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8, "Senha muito curta"),
});

const LoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

export async function createToken(payload: { id: string; email: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string; iat: number };
  } catch {
    return null;
  }
}

export async function registerUser(name: string, email: string, password: string) {
  try {
    const validatedData = CreateUserSchema.parse({ name, email, password });

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Usuário já cadastrado com este e-mail.",
      };
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = await createToken({ id: user.id, email: user.email });
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user,
      token,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Erro interno do servidor",
    };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const validatedData = LoginSchema.parse({ email, password });

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return {
        success: false,
        message: "Usuário não encontrado com este e-mail.",
      };
    }

    const isPasswordValid = await verifyPassword(validatedData.password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Senha incorreta. Por favor, tente novamente.",
      };
    }

    const token = await createToken({ id: user.id, email: user.email });
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Erro interno do servidor",
    };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return { success: false, message: "Token não encontrado" };
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return { success: false, message: "Token inválido" };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    return {
      success: true,
      user: { ...user, iat: payload.iat },
    };
  } catch {
    return {
      success: false,
      message: "Erro ao verificar autenticação",
    };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  return { success: true };
}

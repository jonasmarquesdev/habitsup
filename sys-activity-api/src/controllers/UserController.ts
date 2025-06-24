import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../utils/hash";

export class UserController {
  static async postUser(request: FastifyRequest, reply: FastifyReply) {
    const CreateUserSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8, "Senha muito curta"),
    });

    const { name, email, password } = CreateUserSchema.parse(request.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply
        .status(400)
        .send({ message: "Usuário já cadastrado com este e-mail." });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return reply.status(201).send(user);
  }

  static async getUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const userPayload = request.user as { id: string; iat?: number };
      const userId = userPayload.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });
      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado." });
      }
      return reply.send({ ...user, iat: userPayload.iat });
    } catch (error) {
      return reply.status(401).send({
        message: "Token inválido ou ausente.",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  static async postLogin(request: FastifyRequest, reply: FastifyReply) {
    const LoginSchema = z.object({
      email: z.string(),
      password: z.string(),
    });

    const { email, password } = LoginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply
        .status(400)
        .send({ message: "Usuário não encontrado com este e-mail." });
    }

    const isPassword = await verifyPassword(password, user.password);

    if (!isPassword) {
      return reply
        .status(400)
        .send({ message: "Senha incorreta. Por favor, tente novamente." });
    }

    const token = await reply.jwtSign({
      id: user.id,
      email: user.email,
    });

    return reply.status(200).send({ token });
  }
}

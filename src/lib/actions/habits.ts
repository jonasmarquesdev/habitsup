"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import dayjs from "dayjs";
import { getCurrentUser } from "./auth";

export async function getHabits() {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      return { success: false, message: "Usuário não autenticado" };
    }

    if (!userResult.user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const habits = await prisma.habit.findMany({
      where: { userId: userResult.user.id },
      include: { weekDays: true },
    });

    return { success: true, habits };
  } catch {
    return { success: false, message: "Erro ao buscar hábitos" };
  }
}

export async function getDay(date: Date) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success) {
      return { success: false, message: "Usuário não autenticado" };
    }

    if (!userResult.user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const userId = userResult.user.id;
    const parsedDate = dayjs(date).startOf("day");
    const weekDay = parsedDate.get("day");

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: { lte: date },
        weekDays: { some: { week_day: weekDay } },
        userId,
      },
    });

    const day = await prisma.day.findUnique({
      where: { date_userId: { date: parsedDate.toDate(), userId } },
      include: { dayHabits: true },
    });

    const completedHabits = day?.dayHabits.map((dh: { habit_id: string }) => dh.habit_id) ?? [];

    return { 
      success: true, 
      data: { possibleHabits, completedHabits } 
    };
  } catch {
    return { success: false, message: "Erro ao buscar dia" };
  }
}

export async function createHabit(title: string, weekDays: number[]) {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const createHabitSchema = z.object({
      title: z.string().min(1, "Título é obrigatório"),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    if (!userResult.user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const validatedData = createHabitSchema.parse({ title, weekDays });
    const userId = userResult.user.id;
    const today = dayjs().startOf("day").toDate();

    let day = await prisma.day.findUnique({
      where: { date_userId: { date: today, userId } },
    });

    if (!day) {
      day = await prisma.day.create({
        data: { date: today, userId },
      });
    }

    const habit = await prisma.habit.create({
      data: {
        title: validatedData.title,
        created_at: today,
        userId,
        weekDays: {
          create: validatedData.weekDays.map((weekDay) => ({ week_day: weekDay })),
        },
      },
    });

    return { success: true, habit };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: "Erro ao criar hábito" };
  }
}

export async function toggleHabit(habitId: string) {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const toggleHabitSchema = z.object({
      habitId: z.string().uuid("ID do hábito inválido"),
    });

    if (!userResult.user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const validatedData = toggleHabitSchema.parse({ habitId });
    const userId = userResult.user.id;
    const today = dayjs().startOf("day").toDate();

    let day = await prisma.day.findUnique({
      where: { date_userId: { date: today, userId } },
    });

    if (!day) {
      day = await prisma.day.create({
        data: { date: today, userId },
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: { day_id: day.id, habit_id: validatedData.habitId },
      },
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({ where: { id: dayHabit.id } });
    } else {
      await prisma.dayHabit.create({
        data: { day_id: day.id, habit_id: validatedData.habitId },
      });
    }

    return { success: true };
  } catch {
    return { success: false, message: "Erro ao alternar hábito" };
  }
}

export async function getSummary() {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      return { success: false, message: "Usuário não autenticado" };
    }

    if (!userResult.user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const userId = userResult.user.id;

    const summary = await prisma.$queryRaw`
      SELECT 
        D.id,
        D.date,
        (
          SELECT cast(count(*) as float)
          FROM day_habits DH
          JOIN habits H ON H.id = DH.habit_id
          WHERE DH.day_id = D.id AND H."userId" = ${userId}
        ) as completed,
        (
          SELECT cast(count(*) as float)
          FROM habit_week_days HWD
          JOIN habits H ON H.id = HWD.habit_id
          WHERE 
            HWD.week_day = CAST(EXTRACT(DOW FROM D.date) AS INT)
            AND DATE(H.created_at) <= DATE(D.date)
            AND H."userId" = ${userId}
        ) as amount
      FROM days D
      WHERE D."userId" = ${userId}
      ORDER BY D.date
    `;

    return { success: true, data: summary };
  } catch {
    return { success: false, message: "Erro ao buscar resumo" };
  }
}

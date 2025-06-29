"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import dayjs from "@/lib/dayjs";
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
      orderBy: { title: 'asc' },
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
    const parsedDate = dayjs(date).utc().startOf("day");
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
    const today = dayjs().utc().startOf("day").toDate();

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

    // Buscar todos os dias existentes do usuário
    const existingDays = await prisma.day.findMany({
      where: { 
        userId,
        date: { gte: today } // Só considerar dias a partir de hoje
      }
    });

    // Criar DailyHabitAvailability para os dias que correspondem aos weekDays
    const availabilityRecords = existingDays
      .filter(day => {
        const dayWeekDay = dayjs(day.date).utc().get('day');
        return validatedData.weekDays.includes(dayWeekDay);
      })
      .map(day => ({
        day_id: day.id,
        habit_id: habit.id
      }));

    if (availabilityRecords.length > 0) {
      await prisma.dailyHabitAvailability.createMany({
        data: availabilityRecords,
        skipDuplicates: true // Evita erros se já existirem registros
      });
    }

    return { success: true, habit };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: `Erro ao criar hábito: ${error}` };
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
    const today = dayjs().utc().startOf("day").toDate();

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
        COALESCE(CAST(COUNT(DISTINCT DH.id) AS FLOAT), 0) as completed,
        COALESCE(CAST(COUNT(DISTINCT DHA.id) AS FLOAT), 0) as amount
      FROM days D
      LEFT JOIN day_habits DH ON DH.day_id = D.id
      LEFT JOIN daily_habit_availability DHA ON DHA.day_id = D.id
      WHERE D."userId" = ${userId}
      GROUP BY D.id, D.date
      ORDER BY D.date
    `;

    return { success: true, data: summary };
  } catch {
    return { success: false, message: "Erro ao buscar resumo" };
  }
}

export async function deleteHabit(habitId: string) {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      return { success: false, message: "Usuário não autenticado" };
    }

    if (!userResult.user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const deleteHabitSchema = z.object({
      habitId: z.string().uuid("ID do hábito inválido"),
    });

    const validatedData = deleteHabitSchema.parse({ habitId });
    const userId = userResult.user.id;

    // Verificar se o hábito pertence ao usuário
    const habit = await prisma.habit.findFirst({
      where: {
        id: validatedData.habitId,
        userId: userId,
      },
    });

    if (!habit) {
      return { success: false, message: "Hábito não encontrado" };
    }

    // Excluir registros relacionados primeiro para evitar violação de constraint
    await prisma.$transaction(async (tx) => {
      // Excluir daily habit availability
      await tx.dailyHabitAvailability.deleteMany({
        where: { habit_id: validatedData.habitId },
      });

      // Excluir day habits
      await tx.dayHabit.deleteMany({
        where: { habit_id: validatedData.habitId },
      });

      // Excluir week days
      await tx.habitWeekDays.deleteMany({
        where: { habit_id: validatedData.habitId },
      });

      // Finalmente excluir o hábito
      await tx.habit.delete({
        where: { id: validatedData.habitId },
      });
    });

    return { success: true, message: "Hábito excluído com sucesso" };
  } catch (error) {
    console.error("Erro ao excluir hábito:", error);
    return { success: false, message: "Erro ao excluir hábito" };
  }
}

export async function syncAllDailyHabitAvailability() {
  try {
    const userResult = await getCurrentUser();
    if (!userResult.success) {
      return { success: false, message: "Usuário não autenticado" };
    }

    if (!userResult.user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const userId = userResult.user.id;
    const today = dayjs().utc().startOf("day").toDate();

    // Buscar todos os hábitos do usuário
    const userHabits = await prisma.habit.findMany({
      where: { userId },
      include: { weekDays: true },
    });

    // Buscar todos os dias do usuário a partir de hoje
    const existingDays = await prisma.day.findMany({
      where: { 
        userId,
        date: { gte: today }
      }
    });

    // Criar todos os registros de availability necessários
    const allAvailabilityRecords = [];

    for (const habit of userHabits) {
      const habitWeekDays = habit.weekDays.map(wd => wd.week_day);
      
      for (const day of existingDays) {
        // Só criar se o hábito foi criado antes ou no mesmo dia
        if (habit.created_at <= day.date) {
          const dayWeekDay = dayjs(day.date).utc().get('day');
          
          if (habitWeekDays.includes(dayWeekDay)) {
            allAvailabilityRecords.push({
              day_id: day.id,
              habit_id: habit.id
            });
          }
        }
      }
    }

    if (allAvailabilityRecords.length > 0) {
      await prisma.dailyHabitAvailability.createMany({
        data: allAvailabilityRecords,
        skipDuplicates: true
      });
    }

    return { 
      success: true, 
      message: `Sincronizados ${allAvailabilityRecords.length} registros de availability` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Erro ao sincronizar availability: ${error}` 
    };
  }
}

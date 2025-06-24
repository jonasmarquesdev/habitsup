import { FastifyReply, FastifyRequest } from "fastify";
import dayjs from "dayjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export class HabitController {
  static async getHabits(request: FastifyRequest, reply: FastifyReply) {
    const habits = await prisma.habit.findMany();
    return reply.send(habits);
  }

  static async getDay(request: FastifyRequest, reply: FastifyReply) {
    const getDayParams = z.object({
      date: z.coerce.date(),
      userId: z.string().uuid(),
    });
    const { date, userId } = getDayParams.parse(request.query);

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

    const completedHabits = day?.dayHabits.map((dh) => dh.habit_id) ?? [];

    return reply.send({ possibleHabits, completedHabits });
  }

  static async postHabit(request: FastifyRequest, reply: FastifyReply) {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
      userId: z.string().uuid(),
    });
    const { title, weekDays, userId } = createHabitBody.parse(request.body);

    const today = dayjs().startOf("day").toDate();

    let day = await prisma.day.findUnique({
      where: { date_userId: { date: today, userId } },
    });

    if (!day) {
      day = await prisma.day.create({
        data: { date: today, userId },
      });
    }

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        userId,
        weekDays: {
          create: weekDays.map((weekDay) => ({ week_day: weekDay })),
        },
      },
    });

    return reply.status(201).send();
  }

  static async toggleHabit(request: FastifyRequest, reply: FastifyReply) {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
    });
    const { id, userId } = toggleHabitParams.parse(request.params);

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
        day_id_habit_id: { day_id: day.id, habit_id: id },
      },
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({ where: { id: dayHabit.id } });
    } else {
      await prisma.dayHabit.create({
        data: { day_id: day.id, habit_id: id },
      });
    }

    return reply.send();
  }

  static async getSummary(request: FastifyRequest, reply: FastifyReply) {
    const getSummaryQuery = z.object({
      userId: z.string().uuid(),
    });
    const { userId } = getSummaryQuery.parse(request.query);

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
          AND H.created_at::date <= D.date::date
          AND H."userId" = ${userId}
      ) as amount
    FROM days D
    WHERE D."userId" = ${userId}
    ORDER BY D.date
  `;
    return reply.send(summary);
  }
}

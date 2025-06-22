import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function getSummaryRoute(app: FastifyInstance) {
  app.get("/summary", async () => {
    const summary = await prisma.$queryRaw`
        SELECT
            D.id,
            D.date,
            (
            SELECT COUNT(*)::float
            FROM day_habits DH
            WHERE DH.day_id = D.id
            ) AS completed,
            (
            SELECT COUNT(*)::float
            FROM habit_week_days HWD
            JOIN habits H ON H.id = HWD.habit_id
            WHERE
                HWD.week_day = EXTRACT(DOW FROM D.date)::int
                AND H.created_at <= D.date
            ) AS amount
        FROM days D;
    `;

    return summary;
  });
}

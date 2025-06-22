import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function getSummaryRoute(app: FastifyInstance) {
  app.get("/summary", async () => {
    const summary = await prisma.$queryRaw`
        SELECT 
            D.id,
            D.date,
            (
                SELECT 
                    cast(count(*) as float)
                FROM day_habits DH
                WHERE DH.day_id = D.id
            ) as completed,
            (
                SELECT 
                    cast(count(*) as float)
                FROM habit_week_days HWD
                JOIN habits H
                    ON H.id = HWD.habit_id
        WHERE 
            HWD.week_day = CAST(EXTRACT(DOW FROM D.date) AS INT)
            AND H.created_at::date <= D.date::date
        ) as amount
        FROM days D
    `;

    return summary;
  });
}

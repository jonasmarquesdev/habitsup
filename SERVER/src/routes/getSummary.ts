import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function getSummaryRoute(app: FastifyInstance) {
  app.get("/summary", async () => {
    const summary = await prisma.$queryRawUnsafe(`
      WITH dates AS (
        SELECT generate_series(
          date_trunc('year', current_date)::date,
          current_date,
          interval '1 day'
        ) AS date
      )
      SELECT
        dates.date,
        (
          SELECT CAST(COUNT(*) AS FLOAT)
          FROM day_habits dh
          JOIN days d ON d.id = dh.day_id
          WHERE d.date = dates.date
        ) AS completed,
        (
          SELECT CAST(COUNT(*) AS FLOAT)
          FROM habit_week_days hwd
          JOIN habits h ON h.id = hwd.habit_id
          WHERE hwd.week_day = EXTRACT(DOW FROM dates.date)::INT
            AND h.created_at <= dates.date
        ) AS amount
      FROM dates
      ORDER BY dates.date;
    `);

    return summary;
  });
}

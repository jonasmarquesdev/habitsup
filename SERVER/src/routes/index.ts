import { FastifyInstance } from "fastify";
import { getHabitsRoute } from "./getHabits";
import { getDayRoute } from "./getDay";
import { postHabitRoute } from "./postHabit";
import { toggleHabitRoute } from "./toggleHabit";
import { getSummaryRoute } from "./getSummary";

export async function appRoutes(app: FastifyInstance) {
  await getHabitsRoute(app);
  await getDayRoute(app);
  await postHabitRoute(app);
  await toggleHabitRoute(app);
  await getSummaryRoute(app);
}
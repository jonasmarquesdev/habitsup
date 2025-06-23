import { FastifyInstance } from "fastify";
import { HabitController } from "../controllers/HabitController";

export async function appRoutes(app: FastifyInstance) {
  app.get("/habits", HabitController.getHabits);
  app.get("/day", HabitController.getDay);
  app.post("/habits", HabitController.postHabit);
  app.patch("/habits/:id/toggle", HabitController.toggleHabit);
  app.get("/summary", HabitController.getSummary);
}
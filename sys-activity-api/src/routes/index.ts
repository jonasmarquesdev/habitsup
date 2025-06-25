import { FastifyInstance } from "fastify";
import { HabitController } from "../controllers/HabitController";
import { UserController } from "../controllers/UserController";

export async function appRoutes(app: FastifyInstance) {
  app.post("/user", UserController.postUser);
  app.get("/user", UserController.getUser);
  app.post("/login", UserController.postLogin);
  app.get("/habits", HabitController.getHabits);
  app.get("/day", HabitController.getDay);
  app.post("/habits", HabitController.postHabit);
  app.patch("/habits/:id/toggle/:userId", HabitController.toggleHabit);
  app.get("/summary", HabitController.getSummary);
  app.get("/users/:userId/habits", HabitController.getHabitsByUserId);
}

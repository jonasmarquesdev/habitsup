import Fastify from "fastify";
import cors from "@fastify/cors";
import { appRoutes } from "./routes";

const app = Fastify();

app.register(cors, {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allow PATCH and others
});
app.register(appRoutes);

app
  .listen({
    port: 3030,
  })
  .then(() => {
    console.clear();
    console.log("HTTP server running!");
    console.log("Server is running on http://localhost:3030");
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });

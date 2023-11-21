import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/UserController";

export async function usersRoutes(app: FastifyInstance) {
    app.post("/users", UserController.cadastrar);
    app.get("/users", UserController.listar);
    // app.get("/users/:email", UserController.listarPorEmail);
}
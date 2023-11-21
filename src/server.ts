import fastify from "fastify";
import { pedidosRoutes } from "./routes/pedidos";
import { usersRoutes } from "./routes/user";
// import  routes  from './routes/users';
import cors from "@fastify/cors";


const server = fastify();

server.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

const options = {
  port: 3333,
};

// server.register(usersRoutes);
// server.register(pedidosRoutes);

server.register((usersRoutes));
server.register((pedidosRoutes));

const start = async () => {
  server.listen(options.port);
  console.log("Server listening on port 3333");
};

start();

import { FastifyInstance } from 'fastify';
import { PedidosController } from '../controllers/PedidosController';

export async function pedidosRoutes(app: FastifyInstance) {
    app.post('/pedidos', PedidosController.cadastrar);
    app.get('/pedidos', PedidosController.listar);
    app.get('/pedidos/:usuario_id', PedidosController.ListarPorUsuario);
}
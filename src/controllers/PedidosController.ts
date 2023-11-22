import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db/dbConnect";

interface PedidoReal {
  id: number;
  email: string;
  title: string;
  price: number;
  quantidade: number;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY,
      email TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY,
      id_usuario INTEGER,
      title TEXT,
      price INTEGER,
      quantidade INTEGER,
      FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
    )
  `);
}

createTables();

export class PedidosController {
  static async cadastrar(req: FastifyRequest, res: FastifyReply) {
    try {
      const body = req.body as PedidoReal[];
      console.log(body)

      db.serialize(async () => {
        db.run("BEGIN TRANSACTION");

        for (const item of body) {
          const { title, price, quantidade, email } = item;

          const existingUser = await new Promise<any | null>((resolve, reject) => {
            db.get(
              `SELECT * FROM usuarios WHERE email = ?`,
              [email],
              (err, row) => {
                if (err) {
                  reject(err);
                }
                resolve(row);
              }
            );
          });

          if (!existingUser) {
            console.log(`Usuário não encontrado para o email ${email}`);
            // Trate como necessário, por exemplo, envie uma resposta para o cliente
            continue; // Pule para a próxima iteração do loop
          }

          const userId = existingUser.id as number;

          db.run(
            "INSERT INTO pedidos (id_usuario, title, price, quantidade) VALUES (?, ?, ?, ?)",
            [userId, title, price, quantidade],
            (err) => {
              if (err) {
                console.error("Erro ao inserir na tabela pedidos:", err);
                res.status(500).send({ error: "Erro interno do servidor ao cadastrar pedido" });
              }
            }
          );
        }

        db.run("COMMIT");
      });

      res.send(req.body);
    } catch (error) {
      console.error("Erro ao cadastrar pedido:", error);
      res.status(500).send({ error: "Erro interno do servidor ao cadastrar pedido" });
    }
  }


  static async listar(req: FastifyRequest, res: FastifyReply) {
    try {
      const rows: any[] = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM pedidos", (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        });
      });

      const pedidos = rows.map((row) => {
        return {
          id: row.id,
          title: row.title,
          price: row.price,
          quantidade: row.quantidade,
        };
      });

      res.send(pedidos);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res
        .status(500)
        .send({ error: "Erro interno do servidor ao listar usuários" });
    }
  }

  static async ListarPorUsuario(req: FastifyRequest, res: FastifyReply) {
    try {
      const { usuario_id } = req.params as { usuario_id: string };
      console.log(usuario_id);

      // Retorna a lista de usuários simulada
      const rows: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT * FROM pedidos WHERE usuario_id = ?",
          [usuario_id],
          (err, rows) => {
            if (err) {
              reject(err);
            }
            resolve(rows);
          }
        );
      });

      const usuarios = rows.map((row) => {
        return {
          nome: row.nome,
          endereco: row.endereco,
          lanche: {
            nome: row.lanche_nome,
            preco: row.lanche_preco,
            quantidade: row.lanche_quantidade,
          },
          bebida: {
            nome: row.bebida_nome,
            preco: row.bebida_preco,
            quantidade: row.bebida_quantidade,
          },
        };
      });

      res.send(usuarios);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).send({
        error: "Erro interno do servidor ao listar usuários por e-mail",
      });
    }
  }
}

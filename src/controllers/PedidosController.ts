import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db/dbConnect";

interface Lanche {
  nome: string;
  preco: number;
  quantidade: number;
}

interface Bebida {
  nome: string;
  preco: number;
  quantidade: number;
}

interface Pedido {
  lanche: Lanche;
  bebida: Bebida;
}

interface User {
  nome: string;
  email: string;
  endereco: string;
  pedido: Pedido | Pedido[]; // Pode ser um único pedido ou uma matriz de pedidos
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT,
      endereco TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      nome TEXT,
      endereco TEXT,
      lanche_nome TEXT,
      lanche_preco REAL,
      lanche_quantidade INTEGER,
      bebida_nome TEXT,
      bebida_preco REAL,
      bebida_quantidade INTEGER,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
  `);
}

createTables();

export class PedidosController {
  static async cadastrar(req: FastifyRequest, res: FastifyReply) {
    try {
      const body = req.body as User;

      const { nome, email, endereco, pedido } = body;

      const existingUser = await new Promise<any | null>((resolve, reject) => {
        db.get(
          "SELECT * FROM usuarios WHERE email = ?",
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
        return res.status(400).send({ error: "Usuário não cadastrado." });
      }

        //promessa de que vai retornar um número, no caso dessa função, o id do usuário
        const usuarioId = existingUser.id as number;
        if (!Array.isArray(pedido)) {
          db.run(
            "INSERT INTO pedidos (usuario_id, nome, endereco, lanche_nome, lanche_preco, lanche_quantidade, bebida_nome, bebida_preco, bebida_quantidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              usuarioId,
              nome,
              endereco,
              pedido.lanche.nome,
              pedido.lanche.preco,
              pedido.lanche.quantidade,
              pedido.bebida.nome,
              pedido.bebida.preco,
              pedido.bebida.quantidade,
            ]
          );
        } else {
          for (const item of pedido) {
            db.run(
              "INSERT INTO pedidos (usuario_id, nome, endereco, lanche_nome, lanche_preco, lanche_quantidade, bebida_nome, bebida_preco, bebida_quantidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                usuarioId,
                nome,
                endereco,
                item.lanche.nome,
                item.lanche.preco,
                item.lanche.quantidade,
                item.bebida.nome,
                item.bebida.preco,
                item.bebida.quantidade,
              ]
            );
          }
        }
      res.send(req.body);
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      res
        .status(500)
        .send({ error: "Erro interno do servidor ao cadastrar usuário" });
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
          id: row.usuario_id,
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
          }
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
          }
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

import {FastifyRequest, FastifyReply} from "fastify";
import {db} from "../db/dbConnect";

interface User {
    email: string;
    nome: string;
};

function createTables() {
    db.run (`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT
        )
    `);
}

createTables();

export class UserController {
    static async cadastrar(req: FastifyRequest, res: FastifyReply) {
        try {
            const body = req.body as User[];
            const {email, nome} = body[0];

            console.log("usuario:", body[0]);

            const existingUser = await new Promise((resolve, reject) => {
                db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row);
                });
            })

            if(existingUser){
                res.status(400).send("Usuário já cadastrado");
            } else {
                db.run(`INSERT INTO usuarios (nome, email) VALUES (?, ?)`, [nome, email]);
                res.status(201).send("Usuário cadastrado com sucesso");
            }

        }catch {
            res.status(500).send("Erro interno");
        }
    }
    static async listar(req: FastifyRequest, res: FastifyReply) {
        try{
            const users = await new Promise((resolve, reject) => {
                db.all(`SELECT * FROM usuarios`, (err, rows) => {
                    if(err){
                        reject(err);
                    }
                    resolve(rows);
                });
            });
            res.send(users);
        } catch {
            res.status(500).send("Erro interno");
        }
    }
}
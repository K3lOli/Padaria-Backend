import sqlite3 from "sqlite3";

export const db = new sqlite3.Database(
    "./src/controllers/user.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) return console.error(err.message);
    }
);

//para usar o db no model de users é só importar o db e usar o db.run, db.get, db.all, db.each
//o db.run é para inserir, db.get é para pegar um registro, db.all é para pegar todos os registros, db.each é para pegar cada registro
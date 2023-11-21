import moongose from 'mongoose';
import {db} from '../db/dbConnect';

//para usar o db no model de users é só importar o db e usar o db.run, db.get, db.all, db.each

const Schema = new moongose.Schema({
    id: {type: moongose.Schema.Types.ObjectId},
    name: {type: String, required: true},
    email: {type: String, required: true},
    endereço: {type: String, required: true},
},{ versionKey: false });

export const usuario = moongose.model('usuario', Schema);


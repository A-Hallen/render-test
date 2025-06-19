"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicadoresContablesRepository = void 0;
const base_firebaseRepository_1 = require("../../base/base.firebaseRepository");
// Eliminamos la importaciu00f3n problemu00e1tica
class IndicadoresContablesRepository extends base_firebaseRepository_1.BaseFirebaseRepository {
    constructor() {
        super("Indicadores");
    }
    async crear(data) {
        console.log("creando indicador contable", data);
        const docRef = this.collection.doc();
        data.id = docRef.id;
        await docRef.set(data);
        return data;
    }
}
exports.IndicadoresContablesRepository = IndicadoresContablesRepository;

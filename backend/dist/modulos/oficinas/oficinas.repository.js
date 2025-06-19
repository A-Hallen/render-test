"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OficinasRepository = void 0;
const base_firebaseRepository_1 = require("../../base/base.firebaseRepository");
class OficinasRepository extends base_firebaseRepository_1.BaseFirebaseRepository {
    constructor() {
        super('oficinas');
    }
    /**
     * Método mantenido para compatibilidad con código existente
     * Obtiene todas las oficinas desde Firebase
     */
    async obtenerTodas() {
        return this.obtenerTodos();
    }
}
exports.OficinasRepository = OficinasRepository;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OficinaService = void 0;
const oficinas_repository_1 = require("./oficinas.repository");
class OficinaService {
    constructor() {
        this.oficinasRepository = new oficinas_repository_1.OficinasRepository();
    }
    async obtenerTodas() {
        const oficinas = await this.oficinasRepository.obtenerTodas();
        return {
            oficinas: oficinas
        };
    }
}
exports.OficinaService = OficinaService;

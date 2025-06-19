"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CooperativaService = void 0;
const cooperativa_repository_1 = require("./cooperativa.repository");
class CooperativaService {
    constructor() {
        this.repository = cooperativa_repository_1.CooperativaRepository.getInstance();
    }
    static getInstance() {
        if (!CooperativaService.instance) {
            CooperativaService.instance = new CooperativaService();
        }
        return CooperativaService.instance;
    }
    /**
     * Obtiene la información de la cooperativa
     */
    async obtenerCooperativa() {
        return await this.repository.obtenerCooperativa();
    }
    /**
     * Actualiza la información de la cooperativa
     * @param data Datos a actualizar
     */
    async actualizarCooperativa(data) {
        return await this.repository.actualizarCooperativa(data);
    }
    /**
     * Crea la información de la cooperativa
     * @param data Datos a crear
     */
    async crearCooperativa(data) {
        return await this.repository.crear(data);
    }
}
exports.CooperativaService = CooperativaService;

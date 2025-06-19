"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicadoresContablesService = void 0;
const indicadores_contables_repository_1 = require("./indicadores-contables.repository");
class IndicadoresContablesService {
    constructor() {
        this.indicadoresContablesRepository = new indicadores_contables_repository_1.IndicadoresContablesRepository();
    }
    // Obtener todos los indicadores contables
    async obtenerTodos() {
        console.log('[service] Obteniendo todos los indicadores contables...');
        const indicadores = await this.indicadoresContablesRepository.obtenerTodos();
        return indicadores;
    }
    // Obtener un indicador contable por ID
    async obtenerPorId(id) {
        return await this.indicadoresContablesRepository.obtenerPorId(id);
    }
    // Crear un nuevo indicador contable
    async crear(indicador) {
        return await this.indicadoresContablesRepository.crear(indicador);
    }
    // Actualizar un indicador contable existente
    async actualizar(id, datosActualizados) {
        return await this.indicadoresContablesRepository.actualizar(id, datosActualizados);
    }
    // Eliminar un indicador contable
    async eliminar(id) {
        return await this.indicadoresContablesRepository.eliminar(id);
    }
}
exports.IndicadoresContablesService = IndicadoresContablesService;

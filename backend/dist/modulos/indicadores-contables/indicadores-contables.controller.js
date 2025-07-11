"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicadoresContablesController = void 0;
const indicadores_contables_service_1 = require("./indicadores-contables.service");
class IndicadoresContablesController {
    constructor() {
        this.indicadoresContablesService = new indicadores_contables_service_1.IndicadoresContablesService();
    }
    // Obtener todos los indicadores contables
    async obtenerIndicadores(req, res) {
        try {
            console.log('[controller] Obteniendo todos los indicadores contables...');
            const indicadores = await this.indicadoresContablesService.obtenerTodos();
            res.status(200).json(indicadores);
        }
        catch (error) {
            console.error("[controller] Error al obtener los indicadores contables:", error);
            res.status(500).json({ message: 'Error al obtener los indicadores contables', error });
        }
    }
    // Obtener un indicador contable por ID
    async obtenerIndicadorPorId(req, res) {
        try {
            const { id } = req.params;
            const indicador = await this.indicadoresContablesService.obtenerPorId(id);
            if (!indicador) {
                res.status(404).json({ message: 'Indicador contable no encontrado' });
            }
            else {
                res.status(200).json(indicador);
            }
        }
        catch (error) {
            res.status(500).json({ message: 'Error al obtener el indicador contable', error });
        }
    }
    // Crear un nuevo indicador contable
    async crearIndicador(req, res) {
        try {
            const nuevoIndicador = req.body;
            const indicadorCreado = await this.indicadoresContablesService.crear(nuevoIndicador);
            res.status(201).json(indicadorCreado);
        }
        catch (error) {
            res.status(500).json({ message: 'Error al crear el indicador contable', error });
        }
    }
    // Actualizar un indicador contable existente
    async actualizarIndicador(req, res) {
        try {
            const { id } = req.params;
            console.log("indicador contable a actualizar", id);
            const datosActualizados = req.body;
            console.log("datos actualizados", datosActualizados);
            const indicadorActualizado = await this.indicadoresContablesService.actualizar(id, datosActualizados);
            console.log("indicador contable actualizado", indicadorActualizado);
            if (!indicadorActualizado) {
                res.status(404).json({ message: 'Indicador contable no encontrado' });
            }
            else {
                res.status(200).json(indicadorActualizado);
            }
        }
        catch (error) {
            res.status(500).json({ message: 'Error al actualizar el indicador contable', error });
        }
    }
    // Eliminar un indicador contable
    async eliminarIndicador(req, res) {
        try {
            const { id } = req.params;
            const indicadorEliminado = await this.indicadoresContablesService.eliminar(id);
            if (!indicadorEliminado) {
                res.status(404).json({ message: 'Indicador contable no encontrado' });
            }
            else {
                res.status(200).json({ message: 'Indicador contable eliminado correctamente' });
            }
        }
        catch (error) {
            res.status(500).json({ message: 'Error al eliminar el indicador contable', error });
        }
    }
}
exports.IndicadoresContablesController = IndicadoresContablesController;

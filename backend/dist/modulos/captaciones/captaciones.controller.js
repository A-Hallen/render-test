"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptacionesController = void 0;
const captaciones_service_1 = require("./captaciones.service");
class CaptacionesController {
    constructor() {
        this.captacionesService = new captaciones_service_1.CaptacionesService();
    }
    /**
     * Obtiene la información de captaciones a la vista
     * @param req Request de Express
     * @param res Response de Express
     */
    async obtenerCaptacionesVista(req, res) {
        try {
            const codigoOficina = req.query.oficina;
            console.log(`[CaptacionesController] Procesando solicitud de captaciones a la vista para oficina: ${codigoOficina}`);
            const resultado = await this.captacionesService.obtenerCaptacionesVista(codigoOficina);
            res.status(200).json(resultado);
        }
        catch (error) {
            console.error(`[CaptacionesController] Error: ${error.message}`);
            res.status(500).json({
                captacionActual: {
                    fecha: new Date().toISOString().split('T')[0],
                    monto: 0,
                    tipoCaptacion: 'vista',
                    codigoCuenta: '2101'
                },
                mensaje: `Error al obtener información de captaciones a la vista: ${error.message}`
            });
        }
    }
    /**
     * Obtiene la información de captaciones a plazo
     * @param req Request de Express
     * @param res Response de Express
     */
    async obtenerCaptacionesPlazo(req, res) {
        try {
            const codigoOficina = req.query.oficina;
            console.log(`[CaptacionesController] Procesando solicitud de captaciones a plazo para oficina: ${codigoOficina}`);
            const resultado = await this.captacionesService.obtenerCaptacionesPlazo(codigoOficina);
            res.status(200).json(resultado);
        }
        catch (error) {
            console.error(`[CaptacionesController] Error: ${error.message}`);
            res.status(500).json({
                captacionActual: {
                    fecha: new Date().toISOString().split('T')[0],
                    monto: 0,
                    tipoCaptacion: 'plazo',
                    codigoCuenta: '2103'
                },
                mensaje: `Error al obtener información de captaciones a plazo: ${error.message}`
            });
        }
    }
}
exports.CaptacionesController = CaptacionesController;

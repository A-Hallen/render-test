"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarteraCreditoController = void 0;
const cartera_credito_service_1 = require("./cartera-credito.service");
class CarteraCreditoController {
    constructor() {
        this.carteraCreditoService = new cartera_credito_service_1.CarteraCreditoService();
    }
    /**
     * Obtiene la información de la cartera de crédito actual
     * @param req Request de Express
     * @param res Response de Express
     */
    async obtenerCarteraCredito(req, res) {
        try {
            const codigoOficina = req.query.oficina;
            console.log(`[CarteraCreditoController] Procesando solicitud de cartera de crédito para oficina: ${codigoOficina}`);
            const resultado = await this.carteraCreditoService.obtenerCarteraCredito(codigoOficina);
            res.status(200).json(resultado);
        }
        catch (error) {
            console.error(`[CarteraCreditoController] Error: ${error.message}`);
            res.status(500).json({
                carteraActual: {
                    fecha: new Date().toISOString().split('T')[0],
                    monto: 0
                },
                mensaje: `Error al obtener información de cartera de crédito: ${error.message}`
            });
        }
    }
}
exports.CarteraCreditoController = CarteraCreditoController;

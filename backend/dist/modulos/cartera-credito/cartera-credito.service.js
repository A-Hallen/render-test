"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarteraCreditoService = void 0;
const cartera_credito_repository_1 = require("./cartera-credito.repository");
class CarteraCreditoService {
    constructor() {
        this.carteraCreditoRepository = new cartera_credito_repository_1.CarteraCreditoRepository();
    }
    /**
     * Obtiene la información de la cartera de crédito actual
     * @param codigoOficina Código de la oficina para la cual obtener los datos ('CNS' para todas)
     * @returns Objeto con la información de la cartera de crédito
     */
    async obtenerCarteraCredito(codigoOficina) {
        try {
            console.log('[CarteraCreditoService] Obteniendo información de cartera de crédito');
            const cartera = await this.carteraCreditoRepository.obtenerCarteraCredito(codigoOficina);
            if (!cartera) {
                console.log('[CarteraCreditoService] No se encontró información de cartera de crédito');
                return {
                    carteraActual: {
                        fecha: new Date().toISOString().split('T')[0],
                        monto: 0
                    },
                    mensaje: 'No se encontraron datos de cartera de crédito'
                };
            }
            console.log(`[CarteraCreditoService] Cartera obtenida: ${JSON.stringify(cartera)}`);
            return {
                carteraActual: cartera,
                mensaje: 'Información de cartera de crédito obtenida correctamente'
            };
        }
        catch (error) {
            console.error(`[CarteraCreditoService] Error al obtener cartera de crédito: ${error.message}`);
            return {
                carteraActual: {
                    fecha: new Date().toISOString().split('T')[0],
                    monto: 0
                },
                mensaje: `Error al obtener información de cartera de crédito: ${error.message}`
            };
        }
    }
}
exports.CarteraCreditoService = CarteraCreditoService;

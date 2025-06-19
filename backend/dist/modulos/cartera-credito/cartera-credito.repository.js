"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarteraCreditoRepository = void 0;
const saldos_base_repository_1 = require("../common/saldos-base.repository");
class CarteraCreditoRepository extends saldos_base_repository_1.SaldosBaseRepository {
    constructor() {
        super();
        this.CODIGO_CUENTA_CARTERA = '14'; // Código de cuenta contable para cartera de crédito
    }
    /**
     * Obtiene los saldos de la cartera de crédito para los últimos dos meses disponibles
     * @param codigoOficina Código de la oficina para la cual obtener los datos
     * @returns Objeto con la información de la cartera de crédito actual y su variación
     */
    async obtenerCarteraCredito(codigoOficina) {
        try {
            // Utilizar el método de la clase base para obtener los saldos
            const resultado = await this.obtenerSaldosContables(codigoOficina, [this.CODIGO_CUENTA_CARTERA], 'CarteraCreditoRepository');
            // Si no hay resultados, devolver null
            if (!resultado) {
                return null;
            }
            // Devolver el resultado con el tipo CarteraCredito
            return resultado;
        }
        catch (error) {
            console.error('[CarteraCreditoRepository] Error al obtener cartera de crédito:', error);
            throw error;
        }
    }
}
exports.CarteraCreditoRepository = CarteraCreditoRepository;

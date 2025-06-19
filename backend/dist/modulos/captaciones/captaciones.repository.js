"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptacionesRepository = void 0;
const saldos_base_repository_1 = require("../common/saldos-base.repository");
class CaptacionesRepository extends saldos_base_repository_1.SaldosBaseRepository {
    constructor() {
        super();
        this.CODIGO_CUENTA_VISTA = '2101'; // Código de cuenta contable para captaciones a la vista
        this.CODIGO_CUENTA_PLAZO = '2103'; // Código de cuenta contable para captaciones a plazo
    }
    /**
     * Obtiene los saldos de captaciones para los últimos dos meses disponibles
     * @param codigoOficina Código de la oficina para la cual obtener los datos
     * @param tipoCaptacion Tipo de captación ('vista' o 'plazo')
     * @returns Objeto con la información de captaciones actual y su variación
     */
    async obtenerCaptaciones(codigoOficina, tipoCaptacion) {
        try {
            const codigoCuenta = tipoCaptacion === 'vista' ? this.CODIGO_CUENTA_VISTA : this.CODIGO_CUENTA_PLAZO;
            console.log(`[CaptacionesRepository] Obteniendo datos de captaciones ${tipoCaptacion} (cuenta ${codigoCuenta})`);
            // Utilizar el método de la clase base para obtener los saldos
            const resultado = await this.obtenerSaldosContables(codigoOficina, [codigoCuenta], 'CaptacionesRepository');
            // Si no hay resultados, devolver null
            if (!resultado) {
                return null;
            }
            // Devolver el resultado con el tipo Captacion
            return resultado;
        }
        catch (error) {
            console.error(`[CaptacionesRepository] Error al obtener captaciones ${tipoCaptacion}:`, error);
            throw error;
        }
    }
}
exports.CaptacionesRepository = CaptacionesRepository;

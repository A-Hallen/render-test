"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuentasContablesService = void 0;
const cuentas_contables_repository_1 = require("./cuentas-contables.repository");
/**
 * Servicio para gestionar las cuentas contables
 * Proporciona una capa de abstracción sobre el repositorio
 */
class CuentasContablesService {
    constructor() {
        this.repository = cuentas_contables_repository_1.CuentasContablesRepository.getInstance();
    }
    /**
     * Obtiene todas las cuentas contables activas
     */
    async obtenerCuentas() {
        return this.repository.obtenerCuentas();
    }
    /**
     * Obtiene cuentas contables específicas por sus códigos
     * @param codigos Array de códigos de cuenta a buscar
     */
    async obtenerCuentasPorCodigos(codigos) {
        return this.repository.obtenerCuentasPorCodigos(codigos);
    }
    /**
     * Crea una nueva cuenta contable
     * @param cuenta Datos de la cuenta a crear
     */
    async crearCuenta(cuenta) {
        return this.repository.crearCuenta(cuenta);
    }
    /**
     * Actualiza una cuenta contable existente
     * @param codigo Código de la cuenta a actualizar
     * @param datos Nuevos datos para la cuenta
     */
    async actualizarCuenta(codigo, datos) {
        return this.repository.actualizarCuenta(codigo, datos);
    }
    /**
     * Elimina una cuenta contable (marcándola como inactiva)
     * @param codigo Código de la cuenta a eliminar
     */
    async eliminarCuenta(codigo) {
        return this.repository.eliminarCuenta(codigo);
    }
}
exports.CuentasContablesService = CuentasContablesService;

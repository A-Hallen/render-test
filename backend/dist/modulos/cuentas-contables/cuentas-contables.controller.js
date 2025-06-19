"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuentasContablesController = void 0;
const express_1 = require("express");
const cuentas_contables_service_1 = require("./cuentas-contables.service");
const auth_middleware_1 = require("../../modulos/auth/auth.middleware");
/**
 * Controlador para gestionar las cuentas contables
 * Expone endpoints REST para el CRUD de cuentas
 */
class CuentasContablesController {
    constructor() {
        /**
         * Obtiene todas las cuentas contables activas
         */
        this.obtenerCuentas = async (req, res) => {
            try {
                const cuentas = await this.service.obtenerCuentas();
                res.status(200).json({
                    success: true,
                    cuentas
                });
            }
            catch (error) {
                console.error('Error al obtener cuentas contables:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener cuentas contables',
                    error: error.message || 'Error desconocido'
                });
            }
        };
        /**
         * Obtiene cuentas contables específicas por sus códigos
         */
        this.obtenerCuentasPorCodigos = async (req, res) => {
            try {
                const { codigos } = req.query;
                if (!codigos || !Array.isArray(JSON.parse(codigos))) {
                    res.status(400).json({
                        success: false,
                        message: 'Se requiere un array de códigos'
                    });
                    return;
                }
                const codigosArray = JSON.parse(codigos);
                const cuentas = await this.service.obtenerCuentasPorCodigos(codigosArray);
                res.status(200).json({
                    success: true,
                    cuentas
                });
            }
            catch (error) {
                console.error('Error al obtener cuentas por códigos:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener cuentas por códigos',
                    error: error.message || 'Error desconocido'
                });
            }
        };
        /**
         * Crea una nueva cuenta contable
         */
        this.crearCuenta = async (req, res) => {
            try {
                const { codigo, nombre } = req.body;
                if (!codigo || !nombre) {
                    res.status(400).json({
                        success: false,
                        message: 'Se requieren código y nombre para crear una cuenta'
                    });
                    return;
                }
                const nuevaCuenta = await this.service.crearCuenta({ codigo, nombre });
                res.status(201).json({
                    success: true,
                    message: 'Cuenta contable creada correctamente',
                    cuenta: nuevaCuenta
                });
            }
            catch (error) {
                console.error('Error al crear cuenta contable:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear cuenta contable',
                    error: error.message || 'Error desconocido'
                });
            }
        };
        /**
         * Actualiza una cuenta contable existente
         */
        this.actualizarCuenta = async (req, res) => {
            try {
                const codigo = parseInt(req.params.codigo);
                const { nombre, estaActiva } = req.body;
                if (isNaN(codigo)) {
                    res.status(400).json({
                        success: false,
                        message: 'Código de cuenta inválido'
                    });
                    return;
                }
                const cuentaActualizada = await this.service.actualizarCuenta(codigo, { nombre, estaActiva });
                if (!cuentaActualizada) {
                    res.status(404).json({
                        success: false,
                        message: `No se encontró una cuenta con el código ${codigo}`
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Cuenta contable actualizada correctamente',
                    cuenta: cuentaActualizada
                });
            }
            catch (error) {
                console.error('Error al actualizar cuenta contable:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar cuenta contable',
                    error: error.message || 'Error desconocido'
                });
            }
        };
        /**
         * Elimina una cuenta contable (marcándola como inactiva)
         */
        this.eliminarCuenta = async (req, res) => {
            try {
                const codigo = parseInt(req.params.codigo);
                if (isNaN(codigo)) {
                    res.status(400).json({
                        success: false,
                        message: 'Código de cuenta inválido'
                    });
                    return;
                }
                const eliminado = await this.service.eliminarCuenta(codigo);
                if (!eliminado) {
                    res.status(404).json({
                        success: false,
                        message: `No se encontró una cuenta con el código ${codigo}`
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Cuenta contable eliminada correctamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar cuenta contable:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar cuenta contable',
                    error: error.message || 'Error desconocido'
                });
            }
        };
        this.router = (0, express_1.Router)();
        this.service = new cuentas_contables_service_1.CuentasContablesService();
        this.setupRoutes();
    }
    /**
     * Configura las rutas del controlador
     */
    setupRoutes() {
        // Aplicar middleware de autenticación a todas las rutas
        const authMiddleware = new auth_middleware_1.AuthMiddleware();
        this.router.use(authMiddleware.verifyToken);
        // Rutas CRUD
        this.router.get('/', this.obtenerCuentas);
        this.router.get('/codigos', this.obtenerCuentasPorCodigos);
        this.router.post('/', this.crearCuenta);
        this.router.put('/:codigo', this.actualizarCuenta);
        this.router.delete('/:codigo', this.eliminarCuenta);
    }
    /**
     * Devuelve el router configurado
     */
    getRouter() {
        return this.router;
    }
}
exports.CuentasContablesController = CuentasContablesController;

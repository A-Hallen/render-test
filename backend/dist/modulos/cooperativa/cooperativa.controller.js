"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CooperativaController = void 0;
const cooperativa_service_1 = require("./cooperativa.service");
const user_interface_1 = require("../auth/interfaces/user.interface");
class CooperativaController {
    constructor() {
        /**
         * Obtiene la información de la cooperativa
         */
        this.obtenerCooperativa = async (req, res) => {
            try {
                const cooperativa = await this.service.obtenerCooperativa();
                if (!cooperativa) {
                    res.status(404).json({ message: 'No se encontró información de la cooperativa' });
                    return;
                }
                res.status(200).json(cooperativa);
            }
            catch (error) {
                console.error('Error al obtener la cooperativa:', error);
                res.status(500).json({ message: 'Error al obtener la información de la cooperativa', error: error.message });
            }
        };
        /**
         * Actualiza la información de la cooperativa
         * Solo los administradores pueden actualizar esta información
         */
        this.actualizarCooperativa = async (req, res) => {
            try {
                // Verificar que el usuario sea administrador
                if (!req.user || req.user.role !== user_interface_1.UserRole.ADMIN) {
                    res.status(403).json({ message: 'No tienes permisos para actualizar la información de la cooperativa' });
                    return;
                }
                const cooperativaData = req.body;
                // Validar datos mínimos requeridos
                if (!cooperativaData.nombre) {
                    res.status(400).json({ message: 'El nombre de la cooperativa es obligatorio' });
                    return;
                }
                const cooperativaActualizada = await this.service.actualizarCooperativa(cooperativaData);
                res.status(200).json(cooperativaActualizada);
            }
            catch (error) {
                console.error('Error al actualizar la cooperativa:', error);
                res.status(500).json({ message: 'Error al actualizar la información de la cooperativa', error: error.message });
            }
        };
        /**
         * Crea la información de la cooperativa
         * Solo los administradores pueden crear esta información
         */
        this.crearCooperativa = async (req, res) => {
            try {
                // Verificar que el usuario sea administrador
                if (!req.user || req.user.role !== user_interface_1.UserRole.ADMIN) {
                    res.status(403).json({ message: 'No tienes permisos para crear la información de la cooperativa' });
                    return;
                }
                const cooperativaData = req.body;
                // Validar datos mínimos requeridos
                if (!cooperativaData.nombre) {
                    res.status(400).json({ message: 'El nombre de la cooperativa es obligatorio' });
                    return;
                }
                const cooperativaCreada = await this.service.crearCooperativa(cooperativaData);
                res.status(201).json(cooperativaCreada);
            }
            catch (error) {
                console.error('Error al crear la cooperativa:', error);
                res.status(500).json({ message: 'Error al crear la información de la cooperativa', error: error.message });
            }
        };
        this.service = cooperativa_service_1.CooperativaService.getInstance();
    }
    static getInstance() {
        if (!CooperativaController.instance) {
            CooperativaController.instance = new CooperativaController();
        }
        return CooperativaController.instance;
    }
}
exports.CooperativaController = CooperativaController;

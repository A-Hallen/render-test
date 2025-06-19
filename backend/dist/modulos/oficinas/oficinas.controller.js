"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OficinasController = void 0;
const oficinas_service_1 = require("./oficinas.service");
class OficinasController {
    constructor() {
        this.oficinaService = new oficinas_service_1.OficinaService();
    }
    async obtenerOficinas(req, res) {
        try {
            const oficinas = await this.oficinaService.obtenerTodas();
            res.json(oficinas);
        }
        catch (error) {
            console.error('Error al obtener las oficinas', error);
            res.status(500).json({ error: 'Error al obtener las oficinas' });
        }
    }
}
exports.OficinasController = OficinasController;

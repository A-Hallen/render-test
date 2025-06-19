"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IaController = void 0;
const ia_service_1 = require("./ia.service");
const multer_1 = __importDefault(require("multer"));
// Configuración de Multer
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Validar que sea un archivo de audio
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de audio'));
        }
    },
    limits: {
        fileSize: 25 * 1024 * 1024 // Límite de 25MB (ajusta según necesites)
    }
});
class IaController {
    constructor() {
        this.iaService = new ia_service_1.IaService();
        this.uploadMiddleware = upload;
    }
    async obtenerRespuestaTexto(req, res) {
        const { message, conversation } = req.body;
        try {
            const respuesta = await this.iaService.obtenerRespuesta(message, null, conversation);
            res.status(200).json({ message: respuesta });
        }
        catch (error) {
            console.error("[controller] Error al obtener una respuesta de la ia:", error);
            res.status(500).json({ message: 'Error al obtener una respuesta', error });
        }
    }
    async obtenerRespuestaAudio(req, res) {
        try {
            const buffer = req.file?.buffer; // Assuming the audio blob is sent as a file in the request
            const { conversation } = req.body;
            if (!buffer) {
                throw new Error("No se proporcionó un blob de audio");
            }
            const respuesta = await this.iaService.obtenerRespuesta('', buffer, conversation);
            res.status(200).json({ message: respuesta });
        }
        catch (error) {
            console.error("[controller] Error al procesar el blob de audio:", error);
            res.status(500).json({ message: 'Error al procesar el audio', error });
        }
    }
}
exports.IaController = IaController;

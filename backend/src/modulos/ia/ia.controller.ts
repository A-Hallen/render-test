import { Request, Response } from 'express';
import { IaService } from './ia.service';
import multer from 'multer';
import { Multer } from 'multer';

// Configuración de Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Validar que sea un archivo de audio
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de audio'));
        }
    },
    limits: {
        fileSize: 25 * 1024 * 1024 // Límite de 25MB (ajusta según necesites)
    }
});

export class IaController {
    private iaService: IaService;
    public uploadMiddleware: Multer;

    constructor() {
        this.iaService = new IaService();
        this.uploadMiddleware = upload;
    }

    async obtenerRespuestaTexto(req: Request, res: Response) {
        const { message } = req.body;
        try {
            const respuesta = await this.iaService.obtenerRespuesta(message, null);
            res.status(200).json({ message: respuesta });
        } catch (error) {
            console.error("[controller] Error al obtener una respuesta de la ia:", error);
            res.status(500).json({ message: 'Error al obtener una respuesta', error })
        }
    }

    async obtenerRespuestaAudio(req: Request, res: Response) {
        try {
            const buffer = req.file?.buffer; // Assuming the audio blob is sent as a file in the request
            if (!buffer) {
                throw new Error("No se proporcionó un blob de audio");
            }
            const respuesta = await this.iaService.obtenerRespuesta('', buffer);
            res.status(200).json({ message: respuesta });
        } catch (error) {
            console.error("[controller] Error al procesar el blob de audio:", error);
            res.status(500).json({ message: 'Error al procesar el audio', error });
        }
    }


}
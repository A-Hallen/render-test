"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadCooperativaController = void 0;
const firebase_config_1 = require("../../config/firebase.config");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const cooperativa_service_1 = require("./cooperativa.service");
const url_1 = require("url");
const user_interface_1 = require("../auth/interfaces/user.interface");
// Configuración de multer para almacenamiento temporal
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = path_1.default.join(__dirname, '../../../temp');
        // Crear directorio temporal si no existe
        if (!fs_1.default.existsSync(tempDir)) {
            fs_1.default.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para evitar colisiones
        const uniqueSuffix = Date.now() + '-' + (0, uuid_1.v4)();
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo se permiten archivos de imagen'));
    }
};
// Configuración de multer
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});
class UploadCooperativaController {
    constructor() {
        /**
         * Middleware para manejar la subida de archivos con multer
         */
        this.uploadMiddleware = upload.single('logo');
        this.cooperativaService = cooperativa_service_1.CooperativaService.getInstance();
        // Obtener el bucket predeterminado de Firebase Storage
        this.bucket = firebase_config_1.storage.bucket();
    }
    /**
     * Sube una imagen de logo para la cooperativa a Firebase Storage y actualiza la información de la cooperativa
     * Elimina la imagen anterior si existe
     */
    async uploadLogo(req, res) {
        try {
            // Verificar que el usuario sea administrador
            if (!req.user || req.user.role !== user_interface_1.UserRole.ADMIN) {
                res.status(403).json({ message: 'No tienes permisos para actualizar el logo de la cooperativa' });
                return;
            }
            // Verificar que se subió un archivo
            if (!req.file) {
                res.status(400).json({ message: 'No se ha subido ningún archivo' });
                return;
            }
            // Obtener la cooperativa actual para verificar si ya tiene un logo
            const currentCooperativa = await this.cooperativaService.obtenerCooperativa();
            const currentLogoURL = currentCooperativa?.logo;
            // Si la cooperativa ya tiene un logo, extraer la ruta para eliminarla
            let oldImagePath = null;
            if (currentLogoURL && currentLogoURL.includes('cooperativa-imagen')) {
                try {
                    // Extraer la ruta del archivo de la URL
                    const urlParts = new url_1.URL(currentLogoURL);
                    const pathMatch = urlParts.pathname.match(/\/([^\/]+\/cooperativa-imagen\/.+)/);
                    if (pathMatch && pathMatch[1]) {
                        oldImagePath = pathMatch[1].replace(/^[^\/]+\//, ''); // Eliminar el nombre del bucket
                        console.log(`Logo anterior detectado: ${oldImagePath}`);
                    }
                }
                catch (error) {
                    console.warn('No se pudo extraer la ruta del logo anterior:', error);
                }
            }
            const file = req.file;
            const filePath = file.path;
            // Crear la ruta dentro del bucket existente
            const destination = `cooperativa-imagen/${Date.now()}_${path_1.default.basename(file.originalname)}`;
            console.log(`Subiendo archivo a: ${destination}`);
            // Subir archivo a Firebase Storage
            const [uploadedFile] = await this.bucket.upload(filePath, {
                destination: destination,
                metadata: {
                    contentType: file.mimetype,
                },
                // Asegurar que se usen las credenciales correctas
                gzip: true,
                resumable: false // Deshabilitar subidas reanudables para archivos pequeños
            });
            // Hacer la imagen accesible públicamente
            await uploadedFile.makePublic();
            // Obtener URL pública directamente del archivo subido
            const imageUrl = await uploadedFile.getSignedUrl({
                action: 'read',
                expires: '03-01-2500' // URL prácticamente permanente
            }).then((urls) => urls[0]);
            // Actualizar la cooperativa con la nueva URL del logo
            if (!currentCooperativa) {
                res.status(404).json({ message: 'No se encontró información de la cooperativa' });
                return;
            }
            const updatedCooperativa = await this.cooperativaService.actualizarCooperativa({
                id: currentCooperativa.id,
                logo: imageUrl
            });
            // Eliminar archivo temporal local
            fs_1.default.unlinkSync(filePath);
            // Eliminar la imagen anterior de Firebase Storage si existe
            if (oldImagePath) {
                try {
                    console.log(`Intentando eliminar logo anterior: ${oldImagePath}`);
                    await this.bucket.file(oldImagePath).delete();
                    console.log('Logo anterior eliminado correctamente');
                }
                catch (deleteError) {
                    // No interrumpimos el flujo principal si hay un error al eliminar la imagen anterior
                    console.warn('Error al eliminar el logo anterior:', deleteError);
                }
            }
            res.status(200).json({
                success: true,
                imageUrl,
                cooperativa: updatedCooperativa
            });
        }
        catch (error) {
            console.error('Error al subir logo de la cooperativa:', error);
            // Eliminar archivo temporal si existe
            if (req.file && fs_1.default.existsSync(req.file.path)) {
                fs_1.default.unlinkSync(req.file.path);
            }
            // Determinar código de estado y mensaje apropiados
            let statusCode = 500;
            let message = 'Error al subir logo de la cooperativa';
            if (error.message === 'Solo se permiten archivos de imagen') {
                statusCode = 400;
                message = error.message;
            }
            else if (error.code === 'LIMIT_FILE_SIZE') {
                statusCode = 400;
                message = 'El tamaño máximo de la imagen es 2MB';
            }
            res.status(statusCode).json({
                success: false,
                message,
                code: error.code
            });
        }
    }
}
exports.UploadCooperativaController = UploadCooperativaController;

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { storage as firebaseStorage } from '../../config/firebase.config';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { URL } from 'url';

// Configuración de multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../../../temp');
    // Crear directorio temporal si no existe
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export class UploadController {
  private authService: AuthService;
  private bucket: any; // Firebase Storage Bucket

  constructor() {
    this.authService = new AuthService();
    // Obtener el bucket predeterminado de Firebase Storage
    this.bucket = firebaseStorage.bucket();
  }

  /**
   * Middleware para manejar la subida de archivos con multer
   */
  uploadMiddleware = upload.single('image');

  /**
   * Sube una imagen de perfil a Firebase Storage y actualiza el perfil del usuario
   * Elimina la imagen anterior si existe
   */
  async uploadProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      // Verificar que se subió un archivo
      if (!req.file) {
        res.status(400).json({ message: 'No se ha subido ningún archivo' });
        return;
      }

      // Obtener el usuario actual para verificar si ya tiene una imagen de perfil
      const currentUser = await this.authService.getUserById(userId);
      const currentPhotoURL = currentUser?.photoURL;
      
      // Si el usuario ya tiene una imagen de perfil, extraer la ruta para eliminarla
      let oldImagePath = null;
      if (currentPhotoURL && currentPhotoURL.includes('profile-images')) {
        try {
          // Extraer la ruta del archivo de la URL
          // Las URLs de Firebase Storage suelen tener este formato:
          // https://storage.googleapis.com/[BUCKET]/profile-images/[USER_ID]/[FILENAME]
          const urlParts = new URL(currentPhotoURL);
          const pathMatch = urlParts.pathname.match(/\/([^\/]+\/profile-images\/.+)/);
          
          if (pathMatch && pathMatch[1]) {
            oldImagePath = pathMatch[1].replace(/^[^\/]+\//, ''); // Eliminar el nombre del bucket
            console.log(`Imagen anterior detectada: ${oldImagePath}`);
          }
        } catch (error) {
          console.warn('No se pudo extraer la ruta de la imagen anterior:', error);
        }
      }

      const file = req.file;
      const filePath = file.path;

      // Crear la ruta dentro del bucket existente
      const destination = `profile-images/${userId}/${Date.now()}_${path.basename(file.originalname)}`;
      
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
      }).then((urls: string[]) => urls[0]);

      // Actualizar perfil del usuario con la nueva URL de imagen
      const updatedUser = await this.authService.updateUser(userId, { photoURL: imageUrl });

      // Eliminar archivo temporal local
      fs.unlinkSync(filePath);
      
      // Eliminar la imagen anterior de Firebase Storage si existe
      if (oldImagePath) {
        try {
          console.log(`Intentando eliminar imagen anterior: ${oldImagePath}`);
          await this.bucket.file(oldImagePath).delete();
          console.log('Imagen anterior eliminada correctamente');
        } catch (deleteError) {
          // No interrumpimos el flujo principal si hay un error al eliminar la imagen anterior
          console.warn('Error al eliminar la imagen anterior:', deleteError);
        }
      }

      res.status(200).json({
        success: true,
        imageUrl,
        user: updatedUser
      });
    } catch (error: any) {
      console.error('Error al subir imagen de perfil:', error);
      
      // Eliminar archivo temporal si existe
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      // Determinar código de estado y mensaje apropiados
      let statusCode = 500;
      let message = 'Error al subir imagen de perfil';
      
      if (error.message === 'Solo se permiten archivos de imagen') {
        statusCode = 400;
        message = error.message;
      } else if (error.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'El tamaño máximo de la imagen es 5MB';
      }
      
      res.status(statusCode).json({
        success: false,
        message,
        code: error.code
      });
    }
  }
}

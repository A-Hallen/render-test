/**
 * Rutas para la sincronización de datos entre MySQL y Firebase
 */

import express from "express";
import { SincronizacionController } from "./sincronizacion.controller";
import { AuthMiddleware } from "../auth";

const sincronizacionController = new SincronizacionController();

// Crear el router
const router = express.Router();

const authMiddleware = new AuthMiddleware();

router.get(
  "/contabilidad/estado",
  authMiddleware.verifyToken.bind(authMiddleware),
  sincronizacionController.obtenerEstadoExportacion.bind(
    sincronizacionController
  )
);

router.post(
  "/contabilidad/iniciar",
  authMiddleware.verifyToken.bind(authMiddleware),
  sincronizacionController.iniciarSincronizacion.bind(sincronizacionController)
);

router.get(
  "/contabilidad/historial",
  authMiddleware.verifyToken.bind(authMiddleware),
  sincronizacionController.obtenerHistorialSincronizacion.bind(
    sincronizacionController
  )
);

router.get("/contabilidad/progress-stream", (req, res) => {
  // Usar el método del repositorio para suscribir al cliente a las actualizaciones
  sincronizacionController.suscribirseActualizacionesProgreso(req, res);
});
router.post(
  "/contabilidad/pausar",
  authMiddleware.verifyToken.bind(authMiddleware),
  sincronizacionController.pausarSincronizacion.bind(sincronizacionController)
);

router.post(
  "/contabilidad/detener",
  authMiddleware.verifyToken.bind(authMiddleware),
  sincronizacionController.detenerSincronizacion.bind(sincronizacionController)
);

export default router;

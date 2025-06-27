import { RespuestaHistorialSincronizacion, UserRole } from "shared";
import { SincronizacionService } from "./sincronizacion.service";
import { Request, Response } from "express";

export class SincronizacionController {
  private sincronizacionService;

  constructor() {
    this.sincronizacionService = new SincronizacionService();
  }

  /**
   * Obtiene el estado actual de la exportación de datos contables
   * @param req Request
   * @param res Response
   */
  async obtenerEstadoExportacion(req: Request, res: Response): Promise<void> {
    try {
      const estado =
        await this.sincronizacionService.obtenerEstadoSincronizacion();
      res.status(200).json(estado);
    } catch (error: any) {
      console.error("error al obtener el estado de la sincronizacion", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el estado de la sincronizacion",
      });
    }
  }

  async obtenerHistorialSincronizacion(req: Request, res: Response): Promise<void> {
    try {
      if(!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: "No tienes permisos para obtener el historial de la sincronizacion",
          historial: []
        });
        return;
      }
      const historial = await this.sincronizacionService.obtenerHistorialSincronizacion();
      res.status(200).json({
        success: true,
        message: "Historial de la sincronizacion obtenido exitosamente",
        historial,
      });
    } catch (error: any) {
      console.error("error al obtener el historial de la sincronizacion", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el historial de la sincronizacion",
        historial: [],
      });
    }
  }

  async iniciarSincronizacion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res
          .status(403)
          .json({
            message:
              "No tienes permisos para iniciar la sincronizacion",
          });
        return;
      }
      this.sincronizacionService.iniciarSincronizacion(req.user.uid);
      res.status(200).json({
        success: true,
        message: "Sincronizacion iniciada",
      });
    } catch (error: any) {
      console.error("error al iniciar la sincronizacion", error);
      res.status(500).json({
        success: false,
        message: "Error al iniciar la sincronizacion",
      });
    }
  }

  /**
   * Suscribe al cliente a las actualizaciones de progreso de sincronización
   * @param req Request
   * @param res Response
   */
  suscribirseActualizacionesProgreso(req: Request, res: Response): void {
    try {
      // Suscribir al cliente a las actualizaciones de progreso
      this.sincronizacionService.subscribeToProgressUpdates(res);
      
      // No cerramos la respuesta aquí, ya que se maneja en el método subscribeToProgressUpdates
    } catch (error: any) {
      console.error("Error al suscribirse a actualizaciones de progreso:", error);
      res.status(500).json({
        success: false,
        message: "Error al suscribirse a actualizaciones de progreso",
        error: error.message
      });
    }
  }

  async pausarSincronizacion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res
          .status(403)
          .json({
            message:
              "No tienes permisos para pausar la sincronizacion",
          });
        return;
      }
      this.sincronizacionService.pausarSincronizacion(req.user.uid);
      res.status(200).json({
        success: true,
        message: "Sincronizacion pausada",
      });
    } catch (error: any) {
      console.error("error al pausar la sincronizacion", error);
      res.status(500).json({
        success: false,
        message: "Error al pausar la sincronizacion",
      });
    }
  }

  async detenerSincronizacion(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res
          .status(403)
          .json({
            message:
              "No tienes permisos para detener la sincronizacion",
          });
        return;
      }
      this.sincronizacionService.detenerSincronizacion(req.user.uid);
      res.status(200).json({
        success: true,
        message: "Sincronizacion detenida",
      });
    } catch (error: any) {
      console.error("error al detener la sincronizacion", error);
      res.status(500).json({
        success: false,
        message: "Error al detener la sincronizacion",
      });
    }
  }
}

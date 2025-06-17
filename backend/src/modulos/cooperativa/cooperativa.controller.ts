import { Request, Response } from 'express';
import { CooperativaService } from './cooperativa.service';
import { UserRole } from '../auth/interfaces/user.interface';

export class CooperativaController {
  private static instance: CooperativaController;
  private service: CooperativaService;

  private constructor() {
    this.service = CooperativaService.getInstance();
  }

  public static getInstance(): CooperativaController {
    if (!CooperativaController.instance) {
      CooperativaController.instance = new CooperativaController();
    }
    return CooperativaController.instance;
  }

  /**
   * Obtiene la información de la cooperativa
   */
  obtenerCooperativa = async (req: Request, res: Response): Promise<void> => {
    try {
      const cooperativa = await this.service.obtenerCooperativa();
      
      if (!cooperativa) {
        res.status(404).json({ message: 'No se encontró información de la cooperativa' });
        return;
      }
      
      res.status(200).json(cooperativa);
    } catch (error: any) {
      console.error('Error al obtener la cooperativa:', error);
      res.status(500).json({ message: 'Error al obtener la información de la cooperativa', error: error.message });
    }
  };

  /**
   * Actualiza la información de la cooperativa
   * Solo los administradores pueden actualizar esta información
   */
  actualizarCooperativa = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar que el usuario sea administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
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
    } catch (error: any) {
      console.error('Error al actualizar la cooperativa:', error);
      res.status(500).json({ message: 'Error al actualizar la información de la cooperativa', error: error.message });
    }
  };

  /**
   * Crea la información de la cooperativa
   * Solo los administradores pueden crear esta información
   */
  crearCooperativa = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar que el usuario sea administrador
      if (!req.user || req.user.role !== UserRole.ADMIN) {
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
    } catch (error: any) {
      console.error('Error al crear la cooperativa:', error);
      res.status(500).json({ message: 'Error al crear la información de la cooperativa', error: error.message });
    }
  };
}

import { Router, Request, Response } from 'express';
import { CuentasContablesService } from './cuentas-contables.service';
import { AuthMiddleware } from '../../modulos/auth/auth.middleware';

/**
 * Controlador para gestionar las cuentas contables
 * Expone endpoints REST para el CRUD de cuentas
 */
export class CuentasContablesController {
  private router: Router;
  private service: CuentasContablesService;

  constructor() {
    this.router = Router();
    this.service = new CuentasContablesService();
    this.setupRoutes();
  }

  /**
   * Configura las rutas del controlador
   */
  private setupRoutes(): void {
    // Aplicar middleware de autenticación a todas las rutas
    const authMiddleware = new AuthMiddleware();
    this.router.use(authMiddleware.verifyToken);

    // Rutas CRUD
    this.router.get('/', this.obtenerCuentas);
    this.router.get('/codigos', this.obtenerCuentasPorCodigos);
  }

  /**
   * Obtiene todas las cuentas contables activas
   */
  obtenerCuentas = async (req: Request, res: Response): Promise<void> => {
    try {
      const cuentas = await this.service.obtenerCuentas();
      res.status(200).json({
        success: true,
        cuentas
      });
    } catch (error: any) {
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
  obtenerCuentasPorCodigos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigos } = req.query;
      
      if (!codigos || !Array.isArray(JSON.parse(codigos as string))) {
        res.status(400).json({
          success: false,
          message: 'Se requiere un array de códigos'
        });
        return;
      }
      
      const codigosArray = JSON.parse(codigos as string) as string[];
      const cuentas = await this.service.obtenerCuentasPorCodigos(codigosArray);
      
      res.status(200).json({
        success: true,
        cuentas
      });
    } catch (error: any) {
      console.error('Error al obtener cuentas por códigos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener cuentas por códigos',
        error: error.message || 'Error desconocido'
      });
    }
  };

  /**
   * Devuelve el router configurado
   */
  getRouter(): Router {
    return this.router;
  }
}

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
    this.router.post('/', this.crearCuenta);
    this.router.put('/:codigo', this.actualizarCuenta);
    this.router.delete('/:codigo', this.eliminarCuenta);
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
   * Crea una nueva cuenta contable
   */
  crearCuenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo, nombre } = req.body;
      
      if (!codigo || !nombre) {
        res.status(400).json({
          success: false,
          message: 'Se requieren código y nombre para crear una cuenta'
        });
        return;
      }
      
      const nuevaCuenta = await this.service.crearCuenta({ codigo, nombre });
      
      res.status(201).json({
        success: true,
        message: 'Cuenta contable creada correctamente',
        cuenta: nuevaCuenta
      });
    } catch (error: any) {
      console.error('Error al crear cuenta contable:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear cuenta contable',
        error: error.message || 'Error desconocido'
      });
    }
  };

  /**
   * Actualiza una cuenta contable existente
   */
  actualizarCuenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const codigo = parseInt(req.params.codigo);
      const { nombre, estaActiva } = req.body;
      
      if (isNaN(codigo)) {
        res.status(400).json({
          success: false,
          message: 'Código de cuenta inválido'
        });
        return;
      }
      
      const cuentaActualizada = await this.service.actualizarCuenta(codigo, { nombre, estaActiva });
      
      if (!cuentaActualizada) {
        res.status(404).json({
          success: false,
          message: `No se encontró una cuenta con el código ${codigo}`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Cuenta contable actualizada correctamente',
        cuenta: cuentaActualizada
      });
    } catch (error: any) {
      console.error('Error al actualizar cuenta contable:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar cuenta contable',
        error: error.message || 'Error desconocido'
      });
    }
  };

  /**
   * Elimina una cuenta contable (marcándola como inactiva)
   */
  eliminarCuenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const codigo = parseInt(req.params.codigo);
      
      if (isNaN(codigo)) {
        res.status(400).json({
          success: false,
          message: 'Código de cuenta inválido'
        });
        return;
      }
      
      const eliminado = await this.service.eliminarCuenta(codigo);
      
      if (!eliminado) {
        res.status(404).json({
          success: false,
          message: `No se encontró una cuenta con el código ${codigo}`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Cuenta contable eliminada correctamente'
      });
    } catch (error: any) {
      console.error('Error al eliminar cuenta contable:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar cuenta contable',
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

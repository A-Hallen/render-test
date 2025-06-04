import { Request, Response } from 'express';
import { CarteraCreditoService } from './cartera-credito.service';

export class CarteraCreditoController {
  private carteraCreditoService: CarteraCreditoService;

  constructor() {
    this.carteraCreditoService = new CarteraCreditoService();
  }

  /**
   * Obtiene la información de la cartera de crédito actual
   * @param req Request de Express
   * @param res Response de Express
   */
  async obtenerCarteraCredito(req: Request, res: Response) {
    try {
      const codigoOficina = req.query.oficina as string;
      console.log(`[CarteraCreditoController] Procesando solicitud de cartera de crédito para oficina: ${codigoOficina}`);
      
      const resultado = await this.carteraCreditoService.obtenerCarteraCredito(codigoOficina);
      
      res.status(200).json(resultado);
    } catch (error: any) {
      console.error(`[CarteraCreditoController] Error: ${error.message}`);
      
      res.status(500).json({
        carteraActual: {
          fecha: new Date().toISOString().split('T')[0],
          monto: 0
        },
        mensaje: `Error al obtener información de cartera de crédito: ${error.message}`
      });
    }
  }
}

/**
 * Controlador para la exportación de datos contables a Firebase
 */

import { Request, Response } from 'express';
import { contabilidadExportService } from './contabilidad-export.service';

/**
 * Inicia la exportación de datos contables a Firebase
 * @param req Request
 * @param res Response
 */
export async function iniciarExportacionContable(req: Request, res: Response): Promise<void> {
  try {
    const { fechaInicio, fechaFin, guardarArchivos } = req.body;
    const usuarioId = req.body.usuarioId || req.user?.uid;
    
    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      res.status(400).json({ 
        exito: false, 
        mensaje: 'Se requieren fechaInicio y fechaFin en formato YYYY-MM-DD' 
      });
      return;
    }
    
    // Validar formato de fechas
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fechaInicio) || !regexFecha.test(fechaFin)) {
      res.status(400).json({ 
        exito: false, 
        mensaje: 'Las fechas deben tener formato YYYY-MM-DD' 
      });
      return;
    }
    
    // Verificar si ya hay una exportación en proceso
    if (contabilidadExportService.estaEnProceso()) {
      res.status(409).json({ 
        exito: false, 
        mensaje: 'Ya hay una exportación en proceso', 
        estado: 'en_proceso' 
      });
      return;
    }
    
    // Responder inmediatamente y continuar con la exportación en segundo plano
    res.status(202).json({ 
      exito: true,
      mensaje: `Exportación iniciada para el período ${fechaInicio} al ${fechaFin}`, 
      estado: 'iniciada' 
    });
    
    // Ejecutar la exportación después de enviar la respuesta
    contabilidadExportService.exportarDatosContables(
      fechaInicio, 
      fechaFin, 
      guardarArchivos === true,
      usuarioId
    )
    .then((resultado) => {
      console.log('Exportación contable completada exitosamente:', resultado.mensaje);
    })
    .catch((error) => {
      console.error('Error en exportación contable:', error);
    });
      
  } catch (error: any) {
    console.error('Error al iniciar exportación contable:', error);
    res.status(500).json({ 
      exito: false, 
      mensaje: 'Error al iniciar exportación contable', 
      error: error.message 
    });
  }
}

/**
 * Obtiene el estado actual de la exportación de datos contables
 * @param req Request
 * @param res Response
 */
export function obtenerEstadoExportacion(req: Request, res: Response): void {
  try {
    const estado = {
      enProceso: contabilidadExportService.estaEnProceso(),
      ultimaExportacion: contabilidadExportService.getUltimaExportacion(),
      progreso: contabilidadExportService.getProgresoExportacion()
    };
    
    res.json({
      exito: true,
      estado
    });
  } catch (error: any) {
    console.error('Error al obtener estado de exportación contable:', error);
    res.status(500).json({ 
      exito: false, 
      mensaje: 'Error al obtener estado de exportación', 
      error: error.message 
    });
  }
}

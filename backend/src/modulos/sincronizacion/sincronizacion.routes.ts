/**
 * Rutas para la sincronización de datos entre MySQL y Firebase
 */

import express from 'express';
import { sincronizacionService } from '../../database/SincronizacionService';

// Crear el router
const router = express.Router();

// Manejador para POST /iniciar
async function iniciarSincronizacion(req: express.Request, res: express.Response) {
  try {
    const forzarCompleta = req.body.forzarCompleta === true;
    
    // Verificar si ya hay una sincronización en curso
    if (sincronizacionService.estaEnProceso()) {
      return res.status(409).json({ 
        mensaje: 'Ya hay una sincronización en curso', 
        estado: 'en_proceso' 
      });
    }
    
    // Iniciar sincronización en segundo plano
    console.log(`Iniciando sincronización manual ${forzarCompleta ? 'completa' : 'incremental'}...`);
    
    // Responder inmediatamente y continuar con la sincronización en segundo plano
    res.status(202).json({ 
      mensaje: `Sincronización ${forzarCompleta ? 'completa' : 'incremental'} iniciada`, 
      estado: 'iniciada' 
    });
    
    // Ejecutar la sincronización después de enviar la respuesta
    sincronizacionService.sincronizarDatos(forzarCompleta)
      .then(() => {
        console.log('Sincronización manual completada exitosamente');
      })
      .catch((error) => {
        console.error('Error en sincronización manual:', error);
      });
      
  } catch (error: any) {
    console.error('Error al iniciar sincronización manual:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sincronización', error: error.message });
  }
}

// Manejador para GET /estado
function obtenerEstadoSincronizacion(req: express.Request, res: express.Response) {
  try {
    const estado = {
      enProceso: sincronizacionService.estaEnProceso(),
      ultimaSincronizacion: sincronizacionService.getUltimaSincronizacion(),
      programada: process.env.ENABLE_SYNC === 'true',
      expresionCron: process.env.SYNC_CRON_EXPRESSION || '*/30 * * * *'
    };
    
    res.json(estado);
  } catch (error: any) {
    console.error('Error al obtener estado de sincronización:', error);
    res.status(500).json({ mensaje: 'Error al obtener estado', error: error.message });
  }
}

// Definir las rutas usando aserción de tipo para evitar errores de TypeScript
(router as any).post('/iniciar', iniciarSincronizacion);
(router as any).get('/estado', obtenerEstadoSincronizacion);

export default router;

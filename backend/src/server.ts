import express, { Request, Response } from 'express';
import path from 'path';
import iaRoutes from './modulos/ia/ia.routes';
import reportesRoutes from './modulos/reportes/reportes.routes';
import oficinasRoutes from './modulos/oficinas/oficinas.routes';
import indicadoresContablesRoutes from './modulos/indicadores-contables/indicadores-contables.routes';
import kpiContablesRoutes from './modulos/kpi-contables/kpi-contables.routes';
import sincronizacionRoutes from './modulos/sincronizacion/sincronizacion.routes';
// El módulo de indicadores original ha sido eliminado como parte de la refactorización
import { ValidationError } from 'sequelize';
import { sincronizacionService } from './database/SincronizacionService';
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
import './config/firebase.config';

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas de indicadores y KPIs
// IMPORTANTE: Las rutas más específicas deben ir primero
app.use('/api/indicadores-contables', indicadoresContablesRoutes);
app.use('/api/kpi-contables', kpiContablesRoutes);
app.use('/api/chat', iaRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/oficinas', oficinasRoutes);
app.use('/api/sincronizacion', sincronizacionRoutes);

// Redirección temporal para mantener compatibilidad con código existente
// Esta ruta debe eliminarse una vez que todas las referencias hayan sido actualizadas
app.use('/api/indicadores', (req, res, next) => {
    console.log(`[DEPRECATED] Acceso a ruta legacy: ${req.method} ${req.path}`);
    
    // Redirigir a los nuevos módulos según la ruta solicitada
    if (req.path.includes('/calcular-periodo')) {
        // Redirigir a kpi-contables para cálculos de indicadores
        req.url = req.url.replace('/calcular-periodo', '/rango-fechas');
        return kpiContablesRoutes(req, res, next);
    } else {
        // Redirigir a indicadores-contables para otras operaciones
        return indicadoresContablesRoutes(req, res, next);
    }
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (err instanceof ValidationError) {
        console.error('Error de validación de OpenAPI:', err.message);
        res.status(400).json({ message: 'Error de validación en la petición', errors: err.errors });
    } else {
        next(err); // Pasar el error al siguiente middleware si no es un error de validación de OpenAPI
    }
});

// Servir archivos estáticos desde la carpeta 'frontend'
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Ruta principal para el frontend
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
    
    // Sincronización deshabilitada temporalmente
    console.log('La sincronización automática está deshabilitada temporalmente');
    // Para habilitar la sincronización, configurar ENABLE_SYNC=true en el archivo .env
});

// Manejar señales de terminación para cerrar correctamente las conexiones
process.on('SIGINT', async () => {
    console.log('Recibida señal SIGINT, cerrando conexiones...');
    if (process.env.ENABLE_SYNC === 'true') {
        await sincronizacionService.cerrar();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Recibida señal SIGTERM, cerrando conexiones...');
    if (process.env.ENABLE_SYNC === 'true') {
        await sincronizacionService.cerrar();
    }
    process.exit(0);
});
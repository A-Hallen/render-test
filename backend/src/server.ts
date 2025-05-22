import express, { Request, Response } from 'express';
import path from 'path';
import indicadoresRoutes from './modulos/indicadores/indicadores.routes';
import iaRoutes from './modulos/ia/ia.routes';
import reporteContabilidadRoutes from './modulos/reportes/contabilidad/reporte-contabilidad.routes';
import configuracionReportesContabilidadRoutes from './modulos/configuracion-reportes/contabilidad/configuracion-reportes-contabilidad.routes';
import oficinasRoutes from './modulos/oficinas/oficinas.routes';
import { ValidationError } from 'sequelize';
import { AuthRoutes } from './modulos/auth';
const app = express();
const port = process.env.PORT || 3000;
import './config/firebase.config';

// Middleware para parsear JSON
app.use(express.json());

// Inicializar rutas de autenticación
const authRoutes = new AuthRoutes();

// Usar las rutas de indicadores
app.use('/api/indicadores', indicadoresRoutes);
app.use('/api/chat', iaRoutes);
app.use('/api/configuracion-reportes/contabilidad', configuracionReportesContabilidadRoutes)
app.use('/api/reportes/contabilidad', reporteContabilidadRoutes);
app.use('/api/oficinas', oficinasRoutes);
app.use('/api/auth', authRoutes.getRouter());

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
});
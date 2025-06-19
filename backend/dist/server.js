"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = handleRequest;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const ia_routes_1 = __importDefault(require("./modulos/ia/ia.routes"));
const reporte_contabilidad_routes_1 = __importDefault(require("./modulos/reportes/contabilidad/reporte-contabilidad.routes"));
const configuracion_reportes_contabilidad_routes_1 = __importDefault(require("./modulos/configuracion-reportes/contabilidad/configuracion-reportes-contabilidad.routes"));
const auth_1 = require("./modulos/auth");
const notifications_1 = require("./modulos/notifications");
const oficinas_routes_1 = __importDefault(require("./modulos/oficinas/oficinas.routes"));
const indicadores_contables_routes_1 = __importDefault(require("./modulos/indicadores-contables/indicadores-contables.routes"));
const kpi_contables_routes_1 = __importDefault(require("./modulos/kpi-contables/kpi-contables.routes"));
const sincronizacion_routes_1 = __importDefault(require("./modulos/sincronizacion/sincronizacion.routes"));
const cartera_credito_routes_1 = __importDefault(require("./modulos/cartera-credito/cartera-credito.routes"));
const captaciones_routes_1 = __importDefault(require("./modulos/captaciones/captaciones.routes"));
const cooperativa_routes_1 = __importDefault(require("./modulos/cooperativa/cooperativa.routes"));
// El módulo de indicadores original ha sido eliminado como parte de la refactorización
const sequelize_1 = require("sequelize");
const SincronizacionService_1 = require("./database/SincronizacionService");
const app = (0, express_1.default)();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
require("./config/firebase.config");
// Middleware para parsear JSON
app.use(express_1.default.json());
// Inicializar rutas de autenticación y notificaciones
const authRoutes = new auth_1.AuthRoutes();
const notificationRoutes = new notifications_1.NotificationRoutes();
// Usar las rutas de indicadores
app.use('/api/configuracion-reportes/contabilidad', configuracion_reportes_contabilidad_routes_1.default);
app.use('/api/reportes/contabilidad', reporte_contabilidad_routes_1.default);
app.use('/api/oficinas', oficinas_routes_1.default);
app.use('/api/auth', authRoutes.getRouter());
app.use('/api/notifications', notificationRoutes.getRouter()); // Las rutas de notificaciones ya incluyen sus propios prefijos
// Usar las rutas de indicadores y KPIs
// IMPORTANTE: Las rutas más específicas deben ir primero
app.use('/api/indicadores-contables', indicadores_contables_routes_1.default);
app.use('/api/kpi-contables', kpi_contables_routes_1.default);
app.use('/api/chat', ia_routes_1.default);
app.use('/api/sincronizacion', sincronizacion_routes_1.default);
app.use('/api/cartera-credito', cartera_credito_routes_1.default);
app.use('/api/captaciones', captaciones_routes_1.default);
app.use('/api/cooperativa', cooperativa_routes_1.default);
// Redirección temporal para mantener compatibilidad con código existente
// Esta ruta debe eliminarse una vez que todas las referencias hayan sido actualizadas
app.use('/api/indicadores', (req, res, next) => {
    console.log(`[DEPRECATED] Acceso a ruta legacy: ${req.method} ${req.path}`);
    // Redirigir a los nuevos módulos según la ruta solicitada
    if (req.path.includes('/calcular-periodo')) {
        // Redirigir a kpi-contables para cálculos de indicadores
        req.url = req.url.replace('/calcular-periodo', '/rango-fechas');
        return (0, kpi_contables_routes_1.default)(req, res, next);
    }
    else {
        // Redirigir a indicadores-contables para otras operaciones
        return (0, indicadores_contables_routes_1.default)(req, res, next);
    }
});
app.use((err, req, res, next) => {
    if (err instanceof sequelize_1.ValidationError) {
        console.error('Error de validación de OpenAPI:', err.message);
        res.status(400).json({ message: 'Error de validación en la petición', errors: err.errors });
    }
    else {
        next(err); // Pasar el error al siguiente middleware si no es un error de validación de OpenAPI
    }
});
// Servir archivos estáticos desde la carpeta 'frontend'
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist')));
// Ruta principal para el frontend
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/dist/index.html'));
});
// Función de manejo para Vercel
function handleRequest(req, res) {
    app(req, res);
}
// Para desarrollo local
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
        console.log('La sincronización automática está deshabilitada temporalmente');
    });
}
exports.default = app;
// Manejar señales de terminación para cerrar correctamente las conexiones
process.on('SIGINT', async () => {
    console.log('Recibida señal SIGINT, cerrando conexiones...');
    if (process.env.ENABLE_SYNC === 'true') {
        await SincronizacionService_1.sincronizacionService.cerrar();
    }
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Recibida señal SIGTERM, cerrando conexiones...');
    if (process.env.ENABLE_SYNC === 'true') {
        await SincronizacionService_1.sincronizacionService.cerrar();
    }
    process.exit(0);
});

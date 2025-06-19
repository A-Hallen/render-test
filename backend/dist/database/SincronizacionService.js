"use strict";
/**
 * Servicio de sincronización entre el core financiero (MySQL) y Firebase
 * Este servicio extrae datos del core financiero y los sincroniza con Firebase
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sincronizacionService = exports.SincronizacionService = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const node_cron_1 = require("node-cron");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Cargar variables de entorno
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Configuración de Firebase Admin
const firebaseConfig = {
    credential: (0, app_1.cert)({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
};
// Inicializar Firebase Admin solo si no está ya inicializado
let firebaseApp;
try {
    // Intentar obtener la aplicación existente
    firebaseApp = (0, app_1.getApp)();
    console.log('Usando instancia existente de Firebase');
}
catch (error) {
    // Si no existe, inicializar una nueva
    console.log('Inicializando nueva instancia de Firebase');
    firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
}
const db = (0, firestore_1.getFirestore)(firebaseApp);
// Configuración de MySQL
const mysqlConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306')
};
/**
 * Servicio para sincronizar datos entre MySQL y Firebase
 */
class SincronizacionService {
    /**
     * Verifica si hay una sincronización en proceso
     */
    estaEnProceso() {
        return this.isSyncing;
    }
    /**
     * Obtiene la fecha de la última sincronización
     */
    getUltimaSincronizacion() {
        return this.lastSyncTime;
    }
    constructor() {
        this.isSyncing = false;
        // Crear pool de conexiones MySQL
        this.pool = promise_1.default.createPool(mysqlConfig);
        this.lastSyncTime = new Date(0); // Iniciar con fecha antigua para sincronizar todo
        console.log('Servicio de sincronización inicializado');
    }
    /**
     * Inicia la sincronización programada
     * @param cronExpression Expresión cron para la programación (por defecto cada 15 minutos)
     */
    iniciarSincronizacionProgramada(cronExpression = '*/15 * * * *') {
        console.log(`Sincronización programada iniciada con expresión: ${cronExpression}`);
        // Programar sincronización usando node-cron
        (0, node_cron_1.schedule)(cronExpression, async () => {
            try {
                if (this.isSyncing) {
                    console.warn('Ya hay una sincronización en curso, omitiendo...');
                    return;
                }
                console.log('Iniciando sincronización programada...');
                await this.sincronizarDatos();
                console.log('Sincronización programada completada');
            }
            catch (error) {
                console.error('Error en sincronización programada:', error);
            }
        });
        // Ejecutar una sincronización inicial
        this.sincronizarDatos().catch(error => {
            console.error('Error en sincronización inicial:', error);
        });
    }
    /**
     * Sincroniza datos entre MySQL y Firebase
     * @param forzarCompleta Si es true, sincroniza todos los datos ignorando lastSyncTime
     */
    async sincronizarDatos(forzarCompleta = false) {
        if (this.isSyncing) {
            throw new Error('Ya hay una sincronización en curso');
        }
        this.isSyncing = true;
        const startTime = new Date();
        try {
            console.log('Iniciando sincronización de datos...');
            // Sincronizar cada tipo de dato
            await this.sincronizarIndicadores(forzarCompleta);
            await this.sincronizarTransacciones(forzarCompleta);
            await this.sincronizarCaptaciones(forzarCompleta);
            await this.sincronizarColocaciones(forzarCompleta);
            await this.sincronizarInversiones(forzarCompleta);
            await this.sincronizarAtencionCliente(forzarCompleta);
            // Actualizar tiempo de última sincronización
            this.lastSyncTime = startTime;
            console.log(`Sincronización completada en ${new Date().getTime() - startTime.getTime()}ms`);
        }
        catch (error) {
            console.error('Error durante la sincronización:', error);
            throw error;
        }
        finally {
            this.isSyncing = false;
        }
    }
    /**
     * Sincroniza indicadores financieros
     */
    async sincronizarIndicadores(forzarCompleta) {
        console.log('Sincronizando indicadores financieros...');
        const connection = await this.pool.getConnection();
        try {
            // Consulta SQL para obtener indicadores
            const query = forzarCompleta
                ? 'SELECT * FROM indicadores_financieros WHERE es_activo = 1'
                : 'SELECT * FROM indicadores_financieros WHERE es_activo = 1 AND fecha_actualizacion > ?';
            const params = forzarCompleta ? [] : [this.lastSyncTime];
            const [rows] = await connection.execute(query, params);
            if (Array.isArray(rows) && rows.length > 0) {
                console.log(`Encontrados ${rows.length} indicadores para sincronizar`);
                // Procesar en lotes para evitar sobrecargar Firestore
                const batchSize = 500;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    await this.guardarLoteEnFirebase('datos_financieros', batch, 'indicador');
                }
            }
            else {
                console.log('No se encontraron indicadores nuevos para sincronizar');
            }
        }
        catch (error) {
            console.error('Error al sincronizar indicadores:', error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * Sincroniza transacciones
     */
    async sincronizarTransacciones(forzarCompleta) {
        console.log('Sincronizando transacciones...');
        const connection = await this.pool.getConnection();
        try {
            // Limitar a transacciones recientes si no es sincronización completa
            const query = forzarCompleta
                ? 'SELECT * FROM transacciones WHERE fecha > DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY fecha DESC LIMIT 10000'
                : 'SELECT * FROM transacciones WHERE fecha > ? ORDER BY fecha DESC LIMIT 10000';
            const params = forzarCompleta ? [] : [this.lastSyncTime];
            const [rows] = await connection.execute(query, params);
            if (Array.isArray(rows) && rows.length > 0) {
                console.log(`Encontradas ${rows.length} transacciones para sincronizar`);
                // Procesar en lotes
                const batchSize = 500;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    await this.guardarLoteEnFirebase('datos_financieros', batch, 'transaccion');
                }
            }
            else {
                console.log('No se encontraron transacciones nuevas para sincronizar');
            }
        }
        catch (error) {
            console.error('Error al sincronizar transacciones:', error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * Sincroniza datos de captaciones
     */
    async sincronizarCaptaciones(forzarCompleta) {
        console.log('Sincronizando datos de captaciones...');
        const connection = await this.pool.getConnection();
        try {
            const query = forzarCompleta
                ? 'SELECT * FROM captaciones WHERE fecha > DATE_SUB(NOW(), INTERVAL 90 DAY)'
                : 'SELECT * FROM captaciones WHERE fecha > ?';
            const params = forzarCompleta ? [] : [this.lastSyncTime];
            const [rows] = await connection.execute(query, params);
            if (Array.isArray(rows) && rows.length > 0) {
                console.log(`Encontrados ${rows.length} registros de captaciones para sincronizar`);
                // Procesar en lotes
                const batchSize = 500;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    await this.guardarLoteEnFirebase('datos_financieros', batch, 'captacion');
                }
            }
            else {
                console.log('No se encontraron datos de captaciones nuevos para sincronizar');
            }
        }
        catch (error) {
            console.error('Error al sincronizar captaciones:', error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * Sincroniza datos de colocaciones
     */
    async sincronizarColocaciones(forzarCompleta) {
        console.log('Sincronizando datos de colocaciones...');
        const connection = await this.pool.getConnection();
        try {
            const query = forzarCompleta
                ? 'SELECT * FROM colocaciones WHERE fecha > DATE_SUB(NOW(), INTERVAL 90 DAY)'
                : 'SELECT * FROM colocaciones WHERE fecha > ?';
            const params = forzarCompleta ? [] : [this.lastSyncTime];
            const [rows] = await connection.execute(query, params);
            if (Array.isArray(rows) && rows.length > 0) {
                console.log(`Encontrados ${rows.length} registros de colocaciones para sincronizar`);
                // Procesar en lotes
                const batchSize = 500;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    await this.guardarLoteEnFirebase('datos_financieros', batch, 'colocacion');
                }
            }
            else {
                console.log('No se encontraron datos de colocaciones nuevos para sincronizar');
            }
        }
        catch (error) {
            console.error('Error al sincronizar colocaciones:', error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * Sincroniza datos de inversiones
     */
    async sincronizarInversiones(forzarCompleta) {
        console.log('Sincronizando datos de inversiones...');
        const connection = await this.pool.getConnection();
        try {
            const query = forzarCompleta
                ? 'SELECT * FROM inversiones WHERE fecha > DATE_SUB(NOW(), INTERVAL 90 DAY)'
                : 'SELECT * FROM inversiones WHERE fecha > ?';
            const params = forzarCompleta ? [] : [this.lastSyncTime];
            const [rows] = await connection.execute(query, params);
            if (Array.isArray(rows) && rows.length > 0) {
                console.log(`Encontrados ${rows.length} registros de inversiones para sincronizar`);
                // Procesar en lotes
                const batchSize = 500;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    await this.guardarLoteEnFirebase('datos_financieros', batch, 'inversion');
                }
            }
            else {
                console.log('No se encontraron datos de inversiones nuevos para sincronizar');
            }
        }
        catch (error) {
            console.error('Error al sincronizar inversiones:', error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * Sincroniza datos de atención al cliente
     */
    async sincronizarAtencionCliente(forzarCompleta) {
        console.log('Sincronizando datos de atención al cliente...');
        const connection = await this.pool.getConnection();
        try {
            const query = forzarCompleta
                ? 'SELECT * FROM atencion_cliente WHERE fecha > DATE_SUB(NOW(), INTERVAL 90 DAY)'
                : 'SELECT * FROM atencion_cliente WHERE fecha > ?';
            const params = forzarCompleta ? [] : [this.lastSyncTime];
            const [rows] = await connection.execute(query, params);
            if (Array.isArray(rows) && rows.length > 0) {
                console.log(`Encontrados ${rows.length} registros de atención al cliente para sincronizar`);
                // Procesar en lotes
                const batchSize = 500;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    await this.guardarLoteEnFirebase('datos_financieros', batch, 'atencion');
                }
            }
            else {
                console.log('No se encontraron datos de atención al cliente nuevos para sincronizar');
            }
        }
        catch (error) {
            console.error('Error al sincronizar datos de atención al cliente:', error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * Guarda un lote de datos en Firebase
     */
    async guardarLoteEnFirebase(coleccion, datos, tipo) {
        try {
            // Crear un batch de Firestore
            const batch = db.batch();
            // Procesar cada documento
            for (const dato of datos) {
                // Transformar datos según el tipo
                const documento = this.transformarDatoParaFirebase(dato, tipo);
                // Crear referencia al documento (usar ID existente o generar uno)
                const docRef = dato.id
                    ? db.collection(coleccion).doc(dato.id.toString())
                    : db.collection(coleccion).doc();
                // Añadir al batch
                batch.set(docRef, documento);
            }
            // Ejecutar el batch
            await batch.commit();
            console.log(`Guardados ${datos.length} documentos de tipo ${tipo} en Firebase`);
        }
        catch (error) {
            console.error(`Error al guardar lote en Firebase (tipo: ${tipo}):`, error);
            throw error;
        }
    }
    /**
     * Transforma un dato de MySQL al formato requerido por Firebase
     */
    transformarDatoParaFirebase(dato, tipo) {
        // Base común para todos los tipos
        const base = {
            tipo: tipo,
            fuente: 'core_financiero',
            fecha: new Date(dato.fecha || dato.fecha_actualizacion || new Date()),
            fecha_sincronizacion: new Date(),
        };
        // Transformación específica según el tipo
        switch (tipo) {
            case 'indicador':
                return {
                    ...base,
                    codigo: dato.codigo,
                    nombre: dato.nombre,
                    dimensiones: {
                        oficina: dato.oficina_id,
                        modulo: dato.modulo_id,
                        categoria: dato.categoria || 'general'
                    },
                    metricas: {
                        valor: dato.valor || 0,
                        meta: dato.meta || 0,
                        variacion: dato.variacion || 0
                    },
                    atributos: {
                        tendencia: dato.tendencia || 'estable',
                        es_activo: dato.es_activo === 1,
                        esta_en_pantalla_principal: dato.esta_en_pantalla_principal === 1,
                        mayor_es_mejor: dato.mayor_es_mejor === 1
                    }
                };
            case 'transaccion':
                return {
                    ...base,
                    dimensiones: {
                        oficina: dato.oficina_id,
                        modulo: dato.modulo_id,
                        tipo: dato.tipo
                    },
                    metricas: {
                        monto: dato.monto || 0
                    },
                    atributos: {
                        cliente_id: dato.cliente_id,
                        producto_id: dato.producto_id,
                        estado: dato.estado,
                        detalles: dato.detalles || {}
                    }
                };
            case 'captacion':
                return {
                    ...base,
                    dimensiones: {
                        oficina: dato.oficina_id,
                        modulo: 'captaciones',
                        producto: dato.producto_id,
                        categoria: dato.categoria || 'general'
                    },
                    metricas: {
                        saldo: dato.saldo || 0,
                        cantidad: dato.cantidad || 0,
                        tasa: dato.tasa || 0
                    },
                    atributos: {
                        plazo: dato.plazo,
                        moneda: dato.moneda,
                        detalles: dato.detalles || {}
                    }
                };
            case 'colocacion':
                return {
                    ...base,
                    dimensiones: {
                        oficina: dato.oficina_id,
                        modulo: 'colocaciones',
                        producto: dato.producto_id,
                        categoria: dato.categoria || 'general'
                    },
                    metricas: {
                        saldo: dato.saldo || 0,
                        cantidad: dato.cantidad || 0,
                        tasa: dato.tasa || 0,
                        mora: dato.mora || 0
                    },
                    atributos: {
                        plazo: dato.plazo,
                        moneda: dato.moneda,
                        detalles: dato.detalles || {}
                    }
                };
            case 'inversion':
                return {
                    ...base,
                    dimensiones: {
                        oficina: dato.oficina_id,
                        modulo: 'inversiones',
                        tipo: dato.tipo_inversion,
                        categoria: dato.categoria || 'general'
                    },
                    metricas: {
                        monto: dato.monto || 0,
                        rendimiento: dato.rendimiento || 0,
                        plazo: dato.plazo || 0
                    },
                    atributos: {
                        riesgo: dato.riesgo,
                        moneda: dato.moneda,
                        detalles: dato.detalles || {}
                    }
                };
            case 'atencion':
                return {
                    ...base,
                    dimensiones: {
                        oficina: dato.oficina_id,
                        modulo: 'atencion',
                        canal: dato.canal,
                        categoria: dato.categoria || 'general'
                    },
                    metricas: {
                        cantidad: dato.cantidad || 0,
                        tiempo_promedio: dato.tiempo_promedio || 0,
                        satisfaccion: dato.satisfaccion || 0
                    },
                    atributos: {
                        tipo: dato.tipo_atencion,
                        detalles: dato.detalles || {}
                    }
                };
            default:
                // Transformación genérica para otros tipos
                return {
                    ...base,
                    ...dato,
                    _original: dato // Guardar datos originales por si se necesitan
                };
        }
    }
    /**
     * Cierra las conexiones del servicio
     */
    async cerrar() {
        console.log('Cerrando servicio de sincronización...');
        await this.pool.end();
        console.log('Servicio de sincronización cerrado');
    }
}
exports.SincronizacionService = SincronizacionService;
// Exportar una instancia del servicio para uso global
exports.sincronizacionService = new SincronizacionService();

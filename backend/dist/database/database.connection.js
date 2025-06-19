"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.testConnection = exports.getSequelize = void 0;
/**
 * Configuración de la conexión a la base de datos
 */
const sequelize_1 = require("sequelize");
require('custom-env').env();
let sequelizeInstance = null;
/**
 * Obtiene una instancia de Sequelize para conectar a la base de datos
 * @returns {Sequelize} Instancia de Sequelize
 */
const getSequelize = () => {
    if (sequelizeInstance) {
        return sequelizeInstance;
    }
    const dbName = process.env.DB_NAME;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
    const dialect = (process.env.SQL_DIALECT || 'mysql');
    console.log('[Database] Creando conexión a la base de datos');
    console.log(`[Database] DB_NAME: ${dbName}`);
    console.log(`[Database] DB_USER: ${dbUser}`);
    console.log(`[Database] DB_HOST: ${dbHost}`);
    console.log(`[Database] DB_PORT: ${dbPort}`);
    console.log(`[Database] SQL_DIALECT: ${dialect}`);
    sequelizeInstance = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: dialect,
        logging: false, // Desactivar logs de SQL
        define: {
            timestamps: false, // No usar timestamps por defecto
            freezeTableName: true, // No pluralizar nombres de tablas
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: {
            // Opciones específicas para MySQL
            multipleStatements: true, // Permitir múltiples declaraciones en una sola consulta
        },
    });
    return sequelizeInstance;
};
exports.getSequelize = getSequelize;
/**
 * Prueba la conexión a la base de datos
 * @returns {Promise<boolean>} True si la conexión es exitosa
 */
const testConnection = async () => {
    try {
        const sequelize = (0, exports.getSequelize)();
        await sequelize.authenticate();
        console.log('[Database] Conexión establecida correctamente');
        return true;
    }
    catch (error) {
        console.error('[Database] Error al conectar a la base de datos:', error);
        return false;
    }
};
exports.testConnection = testConnection;
// Exportar la instancia de Sequelize para uso directo
exports.sequelize = (0, exports.getSequelize)();

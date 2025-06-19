"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_connection_1 = require("../database/database.connection");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Script para crear la tabla REPORTES_CONTABILIDAD en la base de datos
 */
async function createReportesContabilidadTable() {
    try {
        console.log('Iniciando creación de tabla REPORTES_CONTABILIDAD...');
        // Leer el archivo SQL
        const sqlFilePath = path_1.default.join(__dirname, 'create-reportes-contabilidad-table.sql');
        const sqlScript = fs_1.default.readFileSync(sqlFilePath, 'utf8');
        // Ejecutar el script SQL
        await database_connection_1.sequelize.query(sqlScript);
        console.log('Tabla REPORTES_CONTABILIDAD creada exitosamente.');
    }
    catch (error) {
        console.error('Error al crear la tabla REPORTES_CONTABILIDAD:', error);
    }
    finally {
        // Cerrar la conexión
        await database_connection_1.sequelize.close();
    }
}
// Ejecutar la función
createReportesContabilidadTable();

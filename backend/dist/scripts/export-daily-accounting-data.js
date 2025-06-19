"use strict";
/**
 * Script para exportar datos contables diarios a archivos JSON
 *
 * Este script ejecuta una consulta para cada día del 1 al 29 de octubre de 2024
 * y guarda los resultados en archivos JSON separados por fecha.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const database_connection_1 = require("../database/database.connection");
const sequelize_1 = require("sequelize");
// Directorio donde se guardarán los archivos JSON
const OUTPUT_DIR = path.join(__dirname, '../../data/accounting-exports/junio');
// Asegurarse de que el directorio exista
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
// Consulta SQL base (sin la cláusula WHERE para la fecha)
const BASE_QUERY = `
SELECT DATE(SC.FECHA) as fecha, DD.NOMBREOFICINA as nombreOficina, DD.CODIGOOFICINA as codigoOficina,
       D.CODIGO as codigoCuentaContable, D.NOMBRE as nombreCuentaContable, CC.ESDEUDORA as esDeudora,
       IF(CC.ESDEUDORA = 1, SC.SALDOINICIAL + SC.TOTALDEBITO - SC.TOTALCREDITO,
          -1 * (SC.SALDOINICIAL + SC.TOTALDEBITO - SC.TOTALCREDITO)) as saldo
FROM \`FBS_CONTABILIDADES.SALDOCONTABLE\` SC
         INNER JOIN
     (
         SELECT CC.SECUENCIALDIVISION, CC.ESDEUDORA FROM
             \`FBS_CONTABILIDADES.CUENTACONTABLE\` CC
         WHERE CC.ESTAACTIVA = 1) CC
     ON CC.SECUENCIALDIVISION = SC.SECUENCIALCUENTACONTABLE
         INNER JOIN \`FBS_GENERALES.DIVISION\` D ON D.SECUENCIAL = CC.SECUENCIALDIVISION
         INNER JOIN
     (
         SELECT D.SECUENCIAL SECUENCIALOFICINA, D.CODIGO CODIGOOFICINA, D.NOMBRE NOMBREOFICINA FROM
             \`FBS_GENERALES.DIVISION\` D
         INNER JOIN \`FBS_GENERALES.NIVELDIVISION\` ND ON ND.SECUENCIAL = D.SECUENCIALNIVEL
         INNER JOIN \`FBS_GENERALES.TIPODIVISION\` T ON T.SECUENCIAL = ND.SECUENCIALTIPODIVISION
WHERE T.SECUENCIAL = 34
    ) DD ON DD.SECUENCIALOFICINA = SC.SECUENCIALDIVISIONORGANIZACION
WHERE SC.FECHA = :fecha
`;
/**
 * Ejecuta la consulta para una fecha específica y guarda los resultados en un archivo JSON
 * @param date Fecha en formato YYYY-MM-DD
 */
async function exportDataForDate(date) {
    try {
        console.log(`Procesando fecha: ${date}`);
        // Ejecutar la consulta usando Sequelize
        const rows = await database_connection_1.sequelize.query(BASE_QUERY, {
            replacements: { fecha: date },
            type: sequelize_1.QueryTypes.SELECT
        });
        // Nombre del archivo de salida basado en la fecha
        const outputFile = path.join(OUTPUT_DIR, `accounting-data-${date}.json`);
        // Guardar los resultados en un archivo JSON
        fs.writeFileSync(outputFile, JSON.stringify(rows, null, 2));
        console.log(`Datos guardados en: ${outputFile} (${rows.length} registros)`);
    }
    catch (error) {
        console.error(`Error al procesar la fecha ${date}:`, error);
    }
}
/**
 * Función principal que procesa todas las fechas
 */
async function main() {
    try {
        console.log('Iniciando exportación de datos contables');
        // Generar array de fechas del 1 al 29 de octubre de 2024
        const dates = [];
        for (let day = 1; day <= 30; day++) {
            // Formatear el día con ceros a la izquierda si es necesario
            const formattedDay = day.toString().padStart(2, '0');
            dates.push(`2025-06-${formattedDay}`);
        }
        // Procesar cada fecha secuencialmente para evitar sobrecargar la API
        for (const date of dates) {
            await exportDataForDate(date);
            // Pequeña pausa entre consultas para no sobrecargar la API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('Exportación completada con éxito');
    }
    catch (error) {
        console.error('Error durante la exportación:', error);
    }
}
// Ejecutar el script
main().catch(console.error);

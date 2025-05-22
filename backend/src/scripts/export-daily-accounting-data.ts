/**
 * Script para exportar datos contables diarios a archivos JSON
 * 
 * Este script ejecuta una consulta para cada día del 1 al 29 de octubre de 2024
 * y guarda los resultados en archivos JSON separados por fecha.
 */

import * as fs from 'fs';
import * as path from 'path';
import { sequelize } from '../database/database.connection';
import { QueryTypes } from 'sequelize';

// Directorio donde se guardarán los archivos JSON
const OUTPUT_DIR = path.join(__dirname, '../../data/accounting-exports/noviembre');

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
async function exportDataForDate(date: string): Promise<void> {
  try {
    console.log(`Procesando fecha: ${date}`);
    
    // Ejecutar la consulta usando Sequelize
    const rows = await sequelize.query(BASE_QUERY, {
      replacements: { fecha: date },
      type: QueryTypes.SELECT
    });
    
    // Nombre del archivo de salida basado en la fecha
    const outputFile = path.join(OUTPUT_DIR, `accounting-data-${date}.json`);
    
    // Guardar los resultados en un archivo JSON
    fs.writeFileSync(outputFile, JSON.stringify(rows, null, 2));
    
    console.log(`Datos guardados en: ${outputFile} (${rows.length} registros)`);
  } catch (error) {
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
    const dates: string[] = [];
    for (let day = 1; day <= 29; day++) {
      // Formatear el día con ceros a la izquierda si es necesario
      const formattedDay = day.toString().padStart(2, '0');
      dates.push(`2024-11-${formattedDay}`);
    }
    
    // Procesar cada fecha secuencialmente para evitar sobrecargar la API
    for (const date of dates) {
      await exportDataForDate(date);
      // Pequeña pausa entre consultas para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Exportación completada con éxito');
  } catch (error) {
    console.error('Error durante la exportación:', error);
  }
}

// Ejecutar el script
main().catch(console.error);

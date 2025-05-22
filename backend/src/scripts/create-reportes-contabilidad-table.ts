import { sequelize } from '../database/database.connection';
import fs from 'fs';
import path from 'path';

/**
 * Script para crear la tabla REPORTES_CONTABILIDAD en la base de datos
 */
async function createReportesContabilidadTable() {
  try {
    console.log('Iniciando creación de tabla REPORTES_CONTABILIDAD...');
    
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create-reportes-contabilidad-table.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Ejecutar el script SQL
    await sequelize.query(sqlScript);
    
    console.log('Tabla REPORTES_CONTABILIDAD creada exitosamente.');
  } catch (error) {
    console.error('Error al crear la tabla REPORTES_CONTABILIDAD:', error);
  } finally {
    // Cerrar la conexión
    await sequelize.close();
  }
}

// Ejecutar la función
createReportesContabilidadTable();

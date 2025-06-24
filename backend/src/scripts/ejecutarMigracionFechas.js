const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Compila y ejecuta el script de migración de fechas
 */
async function ejecutarMigracionFechas() {
  console.log('Compilando script de migración...');

  // Compilar el script TypeScript usando el tsconfig del proyecto
  try {
    await new Promise((resolve, reject) => {
      // Usar el compilador de TypeScript del proyecto
      exec('npx ts-node ./src/scripts/migrarFechasATimestamp.ts', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        resolve();
      });
    });

    console.log('Migración completada con éxito');
  } catch (error) {
    console.error('Error al ejecutar el script:', error);
    
    // Verificar si ts-node está instalado
    if (error.message && error.message.includes('ts-node')) {
      console.log('Intentando instalar ts-node...');
      try {
        await new Promise((resolve, reject) => {
          exec('npm install --save-dev ts-node', (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            console.log('ts-node instalado correctamente. Reintentando ejecución...');
            resolve();
          });
        });
        
        // Reintentar la ejecución
        await new Promise((resolve, reject) => {
          exec('npx ts-node ./src/scripts/migrarFechasATimestamp.ts', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            resolve();
          });
        });
        
        console.log('Migración completada con éxito');
      } catch (installError) {
        console.error('Error al instalar o ejecutar con ts-node:', installError);
      }
    }
  }
}

ejecutarMigracionFechas();

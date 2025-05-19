const admin = require("firebase-admin");
const { Sequelize, QueryTypes } = require("sequelize");
const serviceAccount = require("../database/service-account-key.json"); // Tu archivo de credenciales Firebase
const path = require("path");
require("custom-env").env();
const fs = require('fs');

// Configura Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const firestore = admin.firestore();

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
// Configura Sequelize (usa tu configuración existente)
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: "mysql",
});

// Configurar archivo de progreso
const PROGRESS_FILE = path.join(__dirname, "migration_progress.json");

async function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
    }
  } catch (error) {
    console.error("Error leyendo archivo de progreso:", error);
  }
  return { offset: 0, totalMigrated: 0 };
}

async function saveProgress(offset, totalMigrated) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ offset, totalMigrated }));
  } catch (error) {
    console.error("Error guardando progreso:", error);
  }
}

async function migrateSingleTable() {
  try {
    // Cargar progreso anterior o empezar desde 0
    const progress = await loadProgress();
    let { offset, totalMigrated } = progress;
    const batchSize = 100;
    let hasMoreData = true;

    while (hasMoreData) {
      // Consulta SQL con paginación
      const queryString = `
      SELECT Date(sc.FECHA) as fecha, d1.NOMBRE as nombreOficina, d1.CODIGO as codigoOficina, 
            d.CODIGO as codigoCuentaContable, d.NOMBRE as nombreCuentaContable, cc.ESDEUDORA as esDeudora,
            CASE WHEN cc.ESDEUDORA = 1 THEN sc.SALDOINICIAL + sc.TOTALDEBITO - sc.TOTALCREDITO 
                 ELSE -1 * (sc.SALDOINICIAL + sc.TOTALDEBITO - sc.TOTALCREDITO) END as saldo
          FROM 
            \`FBS_CONTABILIDADES.SALDOCONTABLE\` sc
            INNER JOIN \`FBS_CONTABILIDADES.CUENTACONTABLE\` cc 
              ON cc.SECUENCIALDivision = sc.SECUENCIALCUENTACONTABLE
            INNER JOIN \`FBS_GENERALES.DIVISION\` d 
              ON d.secuencial = cc.secuencialdivision
            INNER JOIN \`FBS_GENERALES.DIVISION\` d1 
              ON d1.secuencial = sc.SECUENCIALDIVISIONORGANIZACION
          WHERE 
            sc.FECHA >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR) AND
            cc.ESTAACTIVA = 1
            LIMIT ${batchSize}
            OFFSET ${offset}
    `;
  
      console.time('consulta');
      const registros = await sequelize.query(queryString, {
        type: QueryTypes.SELECT,
      });
      console.timeEnd('consulta');
      
      if(offset == 0){
        console.log(`Migrando ${registros.length} registros en 5s...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Migrando ${registros.length} registros en 4s...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Migrando ${registros.length} registros en 3s...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Migrando ${registros.length} registros en 2s...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Migrando ${registros.length} registros en 1s...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      

      console.time('push to firebase');
      // Usar Batch para escritura eficiente
      const batch = firestore.batch();
      const collectionRef = firestore.collection("SaldosContables");
      let batchCount = 0;

      for (const registro of registros) {
        const docRef = collectionRef.doc();
        const firestoreData = {
          ...registro,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        batch.set(docRef, firestoreData);
        batchCount++;
      }

      // Confirmar el batch
      await batch.commit();
      console.timeEnd('push to firebase');

      totalMigrated += registros.length;
      offset += batchSize;

      // Guardar progreso después de cada batch
      await saveProgress(offset, totalMigrated);
      console.log(`Batch completado. Total migrado: ${totalMigrated}`);
    }

    console.log(
      `Migración completada exitosamente! Total registros migrados: ${totalMigrated}`
    );
  } catch (error) {
    console.error("Error durante la migración:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrateSingleTable();

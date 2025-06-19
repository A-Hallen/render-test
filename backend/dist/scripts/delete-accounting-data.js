"use strict";
/**
 * Script para eliminar datos contables del 28 de febrero de 2025 de Firebase
 *
 * Este script elimina todos los registros de la colección "SaldosContables"
 * que corresponden al 28 de febrero de 2025 que fueron subidos por error.
 * Implementa un sistema de eliminación por lotes para manejar grandes volúmenes de datos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_config_1 = require("../config/firebase.config");
// Fecha específica a eliminar (28 de febrero de 2025)
const TARGET_DATE = '2025-02-28';
// Configuración de lotes
const BATCH_SIZE = 500; // Número máximo de documentos por lote (límite de Firestore es 500)
/**
 * Elimina los registros de Firebase para una fecha específica usando lotes
 * @param date Fecha en formato YYYY-MM-DD
 */
async function deleteDataForDate(date) {
    try {
        console.log(`Iniciando eliminación de datos para la fecha: ${date}`);
        // Referencia a la colección
        const collectionRef = firebase_config_1.firestore.collection('SaldosContables');
        // Eliminar documentos con fecha como string (formato yyyy-mm-dd)
        await deleteDocumentsInBatches(collectionRef, 'fecha', '==', date, 'string');
    }
    catch (error) {
        console.error(`Error al eliminar datos para la fecha ${date}:`, error);
    }
}
/**
 * Elimina documentos en lotes basados en una consulta de igualdad
 * @param collectionRef Referencia a la colección
 * @param field Campo a filtrar
 * @param operator Operador de comparación
 * @param value Valor a comparar
 * @param formatLabel Etiqueta para el formato (para logs)
 */
async function deleteDocumentsInBatches(collectionRef, field, operator, value, formatLabel) {
    let totalDeleted = 0;
    let batchNumber = 1;
    let hasMoreDocuments = true;
    // Usamos un enfoque de paginación para procesar grandes conjuntos de datos
    while (hasMoreDocuments) {
        // Consulta limitada al tamaño del lote
        const query = collectionRef
            .where(field, operator, value)
            .limit(BATCH_SIZE);
        const snapshot = await query.get();
        if (snapshot.empty) {
            console.log(`No se encontraron más documentos con ${field} ${operator} ${value} (formato ${formatLabel}).`);
            hasMoreDocuments = false;
            break;
        }
        // Crear un nuevo lote
        const batch = firebase_config_1.firestore.batch();
        let batchSize = 0;
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
            batchSize++;
        });
        // Ejecutar el lote
        await batch.commit();
        totalDeleted += batchSize;
        console.log(`Lote #${batchNumber}: Se eliminaron ${batchSize} documentos (formato ${formatLabel}). Total: ${totalDeleted}`);
        batchNumber++;
        // Si el tamaño del lote es menor que el máximo, hemos terminado
        if (batchSize < BATCH_SIZE) {
            hasMoreDocuments = false;
        }
        // Pequeña pausa para evitar sobrecargar Firestore
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(`Eliminación completada: ${totalDeleted} documentos eliminados (formato ${formatLabel}).`);
}
/**
 * Función principal
 */
async function main() {
    try {
        console.log('Iniciando proceso de eliminación de datos contables incorrectos');
        console.log(`Fecha objetivo: ${TARGET_DATE}`);
        console.log(`Tamaño de lote: ${BATCH_SIZE} documentos`);
        console.log('---------------------------------------------------');
        // Eliminar datos para la fecha específica
        await deleteDataForDate(TARGET_DATE);
        console.log('---------------------------------------------------');
        console.log('Proceso de eliminación completado exitosamente');
    }
    catch (error) {
        console.error('Error durante el proceso de eliminación:', error);
    }
    finally {
        // Cerrar la conexión con Firebase
        console.log('Cerrando conexión con Firebase...');
        process.exit(0);
    }
}
// Ejecutar el script
main().catch(console.error);

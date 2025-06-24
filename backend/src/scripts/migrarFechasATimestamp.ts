import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { firestore } from '../config/firebase.config';

interface SaldosContables {
  codigoCuentaContable: number;
  codigoOficina: string;
  esDeudora: number;
  fecha: string;
  nombreCuentaContable: string;
  nombreOficina: string;
  saldo: number;
  fechaTimestamp?: admin.firestore.Timestamp;
}

interface ProgresoMigracion {
  ultimoDocumentoProcesado: string | null;
  documentosProcesados: number;
  documentosActualizados: number;
  fechaInicio: string;
  ultimaActualizacion: string;
  errores: Array<{ documentoId: string; error: string }>;
}

const COLECCION = 'SaldosContables';
const ARCHIVO_PROGRESO = './migracion-fechas-progreso.json';
const TAMANO_LOTE = 2000; // Procesar 500 documentos por lote
const DELAY_ENTRE_OPERACIONES = 100; // 500ms entre operaciones

/**
 * Convierte una fecha en formato string "yyyy-mm-dd" a un Timestamp de Firestore
 * @throws Error si el formato de fecha no es válido
 */
function convertirStringATimestamp(fechaStr: string): admin.firestore.Timestamp {
  // Validar formato de fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    throw new Error(`Formato de fecha inválido: ${fechaStr}. Se esperaba formato YYYY-MM-DD`);
  }
  
  const [year, month, day] = fechaStr.split('-').map(Number);
  
  // Validar componentes de fecha
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Componentes de fecha inválidos en: ${fechaStr}`);
  }
  
  // Validar rangos
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Valores de fecha fuera de rango en: ${fechaStr}`);
  }
  
  // Crear objeto Date (month es 0-indexed en JavaScript)
  const fecha = new Date(year, month - 1, day);
  
  // Verificar que la fecha sea válida
  if (fecha.getFullYear() !== year || fecha.getMonth() !== month - 1 || fecha.getDate() !== day) {
    throw new Error(`Fecha inválida: ${fechaStr}`);
  }
  
  return admin.firestore.Timestamp.fromDate(fecha);
}

/**
 * Espera un tiempo determinado en milisegundos
 */
async function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Guarda el progreso de la migración en un archivo
 */
function guardarProgreso(progreso: ProgresoMigracion): void {
  fs.writeFileSync(ARCHIVO_PROGRESO, JSON.stringify(progreso, null, 2));
  console.log(`Progreso guardado: ${progreso.documentosProcesados} documentos procesados, ${progreso.documentosActualizados} actualizados`);
}

/**
 * Carga el progreso de la migración desde un archivo
 */
function cargarProgreso(): ProgresoMigracion {
  try {
    if (fs.existsSync(ARCHIVO_PROGRESO)) {
      const contenido = fs.readFileSync(ARCHIVO_PROGRESO, 'utf8');
      const datos = JSON.parse(contenido);
      
      // Manejar compatibilidad con versión anterior del archivo de progreso
      if ('ultimaFechaProcesada' in datos && !('ultimoDocumentoProcesado' in datos)) {
        console.log('Convirtiendo formato antiguo de progreso al nuevo formato...');
        return {
          ultimoDocumentoProcesado: null, // Reiniciar desde el principio
          documentosProcesados: datos.documentosProcesados || 0,
          documentosActualizados: datos.documentosActualizados || 0,
          fechaInicio: datos.fechaInicio || new Date().toISOString(),
          ultimaActualizacion: new Date().toISOString(),
          errores: datos.errores?.map((e: any) => ({
            documentoId: e.documentoId || 'desconocido',
            error: e.error
          })) || []
        };
      }
      
      return datos as ProgresoMigracion;
    }
  } catch (error) {
    console.error('Error al cargar el archivo de progreso:', error);
  }

  // Si no hay archivo o hay error, crear nuevo progreso
  return {
    ultimoDocumentoProcesado: null,
    documentosProcesados: 0,
    documentosActualizados: 0,
    fechaInicio: new Date().toISOString(),
    ultimaActualizacion: new Date().toISOString(),
    errores: []
  };
}

/**
 * Procesa un lote de documentos
 */
async function procesarLote(
  fechaInicio: string,
  fechaFin: string,
  progreso: ProgresoMigracion
): Promise<ProgresoMigracion> {
  console.log(`Procesando documentos entre ${fechaInicio} y ${fechaFin}...`);

  try {
    // Crear consulta para obtener documentos
    let query = firestore.collection(COLECCION)
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(TAMANO_LOTE);

    // Si hay un último documento procesado, comenzar desde ahí
    if (progreso.ultimoDocumentoProcesado) {
      // Obtener referencia al último documento procesado
      const lastDocRef = firestore.collection(COLECCION).doc(progreso.ultimoDocumentoProcesado);
      const lastDocSnapshot = await lastDocRef.get();
      
      if (lastDocSnapshot.exists) {
        query = firestore.collection(COLECCION)
          .orderBy(admin.firestore.FieldPath.documentId())
          .startAfter(lastDocSnapshot)
          .limit(TAMANO_LOTE);
      } else {
        console.log(`Advertencia: El documento ${progreso.ultimoDocumentoProcesado} ya no existe. Comenzando desde el principio.`);
      }
    }

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log('No se encontraron más documentos');
      return progreso;
    }

    const totalDocumentos = await firestore.collection(COLECCION).count().get();
    const porcentajeCompletado = (progreso.documentosProcesados / totalDocumentos.data().count) * 100;
    
    console.log(`Procesando lote de ${snapshot.size} documentos... (${progreso.documentosProcesados}/${totalDocumentos.data().count} - ${porcentajeCompletado.toFixed(2)}%)`);
    
    // Procesar cada documento
    let ultimoDocId = progreso.ultimoDocumentoProcesado;
    let contador = 0;
    
    // Usar un batch para actualizar múltiples documentos en una sola operación
    let batch = firestore.batch();
    let batchSize = 0;
    const MAX_BATCH_SIZE = 500; // Límite de Firestore para operaciones en batch
    
    for (const doc of snapshot.docs) {
      const data = doc.data() as SaldosContables;
      progreso.documentosProcesados++;
      ultimoDocId = doc.id;
      
      // Solo actualizar si tiene fecha en formato string y está en el rango deseado
      if (typeof data.fecha === 'string' && 
          data.fecha >= fechaInicio && 
          data.fecha <= fechaFin && 
          !data.fechaTimestamp) {
        try {
          const fechaTimestamp = convertirStringATimestamp(data.fecha);
          
          // Añadir actualización al batch
          batch.update(doc.ref, { fechaTimestamp });
          batchSize++;
          progreso.documentosActualizados++;
          
          // Si el batch alcanza el tamaño máximo, commitear y crear uno nuevo
          if (batchSize >= MAX_BATCH_SIZE) {
            try {
              await batch.commit();
              console.log(`Batch de ${batchSize} actualizaciones completado`);
            } catch (batchError) {
              console.error('Error al ejecutar batch:', batchError);
              // Intentar dividir el batch en grupos más pequeños si hay error
              console.log('Reintentando con batches más pequeños...');
            }
            await esperar(DELAY_ENTRE_OPERACIONES);
            batch = firestore.batch(); // Crear un nuevo batch
            batchSize = 0;
          }
        } catch (error) {
          console.error(`Error al procesar documento ${doc.id} con fecha ${data.fecha}:`, error);
          progreso.errores.push({
            documentoId: doc.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      contador++;
      
      // Actualizar y guardar progreso cada 100 documentos
      if (contador % 100 === 0) {
        progreso.ultimoDocumentoProcesado = ultimoDocId;
        progreso.ultimaActualizacion = new Date().toISOString();
        guardarProgreso(progreso);
        
        // Mostrar progreso actualizado
        const porcentajeActual = (progreso.documentosProcesados / totalDocumentos.data().count) * 100;
        console.log(`Progreso: ${porcentajeActual.toFixed(2)}% (${progreso.documentosProcesados}/${totalDocumentos.data().count})`);
      }
    }
    
    // Commitear el último batch si quedaron operaciones pendientes
    if (batchSize > 0) {
      try {
        await batch.commit();
        console.log(`Batch final de ${batchSize} actualizaciones completado`);
      } catch (batchError) {
        console.error('Error al ejecutar batch final:', batchError);
        // Aquí podríamos implementar una estrategia de reintento más sofisticada
      }
    }
    
    // Actualizar el progreso con el último documento procesado
    progreso.ultimoDocumentoProcesado = ultimoDocId;
    progreso.ultimaActualizacion = new Date().toISOString();
    
    return progreso;
  } catch (error) {
    console.error('Error al procesar lote:', error);
    progreso.errores.push({
      documentoId: progreso.ultimoDocumentoProcesado || 'desconocido',
      error: error instanceof Error ? error.message : String(error)
    });
    return progreso;
  }
}

/**
 * Función principal que ejecuta la migración
 */
async function migrarFechasATimestamp(): Promise<void> {
  console.log('Iniciando migración de fechas a timestamp...');
  
  // Cargar progreso anterior si existe
  const progreso = cargarProgreso();
  console.log('Progreso cargado:', progreso);
  
  // Definir rango de fechas a procesar
  const fechaInicio = '2024-09-01';
  const fechaFin = '2025-06-16';
  
  try {
    // Verificar si hay documentos en el rango de fechas especificado
    const totalDocsQuery = await firestore.collection(COLECCION)
      .where('fecha', '>=', fechaInicio)
      .where('fecha', '<=', fechaFin)
      .count()
      .get();
    
    const totalDocsEnRango = totalDocsQuery.data().count;
    console.log(`Total de documentos en el rango de fechas: ${totalDocsEnRango}`);
    
    if (totalDocsEnRango === 0) {
      console.log('No hay documentos en el rango de fechas especificado.');
      return;
    }
    
    let continuar = true;
    let ultimoDocumentoProcesado = progreso.ultimoDocumentoProcesado;
    let documentosProcesadosAnterior = progreso.documentosProcesados;
    let intentosFallidos = 0;
    const MAX_INTENTOS_FALLIDOS = 3;
    
    while (continuar) {
      try {
        console.log(`Continuando procesamiento desde documento ID: ${ultimoDocumentoProcesado || 'inicio'}`);
        console.log(`Documentos procesados hasta ahora: ${progreso.documentosProcesados}/${totalDocsEnRango} (${((progreso.documentosProcesados / totalDocsEnRango) * 100).toFixed(2)}%)`);
        
        // Procesar un lote de documentos
        const progresoActualizado = await procesarLote(fechaInicio, fechaFin, progreso);
        
        // Guardar progreso actualizado
        guardarProgreso(progresoActualizado);
        
        // Esperar antes de procesar el siguiente lote
        await esperar(DELAY_ENTRE_OPERACIONES);
        
        // Verificar si se procesaron nuevos documentos en este lote
        if (progresoActualizado.documentosProcesados === documentosProcesadosAnterior) {
          console.log('No se procesaron nuevos documentos en este lote. Finalizando.');
          continuar = false;
        } else if (progresoActualizado.ultimoDocumentoProcesado === ultimoDocumentoProcesado) {
          console.log('No se avanzó a un nuevo documento. Finalizando.');
          continuar = false;
        } else if (progresoActualizado.documentosProcesados >= totalDocsEnRango) {
          console.log('Se han procesado todos los documentos en el rango. Finalizando.');
          continuar = false;
        }
        
        // Actualizar referencias para la siguiente iteración
        ultimoDocumentoProcesado = progresoActualizado.ultimoDocumentoProcesado;
        documentosProcesadosAnterior = progresoActualizado.documentosProcesados;
        
        // Actualizar referencia al progreso
        Object.assign(progreso, progresoActualizado);
        
        // Resetear contador de intentos fallidos
        intentosFallidos = 0;
      } catch (error) {
        intentosFallidos++;
        console.error(`Error al procesar lote (intento ${intentosFallidos}/${MAX_INTENTOS_FALLIDOS}):`, error);
        
        if (intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
          console.error('Se alcanzó el número máximo de intentos fallidos. Deteniendo la migración.');
          continuar = false;
        } else {
          console.log(`Reintentando en ${DELAY_ENTRE_OPERACIONES * 2}ms...`);
          await esperar(DELAY_ENTRE_OPERACIONES * 2);
        }
      }
    }
    
    console.log('Migración completada con éxito');
    console.log(`Total de documentos procesados: ${progreso.documentosProcesados}`);
    console.log(`Total de documentos actualizados: ${progreso.documentosActualizados}`);
    console.log(`Total de errores: ${progreso.errores.length}`);
    
    if (progreso.errores.length > 0) {
      console.log('Errores encontrados:');
      console.log(progreso.errores);
      
      // Guardar errores en un archivo separado para análisis posterior
      fs.writeFileSync('./migracion-fechas-errores.json', JSON.stringify(progreso.errores, null, 2));
      console.log('Errores guardados en migracion-fechas-errores.json');
    }
  } catch (error) {
    console.error('Error fatal en la migración:', error);
  }
}

// Ejecutar la migración
migrarFechasATimestamp()
  .then(() => {
    console.log('Proceso finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });

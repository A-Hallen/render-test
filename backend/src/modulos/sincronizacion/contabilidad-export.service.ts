/**
 * Servicio para exportar datos contables a Firebase
 * Este servicio extrae datos contables de MySQL y los guarda en Firebase
 * Incluye integración con el sistema de notificaciones para informar a los administradores
 */

import * as fs from 'fs';
import * as path from 'path';
import { sequelize } from '../../database/database.connection';
import { QueryTypes } from 'sequelize';
import { firestore } from '../../config/firebase.config';
import { NotificationService } from '../notifications/notification.service';
import { NotificationPayload } from '../notifications/interfaces/notification.interface';

/**
 * Servicio para exportar datos contables a Firebase
 */
export class ContabilidadExportService {
  private isSyncing: boolean = false;
  private lastSyncTime: Date | null = null;
  private notificationService: NotificationService;
  private exportProgress: {
    total: number;
    processed: number;
    success: number;
    failed: number;
    startTime: Date | null;
  } = {
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    startTime: null
  };
  
  constructor() {
    this.notificationService = new NotificationService();
    console.log('Servicio de exportación de datos contables inicializado');
  }
  
  /**
   * Verifica si hay una exportación en proceso
   */
  public estaEnProceso(): boolean {
    return this.isSyncing;
  }
  
  /**
   * Obtiene la fecha de la última exportación
   */
  public getUltimaExportacion(): Date | null {
    return this.lastSyncTime;
  }

  /**
   * Obtiene el progreso actual de la exportación
   */
  public getProgresoExportacion() {
    return {
      ...this.exportProgress,
      enProceso: this.isSyncing,
      porcentajeCompletado: this.exportProgress.total > 0 
        ? Math.round((this.exportProgress.processed / this.exportProgress.total) * 100) 
        : 0,
      tiempoTranscurrido: this.exportProgress.startTime 
        ? Math.round((new Date().getTime() - this.exportProgress.startTime.getTime()) / 1000) 
        : 0
    };
  }
  
  /**
   * Exporta datos contables para un rango de fechas
   * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
   * @param fechaFin Fecha de fin en formato YYYY-MM-DD
   * @param guardarArchivos Si es true, guarda los archivos JSON en disco
   * @param usuarioId ID del usuario que inició la exportación (opcional)
   * @returns Resultado de la exportación
   */
  async exportarDatosContables(
    fechaInicio: string, 
    fechaFin: string,
    guardarArchivos: boolean = false,
    usuarioId?: string
  ): Promise<{ exito: boolean; mensaje: string; registros: number }> {
    if (this.isSyncing) {
      throw new Error('Ya hay una exportación en proceso');
    }
    
    this.isSyncing = true;
    const startTime = new Date();
    
    // Reiniciar el progreso
    this.exportProgress = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      startTime
    };
    
    let totalRegistros = 0;
    
    // Notificar inicio de exportación a administradores
    await this.notificarAdministradores({
      title: 'Exportación de datos contables iniciada',
      body: `Se ha iniciado la exportación de datos contables del ${fechaInicio} al ${fechaFin}`,
      type: 'info',
      data: {
        fechaInicio,
        fechaFin,
        iniciadaPor: usuarioId || 'sistema'
      }
    });

    try {
      console.log(`Iniciando exportación de datos contables del ${fechaInicio} al ${fechaFin}...`);
      
      // Generar array de fechas en el rango
      const fechas = this.generarRangoFechas(fechaInicio, fechaFin);
      
      // Establecer el total de fechas a procesar
      this.exportProgress.total = fechas.length;
      
      // Procesar cada fecha
      for (const fecha of fechas) {
        try {
          const registros = await this.exportarDatosPorFecha(fecha, guardarArchivos);
          totalRegistros += registros;
          this.exportProgress.processed++;
          this.exportProgress.success++;
          
          // Notificar progreso cada 5 fechas procesadas o al 25%, 50%, 75% del total
          const porcentaje = Math.round((this.exportProgress.processed / this.exportProgress.total) * 100);
          if (this.exportProgress.processed % 5 === 0 || [25, 50, 75].includes(porcentaje)) {
            await this.notificarProgreso(porcentaje, fechaInicio, fechaFin);
          }
        } catch (error) {
          console.error(`Error al procesar fecha ${fecha}:`, error);
          this.exportProgress.processed++;
          this.exportProgress.failed++;
        }
        
        // Pequeña pausa entre consultas para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Actualizar tiempo de última exportación
      this.lastSyncTime = startTime;
      
      const duracion = new Date().getTime() - startTime.getTime();
      const duracionFormateada = this.formatearDuracion(duracion);
      const mensaje = `Exportación completada en ${duracionFormateada}. ${totalRegistros} registros procesados.`;
      console.log(mensaje);
      
      // Notificar finalización exitosa
      await this.notificarAdministradores({
        title: 'Exportación de datos contables completada',
        body: mensaje,
        type: 'success',
        data: {
          fechaInicio,
          fechaFin,
          registros: totalRegistros.toString(),
          duracion: duracionFormateada,
          exito: 'true'
        }
      });
      
      return {
        exito: true,
        mensaje,
        registros: totalRegistros
      };
    } catch (error: any) {
      console.error('Error durante la exportación de datos contables:', error);
      
      // Notificar error
      await this.notificarAdministradores({
        title: 'Error en exportación de datos contables',
        body: `Se ha producido un error durante la exportación: ${error.message}`,
        type: 'error',
        data: {
          fechaInicio,
          fechaFin,
          error: error.message,
          exito: 'false'
        }
      });
      
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Exporta datos contables para una fecha específica
   * @param fecha Fecha en formato YYYY-MM-DD
   * @param guardarArchivo Si es true, guarda el archivo JSON en disco
   * @returns Número de registros exportados
   */
  private async exportarDatosPorFecha(fecha: string, guardarArchivo: boolean = false): Promise<number> {
    console.log(`Exportando datos contables para ${fecha}...`);
    
    // Consulta SQL para obtener datos contables por fecha
    const query = `
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
    
    // Ejecutar consulta
    const resultados = await sequelize.query(query, {
      replacements: { fecha: fecha },
      type: QueryTypes.SELECT
    });
    
    if (resultados.length === 0) {
      console.log(`No hay datos contables para ${fecha}`);
      return 0;
    }
    
    // Guardar en Firebase
    await this.guardarEnFirebase(fecha, resultados);
    
    // Guardar archivo JSON si se solicita
    if (guardarArchivo) {
      await this.guardarArchivoJSON(fecha, resultados);
    }
    
    console.log(`Exportados ${resultados.length} registros contables para ${fecha}`);
    return resultados.length;
  }
  
  /**
   * Guarda los datos contables en Firebase
   * @param fecha Fecha de los datos
   * @param datos Datos contables
   */
  private async guardarEnFirebase(fecha: string, datos: any[]): Promise<void> {
    try {
      // Referencia a la colección en Firestore
      const coleccion = `SaldosContablesTemp`;
      
      // Crear batch para operaciones en lote
      const batch = firestore.batch();
      
      // Procesar cada registro
      for (const registro of datos) {
        const docRef = firestore.collection(coleccion).doc(`${registro.id}`);
        batch.set(docRef, {
          ...registro,
          updatedAt: new Date()
        });
      }
      
      // Ejecutar batch
      await batch.commit();
      
      console.log(`Datos guardados en Firebase: ${coleccion}`);
    } catch (error) {
      console.error(`Error al guardar datos en Firebase para ${fecha}:`, error);
      throw error;
    }
  }
  
  /**
   * Guarda los datos contables en un archivo JSON
   * @param fecha Fecha de los datos
   * @param datos Datos contables
   */
  private async guardarArchivoJSON(fecha: string, datos: any[]): Promise<void> {
    try {
      // Crear directorio si no existe
      const dirPath = path.join(process.cwd(), 'exports', 'contabilidad');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Ruta del archivo
      const filePath = path.join(dirPath, `contabilidad_${fecha}.json`);
      
      // Guardar archivo
      fs.writeFileSync(filePath, JSON.stringify(datos, null, 2));
      
      console.log(`Archivo JSON guardado: ${filePath}`);
    } catch (error) {
      console.error(`Error al guardar archivo JSON para ${fecha}:`, error);
      // No lanzar error para continuar con el proceso
    }
  }
  
  /**
   * Genera un array de fechas en el rango especificado
   * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
   * @param fechaFin Fecha de fin en formato YYYY-MM-DD
   * @returns Array de fechas en formato YYYY-MM-DD
   */
  private generarRangoFechas(fechaInicio: string, fechaFin: string): string[] {
    const fechas: string[] = [];
    const currentDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    
    // Asegurar que las fechas son válidas
    if (isNaN(currentDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Fechas inválidas');
    }
    
    // Generar array de fechas
    while (currentDate <= endDate) {
      fechas.push(this.formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return fechas;
  }
  
  /**
   * Formatea una fecha a formato YYYY-MM-DD
   * @param date Objeto Date
   * @returns Fecha formateada
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Formatea una duración en milisegundos a un formato legible
   * @param duracionMs Duración en milisegundos
   * @returns Duración formateada
   */
  private formatearDuracion(duracionMs: number): string {
    const segundos = Math.floor(duracionMs / 1000);
    
    if (segundos < 60) {
      return `${segundos} segundos`;
    }
    
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    
    if (minutos < 60) {
      return `${minutos} minutos y ${segundosRestantes} segundos`;
    }
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    return `${horas} horas, ${minutosRestantes} minutos y ${segundosRestantes} segundos`;
  }
  
  /**
   * Envía una notificación a todos los usuarios administradores
   */
  private async notificarAdministradores(notificacion: NotificationPayload): Promise<void> {
    try {
      // Obtener IDs de usuarios administradores
      const usersRef = firestore.collection('users');
      const snapshot = await usersRef.where('role', '==', 'admin').get();
      
      if (snapshot.empty) {
        console.log('No se encontraron usuarios administradores');
        return;
      }
      
      const adminUserIds = snapshot.docs.map(doc => doc.id);
      
      if (adminUserIds.length > 0) {
        // Enviar notificación a todos los administradores
        await this.notificationService.sendNotificationToMultipleUsers(
          adminUserIds,
          notificacion
        );
      }
    } catch (error) {
      console.error('Error al notificar a administradores:', error);
    }
  }
  
  /**
   * Notifica el progreso de la exportación
   */
  private async notificarProgreso(porcentaje: number, fechaInicio: string, fechaFin: string): Promise<void> {
    const duracionMs = this.exportProgress.startTime 
      ? new Date().getTime() - this.exportProgress.startTime.getTime() 
      : 0;
    
    await this.notificarAdministradores({
      title: `Exportación de datos contables: ${porcentaje}% completado`,
      body: `Se han procesado ${this.exportProgress.processed} de ${this.exportProgress.total} fechas. ${this.formatearDuracion(duracionMs)} transcurridos.`,
      type: 'info',
      data: {
        fechaInicio,
        fechaFin,
        porcentaje: porcentaje.toString(),
        procesadas: this.exportProgress.processed.toString(),
        total: this.exportProgress.total.toString()
      }
    });
  }
}

// Exportar una instancia del servicio para uso global
export const contabilidadExportService = new ContabilidadExportService();

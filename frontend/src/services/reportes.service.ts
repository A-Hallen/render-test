/**
 * Servicio para gestionar los reportes contables
 * Utiliza el cliente HTTP centralizado para manejar automáticamente
 * tokens y errores de autenticación
 */

import { httpClient } from './httpClient';

/**
 * Obtiene los reportes contables activos
 * @returns Lista de reportes contables activos
 */
export async function obtenerReportesActivos() {
  try {
    return await httpClient.get("/api/configuracion-reportes/contabilidad/activos");
  } catch (error) {
    console.error('Error al obtener reportes activos:', error);
    throw error;
  }
}

/**
 * Obtiene la configuración de reportes contables
 * @returns Configuración de reportes contables
 */
export async function obtenerConfiguracionReportes() {
  try {
    return await httpClient.get("/api/configuracion-reportes/contabilidad/configuracion");
  } catch (error) {
    console.error('Error al obtener configuración de reportes:', error);
    throw error;
  }
}

/**
 * Actualiza la configuración de un reporte contable
 * @param configuracion Nueva configuración
 * @returns Resultado de la actualización
 */
export async function actualizarConfiguracionReporte(configuracion: any) {
  try {
    return await httpClient.put("/api/configuracion-reportes/contabilidad/configuracion", configuracion);
  } catch (error) {
    console.error('Error al actualizar configuración de reporte:', error);
    throw error;
  }
}

/**
 * Crea una nueva configuración de reporte contable
 * @param configuracion Datos de la nueva configuración
 * @returns Resultado de la creación
 */
export async function crearConfiguracionReporte(configuracion: any) {
  try {
    return await httpClient.post("/api/configuracion-reportes/contabilidad/configuracion", configuracion);
  } catch (error) {
    console.error('Error al crear configuración de reporte:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de oficinas
 * @returns Lista de oficinas
 */
export async function obtenerOficinas() {
  try {
    return await httpClient.get("/api/oficinas");
  } catch (error) {
    console.error('Error al obtener oficinas:', error);
    throw error;
  }
}

/**
 * Genera un reporte contable para un rango de fechas
 * @param datos Datos para generar el reporte
 * @returns Resultado de la generación del reporte
 */
export async function generarReporteRango(datos: any) {
  try {
    return await httpClient.post("api/reportes/contabilidad/rango", datos);
  } catch (error) {
    console.error('Error al generar reporte por rango:', error);
    throw error;
  }
}

/**
 * Obtiene las cuentas contables disponibles
 * @returns Lista de cuentas contables
 */
export async function obtenerCuentasContables() {
  try {
    return await httpClient.get("/api/configuracion-reportes/contabilidad/cuentas");
  } catch (error) {
    console.error('Error al obtener cuentas contables:', error);
    throw error;
  }
}

/**
 * Elimina una configuración de reporte contable
 * @param configuracion Configuración a eliminar
 * @returns Resultado de la eliminación
 */
export async function eliminarConfiguracionReporte(configuracion: any) {
  try {
    return await httpClient.delete("/api/configuracion-reportes/contabilidad/configuracion", {
      body: JSON.stringify(configuracion),
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error('Error al eliminar configuración de reporte:', error);
    throw error;
  }
}

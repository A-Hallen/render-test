import { ConfiguracionReporteContabilidad } from "./configuracion-reportes-contabilidad.model";
import { ConfiguracionReportesContabilidadRepository } from "./configuracion-reportes-contabilidad.repository";
import {
  ConfiguracionesActivasResponse,
  ConfiguracionGuardadaResponse,
  adaptarDatosReporte,
  ConfiguracionReporteDTO,
  CuentaResponse,
  ReporteTendenciaRequest,
  ReporteTendenciaResponse,
} from "shared/src/types/reportes.types";
import { ApiResponse } from "shared/src/types/generic.types";

export class ConfiguracionReportesContabilidadService {
  private configuracionReportesContabilidadRepository: ConfiguracionReportesContabilidadRepository;

  constructor() {
    this.configuracionReportesContabilidadRepository = new ConfiguracionReportesContabilidadRepository();
  }

  async obtenerConfiguracionesActivas(): Promise<ConfiguracionesActivasResponse> {
    const configuraciones =
      await this.configuracionReportesContabilidadRepository.obtenerConfiguracionesActivas();
    return {
      configuraciones: configuraciones,
    };
  }

  async obtenerCuentas(): Promise<CuentaResponse> {
    return {
      cuentas: await this.configuracionReportesContabilidadRepository.obtenerCuentas(),
    };
  }

  async generarReporteTendencia(
    reporteData: ReporteTendenciaRequest
  ): Promise<ReporteTendenciaResponse> {
    const response = await this.configuracionReportesContabilidadRepository.generarReporteTendencia(
      reporteData
    );
    
    if (!response.data) {
      return {
        success: response.success,
        message: response.message
      };
    }
    
    // Crear un objeto que cumpla con la estructura ReporteContabilidadData
    const reporteContabilidadData = {
      esActivo: true,
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
      id: 0,
      fechaInicio: reporteData.fechaInicio,
      fechaFin: reporteData.fechaFin,
      oficina: response.data.oficina,
      nombreConfiguracion: reporteData.tipo.nombre,
      tipoReporte: reporteData.periodo,
      categorias: response.data.categorias.map(cat => ({
        nombre: cat.nombre,
        cuentas: cat.cuentas.map(cuenta => ({
          codigo: cuenta.codigo.toString(),
          nombre: cuenta.nombre,
          valoresPorFecha: cuenta.valores,
          diferencias: {},
          valores: cuenta.valores
        })),
        totalesPorFecha: cat.valores,
        diferencias: {},
        valores: cat.valores
      })),
      fechas: response.data.fechas
    };
    
    // Adaptar los datos usando la función de utilidad
    const adaptedData = adaptarDatosReporte(reporteContabilidadData);
    
    return {
      success: true,
      message: "Reporte generado correctamente",
      data: adaptedData,
    };
  }

  async guardarConfiguracion(
    configuracion: ConfiguracionReporteDTO
  ): Promise<ConfiguracionGuardadaResponse> {
    //convertir al modelo para guardar en la bd mapeando sus propiedades
    const configuracionModel = new ConfiguracionReporteContabilidad();
    configuracionModel.nombre = configuracion.nombre;
    configuracionModel.descripcion = configuracion.descripcion;
    configuracionModel.categorias = configuracion.categorias;
    configuracionModel.esActivo = configuracion.esActivo;
    configuracionModel.fechaCreacion = new Date();
    configuracionModel.fechaModificacion = new Date();
    await this.configuracionReportesContabilidadRepository.crear(configuracionModel.toDbObject());
    return {
      success: true,
      message: "Configuración guardada correctamente",
    };
  }

  async actualizarConfiguracion(
    configuracion: ConfiguracionReporteDTO
  ): Promise<ConfiguracionGuardadaResponse> {
    const response = await this.configuracionReportesContabilidadRepository.actualizarConfiguracion(
      configuracion
    );
    return response;
  }

  async eliminarConfiguracion(
    configuracion: ConfiguracionReporteDTO
  ): Promise<ApiResponse> {
    console.log("[ConfiguracionReportesContabilidadService] eliminando configuracion... ", configuracion);
    await this.configuracionReportesContabilidadRepository.eliminarConfiguracion(configuracion);
    return {
      success: true,
      message: "Configuracion de reporte eliminada correctamente",
    };
  }
}

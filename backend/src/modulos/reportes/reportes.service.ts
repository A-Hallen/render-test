import { ConfiguracionReporte } from "./reportes.model";
import { ReportesRepository } from "./reportes.repository";

// Definimos localmente las interfaces necesarias para evitar problemas de importación
interface ApiResponse {
  success: boolean;
  message: string;
}

interface ConfiguracionReporteDTO {
  nombre: string;
  descripcion: string | null;
  categorias: Array<{
    nombre: string;
    cuentas: string[];
  }>;
  esActivo: boolean;
  fechaCreacion: Date;
  fechaModificacion: Date;
}

interface ConfiguracionesActivasResponse {
  configuraciones: ConfiguracionReporteDTO[];
}

interface ReporteTendenciaRequest {
  tipo: ConfiguracionReporteDTO;
  oficina: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
}

interface ReporteTendenciaResponse {
  success: boolean;
  message: string;
  data?: {
    fechas: string[];
    categorias: {
      nombre: string;
      cuentas: {
        codigo: number;
        nombre: string;
        valores: Record<string, number>;
      }[];
      valores: Record<string, number>;
    }[];
    oficina: string;
  }
}

interface CuentaResponse {
  cuentas: CuentaData[];
}

interface CuentaData {
  CODIGO: number;
  NOMBRE: string;
}

interface ConfiguracionGuardadaResponse {
  success: boolean;
  message: string;
}

export class ReportesService {
  private reportesRepository: ReportesRepository;

  constructor() {
    this.reportesRepository = new ReportesRepository();
  }

  async obtenerConfiguracionesActivas(): Promise<ConfiguracionesActivasResponse> {
    const configuraciones =
      await this.reportesRepository.obtenerConfiguracionesActivas();
    return {
      configuraciones: configuraciones,
    };
  }

  async obtenerCuentas(): Promise<CuentaResponse> {
    return {
      cuentas: await this.reportesRepository.obtenerCuentas(),
    };
  }

  async generarReporteTendencia(
    reporteData: ReporteTendenciaRequest
  ): Promise<ReporteTendenciaResponse> {
    const response = await this.reportesRepository.generarReporteTendencia(
      reporteData
    );
    return response;
  }

  async guardarConfiguracion(
    configuracion: ConfiguracionReporteDTO
  ): Promise<ConfiguracionGuardadaResponse> {
    //convertir al modelo para guardar en la bd mapeando sus propiedades
    const configuracionModel = new ConfiguracionReporte();
    configuracionModel.nombre = configuracion.nombre;
    configuracionModel.descripcion = configuracion.descripcion;
    configuracionModel.categorias = configuracion.categorias;
    configuracionModel.esActivo = configuracion.esActivo;
    configuracionModel.fechaCreacion = new Date();
    configuracionModel.fechaModificacion = new Date();
    await this.reportesRepository.crear(configuracionModel.toDbObject());
    return {
      success: true,
      message: "Configuración guardada correctamente",
    };
  }

  async actualizarConfiguracion(
    configuracion: ConfiguracionReporteDTO
  ): Promise<ConfiguracionGuardadaResponse> {
    const response = await this.reportesRepository.actualizarConfiguracion(
      configuracion
    );
    return response;
  }

  async eliminarConfiguracion(
    configuracion: ConfiguracionReporteDTO
  ): Promise<ApiResponse> {
    console.log("[ReportesService] eliminando configuracion... ", configuracion);
    await this.reportesRepository.eliminarConfiguracion(configuracion);
    return {
      success: true,
      message: "Configuracion de reporte eliminada correctamente",
    };
  }
}

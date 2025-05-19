export interface ConfiguracionReporteDTO {
    /** 
     * Nombre único de la configuración de reporte
     */
    nombre: string;

    /**
     * Descripción opcional de la configuración
     */
    descripcion: string | null;

    /**
     * Categorías asociadas a la configuración
     * @example [{ nombre: "category1", id: "1" }]
     */
    categorias: Array<{
        nombre: string;
        cuentas: string[];
    }>;

    /**
     * Indica si la configuración está activa
     */
    esActivo: boolean;

    /**
     * Fecha de creación de la configuración
     */
    fechaCreacion: Date;

    /**
     * Fecha de última modificación de la configuración
     */
    fechaModificacion: Date;
}

export interface ConfiguracionesActivasResponse {
    /**
     * Lista de configuraciones activas de reportes
     */
    configuraciones: ConfiguracionReporteDTO[];
}

export interface ReporteTendenciaRequest {
    tipo: ConfiguracionReporteDTO;
    oficina: string;
    periodo: string;
    fechaInicio: string;
    fechaFin: string;
}

export interface ReporteTendenciaResponse {
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

export interface CuentaResponse {
    cuentas: CuentaData[];
}

export interface CuentaData {
    CODIGO: number;
    NOMBRE: string;
}

export interface ConfiguracionGuardadaResponse {
    success: boolean;
    message: string;
}

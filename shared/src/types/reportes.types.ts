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

/**
 * Estructura de datos actual para los reportes de contabilidad
 */
export interface ReporteContabilidadData {
    // Propiedades del nuevo modelo
    esActivo: boolean;
    fechaCreacion: string;
    fechaModificacion: string;
    id: number;
    fechaInicio: string;
    fechaFin: string;
    oficina: string;
    nombreConfiguracion: string;
    tipoReporte: string;
    categorias: {
        nombre: string;
        cuentas: {
            codigo: string;
            nombre: string;
            valoresPorFecha: Record<string, number>;
            diferencias: {
                [fecha: string]: {
                    valor: number;
                    porcentaje: number;
                }
            };
            // Propiedad para compatibilidad con el código existente
            valores: Record<string, number>;
        }[];
        totalesPorFecha: Record<string, number>;
        diferencias: {
            [fecha: string]: {
                valor: number;
                porcentaje: number;
            }
        };
        // Propiedad para compatibilidad con el código existente
        valores: Record<string, number>;
    }[];
    
    // Propiedades para compatibilidad con el código existente
    fechas: string[];
}

/**
 * Interfaz para la respuesta de reportes de tendencia
 * Mantiene compatibilidad con el código existente
 */
export interface ReporteTendenciaResponse {
    success: boolean;
    message: string;
    data?: ReporteContabilidadData;
}

/**
 * Adapta los datos del nuevo formato al formato esperado por los componentes frontend
 * @param data Datos del reporte en el nuevo formato
 * @returns Datos adaptados al formato esperado por los componentes frontend
 */
export function adaptarDatosReporte(data: ReporteContabilidadData): ReporteContabilidadData {
    // Inicializar las propiedades de compatibilidad si no existen
    if (!data.fechas) {
        data.fechas = [];
    }

    // Extraer las fechas únicas de los valores por fecha
    const fechasSet = new Set<string>();
    
    // Recopilar todas las fechas de todas las categorías y cuentas
    data.categorias.forEach(categoria => {
        // Inicializar el objeto valores para la categoría si no existe
        if (!categoria.valores) {
            categoria.valores = {};
        }

        // Añadir fechas de totalesPorFecha
        Object.keys(categoria.totalesPorFecha).forEach(fecha => fechasSet.add(fecha));
        
        // Adaptar cada cuenta
        categoria.cuentas.forEach(cuenta => {
            // Inicializar el objeto valores para la cuenta si no existe
            if (!cuenta.valores) {
                cuenta.valores = {};
            }

            // Añadir fechas de cada cuenta
            Object.keys(cuenta.valoresPorFecha).forEach(fecha => fechasSet.add(fecha));
        });
    });
    
    // Convertir el Set a un array ordenado
    const fechas = Array.from(fechasSet).sort();
    
    // Asignar las fechas al objeto de datos
    data.fechas = fechas;
    
    // Adaptar los datos de cada categoría y cuenta
    data.categorias.forEach(categoria => {
        // Llenar el objeto valores para la categoría
        fechas.forEach(fecha => {
            categoria.valores[fecha] = categoria.totalesPorFecha[fecha] || 0;
        });
        
        // Llenar el objeto valores para cada cuenta
        categoria.cuentas.forEach(cuenta => {
            fechas.forEach(fecha => {
                cuenta.valores[fecha] = cuenta.valoresPorFecha[fecha] || 0;
            });
        });
    });
    
    return data;
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

/**
 * Interfaz para la solicitud al endpoint /rango de reportes de contabilidad
 */
export interface ReporteContabilidadRangoRequest {
    fechaInicio: string;
    fechaFin: string;
    oficina: string;
    nombreConfiguracion: string;
    tipoReporte: string;
}

/**
 * Interfaz para la respuesta del endpoint /rango de reportes de contabilidad
 */
export interface ReporteContabilidadRangoResponse {
    success: boolean;
    message: string;
    data?: ReporteTendenciaResponse['data'];
}

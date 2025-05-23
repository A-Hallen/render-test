/**
 * Modelo de datos unificado para visualizaciones financieras
 * Este modelo estandariza diferentes fuentes de datos para su uso en visualizaciones 3D
 */

// Tipos de datos financieros soportados
export enum TipoDato {
  INDICADOR = 'indicador',
  TRANSACCION = 'transaccion',
  CLIENTE = 'cliente',
  PRODUCTO = 'producto',
  CUENTA = 'cuenta',
  COMPARATIVO = 'comparativo',
  HISTORICO = 'historico'
  // Se pueden añadir más tipos según sea necesario
}

// Interfaz principal para datos financieros
export interface DatoFinanciero {
  // Identificadores y metadatos
  id: string;
  tipo: TipoDato;
  fuente: string;
  fecha: Date;
  
  // Propiedades para agrupación y filtrado
  dimensiones: Record<string, string | number>; // ej: {"oficina": "Central", "producto": "Préstamos"}
  
  // Valores numéricos para visualización
  metricas: Record<string, number>; // ej: {"valor": 1500, "meta": 2000, "variacion": 0.05}
  
  // Metadatos adicionales para visualización
  atributos?: Record<string, any>; // ej: {"color": "#ff0000", "prioridad": "alta"}
}

// Interfaz para configuración de visualizaciones
export enum TipoVisualizacion {
  BARRAS_3D = 'barras3d',
  SUPERFICIE_3D = 'superficie3d',
  DISPERSION_3D = 'dispersion3d',
  MAPA_CALOR_3D = 'mapaCalor3d',
  LINEA_TIEMPO_3D = 'lineaTiempo3d',
  BARRAS_COMPARATIVAS_3D = 'barrasComparativas3d',
  RADAR_3D = 'radar3d',
  BURBUJAS_3D = 'burbujas3d'
}

export interface ConfiguracionVisualizacion {
  tipo: TipoVisualizacion;
  dimensionX?: string;
  dimensionY?: string;
  dimensionZ?: string;
  metrica?: string;
  filtros?: Record<string, any>;
  opciones?: Record<string, any>;
}

// Interfaz para datos transformados listos para visualización
export interface DatosVisualizacion {
  datos: any[];
  ejes?: {
    x: string[];
    y: string[];
    z?: string[];
  };
  metadatos?: Record<string, any>;
}

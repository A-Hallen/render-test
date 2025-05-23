/**
 * Adaptadores para transformar datos específicos al modelo genérico
 * Estos adaptadores permiten estandarizar diferentes fuentes de datos para su visualización
 */

import { DatoFinanciero, TipoDato } from '../modelo/DatoFinanciero';

// Interfaz genérica para adaptadores de datos
export interface AdaptadorDatos<T> {
  // Convierte datos específicos al modelo genérico
  adaptar(datos: T[]): DatoFinanciero[];
  
  // Extrae dimensiones disponibles para filtrado
  obtenerDimensiones(datos: T[]): string[];
  
  // Extrae métricas disponibles para visualización
  obtenerMetricas(datos: T[]): string[];
}

// Interfaz para indicadores financieros (ejemplo)
export interface IndicadorFinanciero {
  codigo: string;
  nombre: string;
  valor: number;
  meta?: number;
  variacion?: number;
  fecha: string;
  oficinaId: string;
  moduloId: string;
  categoria?: string;
  tendencia?: 'alza' | 'baja' | 'estable';
  esActivo: boolean;
  estaEnPantallaPrincipal?: boolean;
  mayorEsMejor?: boolean;
}

// Adaptador para indicadores financieros
export class AdaptadorIndicadores implements AdaptadorDatos<IndicadorFinanciero> {
  adaptar(indicadores: IndicadorFinanciero[]): DatoFinanciero[] {
    return indicadores.map(indicador => ({
      id: indicador.codigo,
      tipo: TipoDato.INDICADOR,
      fuente: 'core_financiero',
      fecha: new Date(indicador.fecha),
      dimensiones: {
        oficina: indicador.oficinaId,
        modulo: indicador.moduloId,
        categoria: indicador.categoria || 'general'
      },
      metricas: {
        valor: indicador.valor,
        meta: indicador.meta || 0,
        variacion: indicador.variacion || 0
      },
      atributos: {
        color: this.determinarColor(indicador),
        tendencia: indicador.tendencia || 'estable',
        activo: indicador.esActivo,
        enPantallaPrincipal: indicador.estaEnPantallaPrincipal || false,
        mayorEsMejor: indicador.mayorEsMejor || true
      }
    }));
  }
  
  obtenerDimensiones(indicadores: IndicadorFinanciero[]): string[] {
    // Extraer dimensiones únicas disponibles en los datos
    const dimensiones = new Set<string>();
    
    indicadores.forEach(indicador => {
      dimensiones.add('oficina');
      dimensiones.add('modulo');
      if (indicador.categoria) dimensiones.add('categoria');
    });
    
    return Array.from(dimensiones);
  }
  
  obtenerMetricas(indicadores: IndicadorFinanciero[]): string[] {
    // Extraer métricas únicas disponibles en los datos
    const metricas = new Set<string>();
    
    metricas.add('valor');
    indicadores.forEach(indicador => {
      if (indicador.meta !== undefined) metricas.add('meta');
      if (indicador.variacion !== undefined) metricas.add('variacion');
    });
    
    return Array.from(metricas);
  }
  
  private determinarColor(indicador: IndicadorFinanciero): string {
    // Determinar color basado en la relación entre valor y meta
    if (!indicador.meta) return '#808080'; // Gris si no hay meta
    
    const ratio = indicador.valor / indicador.meta;
    const esBueno = indicador.mayorEsMejor !== false ? ratio >= 1 : ratio <= 1;
    
    if (esBueno) {
      return '#4caf50'; // Verde para buen desempeño
    } else if (ratio > 0.8) {
      return '#ff9800'; // Amarillo para desempeño cercano a la meta
    } else {
      return '#f44336'; // Rojo para desempeño bajo
    }
  }
}

// Adaptador genérico para cualquier tipo de dato
export class AdaptadorGenerico implements AdaptadorDatos<any> {
  adaptar(datos: any[]): DatoFinanciero[] {
    return datos.map((dato, index) => {
      // Extraer propiedades dinámicamente
      const dimensiones: Record<string, string | number> = {};
      const metricas: Record<string, number> = {};
      
      Object.entries(dato).forEach(([clave, valor]) => {
        if (typeof valor === 'number') {
          metricas[clave] = valor;
        } else if (typeof valor === 'string' || typeof valor === 'boolean') {
          dimensiones[clave] = typeof valor === 'boolean' ? (valor ? 1 : 0) : valor;
        }
      });
      
      return {
        id: dato.id || `dato_${index}`,
        tipo: dato.tipo || TipoDato.INDICADOR,
        fuente: dato.fuente || 'desconocida',
        fecha: dato.fecha ? new Date(dato.fecha) : new Date(),
        dimensiones,
        metricas,
        atributos: dato.atributos || {}
      };
    });
  }
  
  obtenerDimensiones(datos: any[]): string[] {
    const dimensiones = new Set<string>();
    
    datos.forEach(dato => {
      Object.entries(dato).forEach(([clave, valor]) => {
        if (typeof valor === 'string' || typeof valor === 'boolean') {
          dimensiones.add(clave);
        }
      });
    });
    
    return Array.from(dimensiones);
  }
  
  obtenerMetricas(datos: any[]): string[] {
    const metricas = new Set<string>();
    
    datos.forEach(dato => {
      Object.entries(dato).forEach(([clave, valor]) => {
        if (typeof valor === 'number') {
          metricas.add(clave);
        }
      });
    });
    
    return Array.from(metricas);
  }
}

/**
 * Servicio para integraciu00f3n con el core financiero
 * Permite extraer datos del core financiero y procesarlos
 */

import { DatoFinanciero, TipoDato } from '../features/visualizacion/modelo/DatoFinanciero';
import { firebaseService } from './FirebaseService';

// Interfaz para filtros de consulta
export interface FiltroConsulta {
  modulo?: string;
  oficina?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  categoria?: string;
  limite?: number;
}

// Interfaz para indicadores financieros del core
export interface IndicadorFinancieroCoreResponse {
  codigo: string;
  nombre: string;
  valor: number;
  meta?: number;
  variacion?: number;
  fecha: string;
  oficinaId: string;
  moduloId: string;
  categoria?: string;
  tendencia?: 'creciente' | 'estable' | 'decreciente';
  esActivo: boolean;
  estaEnPantallaPrincipal?: boolean;
  mayorEsMejor?: boolean;
}

// Interfaz para transacciones del core
export interface TransaccionCoreResponse {
  id: string;
  tipo: string;
  monto: number;
  fecha: string;
  oficinaId: string;
  moduloId: string;
  clienteId?: string;
  productoId?: string;
  estado: string;
  detalles?: Record<string, any>;
}

/**
 * Servicio para extraer datos del core financiero
 */
export class CoreFinancieroService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }
  
  /**
   * Obtiene indicadores financieros del core
   */
  async obtenerIndicadores(filtros: FiltroConsulta = {}): Promise<DatoFinanciero[]> {
    try {
      const url = new URL(`${this.apiUrl}/indicadores`);
      
      // Agregar filtros a la URL
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            url.searchParams.append(key, value.toISOString());
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error al obtener indicadores: ${response.statusText}`);
      }
      
      const indicadoresCore: IndicadorFinancieroCoreResponse[] = await response.json();
      
      // Transformar a formato DatoFinanciero
      return this.transformarIndicadores(indicadoresCore);
    } catch (error) {
      console.error('Error al obtener indicadores del core:', error);
      
      // Si hay un error, intentar obtener datos de Firebase como fallback
      try {
        return await firebaseService.obtenerDatosPorTipo(TipoDato.INDICADOR);
      } catch (fbError) {
        console.error('Error al obtener indicadores de Firebase:', fbError);
        throw error; // Propagar el error original
      }
    }
  }
  
  /**
   * Obtiene transacciones del core
   */
  async obtenerTransacciones(filtros: FiltroConsulta = {}): Promise<DatoFinanciero[]> {
    try {
      const url = new URL(`${this.apiUrl}/transacciones`);
      
      // Agregar filtros a la URL
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            url.searchParams.append(key, value.toISOString());
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error al obtener transacciones: ${response.statusText}`);
      }
      
      const transaccionesCore: TransaccionCoreResponse[] = await response.json();
      
      // Transformar a formato DatoFinanciero
      return this.transformarTransacciones(transaccionesCore);
    } catch (error) {
      console.error('Error al obtener transacciones del core:', error);
      
      // Si hay un error, intentar obtener datos de Firebase como fallback
      try {
        return await firebaseService.obtenerDatosPorTipo(TipoDato.TRANSACCION);
      } catch (fbError) {
        console.error('Error al obtener transacciones de Firebase:', fbError);
        throw error; // Propagar el error original
      }
    }
  }
  
  /**
   * Obtiene datos de un mu00f3dulo especu00edfico
   */
  async obtenerDatosModulo(modulo: string, filtros: FiltroConsulta = {}): Promise<DatoFinanciero[]> {
    try {
      const url = new URL(`${this.apiUrl}/modulos/${modulo}/datos`);
      
      // Agregar filtros a la URL
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            url.searchParams.append(key, value.toISOString());
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos del mu00f3dulo ${modulo}: ${response.statusText}`);
      }
      
      const datosCore = await response.json();
      
      // Transformar a formato DatoFinanciero
      return this.transformarDatosModulo(datosCore, modulo);
    } catch (error) {
      console.error(`Error al obtener datos del mu00f3dulo ${modulo}:`, error);
      
      // Si hay un error, intentar obtener datos de Firebase como fallback
      try {
        return await firebaseService.obtenerDatosPorOficina(filtros.oficina || 'todas');
      } catch (fbError) {
        console.error('Error al obtener datos de Firebase:', fbError);
        throw error; // Propagar el error original
      }
    }
  }
  
  /**
   * Sincroniza datos del core con Firebase
   */
  async sincronizarConFirebase(): Promise<void> {
    try {
      // Obtener datos del core
      const indicadores = await this.obtenerIndicadores();
      const transacciones = await this.obtenerTransacciones();
      
      // Guardar en Firebase
      for (const indicador of indicadores) {
        await firebaseService.guardarDatoFinanciero(indicador);
      }
      
      for (const transaccion of transacciones) {
        await firebaseService.guardarDatoFinanciero(transaccion);
      }
      
      console.log('Sincronizaciu00f3n con Firebase completada');
    } catch (error) {
      console.error('Error al sincronizar con Firebase:', error);
      throw error;
    }
  }
  
  /**
   * Transforma indicadores del core al formato DatoFinanciero
   */
  private transformarIndicadores(indicadoresCore: IndicadorFinancieroCoreResponse[]): DatoFinanciero[] {
    return indicadoresCore.map(indicador => ({
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
        nombre: indicador.nombre,
        tendencia: indicador.tendencia || 'estable',
        activo: indicador.esActivo,
        enPantallaPrincipal: indicador.estaEnPantallaPrincipal || false,
        mayorEsMejor: indicador.mayorEsMejor || true
      }
    }));
  }
  
  /**
   * Transforma transacciones del core al formato DatoFinanciero
   */
  private transformarTransacciones(transaccionesCore: TransaccionCoreResponse[]): DatoFinanciero[] {
    return transaccionesCore.map(transaccion => ({
      id: transaccion.id,
      tipo: TipoDato.TRANSACCION,
      fuente: 'core_financiero',
      fecha: new Date(transaccion.fecha),
      dimensiones: {
        oficina: transaccion.oficinaId,
        modulo: transaccion.moduloId,
        tipo: transaccion.tipo,
        cliente: transaccion.clienteId || 'anonimo',
        producto: transaccion.productoId || 'general'
      },
      metricas: {
        valor: transaccion.monto
      },
      atributos: {
        estado: transaccion.estado,
        detalles: transaccion.detalles || {}
      }
    }));
  }
  
  /**
   * Transforma datos de mu00f3dulo al formato DatoFinanciero
   */
  private transformarDatosModulo(datosCore: any[], modulo: string): DatoFinanciero[] {
    // La transformaciu00f3n depende del tipo de mu00f3dulo
    switch (modulo) {
      case 'captaciones':
        return this.transformarDatosCaptaciones(datosCore);
      case 'colocaciones':
        return this.transformarDatosColocaciones(datosCore);
      case 'inversiones':
        return this.transformarDatosInversiones(datosCore);
      case 'atencion':
        return this.transformarDatosAtencion(datosCore);
      default:
        // Transformaciu00f3n genu00e9rica
        return datosCore.map((dato, index) => ({
          id: dato.id || `${modulo}-${index}`,
          tipo: TipoDato.INDICADOR,
          fuente: 'core_financiero',
          fecha: new Date(dato.fecha || new Date()),
          dimensiones: {
            oficina: dato.oficinaId || 'todas',
            modulo: modulo,
            categoria: dato.categoria || 'general'
          },
          metricas: {
            valor: dato.valor || 0
          },
          atributos: dato.atributos || {}
        }));
    }
  }
  
  /**
   * Transformaciones especu00edficas para cada mu00f3dulo
   */
  private transformarDatosCaptaciones(datosCore: any[]): DatoFinanciero[] {
    return datosCore.map(dato => ({
      id: dato.id,
      tipo: TipoDato.INDICADOR,
      fuente: 'core_financiero',
      fecha: new Date(dato.fecha),
      dimensiones: {
        oficina: dato.oficinaId,
        modulo: 'captaciones',
        producto: dato.productoId,
        categoria: dato.categoria || 'general'
      },
      metricas: {
        valor: dato.saldo || 0,
        cantidad: dato.cantidad || 0,
        tasa: dato.tasa || 0
      },
      atributos: {
        plazo: dato.plazo,
        moneda: dato.moneda,
        detalles: dato.detalles || {}
      }
    }));
  }
  
  private transformarDatosColocaciones(datosCore: any[]): DatoFinanciero[] {
    return datosCore.map(dato => ({
      id: dato.id,
      tipo: TipoDato.INDICADOR,
      fuente: 'core_financiero',
      fecha: new Date(dato.fecha),
      dimensiones: {
        oficina: dato.oficinaId,
        modulo: 'colocaciones',
        producto: dato.productoId,
        categoria: dato.categoria || 'general'
      },
      metricas: {
        valor: dato.saldo || 0,
        cantidad: dato.cantidad || 0,
        tasa: dato.tasa || 0,
        mora: dato.mora || 0
      },
      atributos: {
        plazo: dato.plazo,
        moneda: dato.moneda,
        detalles: dato.detalles || {}
      }
    }));
  }
  
  private transformarDatosInversiones(datosCore: any[]): DatoFinanciero[] {
    return datosCore.map(dato => ({
      id: dato.id,
      tipo: TipoDato.INDICADOR,
      fuente: 'core_financiero',
      fecha: new Date(dato.fecha),
      dimensiones: {
        oficina: dato.oficinaId,
        modulo: 'inversiones',
        tipo: dato.tipoInversion,
        categoria: dato.categoria || 'general'
      },
      metricas: {
        valor: dato.monto || 0,
        rendimiento: dato.rendimiento || 0,
        plazo: dato.plazo || 0
      },
      atributos: {
        riesgo: dato.riesgo,
        moneda: dato.moneda,
        detalles: dato.detalles || {}
      }
    }));
  }
  
  private transformarDatosAtencion(datosCore: any[]): DatoFinanciero[] {
    return datosCore.map(dato => ({
      id: dato.id,
      tipo: TipoDato.INDICADOR,
      fuente: 'core_financiero',
      fecha: new Date(dato.fecha),
      dimensiones: {
        oficina: dato.oficinaId,
        modulo: 'atencion',
        canal: dato.canal,
        categoria: dato.categoria || 'general'
      },
      metricas: {
        cantidad: dato.cantidad || 0,
        tiempoPromedio: dato.tiempoPromedio || 0,
        satisfaccion: dato.satisfaccion || 0
      },
      atributos: {
        tipo: dato.tipoAtencion,
        detalles: dato.detalles || {}
      }
    }));
  }
}

// Exportar una instancia del servicio para uso global
export const coreFinancieroService = new CoreFinancieroService();

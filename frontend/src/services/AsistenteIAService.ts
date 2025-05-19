/**
 * Servicio para el asistente de IA
 * Permite procesar consultas en lenguaje natural y generar visualizaciones
 */

import { DatoFinanciero, ConfiguracionVisualizacion, TipoVisualizacion, TipoDato } from '../features/visualizacion/modelo/DatoFinanciero';
// Importaremos firebaseService cuando lo necesitemos para obtener datos reales

// Tipos de consultas que puede procesar el asistente
export enum TipoConsulta {
  VISUALIZACION = 'visualizacion',
  INFORMACION = 'informacion',
  TENDENCIA = 'tendencia',
  COMPARACION = 'comparacion'
}

// Interfaz para las consultas al asistente
export interface ConsultaIA {
  texto: string;
  tipo?: TipoConsulta;
  filtros?: Record<string, any>;
  usuario?: string;
  fecha?: Date;
}

// Interfaz para las respuestas del asistente
export interface RespuestaIA {
  texto: string;
  visualizacion?: ConfiguracionVisualizacion;
  datos?: DatoFinanciero[];
  sugerencias?: string[];
  error?: string;
}

/**
 * Servicio para procesar consultas al asistente de IA
 */
export class AsistenteIAService {
  constructor() {
    // Inicialización del servicio
  }
  
  /**
   * Procesa una consulta en lenguaje natural
   */
  async procesarConsulta(consulta: ConsultaIA): Promise<RespuestaIA> {
    try {
      // En un caso real, aquí se haría una llamada a la API
      // Para esta demo, simulamos el procesamiento
      
      // Simular un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Procesar la consulta según su tipo
      if (consulta.tipo === TipoConsulta.VISUALIZACION || consulta.texto.includes('mostrar') || consulta.texto.includes('visualizar')) {
        return await this.generarVisualizacion(consulta);
      } else if (consulta.tipo === TipoConsulta.TENDENCIA || consulta.texto.includes('tendencia') || consulta.texto.includes('evolución')) {
        return await this.analizarTendencia(consulta);
      } else if (consulta.tipo === TipoConsulta.COMPARACION || consulta.texto.includes('comparar') || consulta.texto.includes('diferencia')) {
        return await this.compararDatos(consulta);
      } else {
        return await this.responderInformacion(consulta);
      }
    } catch (error) {
      console.error('Error al procesar consulta:', error);
      return {
        texto: 'Lo siento, ha ocurrido un error al procesar tu consulta.',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
  
  /**
   * Genera una visualización basada en la consulta
   */
  private async generarVisualizacion(consulta: ConsultaIA): Promise<RespuestaIA> {
    // Analizar la consulta para determinar qué tipo de visualización generar
    const tipoVisualizacion = this.determinarTipoVisualizacion(consulta.texto);
    const dimensiones = this.extraerDimensiones(consulta.texto);
    const metrica = this.extraerMetrica(consulta.texto);
    
    // Obtener datos para la visualización
    let datos: DatoFinanciero[] = [];
    try {
      // En un caso real, aquí se obtendrían datos de Firebase
      // Para esta demo, generamos datos de ejemplo
      datos = await this.obtenerDatosParaVisualizacion(consulta);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
    
    // Configurar la visualización
    const configuracion: ConfiguracionVisualizacion = {
      tipo: tipoVisualizacion,
      dimensionX: dimensiones.x || 'oficina',
      dimensionY: dimensiones.y || 'modulo',
      metrica: metrica || 'valor',
      filtros: consulta.filtros || {}
    };
    
    return {
      texto: `He generado una visualización ${tipoVisualizacion} que muestra ${metrica || 'valor'} por ${dimensiones.x || 'oficina'} y ${dimensiones.y || 'módulo'}.`,
      visualizacion: configuracion,
      datos,
      sugerencias: [
        '¿Puedes mostrarme esto como gráfico de superficie?',
        '¿Cómo ha evolucionado esto en los últimos 6 meses?',
        '¿Puedes comparar estos datos con el año anterior?'
      ]
    };
  }
  
  /**
   * Analiza tendencias en los datos
   */
  private async analizarTendencia(consulta: ConsultaIA): Promise<RespuestaIA> {
    // Obtener datos históricos
    const datos = await this.obtenerDatosHistoricos(consulta);
    
    // Configurar visualización de tendencia (línea temporal)
    const configuracion: ConfiguracionVisualizacion = {
      tipo: TipoVisualizacion.LINEA_TIEMPO_3D,
      dimensionX: 'fecha',
      dimensionY: 'oficina',
      metrica: this.extraerMetrica(consulta.texto) || 'valor',
      filtros: consulta.filtros || {}
    };
    
    return {
      texto: `He analizado la tendencia de ${configuracion.metrica} a lo largo del tiempo. Se observa un crecimiento sostenido en los últimos meses.`,
      visualizacion: configuracion,
      datos,
      sugerencias: [
        '¿Cuáles son los factores que influyen en esta tendencia?',
        '¿Puedes mostrarme una proyección para los próximos 3 meses?',
        '¿Cómo se compara esta tendencia con otras oficinas?'
      ]
    };
  }
  
  /**
   * Compara conjuntos de datos
   */
  private async compararDatos(consulta: ConsultaIA): Promise<RespuestaIA> {
    // Extraer elementos a comparar
    const elementos = this.extraerElementosComparacion(consulta.texto);
    
    // Obtener datos para comparación
    const datos = await this.obtenerDatosComparacion(consulta, elementos);
    
    // Configurar visualización de comparación
    const configuracion: ConfiguracionVisualizacion = {
      tipo: TipoVisualizacion.BARRAS_COMPARATIVAS_3D,
      dimensionX: elementos.dimensionComparacion || 'oficina',
      dimensionY: 'categoria',
      metrica: this.extraerMetrica(consulta.texto) || 'valor',
      filtros: consulta.filtros || {}
    };
    
    return {
      texto: `He comparado ${configuracion.metrica} entre diferentes ${configuracion.dimensionX}. La oficina central muestra los mejores resultados.`,
      visualizacion: configuracion,
      datos,
      sugerencias: [
        '¿Cuáles son las principales diferencias?',
        '¿Qué factores explican estas diferencias?',
        '¿Puedes mostrarme los detalles de la oficina con mejor desempeño?'
      ]
    };
  }
  
  /**
   * Responde a consultas de información general
   */
  private async responderInformacion(consulta: ConsultaIA): Promise<RespuestaIA> {
    // Analizar la consulta para determinar qué información proporcionar
    const temaConsulta = this.analizarTemaConsulta(consulta.texto);
    
    // Respuestas predefinidas según el tema
    const respuestas: Record<string, string> = {
      general: 'El sistema financiero muestra un desempeño estable con un crecimiento del 3.5% en el último trimestre.',
      oficinas: 'Actualmente hay 12 oficinas operativas. La oficina central tiene el mayor volumen de operaciones.',
      productos: 'Los productos más rentables son los créditos hipotecarios y las inversiones a plazo fijo.',
      clientes: 'La base de clientes ha crecido un 8% en el último año, con mayor incremento en el segmento joven.',
      default: 'Puedo ayudarte con información sobre el desempeño financiero, oficinas, productos o clientes.'
    };
    
    return {
      texto: respuestas[temaConsulta] || respuestas.default,
      sugerencias: [
        '¿Puedes mostrarme una visualización de esto?',
        '¿Cómo ha evolucionado esto en el tiempo?',
        '¿Qué oficina tiene el mejor desempeño?'
      ]
    };
  }
  
  /**
   * Determina el tipo de visualización basado en el texto de la consulta
   */
  private determinarTipoVisualizacion(texto: string): TipoVisualizacion {
    const textoLower = texto.toLowerCase();
    
    if (textoLower.includes('barra') || textoLower.includes('columna')) {
      return TipoVisualizacion.BARRAS_3D;
    } else if (textoLower.includes('superficie') || textoLower.includes('area')) {
      return TipoVisualizacion.SUPERFICIE_3D;
    } else if (textoLower.includes('dispersión') || textoLower.includes('scatter')) {
      return TipoVisualizacion.DISPERSION_3D;
    } else if (textoLower.includes('línea') || textoLower.includes('tendencia') || textoLower.includes('evolución')) {
      return TipoVisualizacion.LINEA_TIEMPO_3D;
    } else if (textoLower.includes('mapa') || textoLower.includes('geográfico')) {
      return TipoVisualizacion.MAPA_CALOR_3D;
    } else {
      // Por defecto, usar barras 3D
      return TipoVisualizacion.BARRAS_3D;
    }
  }
  
  /**
   * Extrae dimensiones de la consulta
   */
  private extraerDimensiones(texto: string): { x: string | null, y: string | null } {
    const textoLower = texto.toLowerCase();
    let dimensionX: string | null = null;
    let dimensionY: string | null = null;
    
    // Dimensiones comunes
    const dimensiones = ['oficina', 'sucursal', 'agencia', 'módulo', 'producto', 'servicio', 'cliente', 'fecha', 'mes', 'año', 'trimestre', 'categoría'];
    
    // Buscar dimensiones en el texto
    for (const dimension of dimensiones) {
      if (textoLower.includes(dimension)) {
        if (!dimensionX) {
          dimensionX = dimension;
        } else if (!dimensionY) {
          dimensionY = dimension;
          break;
        }
      }
    }
    
    // Si no se encontraron dimensiones, usar valores predeterminados
    return {
      x: dimensionX || 'oficina',
      y: dimensionY || 'modulo'
    };
  }
  
  /**
   * Extrae la métrica de la consulta
   */
  private extraerMetrica(texto: string): string | null {
    const textoLower = texto.toLowerCase();
    
    // Métricas comunes
    const metricas = [
      { nombre: 'valor', keywords: ['valor', 'monto', 'importe', 'cantidad'] },
      { nombre: 'rentabilidad', keywords: ['rentabilidad', 'ganancia', 'beneficio', 'utilidad'] },
      { nombre: 'crecimiento', keywords: ['crecimiento', 'incremento', 'aumento'] },
      { nombre: 'transacciones', keywords: ['transacciones', 'operaciones', 'movimientos'] },
      { nombre: 'clientes', keywords: ['clientes', 'usuarios', 'personas'] }
    ];
    
    // Buscar métricas en el texto
    for (const metrica of metricas) {
      for (const keyword of metrica.keywords) {
        if (textoLower.includes(keyword)) {
          return metrica.nombre;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Extrae elementos para comparación
   */
  private extraerElementosComparacion(texto: string): { 
    dimensionComparacion: string | null,
    elementos: string[]
  } {
    const textoLower = texto.toLowerCase();
    let dimensionComparacion: string | null = null;
    const elementos: string[] = [];
    
    // Dimensiones comunes para comparación
    const dimensiones = [
      { nombre: 'oficina', keywords: ['oficina', 'sucursal', 'agencia'] },
      { nombre: 'producto', keywords: ['producto', 'servicio'] },
      { nombre: 'periodo', keywords: ['mes', 'año', 'trimestre', 'semestre'] },
      { nombre: 'segmento', keywords: ['segmento', 'tipo', 'categoría'] }
    ];
    
    // Buscar dimensión de comparación
    for (const dimension of dimensiones) {
      for (const keyword of dimension.keywords) {
        if (textoLower.includes(keyword)) {
          dimensionComparacion = dimension.nombre;
          break;
        }
      }
      if (dimensionComparacion) break;
    }
    
    // Si no se encontró dimensión, usar oficina por defecto
    return {
      dimensionComparacion: dimensionComparacion || 'oficina',
      elementos: elementos.length > 0 ? elementos : ['central', 'norte', 'sur']
    };
  }
  
  /**
   * Analiza el tema de la consulta
   */
  private analizarTemaConsulta(texto: string): string {
    const textoLower = texto.toLowerCase();
    
    if (textoLower.includes('oficina') || textoLower.includes('sucursal') || textoLower.includes('agencia')) {
      return 'oficinas';
    } else if (textoLower.includes('producto') || textoLower.includes('servicio')) {
      return 'productos';
    } else if (textoLower.includes('cliente') || textoLower.includes('usuario')) {
      return 'clientes';
    } else {
      return 'general';
    }
  }
  
  /**
   * Obtiene datos para visualización
   */
  private async obtenerDatosParaVisualizacion(_consulta: ConsultaIA): Promise<DatoFinanciero[]> {
    // En un caso real, aquí se obtendrían datos de Firebase
    // Para esta demo, generamos datos de ejemplo
    return this.generarDatosEjemplo();
  }
  
  /**
   * Obtiene datos históricos
   */
  private async obtenerDatosHistoricos(_consulta: ConsultaIA): Promise<DatoFinanciero[]> {
    // Generar datos históricos de ejemplo
    const datos: DatoFinanciero[] = [];
    const fechaBase = new Date();
    const oficinas = ['central', 'norte', 'sur', 'este', 'oeste'];
    
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(fechaBase);
      fecha.setMonth(fecha.getMonth() - i);
      
      for (const oficina of oficinas) {
        datos.push({
          id: `hist-${i}-${oficina}`,
          tipo: TipoDato.HISTORICO,
          fuente: 'historico',
          fecha,
          dimensiones: {
            oficina,
            modulo: 'general'
          },
          metricas: {
            valor: 1000 + Math.floor(Math.random() * 5000) + (i * 100),
            crecimiento: 5 + Math.floor(Math.random() * 10) - (i % 3)
          }
        });
      }
    }
    
    return datos;
  }
  
  /**
   * Obtiene datos para comparación
   */
  private async obtenerDatosComparacion(_consulta: ConsultaIA, elementos: { dimensionComparacion: string | null, elementos: string[] }): Promise<DatoFinanciero[]> {
    // Generar datos de comparación de ejemplo
    const datos: DatoFinanciero[] = [];
    const categorias = ['ingresos', 'gastos', 'utilidad', 'inversión'];
    
    for (const elemento of elementos.elementos) {
      for (const categoria of categorias) {
        datos.push({
          id: `comp-${elemento}-${categoria}`,
          tipo: TipoDato.COMPARATIVO,
          fuente: 'comparacion',
          fecha: new Date(),
          dimensiones: {
            [elementos.dimensionComparacion || 'oficina']: elemento,
            categoria
          },
          metricas: {
            valor: 1000 + Math.floor(Math.random() * 8000),
            variacion: Math.floor(Math.random() * 20) - 5
          }
        });
      }
    }
    
    return datos;
  }
  
  /**
   * Genera datos de ejemplo
   */
  private generarDatosEjemplo(): DatoFinanciero[] {
    const datos: DatoFinanciero[] = [];
    const oficinas = ['central', 'norte', 'sur', 'este', 'oeste'];
    const modulos = ['captaciones', 'colocaciones', 'servicios', 'inversiones', 'atención'];
    
    for (const oficina of oficinas) {
      for (const modulo of modulos) {
        datos.push({
          id: `${oficina}-${modulo}`,
          tipo: TipoDato.INDICADOR,
          fuente: 'ejemplo',
          fecha: new Date(),
          dimensiones: {
            oficina,
            modulo
          },
          metricas: {
            valor: 1000 + Math.floor(Math.random() * 9000),
            meta: 5000 + Math.floor(Math.random() * 5000),
            variacion: Math.floor(Math.random() * 20) - 5
          },
          atributos: {
            color: this.determinarColorIndicador(Math.floor(Math.random() * 100)),
            tendencia: ['creciente', 'estable', 'decreciente'][Math.floor(Math.random() * 3)],
            activo: true,
            enPantallaPrincipal: Math.random() > 0.5
          }
        });
      }
    }
    
    return datos;
  }
  
  /**
   * Determina el color de un indicador según su valor
   */
  private determinarColorIndicador(valor: number): string {
    if (valor < 30) {
      return '#FF4560'; // Rojo
    } else if (valor < 70) {
      return '#FEB019'; // Amarillo
    } else {
      return '#00E396'; // Verde
    }
  }
}

// Exportar una instancia del servicio para uso global
export const asistenteIAService = new AsistenteIAService();

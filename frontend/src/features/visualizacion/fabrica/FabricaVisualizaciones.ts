/**
 * Fábrica de visualizaciones para crear diferentes tipos de gráficos 3D
 * Implementa el patrón Factory para generar configuraciones de gráficos
 */

import { DatoFinanciero, ConfiguracionVisualizacion, TipoVisualizacion, DatosVisualizacion } from '../modelo/DatoFinanciero';

// Tipo para opciones de gráfico de ECharts
export type OpcionesGrafico = Record<string, any>;

/**
 * Fábrica para crear diferentes tipos de visualizaciones 3D
 */
export class FabricaVisualizaciones {
  /**
   * Crea una configuración de visualización basada en el tipo y los datos
   * @param datos Datos financieros estandarizados
   * @param config Configuración de la visualización
   * @returns Opciones de configuración para ECharts
   */
  crearVisualizacion(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): OpcionesGrafico {
    // Validar datos y configuración
    if (!datos || datos.length === 0) {
      return this.crearConfiguracionVacia('No hay datos disponibles');
    }
    
    // Crear visualización según el tipo
    switch (config.tipo) {
      case TipoVisualizacion.BARRAS_3D:
        return this.crearGraficoBarras3D(datos, config);
      case TipoVisualizacion.SUPERFICIE_3D:
        return this.crearGraficoSuperficie3D(datos, config);
      case TipoVisualizacion.DISPERSION_3D:
        return this.crearGraficoDispersion3D(datos, config);
      case TipoVisualizacion.LINEA_3D:
        return this.crearGraficoLinea3D(datos, config);
      case TipoVisualizacion.MAPA_CALOR_3D:
        return this.crearGraficoMapaCalor3D(datos, config);
      case TipoVisualizacion.RADAR_3D:
        return this.crearGraficoRadar3D(datos, config);
      default:
        throw new Error(`Tipo de visualización no soportado: ${config.tipo}`);
    }
  }
  
  /**
   * Crea un gráfico de barras 3D
   */
  private crearGraficoBarras3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): OpcionesGrafico {
    // Transformar datos genéricos a formato específico para gráfico de barras 3D
    const datosTransformados = this.transformarParaBarras3D(datos, config);
    
    // Crear configuración de ECharts para barras 3D
    return {
      tooltip: {},
      visualMap: {
        max: this.calcularMaximo(datosTransformados.datos),
        inRange: {
          color: ['#50a3ba', '#eac736', '#d94e5d']
        }
      },
      xAxis3D: {
        type: 'category',
        data: datosTransformados.ejes.x,
        name: config.dimensionX || ''
      },
      yAxis3D: {
        type: 'category',
        data: datosTransformados.ejes.y,
        name: config.dimensionY || ''
      },
      zAxis3D: {
        type: 'value',
        name: config.metrica || 'Valor'
      },
      grid3D: {
        boxWidth: 200,
        boxDepth: 80,
        viewControl: {
          autoRotate: true,
          autoRotateSpeed: 10,
          rotateSensitivity: 1
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true
          },
          ambient: {
            intensity: 0.3
          }
        }
      },
      series: [{
        type: 'bar3D',
        data: datosTransformados.datos,
        shading: 'realistic',
        itemStyle: {
          opacity: 0.8
        },
        emphasis: {
          itemStyle: {
            opacity: 1
          }
        }
      }]
    };
  }
  
  /**
   * Crea un gráfico de superficie 3D
   */
  private crearGraficoSuperficie3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): OpcionesGrafico {
    // Transformar datos genéricos a formato específico para gráfico de superficie 3D
    const datosTransformados = this.transformarParaSuperficie3D(datos, config);
    
    return {
      tooltip: {},
      visualMap: {
        show: true,
        dimension: 2,
        min: this.calcularMinimo(datosTransformados.datos),
        max: this.calcularMaximo(datosTransformados.datos),
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        }
      },
      xAxis3D: {
        type: 'value',
        name: config.dimensionX || '',
      },
      yAxis3D: {
        type: 'value',
        name: config.dimensionY || ''
      },
      zAxis3D: {
        type: 'value',
        name: config.metrica || 'Valor'
      },
      grid3D: {
        viewControl: {
          projection: 'perspective',
          autoRotate: true
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true
          },
          ambient: {
            intensity: 0.3
          }
        }
      },
      series: [{
        type: 'surface',
        data: datosTransformados.datos,
        wireframe: {
          show: true
        },
        itemStyle: {
          opacity: 0.8
        },
        emphasis: {
          itemStyle: {
            color: '#c23531'
          }
        }
      }]
    };
  }
  
  /**
   * Crea un gráfico de dispersión 3D
   */
  private crearGraficoDispersion3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): OpcionesGrafico {
    // Transformar datos genéricos a formato específico para gráfico de dispersión 3D
    const datosTransformados = this.transformarParaDispersion3D(datos, config);
    
    return {
      tooltip: {},
      visualMap: {
        min: this.calcularMinimo(datosTransformados.datos, 2),
        max: this.calcularMaximo(datosTransformados.datos, 2),
        dimension: 2,
        inRange: {
          color: ['#1710c0', '#0b9df0', '#00fea8', '#00ff0d', '#f5f811', '#f09a09', '#fe0300']
        }
      },
      xAxis3D: {
        name: config.dimensionX || '',
        type: 'value'
      },
      yAxis3D: {
        name: config.dimensionY || '',
        type: 'value'
      },
      zAxis3D: {
        name: config.metrica || 'Valor',
        type: 'value'
      },
      grid3D: {
        viewControl: {
          projection: 'perspective',
          autoRotate: true
        }
      },
      series: [{
        type: 'scatter3D',
        data: datosTransformados.datos,
        symbolSize: 12,
        itemStyle: {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.8)'
        },
        emphasis: {
          itemStyle: {
            color: '#fff'
          }
        }
      }]
    };
  }
  
  /**
   * Crea un gráfico de línea 3D
   */
  private crearGraficoLinea3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): OpcionesGrafico {
    // Implementación simplificada, se puede expandir según necesidades
    return this.crearGraficoDispersion3D(datos, config);
  }
  
  /**
   * Crea un gráfico de mapa de calor 3D
   */
  private crearGraficoMapaCalor3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): OpcionesGrafico {
    // Implementación simplificada, se puede expandir según necesidades
    return this.crearGraficoBarras3D(datos, config);
  }
  
  /**
   * Crea un gráfico de radar 3D
   */
  private crearGraficoRadar3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): OpcionesGrafico {
    // Implementación simplificada, se puede expandir según necesidades
    return this.crearConfiguracionVacia('Gráfico de radar 3D no implementado completamente');
  }
  
  /**
   * Crea una configuración vacía con un mensaje
   */
  private crearConfiguracionVacia(mensaje: string): OpcionesGrafico {
    return {
      title: {
        text: mensaje,
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: []
    };
  }
  
  /**
   * Transforma datos para gráfico de barras 3D
   */
  private transformarParaBarras3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): DatosVisualizacion {
    // Validar configuración
    const dimensionX = config.dimensionX || Object.keys(datos[0].dimensiones)[0];
    const dimensionY = config.dimensionY || Object.keys(datos[0].dimensiones)[1] || dimensionX;
    const metrica = config.metrica || Object.keys(datos[0].metricas)[0];
    
    // Extraer valores únicos para ejes
    const valoresX = new Set<string>();
    const valoresY = new Set<string>();
    
    datos.forEach(dato => {
      valoresX.add(String(dato.dimensiones[dimensionX]));
      valoresY.add(String(dato.dimensiones[dimensionY]));
    });
    
    const ejesX = Array.from(valoresX);
    const ejesY = Array.from(valoresY);
    
    // Crear datos para gráfico
    const datosGrafico: [number, number, number][] = [];
    
    datos.forEach(dato => {
      const x = ejesX.indexOf(String(dato.dimensiones[dimensionX]));
      const y = ejesY.indexOf(String(dato.dimensiones[dimensionY]));
      const z = dato.metricas[metrica] || 0;
      
      if (x >= 0 && y >= 0) {
        datosGrafico.push([x, y, z]);
      }
    });
    
    return {
      datos: datosGrafico,
      ejes: {
        x: ejesX,
        y: ejesY
      }
    };
  }
  
  /**
   * Transforma datos para gráfico de superficie 3D
   */
  private transformarParaSuperficie3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): DatosVisualizacion {
    // Implementación simplificada para demostración
    // En una implementación real, se necesitaría un algoritmo más sofisticado para generar una superficie
    const datosGrafico: [number, number, number][] = [];
    
    // Generar una superficie de ejemplo
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        // Buscar un dato que coincida con estas coordenadas o generar uno sintético
        const valor = this.encontrarValor(datos, i, j, config) || Math.sin(i / 5) * Math.cos(j / 5) * 5 + 5;
        datosGrafico.push([i, j, valor]);
      }
    }
    
    return {
      datos: datosGrafico,
      ejes: {
        x: Array.from({ length: 10 }, (_, i) => String(i)),
        y: Array.from({ length: 10 }, (_, i) => String(i))
      }
    };
  }
  
  /**
   * Transforma datos para gráfico de dispersión 3D
   */
  private transformarParaDispersion3D(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): DatosVisualizacion {
    // Validar configuración
    const dimensionX = config.dimensionX || Object.keys(datos[0].dimensiones)[0];
    const dimensionY = config.dimensionY || Object.keys(datos[0].dimensiones)[1] || dimensionX;
    const metrica = config.metrica || Object.keys(datos[0].metricas)[0];
    
    // Crear datos para gráfico
    const datosGrafico: [number, number, number][] = [];
    
    datos.forEach(dato => {
      const x = parseFloat(String(dato.dimensiones[dimensionX])) || 0;
      const y = parseFloat(String(dato.dimensiones[dimensionY])) || 0;
      const z = dato.metricas[metrica] || 0;
      
      datosGrafico.push([x, y, z]);
    });
    
    return {
      datos: datosGrafico,
      ejes: {
        x: [dimensionX],
        y: [dimensionY]
      }
    };
  }
  
  /**
   * Encuentra un valor en los datos que coincida con las coordenadas
   */
  private encontrarValor(datos: DatoFinanciero[], x: number, y: number, config: ConfiguracionVisualizacion): number | null {
    // Esta es una implementación simplificada
    // En una implementación real, se necesitaría mapear coordenadas a dimensiones
    return null;
  }
  
  /**
   * Calcula el valor máximo en los datos
   */
  private calcularMaximo(datos: any[], indice: number = 2): number {
    return Math.max(...datos.map(item => Array.isArray(item) ? item[indice] : item));
  }
  
  /**
   * Calcula el valor mínimo en los datos
   */
  private calcularMinimo(datos: any[], indice: number = 2): number {
    return Math.min(...datos.map(item => Array.isArray(item) ? item[indice] : item));
  }
}

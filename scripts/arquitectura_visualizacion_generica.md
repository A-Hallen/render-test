# Arquitectura de Visualización Genérica para Datos Financieros

## Introducción

Este documento describe la arquitectura para un sistema genérico de visualización de datos financieros en 3D. El objetivo es crear una estructura flexible que permita representar diferentes tipos de datos financieros de manera coherente y eficiente, independientemente de su origen o estructura específica.

## Principios de Diseño

1. **Abstracción de Datos**: Separar la representación de los datos de su visualización
2. **Adaptabilidad**: Soportar múltiples tipos de datos y visualizaciones
3. **Extensibilidad**: Facilitar la adición de nuevos tipos de gráficos y fuentes de datos
4. **Rendimiento**: Optimizar para grandes volúmenes de datos financieros
5. **Coherencia Visual**: Mantener una experiencia de usuario consistente

## Arquitectura de Visualización Genérica

### 1. Modelo de Datos Unificado

Crearemos un modelo de datos intermedio que estandarice diferentes fuentes de datos financieros:

```typescript
// Modelo de datos genérico para visualizaciones
interface DatoFinanciero {
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

enum TipoDato {
  INDICADOR,
  TRANSACCION,
  BALANCE,
  CLIENTE,
  PRODUCTO,
  OFICINA,
  // Otros tipos según necesidad
}
```

### 2. Adaptadores de Datos

Implementaremos adaptadores para transformar datos específicos al modelo genérico:

```typescript
interface AdaptadorDatos<T> {
  // Convierte datos específicos al modelo genérico
  adaptar(datos: T[]): DatoFinanciero[];
  
  // Extrae dimensiones disponibles para filtrado
  obtenerDimensiones(datos: T[]): string[];
  
  // Extrae métricas disponibles para visualización
  obtenerMetricas(datos: T[]): string[];
}

// Ejemplo de adaptador para indicadores financieros
class AdaptadorIndicadores implements AdaptadorDatos<IndicadorFinanciero> {
  adaptar(indicadores: IndicadorFinanciero[]): DatoFinanciero[] {
    return indicadores.map(indicador => ({
      id: indicador.codigo,
      tipo: TipoDato.INDICADOR,
      fuente: 'core_financiero',
      fecha: new Date(indicador.fecha),
      dimensiones: {
        oficina: indicador.oficinaId,
        modulo: indicador.moduloId,
        categoria: indicador.categoria
      },
      metricas: {
        valor: indicador.valor,
        meta: indicador.meta,
        variacion: indicador.variacion
      },
      atributos: {
        color: this.determinarColor(indicador),
        tendencia: indicador.tendencia
      }
    }));
  }
  
  // Implementación de otros métodos...
}
```

### 3. Fábrica de Visualizaciones

Utilizaremos el patrón Factory para crear diferentes tipos de visualizaciones 3D:

```typescript
interface ConfiguracionVisualizacion {
  tipo: TipoVisualizacion;
  dimensionX?: string;
  dimensionY?: string;
  dimensionZ?: string;
  metrica?: string;
  filtros?: Record<string, any>;
  opciones?: Record<string, any>;
}

enum TipoVisualizacion {
  BARRAS_3D,
  SUPERFICIE_3D,
  DISPERSION_3D,
  LINEA_3D,
  MAPA_CALOR_3D,
  RADAR_3D,
  // Otros tipos según necesidad
}

class FabricaVisualizaciones {
  crearVisualizacion(datos: DatoFinanciero[], config: ConfiguracionVisualizacion): OpcionesGrafico {
    switch (config.tipo) {
      case TipoVisualizacion.BARRAS_3D:
        return this.crearGraficoBarras3D(datos, config);
      case TipoVisualizacion.SUPERFICIE_3D:
        return this.crearGraficoSuperficie3D(datos, config);
      // Otros casos para diferentes tipos de visualizaciones
      default:
        throw new Error(`Tipo de visualización no soportado: ${config.tipo}`);
    }
  }
  
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
        data: datosTransformados.ejes.x
      },
      yAxis3D: {
        type: 'category',
        data: datosTransformados.ejes.y
      },
      zAxis3D: {
        type: 'value'
      },
      grid3D: {
        boxWidth: 200,
        boxDepth: 80,
        viewControl: {
          autoRotate: true
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true
          }
        }
      },
      series: [{
        type: 'bar3D',
        data: datosTransformados.datos,
        shading: 'realistic',
        itemStyle: {
          opacity: 0.8
        }
      }]
    };
  }
  
  // Métodos para otros tipos de visualizaciones...
}
```

### 4. Componente de Visualización Genérico

Crearemos un componente React que utilice la fábrica de visualizaciones:

```tsx
interface VisualizacionProps {
  datos: DatoFinanciero[];
  configuracion: ConfiguracionVisualizacion;
  altura?: number;
  ancho?: number;
  tema?: 'claro' | 'oscuro';
  onClickData?: (dato: DatoFinanciero) => void;
}

const Visualizacion: React.FC<VisualizacionProps> = ({
  datos,
  configuracion,
  altura = 500,
  ancho = '100%',
  tema = 'claro',
  onClickData
}) => {
  const fabricaVisualizaciones = new FabricaVisualizaciones();
  
  // Aplicar tema
  const opcionesConTema = aplicarTema(
    fabricaVisualizaciones.crearVisualizacion(datos, configuracion),
    tema
  );
  
  // Manejar eventos
  const onEvents = {
    'click': (params) => {
      if (onClickData && params.data) {
        const datoSeleccionado = datos.find(d => {
          // Lógica para encontrar el dato correspondiente al punto clickeado
          return true; // Simplificado para el ejemplo
        });
        if (datoSeleccionado) {
          onClickData(datoSeleccionado);
        }
      }
    }
  };
  
  return (
    <div className="visualizacion-container">
      <ReactECharts 
        option={opcionesConTema} 
        style={{ height: altura, width: ancho }} 
        onEvents={onEvents}
      />
    </div>
  );
};
```

### 5. Sistema de Configuración Dinámica

Implementaremos un sistema para configurar visualizaciones dinámicamente:

```tsx
const ConfiguradorVisualizacion: React.FC<{
  datos: DatoFinanciero[];
  onConfiguracionCambiada: (config: ConfiguracionVisualizacion) => void;
}> = ({ datos, onConfiguracionCambiada }) => {
  // Extraer dimensiones y métricas disponibles
  const dimensiones = extraerDimensionesUnicas(datos);
  const metricas = extraerMetricasUnicas(datos);
  
  // Estado para la configuración actual
  const [configuracion, setConfiguracion] = useState<ConfiguracionVisualizacion>({
    tipo: TipoVisualizacion.BARRAS_3D,
    dimensionX: dimensiones[0]?.id,
    dimensionY: dimensiones[1]?.id,
    metrica: metricas[0]?.id,
    filtros: {}
  });
  
  // Actualizar configuración y notificar cambios
  const actualizarConfiguracion = (cambios: Partial<ConfiguracionVisualizacion>) => {
    const nuevaConfig = { ...configuracion, ...cambios };
    setConfiguracion(nuevaConfig);
    onConfiguracionCambiada(nuevaConfig);
  };
  
  return (
    <div className="configurador-visualizacion">
      <div className="seccion">
        <h3>Tipo de Visualización</h3>
        <select
          value={configuracion.tipo}
          onChange={(e) => actualizarConfiguracion({ 
            tipo: parseInt(e.target.value) as TipoVisualizacion 
          })}
        >
          <option value={TipoVisualizacion.BARRAS_3D}>Barras 3D</option>
          <option value={TipoVisualizacion.SUPERFICIE_3D}>Superficie 3D</option>
          {/* Otras opciones */}
        </select>
      </div>
      
      <div className="seccion">
        <h3>Dimensiones</h3>
        <div className="campo">
          <label>Eje X:</label>
          <select
            value={configuracion.dimensionX}
            onChange={(e) => actualizarConfiguracion({ dimensionX: e.target.value })}
          >
            {dimensiones.map(dim => (
              <option key={dim.id} value={dim.id}>{dim.nombre}</option>
            ))}
          </select>
        </div>
        {/* Campos similares para dimensionY y dimensionZ */}
      </div>
      
      <div className="seccion">
        <h3>Métrica</h3>
        <select
          value={configuracion.metrica}
          onChange={(e) => actualizarConfiguracion({ metrica: e.target.value })}
        >
          {metricas.map(met => (
            <option key={met.id} value={met.id}>{met.nombre}</option>
          ))}
        </select>
      </div>
      
      <div className="seccion">
        <h3>Filtros</h3>
        {/* Componentes para configurar filtros dinámicamente */}
      </div>
    </div>
  );
};
```

### 6. Integración con Asistente IA

Implementaremos la integración con el asistente IA para generar visualizaciones a partir de consultas:

```typescript
class AsistenteVisualizacion {
  private fabricaVisualizaciones = new FabricaVisualizaciones();
  
  async generarVisualizacionDesdeConsulta(
    consulta: string,
    datosDisponibles: DatoFinanciero[],
    usuarioId: string
  ): Promise<{
    configuracion: ConfiguracionVisualizacion,
    explicacion: string
  }> {
    // Analizar la consulta con IA para determinar la visualización adecuada
    const analisisConsulta = await this.analizarConsulta(consulta, datosDisponibles);
    
    // Extraer dimensiones y métricas mencionadas en la consulta
    const dimensiones = this.extraerDimensiones(analisisConsulta, datosDisponibles);
    const metrica = this.extraerMetrica(analisisConsulta, datosDisponibles);
    
    // Determinar el tipo de visualización más adecuado
    const tipoVisualizacion = this.determinarTipoVisualizacion(
      analisisConsulta,
      dimensiones.length
    );
    
    // Crear configuración de visualización
    const configuracion: ConfiguracionVisualizacion = {
      tipo: tipoVisualizacion,
      dimensionX: dimensiones[0],
      dimensionY: dimensiones.length > 1 ? dimensiones[1] : undefined,
      dimensionZ: dimensiones.length > 2 ? dimensiones[2] : undefined,
      metrica: metrica,
      filtros: this.extraerFiltros(analisisConsulta, datosDisponibles)
    };
    
    return {
      configuracion,
      explicacion: this.generarExplicacion(configuracion, analisisConsulta)
    };
  }
  
  // Métodos auxiliares para analizar consultas y generar configuraciones...
}
```

## Ejemplos de Uso

### 1. Visualización de Indicadores Financieros por Oficina y Producto

```tsx
const DashboardIndicadores: React.FC = () => {
  const [datos, setDatos] = useState<DatoFinanciero[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionVisualizacion>({
    tipo: TipoVisualizacion.BARRAS_3D,
    dimensionX: 'oficina',
    dimensionY: 'producto',
    metrica: 'valor'
  });
  
  useEffect(() => {
    // Cargar datos de Firebase
    const cargarDatos = async () => {
      const indicadoresRaw = await firebaseService.obtenerIndicadores();
      const adaptador = new AdaptadorIndicadores();
      setDatos(adaptador.adaptar(indicadoresRaw));
    };
    
    cargarDatos();
  }, []);
  
  return (
    <div className="dashboard-container">
      <h2>Indicadores Financieros por Oficina y Producto</h2>
      
      <div className="controles">
        <ConfiguradorVisualizacion 
          datos={datos} 
          onConfiguracionCambiada={setConfiguracion} 
        />
      </div>
      
      <div className="visualizacion">
        <Visualizacion 
          datos={datos} 
          configuracion={configuracion} 
          altura={600}
          tema="claro"
          onClickData={(dato) => console.log('Dato seleccionado:', dato)}
        />
      </div>
    </div>
  );
};
```

### 2. Generación de Visualizaciones con Asistente IA

```tsx
const AsistenteVisualizaciones: React.FC = () => {
  const [consulta, setConsulta] = useState('');
  const [datos, setDatos] = useState<DatoFinanciero[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionVisualizacion | null>(null);
  const [explicacion, setExplicacion] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const asistente = new AsistenteVisualizacion();
  
  useEffect(() => {
    // Cargar datos disponibles para el usuario actual
    const cargarDatos = async () => {
      const datosRaw = await firebaseService.obtenerDatosParaUsuario(usuarioActual.id);
      const adaptador = new AdaptadorGenerico();
      setDatos(adaptador.adaptar(datosRaw));
    };
    
    cargarDatos();
  }, []);
  
  const procesarConsulta = async () => {
    if (!consulta.trim()) return;
    
    setCargando(true);
    try {
      const resultado = await asistente.generarVisualizacionDesdeConsulta(
        consulta,
        datos,
        usuarioActual.id
      );
      
      setConfiguracion(resultado.configuracion);
      setExplicacion(resultado.explicacion);
    } catch (error) {
      console.error('Error al procesar consulta:', error);
      setExplicacion('Lo siento, no pude generar una visualización para esa consulta.');
    } finally {
      setCargando(false);
    }
  };
  
  return (
    <div className="asistente-container">
      <h2>Asistente de Visualización</h2>
      
      <div className="consulta-container">
        <input
          type="text"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Describe la visualización que necesitas..."
          className="consulta-input"
        />
        <button 
          onClick={procesarConsulta}
          disabled={cargando}
          className="consulta-boton"
        >
          {cargando ? 'Procesando...' : 'Generar Visualización'}
        </button>
      </div>
      
      {explicacion && (
        <div className="explicacion">
          <p>{explicacion}</p>
        </div>
      )}
      
      {configuracion && (
        <div className="visualizacion-resultado">
          <Visualizacion 
            datos={datos} 
            configuracion={configuracion} 
            altura={500}
          />
        </div>
      )}
    </div>
  );
};
```

## Consideraciones de Rendimiento

1. **Agregación de Datos**: Implementar agregación en el servidor para reducir el volumen de datos transferidos.

2. **Carga Progresiva**: Cargar datos de manera incremental para visualizaciones complejas.

3. **Nivel de Detalle Adaptativo**: Ajustar la complejidad de la visualización según el rendimiento del dispositivo.

4. **Caché Inteligente**: Almacenar en caché configuraciones y datos frecuentemente utilizados.

5. **Renderizado Selectivo**: Renderizar solo los elementos visibles en visualizaciones grandes.

## Extensibilidad

El sistema está diseñado para ser extensible en varias dimensiones:

1. **Nuevos Tipos de Datos**: Añadir nuevos adaptadores para diferentes fuentes de datos.

2. **Nuevas Visualizaciones**: Extender la fábrica de visualizaciones con nuevos tipos de gráficos.

3. **Personalización**: Permitir temas personalizados y configuraciones avanzadas.

4. **Integración**: Facilitar la integración con otros sistemas y APIs.

## Conclusión

Esta arquitectura genérica para visualización de datos financieros proporciona una base sólida y flexible para representar diferentes tipos de datos en visualizaciones 3D. Al separar los datos de su representación visual y utilizar patrones de diseño como adaptadores y fábricas, el sistema puede evolucionar y adaptarse a nuevas necesidades sin cambios estructurales significativos.

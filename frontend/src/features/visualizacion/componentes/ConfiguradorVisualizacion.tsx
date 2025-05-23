/**
 * Componente para configurar visualizaciones 3D
 * Permite a los usuarios personalizar las visualizaciones de forma dinu00e1mica
 */

import React, { useState, useEffect } from 'react';
import { ConfiguracionVisualizacion, TipoVisualizacion, DatoFinanciero } from '../modelo/DatoFinanciero';

// Propiedades del componente configurador
interface ConfiguradorVisualizacionProps {
  datos: DatoFinanciero[];
  configuracionInicial?: Partial<ConfiguracionVisualizacion>;
  onConfiguracionCambiada: (config: ConfiguracionVisualizacion) => void;
  className?: string;
}

// Interfaz para dimensiones y mu00e9tricas disponibles
interface DimensionOMetrica {
  id: string;
  nombre: string;
}

/**
 * Componente para configurar visualizaciones 3D
 */
const ConfiguradorVisualizacion: React.FC<ConfiguradorVisualizacionProps> = ({
  datos,
  configuracionInicial = {},
  onConfiguracionCambiada,
  className = ''
}) => {
  // Extraer dimensiones y mu00e9tricas disponibles
  const [dimensiones, setDimensiones] = useState<DimensionOMetrica[]>([]);
  const [metricas, setMetricas] = useState<DimensionOMetrica[]>([]);
  
  // Estado para la configuracion actual
  const [configuracion, setConfiguracion] = useState<ConfiguracionVisualizacion>({
    tipo: configuracionInicial.tipo || TipoVisualizacion.BARRAS_3D,
    dimensionX: configuracionInicial.dimensionX,
    dimensionY: configuracionInicial.dimensionY,
    dimensionZ: configuracionInicial.dimensionZ,
    metrica: configuracionInicial.metrica,
    filtros: configuracionInicial.filtros || {},
    opciones: configuracionInicial.opciones || {}
  });
  
  // Extraer dimensiones y mu00e9tricas de los datos
  useEffect(() => {
    if (!datos || datos.length === 0) return;
    
    // Extraer dimensiones u00fanicas
    const dimensionesUnicas = new Map<string, string>();
    
    // Extraer mu00e9tricas u00fanicas
    const metricasUnicas = new Map<string, string>();
    
    datos.forEach(dato => {
      // Procesar dimensiones
      Object.entries(dato.dimensiones).forEach(([id]) => {
        if (!dimensionesUnicas.has(id)) {
          dimensionesUnicas.set(id, formatearNombre(id));
        }
      });
      
      // Procesar métricas
      Object.entries(dato.metricas).forEach(([id]) => {
        if (!metricasUnicas.has(id)) {
          metricasUnicas.set(id, formatearNombre(id));
        }
      });
    });
    
    // Convertir a arrays para el estado
    setDimensiones(Array.from(dimensionesUnicas.entries()).map(([id, nombre]) => ({ id, nombre })));
    setMetricas(Array.from(metricasUnicas.entries()).map(([id, nombre]) => ({ id, nombre })));
    
    // Establecer valores predeterminados si no estu00e1n definidos
    const configActualizada = { ...configuracion };
    let actualizado = false;
    
    if (!configActualizada.dimensionX && dimensionesUnicas.size > 0) {
      configActualizada.dimensionX = Array.from(dimensionesUnicas.keys())[0];
      actualizado = true;
    }
    
    if (!configActualizada.dimensionY && dimensionesUnicas.size > 1) {
      configActualizada.dimensionY = Array.from(dimensionesUnicas.keys())[1];
      actualizado = true;
    }
    
    if (!configActualizada.metrica && metricasUnicas.size > 0) {
      configActualizada.metrica = Array.from(metricasUnicas.keys())[0];
      actualizado = true;
    }
    
    if (actualizado) {
      setConfiguracion(configActualizada);
      onConfiguracionCambiada(configActualizada);
    }
  }, [datos]);
  
  // Actualizar configuracion y notificar cambios
  const actualizarConfiguracion = (cambios: Partial<ConfiguracionVisualizacion>) => {
    const nuevaConfig = { ...configuracion, ...cambios };
    setConfiguracion(nuevaConfig);
    onConfiguracionCambiada(nuevaConfig);
  };
  
  // Formatear nombre para mostrar
  const formatearNombre = (id: string): string => {
    return id
      .replace(/([A-Z])/g, ' $1') // Insertar espacio antes de mayu00fasculas
      .replace(/^./, str => str.toUpperCase()) // Primera letra mayu00fascula
      .trim();
  };
  
  return (
    <div className={`configurador-visualizacion ${className}`}>
      <div className="seccion">
        <h3 className="titulo-seccion">Tipo de Visualizaciu00f3n</h3>
        <select
          className="selector"
          value={configuracion.tipo}
          onChange={(e) => actualizarConfiguracion({ 
            tipo: e.target.value as TipoVisualizacion 
          })}
        >
          <option value={TipoVisualizacion.BARRAS_3D}>Barras 3D</option>
          <option value={TipoVisualizacion.SUPERFICIE_3D}>Superficie 3D</option>
          <option value={TipoVisualizacion.DISPERSION_3D}>Dispersiu00f3n 3D</option>
          <option value={TipoVisualizacion.LINEA_3D}>Lu00ednea 3D</option>
          <option value={TipoVisualizacion.MAPA_CALOR_3D}>Mapa de Calor 3D</option>
          <option value={TipoVisualizacion.RADAR_3D}>Radar 3D</option>
        </select>
      </div>
      
      <div className="seccion">
        <h3 className="titulo-seccion">Dimensiones</h3>
        <div className="campo">
          <label>Eje X:</label>
          <select
            className="selector"
            value={configuracion.dimensionX || ''}
            onChange={(e) => actualizarConfiguracion({ dimensionX: e.target.value })}
          >
            <option value="">Seleccionar dimensiu00f3n</option>
            {dimensiones.map(dim => (
              <option key={dim.id} value={dim.id}>{dim.nombre}</option>
            ))}
          </select>
        </div>
        
        <div className="campo">
          <label>Eje Y:</label>
          <select
            className="selector"
            value={configuracion.dimensionY || ''}
            onChange={(e) => actualizarConfiguracion({ dimensionY: e.target.value })}
          >
            <option value="">Seleccionar dimensiu00f3n</option>
            {dimensiones.map(dim => (
              <option key={dim.id} value={dim.id}>{dim.nombre}</option>
            ))}
          </select>
        </div>
        
        {(configuracion.tipo === TipoVisualizacion.DISPERSION_3D || 
          configuracion.tipo === TipoVisualizacion.LINEA_3D) && (
          <div className="campo">
            <label>Eje Z:</label>
            <select
              className="selector"
              value={configuracion.dimensionZ || ''}
              onChange={(e) => actualizarConfiguracion({ dimensionZ: e.target.value })}
            >
              <option value="">Seleccionar dimensiu00f3n</option>
              {dimensiones.map(dim => (
                <option key={dim.id} value={dim.id}>{dim.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="seccion">
        <h3 className="titulo-seccion">Mu00e9trica</h3>
        <select
          className="selector"
          value={configuracion.metrica || ''}
          onChange={(e) => actualizarConfiguracion({ metrica: e.target.value })}
        >
          <option value="">Seleccionar mu00e9trica</option>
          {metricas.map(met => (
            <option key={met.id} value={met.id}>{met.nombre}</option>
          ))}
        </select>
      </div>
      
      {/* Aquu00ed se pueden au00f1adir mu00e1s secciones para filtros y opciones avanzadas */}
    </div>
  );
};

export default ConfiguradorVisualizacion;

/**
 * Componente genu00e9rico para visualizaciones 3D
 * Utiliza la fu00e1brica de visualizaciones para mostrar diferentes tipos de gru00e1ficos
 */

import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { DatoFinanciero, ConfiguracionVisualizacion } from '../modelo/DatoFinanciero';
import { FabricaVisualizaciones, OpcionesGrafico } from '../fabrica/FabricaVisualizaciones';

// Propiedades del componente de visualizaciu00f3n
interface VisualizacionProps {
  datos: DatoFinanciero[];
  configuracion: ConfiguracionVisualizacion;
  altura?: number | string;
  ancho?: number | string;
  tema?: 'claro' | 'oscuro';
  className?: string;
  onClickData?: (dato: DatoFinanciero) => void;
  cargando?: boolean;
}

/**
 * Componente genu00e9rico para visualizaciones 3D
 */
const Visualizacion: React.FC<VisualizacionProps> = ({
  datos,
  configuracion,
  altura = 500,
  ancho = '100%',
  tema = 'claro',
  className = '',
  onClickData,
  cargando = false
}) => {
  // Estado para las opciones del gru00e1fico
  const [opciones, setOpciones] = useState<OpcionesGrafico | null>(null);
  
  // Instancia de la fu00e1brica de visualizaciones
  const fabricaVisualizaciones = new FabricaVisualizaciones();
  
  // Generar opciones de gru00e1fico cuando cambian los datos o la configuraciu00f3n
  useEffect(() => {
    if (cargando) return;
    
    try {
      // Crear visualizaciu00f3n usando la fu00e1brica
      const opcionesGeneradas = fabricaVisualizaciones.crearVisualizacion(datos, configuracion);
      
      // Aplicar tema
      const opcionesConTema = aplicarTema(opcionesGeneradas, tema);
      
      setOpciones(opcionesConTema);
    } catch (error) {
      console.error('Error al generar visualizaciu00f3n:', error);
      setOpciones({
        title: {
          text: 'Error al generar visualizaciu00f3n',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#f44336',
            fontSize: 16
          }
        }
      });
    }
  }, [datos, configuracion, tema, cargando]);
  
  // Manejar eventos de click en el gru00e1fico
  const onEvents = {
    'click': (params: any) => {
      if (!onClickData || !params.data) return;
      
      // Buscar el dato correspondiente al punto clickeado
      const datoSeleccionado = encontrarDatoCorrespondiente(params.data, datos, configuracion);
      
      if (datoSeleccionado) {
        onClickData(datoSeleccionado);
      }
    }
  };
  
  // Renderizar componente
  return (
    <div className={`visualizacion-container ${className}`} style={{ position: 'relative' }}>
      {cargando ? (
        <div className="visualizacion-cargando" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: typeof altura === 'number' ? `${altura}px` : altura,
          width: typeof ancho === 'number' ? `${ancho}px` : ancho,
          backgroundColor: tema === 'oscuro' ? '#1a1a1a' : '#f5f5f5',
          color: tema === 'oscuro' ? '#ffffff' : '#333333',
        }}>
          <div>
            <div style={{ 
              border: '4px solid rgba(0, 0, 0, 0.1)',
              borderTopColor: tema === 'oscuro' ? '#ffffff' : '#3498db',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px auto'
            }} />
            <div>Cargando visualizaciu00f3n...</div>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : opciones ? (
        <ReactECharts 
          option={opciones} 
          style={{ height: altura, width: ancho }} 
          onEvents={onEvents}
          opts={{ renderer: 'canvas' }}
        />
      ) : null}
    </div>
  );
};

/**
 * Aplica un tema a las opciones del gru00e1fico
 */
const aplicarTema = (opciones: OpcionesGrafico, tema: 'claro' | 'oscuro'): OpcionesGrafico => {
  // Clonar opciones para no modificar el original
  const opcionesConTema = { ...opciones };
  
  // Aplicar tema oscuro
  if (tema === 'oscuro') {
    opcionesConTema.backgroundColor = '#1a1a1a';
    opcionesConTema.textStyle = { color: '#ffffff' };
    
    // Aplicar tema a ejes
    ['xAxis3D', 'yAxis3D', 'zAxis3D'].forEach(eje => {
      if (opcionesConTema[eje]) {
        opcionesConTema[eje] = {
          ...opcionesConTema[eje],
          axisLine: { lineStyle: { color: '#ffffff' } },
          axisLabel: { color: '#ffffff' },
          nameTextStyle: { color: '#ffffff' }
        };
      }
    });
    
    // Aplicar tema a tu00edtulo
    if (opcionesConTema.title) {
      opcionesConTema.title.textStyle = {
        ...opcionesConTema.title.textStyle,
        color: '#ffffff'
      };
    }
  }
  
  return opcionesConTema;
};

/**
 * Encuentra el dato correspondiente a un punto clickeado en el gru00e1fico
 */
const encontrarDatoCorrespondiente = (
  puntoClickeado: any,
  datos: DatoFinanciero[],
  configuracion: ConfiguracionVisualizacion
): DatoFinanciero | null => {
  // Esta es una implementaciu00f3n simplificada
  // En una implementaciu00f3n real, se necesitaru00eda mapear coordenadas a dimensiones
  if (!Array.isArray(puntoClickeado) || puntoClickeado.length < 3) {
    return null;
  }
  
  // Para gru00e1ficos de barras 3D, dispersiu00f3n 3D, etc.
  const [x, y, z] = puntoClickeado;
  
  // Buscar el dato mu00e1s cercano
  // Esta es una implementaciu00f3n muy bu00e1sica, en la pru00e1ctica se necesitaru00eda algo mu00e1s sofisticado
  return datos[0] || null;
};

export default Visualizacion;

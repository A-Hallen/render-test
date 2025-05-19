/**
 * Componente de demostración para visualizaciones 3D
 * Muestra cómo utilizar la arquitectura genérica de visualización
 */

import React, { useState, useEffect } from 'react';
import Visualizacion from '../componentes/Visualizacion';
import ConfiguradorVisualizacion from '../componentes/ConfiguradorVisualizacion';
import { DatoFinanciero, ConfiguracionVisualizacion, TipoVisualizacion } from '../modelo/DatoFinanciero';
import { AdaptadorIndicadores, IndicadorFinanciero } from '../adaptadores/AdaptadorDatos';
import { useAutorizacion } from '../../../context/AutorizacionContext';
import { Accion } from '../../../services/AutorizacionService';

/**
 * Componente de demostración para visualizaciones 3D
 */
const DemoVisualizacion: React.FC = () => {
  // Estado para datos y configuración
  const [datos, setDatos] = useState<DatoFinanciero[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionVisualizacion>({
    tipo: TipoVisualizacion.BARRAS_3D,
    dimensionX: 'oficina',
    dimensionY: 'modulo',
    metrica: 'valor'
  });
  const [cargando, setCargando] = useState<boolean>(true);
  const { usuario, puede } = useAutorizacion();
  
  // Cargar datos de ejemplo al iniciar
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      const datosEjemplo = generarDatosEjemplo();
      const adaptador = new AdaptadorIndicadores();
      const datosAdaptados = adaptador.adaptar(datosEjemplo);
      
      // Filtrar datos según permisos del usuario
      const datosFiltrados = datosAdaptados.filter(dato => {
        // Si no hay usuario o es administrador, mostrar todos los datos
        if (!usuario || usuario.rol === 'administrador') return true;
        
        // Para gerente de oficina, solo mostrar datos de su oficina
        if (usuario.rol === 'gerente_oficina' && usuario.oficinaId) {
          return dato.dimensiones.oficina === usuario.oficinaId;
        }
        
        // Verificar permiso para ver el dato
        return puede(Accion.LEER, { type: 'DatoFinanciero', ...dato });
      });
      
      setDatos(datosFiltrados);
      setCargando(false);
    }, 1500);
  }, [usuario, puede]);
  
  // Manejar cambios en la configuración
  const handleConfiguracionCambiada = (nuevaConfig: ConfiguracionVisualizacion) => {
    setConfiguracion(nuevaConfig);
  };
  
  // Manejar clic en datos
  const handleClickDato = (dato: DatoFinanciero) => {
    console.log('Dato seleccionado:', dato);
    // Aquí se podría mostrar un modal con detalles del dato seleccionado
  };
  
  return (
    <div className="demo-visualizacion">
      <h2 className="titulo">Demostración de Visualizaciones 3D</h2>
      <p className="descripcion">
        Esta demostración muestra cómo utilizar la arquitectura genérica de visualización para crear diferentes tipos de gráficos 3D a partir de los mismos datos.
      </p>
      
      <div className="contenedor-principal">
        <div className="panel-configuracion">
          <h3>Configuración</h3>
          <ConfiguradorVisualizacion 
            datos={datos} 
            configuracionInicial={configuracion}
            onConfiguracionCambiada={handleConfiguracionCambiada} 
          />
        </div>
        
        <div className="panel-visualizacion">
          <h3>Visualización</h3>
          <Visualizacion 
            datos={datos} 
            configuracion={configuracion} 
            altura={500}
            tema="claro"
            onClickData={handleClickDato}
            cargando={cargando}
          />
        </div>
      </div>
      
      <div className="panel-info">
        <h3>Información</h3>
        <p>
          <strong>Tipo de visualización:</strong> {configuracion.tipo}
        </p>
        <p>
          <strong>Dimensión X:</strong> {configuracion.dimensionX || 'No seleccionada'}
        </p>
        <p>
          <strong>Dimensión Y:</strong> {configuracion.dimensionY || 'No seleccionada'}
        </p>
        <p>
          <strong>Métrica:</strong> {configuracion.metrica || 'No seleccionada'}
        </p>
        <p>
          <strong>Cantidad de datos:</strong> {datos.length}
        </p>
      </div>
      
      <style>{`
        .demo-visualizacion {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .titulo {
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .descripcion {
          color: #7f8c8d;
          margin-bottom: 20px;
        }
        
        .contenedor-principal {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .panel-configuracion {
          flex: 1;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .panel-visualizacion {
          flex: 2;
          padding: 15px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .panel-info {
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h3 {
          color: #3498db;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

/**
 * Genera datos de ejemplo para la demostración
 */
const generarDatosEjemplo = (): IndicadorFinanciero[] => {
  const oficinas = ['Central', 'Norte', 'Sur', 'Este', 'Oeste'];
  const modulos = ['Préstamos', 'Ahorros', 'Inversiones', 'Seguros', 'Tarjetas'];
  const categorias = ['Operativo', 'Financiero', 'Comercial', 'Administrativo'];
  
  const datos: IndicadorFinanciero[] = [];
  
  // Generar datos para cada combinación de oficina y módulo
  oficinas.forEach((oficina, i) => {
    modulos.forEach((modulo, j) => {
      categorias.forEach((categoria, k) => {
        // Generar un valor aleatorio entre 50 y 100
        const valor = Math.floor(Math.random() * 50) + 50;
        // Generar una meta aleatoria entre 80 y 120
        const meta = Math.floor(Math.random() * 40) + 80;
        // Calcular variación
        const variacion = ((valor - meta) / meta) * 100;
        
        datos.push({
          codigo: `IND-${i}-${j}-${k}`,
          nombre: `Indicador ${modulo} - ${oficina}`,
          valor: valor,
          meta: meta,
          variacion: variacion,
          fecha: new Date().toISOString(),
          oficinaId: oficina,
          moduloId: modulo,
          categoria: categoria,
          tendencia: variacion > 0 ? 'alza' : variacion < 0 ? 'baja' : 'estable',
          esActivo: true,
          estaEnPantallaPrincipal: Math.random() > 0.5,
          mayorEsMejor: Math.random() > 0.3
        });
      });
    });
  });
  
  return datos;
};

export default DemoVisualizacion;

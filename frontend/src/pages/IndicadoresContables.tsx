import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from '../components/ui';
import { Calendar, Search } from 'lucide-react';
import { IndicadorCircular } from '../components/indicadores';
import { OficinasService, Oficina } from '../services/OficinasService';

interface IndicadorContable {
  id: string;
  nombre: string;
  valor: number;
  rendimiento: 'DEFICIENTE' | 'ACEPTABLE' | 'BUENO';
  color: string;
}

interface FiltrosIndicadores {
  oficina: string;
  fecha: string;
}

export const IndicadoresContables: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadorContable[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [cargandoOficinas, setCargandoOficinas] = useState<boolean>(true);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosIndicadores>({
    oficina: 'MATRIZ',
    fecha: formatearFecha(new Date())
  });

  // Función para formatear fecha en formato YYYY-MM-DD
  function formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Cargar oficinas al iniciar
  useEffect(() => {
    cargarOficinas();
  }, []);

  // Cargar indicadores al iniciar o cuando cambien los filtros
  useEffect(() => {
    cargarIndicadores();
  }, [filtros]);

  // Función para cargar las oficinas desde el backend
  const cargarOficinas = async () => {
    try {
      setCargandoOficinas(true);
      const oficinasData = await OficinasService.obtenerOficinas();
      setOficinas(oficinasData);
    } catch (err: any) {
      console.error('Error al cargar oficinas:', err);
      setError(err.message || 'Error al cargar oficinas');
    } finally {
      setCargandoOficinas(false);
    }
  };

  // Función para cargar los indicadores desde el backend
  const cargarIndicadores = async () => {
    try {
      setCargando(true);
      setError(null);
      
      // Formatear la fecha correctamente para asegurar compatibilidad con el backend
      // Convertir de YYYY-MM-DD a DD/MM/YYYY que es lo que espera el backend
      let fechaFormateada = filtros.fecha;
      if (fechaFormateada && fechaFormateada.includes('-')) {
        const [anio, mes, dia] = fechaFormateada.split('-');
        fechaFormateada = `${dia}/${mes}/${anio}`;
      }
      console.log('Fecha formateada:', fechaFormateada);
      
      // Usar el nuevo endpoint con fechaInicio y fechaFin iguales
      const url = `/api/kpi-contables/rango-fechas?oficina=${encodeURIComponent(filtros.oficina)}&fechaInicio=${encodeURIComponent(fechaFormateada)}&fechaFin=${encodeURIComponent(fechaFormateada)}`;
      
      console.log(`Consultando KPIs: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        try {
          const errorData = await response.json();
          throw new Error(errorData.mensaje || `Error al obtener indicadores: ${response.statusText}`);
        } catch (parseError) {
          throw new Error(`Error al obtener indicadores: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      // Verificar si hay indicadores calculados para la fecha
      if (!data.kpisCalculados || Object.keys(data.kpisCalculados).length === 0) {
        console.log('No hay indicadores calculados disponibles');
        setIndicadores([]);
        setError('No hay indicadores disponibles para los filtros seleccionados');
        return;
      }
      
      // Mostrar mensaje informativo
      if (data.mensaje) {
        console.log('Mensaje del servidor:', data.mensaje);
      }
      
      // Procesar los indicadores recibidos
      const fechaActual = Object.keys(data.kpisCalculados)[0]; // Tomamos la primera fecha disponible
      if (!fechaActual) {
        setIndicadores([]);
        setError('No hay datos disponibles para la fecha seleccionada');
        return;
      }
      
      console.log('Fecha actual:', fechaActual);
      console.log('Indicadores disponibles:', data.indicadores);
      console.log('KPIs calculados para la fecha:', data.kpisCalculados[fechaActual]);
      
      // Definir interfaces para tipar correctamente
      interface KPI {
        idIndicador: string;
        valor: number;
        fecha: string;
        codigoOficina: string;
        componentes: {
          numerador: number;
          denominador: number;
          detalle: {
            numerador: Record<string, number>;
            denominador: Record<string, number>;
          };
        };
      }
      
      interface IndicadorAPI {
        id: string;
        nombre: string;
        color: string;
      }
      
      // Mapear los KPIs calculados a la estructura que espera el componente
      const indicadoresProcesados = data.kpisCalculados[fechaActual].map((kpi: KPI) => {
        // Buscar el indicador correspondiente en la lista de indicadores
        const indicadorInfo = data.indicadores.find((ind: IndicadorAPI) => ind.id === kpi.idIndicador);
        
        return {
          id: kpi.idIndicador,
          nombre: indicadorInfo?.nombre || kpi.idIndicador,
          valor: kpi.valor,
          rendimiento: determinarRendimiento(kpi.valor),
          color: indicadorInfo?.color || determinarColor(kpi.valor)
        };
      });
      
      setIndicadores(indicadoresProcesados);
    } catch (err: any) {
      console.error('Error al cargar indicadores contables:', err);
      setError(err.message || 'Error al cargar indicadores contables');
    } finally {
      setCargando(false);
    }
  };

  // Función para determinar el rendimiento basado en el valor
  const determinarRendimiento = (valor: number): 'DEFICIENTE' | 'ACEPTABLE' | 'BUENO' => {
    if (valor < 40) return 'DEFICIENTE';
    if (valor < 70) return 'ACEPTABLE';
    return 'BUENO';
  };

  // Función para determinar el color basado en el rendimiento
  const determinarColor = (valor: number): string => {
    if (valor < 40) return '#FF8C42'; // Naranja para deficiente
    if (valor < 70) return '#FFD166'; // Amarillo para aceptable
    return '#06D6A0'; // Verde para bueno
  };

  // Manejar cambio de oficina
  const handleOficinaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltros(prev => ({ ...prev, oficina: e.target.value }));
  };

  // Manejar cambio de fecha
  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros(prev => ({ ...prev, fecha: e.target.value }));
  };

  // Manejar clic en consultar
  const handleConsultar = () => {
    cargarIndicadores();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Consulta de Indicadores Calculados</h1>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Indicadores Financieros Calculados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oficina:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filtros.oficina}
              onChange={handleOficinaChange}
              disabled={cargandoOficinas}
            >
              {cargandoOficinas ? (
                <option value="">Cargando oficinas...</option>
              ) : oficinas.length > 0 ? (
                oficinas.map(oficina => (
                  <option key={oficina.codigo} value={oficina.codigo}>
                    {oficina.nombre}
                  </option>
                ))
              ) : (
                <>
                  <option value="MATRIZ">MATRIZ</option>
                  <option value="SUCURSAL_1">SUCURSAL 1</option>
                  <option value="SUCURSAL_2">SUCURSAL 2</option>
                  <option value="CONSOLIDADO">CONSOLIDADO</option>
                </>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
            <div className="relative">
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtros.fecha}
                onChange={handleFechaChange}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleConsultar}>
            <Search className="mr-2 h-4 w-4" />
            Consultar
          </Button>
        </div>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      ) : indicadores.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Indicadores para {filtros.oficina}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {indicadores.map((indicador) => (
              <div key={indicador.id} className="border rounded-lg p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-4">{indicador.nombre}</h3>
                <IndicadorCircular 
                  valor={indicador.valor} 
                  etiqueta={indicador.rendimiento} 
                  color={indicador.color} 
                />
              </div>
            ))}
          </div>
        </Card>
      ) : !cargando && error ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      ) : !cargando && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No hay indicadores disponibles para los filtros seleccionados.</p>
        </Card>
      )}
    </div>
  );
};

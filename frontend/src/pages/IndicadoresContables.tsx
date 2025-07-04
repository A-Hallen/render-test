import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from '../components/ui';
import { Calendar, Search, RefreshCw, Info } from 'lucide-react';
import { IndicadorCircular } from '../components/indicadores';
import { DetalleIndicador } from '../components/indicadores/DetalleIndicador';
import { OficinasService, Oficina } from '../services/OficinasService';
import { obtenerIndicadoresPorRango } from '../services/indicadores.service';
import '../components/ui/DateInput.css';  // Importar estilos para el input de fecha

interface IndicadorContable {
  id: string;
  nombre: string;
  valor: number;
  rendimiento: 'DEFICIENTE' | 'ACEPTABLE' | 'BUENO';
  color: string;
  componentes?: {
    numerador: number;
    denominador: number;
    detalle: {
      numerador: Record<string, number>;
      denominador: Record<string, number>;
    };
  };
}

interface FiltrosIndicadores {
  oficina: string;
  fecha: string;
}

// Usamos el servicio centralizado para indicadores financieros

export const IndicadoresContables: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadorContable[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [cargandoOficinas, setCargandoOficinas] = useState<boolean>(true);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosIndicadores>({
    oficina: 'MATRIZ',
    fecha: formatearFechaParaInput(new Date())
  });
  
  // Estado para las fechas mostradas al usuario en formato DD/MM/YYYY
  const [fechaMostrada, setFechaMostrada] = useState<string>(formatearFechaParaMostrar(formatearFechaParaInput(new Date())));
  
  // Estado para el modal de detalle de indicador
  const [indicadorSeleccionado, setIndicadorSeleccionado] = useState<IndicadorContable | null>(null);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);

  // Función para formatear fecha en formato YYYY-MM-DD para input type="date"
  function formatearFechaParaInput(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Función para formatear fecha en formato DD/MM/YYYY para mostrar al usuario
  function formatearFechaParaMostrar(fechaStr: string): string {
    if (!fechaStr || !fechaStr.includes('-')) return '';
    const [year, month, day] = fechaStr.split('-');
    return `${day}/${month}/${year}`;
  }

  // Cargar oficinas al iniciar y configurar la oficina seleccionada
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      await cargarOficinas();
      // Cargar indicadores iniciales después de cargar las oficinas y actualizar la oficina seleccionada
      cargarIndicadores();
    };
    
    cargarDatosIniciales();
  }, []);
  
  // Efecto para registrar cambios en los filtros (para depuración)
  useEffect(() => {
  }, [filtros]);

  // Función para cargar las oficinas desde el backend
  const cargarOficinas = async () => {
    try {
      setCargandoOficinas(true);
      const oficinasData = await OficinasService.obtenerOficinas();
      setOficinas(oficinasData);
      
      // Si hay oficinas disponibles, actualizamos el filtro con la primera oficina disponible
      // en lugar de usar MATRIZ por defecto
      if (oficinasData && oficinasData.length > 0) {
        // Siempre usar la primera oficina disponible al cargar inicialmente
        // para evitar usar MATRIZ como valor por defecto
        const oficinaInicial = oficinasData[0].codigo;
        setFiltros(prev => ({ ...prev, oficina: oficinaInicial }));
        console.log(`Oficina seleccionada inicialmente: ${oficinaInicial} (${oficinasData[0].nombre})`);
      }
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
      
      // Usar los valores actuales de los filtros
      const oficinaSeleccionada = filtros.oficina;
      const fechaSeleccionada = filtros.fecha;
      
      console.log(`Cargando indicadores para oficina: ${oficinaSeleccionada}, fecha: ${fechaSeleccionada}`);
      
      // Asegurarse de que se está enviando la oficina seleccionada
      if (!oficinaSeleccionada) {
        console.error('Error: No se ha seleccionado una oficina');
        setError('No se ha seleccionado una oficina');
        setCargando(false);
        return;
      }
      
      // Llamar al servicio con la oficina seleccionada explícitamente
      const data = await obtenerIndicadoresPorRango(oficinaSeleccionada, fechaSeleccionada, fechaSeleccionada);
      
      // Verificar si hay indicadores calculados para la fecha
      if (!data.kpisCalculados || Object.keys(data.kpisCalculados).length === 0) {
        console.log('No hay indicadores calculados disponibles');
        setIndicadores([]);
        // No establecemos error, solo mostramos el estado vacío
        setError(null);
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
        // No establecemos error, solo mostramos el estado vacío
        setError(null);
        return;
      }
      
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
        
        // Multiplicar el valor por 100 para convertirlo a porcentaje
        const valorPorcentaje = kpi.valor * 100;
        
        return {
          id: kpi.idIndicador,
          nombre: indicadorInfo?.nombre || kpi.idIndicador,
          valor: valorPorcentaje,
          rendimiento: determinarRendimiento(valorPorcentaje),
          color: indicadorInfo?.color || determinarColor(valorPorcentaje),
          componentes: kpi.componentes
        };
      });
      
      setIndicadores(indicadoresProcesados);
    } catch (err: any) {
      console.error('Error al cargar indicadores financieros:', err);
      setError(err.message || 'Error al cargar indicadores financieros');
    } finally {
      setCargando(false);
    }
  };

  // Función para determinar el rendimiento basado en el valor (ya en porcentaje)
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
    const nuevaOficina = e.target.value;
    const nombreOficina = oficinas.find(o => o.codigo === nuevaOficina)?.nombre || nuevaOficina;
    console.log(`Cambiando oficina seleccionada a: ${nuevaOficina} (${nombreOficina})`);
    setFiltros(prev => ({ ...prev, oficina: nuevaOficina }));
    // No cargamos automáticamente para mantener consistencia con el comportamiento de la fecha
    // El usuario debe hacer clic en el botón Consultar para actualizar los datos
  };

  // Manejar cambio de fecha desde el input personalizado
  const handleFechaChange = (nuevaFecha: string) => {
    setFiltros(prev => ({ ...prev, fecha: nuevaFecha }));
    setFechaMostrada(formatearFechaParaMostrar(nuevaFecha));
  };
  
  // Función para abrir el modal con los detalles del indicador
  const abrirModalDetalles = (indicador: IndicadorContable) => {
    setIndicadorSeleccionado(indicador);
    setModalAbierto(true);
  };
  
  // Función para cerrar el modal
  const cerrarModalDetalles = () => {
    setModalAbierto(false);
    setTimeout(() => setIndicadorSeleccionado(null), 300); // Limpiar después de la animación
  };
  
  // Referencia al input de fecha
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  // Manejar clic en consultar
  const handleConsultar = () => {
    console.log(`Consultando indicadores con oficina: ${filtros.oficina}`);
    cargarIndicadores();
  };

  return (
    <>
      <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Indicadores financieros</h1>
        <div className="text-sm text-gray-500">
          <span className="mr-2">Última actualización:</span>
          <span className="font-medium">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
      
      <Card className="p-6 shadow-md border-t-4 border-blue-600">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          Filtros de Consulta
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Oficina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Oficina:</label>
              <div className="relative h-10"> {/* Altura fija para todos los controles */}
                <select
                  className="w-full h-10 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm absolute inset-0"
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
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                  </svg>
                </div>
              </div>
            </div>
            

            
            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha:
              </label>
              <div className="relative h-10"> {/* Altura fija para todos los controles */}
                {/* Contenedor del input de fecha personalizado con clases CSS */}
                <div className="custom-date-input h-full">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={filtros.fecha}
                    onChange={(e) => handleFechaChange(e.target.value)}
                    className="h-10 absolute inset-0" /* Altura fija igual que los demás controles */
                  />
                  <div className="date-display-overlay">
                    <span className="date-display-text text-sm">
                      {fechaMostrada || 'Seleccionar fecha'}
                    </span>
                    <Calendar className="h-4 w-4 date-icon" />
                  </div>
                </div>
              </div>
            </div>
            

          </div>
          
          {/* Botón de consulta */}
          <div className="md:flex-shrink-0 w-full md:w-auto">
            <Button 
              onClick={handleConsultar} 
              className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto h-10 flex items-center justify-center px-4"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Consultar
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Error al cargar indicadores</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {cargando ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-800 font-medium text-lg">Cargando indicadores financieros</p>
            <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
          </div>
        </div>
      ) : indicadores.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Indicadores para {oficinas.find(o => o.codigo === filtros.oficina)?.nombre || filtros.oficina} ({fechaMostrada})
              </h2>
              <Button 
                onClick={handleConsultar} 
                variant="outline" 
                size="sm"
                className="flex items-center bg-white text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {indicadores.map((indicador) => (
                  <div 
                    key={indicador.id} 
                    className="bg-white rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer group"
                    onClick={() => abrirModalDetalles(indicador)}
                  >
                    <div className="w-full flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-800">{indicador.nombre}</h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Info className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <IndicadorCircular 
                      valor={indicador.valor} 
                      etiqueta={indicador.rendimiento} 
                      color={indicador.color}
                      onClick={() => abrirModalDetalles(indicador)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium mb-1">Acerca de los indicadores</p>
              <p>Los indicadores financieros muestran el rendimiento financiero de la oficina seleccionada. Un valor mayor indica mejor desempeño.</p>
            </div>
          </div>
        </div>
      ) : !cargando && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
          <div className="flex flex-col items-center py-8 max-w-md mx-auto">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
              <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No hay indicadores disponibles</h3>
            <p className="text-gray-500 mb-6">No se encontraron datos para los filtros seleccionados. Intenta con otra fecha u oficina.</p>
            <Button onClick={handleConsultar} variant="primary" className="bg-blue-600 hover:bg-blue-700">
              <Search className="mr-2 h-4 w-4" />
              Intentar con otros filtros
            </Button>
          </div>
        </div>
      )}
      </div>
      
      {/* Modal de detalle de indicador */}
      <DetalleIndicador 
        isOpen={modalAbierto}
        onClose={cerrarModalDetalles}
        indicador={indicadorSeleccionado}
      />
    </>
  );
};


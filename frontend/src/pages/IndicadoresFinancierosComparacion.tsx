import React, { useState, useEffect } from "react";
import { OficinasService, Oficina } from "../services/OficinasService";
import { compararIndicadoresEntreOficinas } from "../services/indicadores.service";
import {
  FiltrosComparacion as FiltrosComparacionComponent,
  GraficosComparacion,
  TablaComparacion,
  MensajesEstado,
  ListaDetallesIndicadores,
  FiltrosComparacion as FiltrosComparacionType,
  IndicadorFinanciero,
  ComparacionData,
  formatearFechaParaInput,
  formatearFechaParaMostrar,
  procesarIndicadores
} from "../components/indicadores/comparacion";
import { FiltrosComparacion } from "../components/indicadores/comparacion/types";

/**
 * Componente principal para la comparación de indicadores financieros entre dos oficinas
 */
export const IndicadoresFinancierosComparacion: React.FC = () => {
  // Estados para los datos
  const [indicadoresOficina1, setIndicadoresOficina1] = useState<IndicadorFinanciero[]>([]);
  const [indicadoresOficina2, setIndicadoresOficina2] = useState<IndicadorFinanciero[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [cargandoOficinas, setCargandoOficinas] = useState<boolean>(true);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comparacionData, setComparacionData] = useState<ComparacionData | null>(null);

  // Estado para los filtros
  const [filtros, setFiltros] = useState<FiltrosComparacion>({
    oficina1: "",
    oficina2: "",
    fecha: formatearFechaParaInput(new Date()),
  });

  // Estado para la fecha mostrada al usuario en formato DD/MM/YYYY
  const [fechaMostrada, setFechaMostrada] = useState<string>(
    formatearFechaParaMostrar(formatearFechaParaInput(new Date()))
  );

  // Cargar oficinas al iniciar
  useEffect(() => {
    cargarOficinas();
  }, []);

  // Función para cargar las oficinas desde el backend
  const cargarOficinas = async () => {
    try {
      setCargandoOficinas(true);
      const oficinasData = await OficinasService.obtenerOficinas();
      setOficinas(oficinasData);

      // Si hay oficinas disponibles, actualizamos los filtros con las dos primeras oficinas
      if (oficinasData && oficinasData.length > 1) {
        setFiltros((prev) => ({
          ...prev,
          oficina1: oficinasData[0].codigo,
          oficina2: oficinasData[1].codigo,
        }));
      }
    } catch (err: any) {
      console.error("Error al cargar oficinas:", err);
      setError(err.message || "Error al cargar oficinas");
    } finally {
      setCargandoOficinas(false);
    }
  };

  // Función para cargar la comparación de indicadores
  const cargarComparacion = async () => {
    try {
      setCargando(true);
      setError(null);

      const { oficina1, oficina2, fecha } = filtros;

      console.log(
        `Comparando indicadores entre oficinas: ${oficina1} y ${oficina2}, fecha: ${fecha}`
      );

      // Validar que se hayan seleccionado dos oficinas diferentes
      if (!oficina1 || !oficina2) {
        setError("Debe seleccionar dos oficinas para comparar");
        setCargando(false);
        return;
      }

      if (oficina1 === oficina2) {
        setError("Debe seleccionar dos oficinas diferentes para comparar");
        setCargando(false);
        return;
      }

      // Llamar al servicio para obtener la comparación
      const data = await compararIndicadoresEntreOficinas(
        oficina1,
        oficina2,
        fecha
      );
      setComparacionData(data);

      // Procesar los indicadores para cada oficina
      if (data && data.kpisOficina1 && data.kpisOficina2) {
        const fechaKey = Object.keys(data.kpisOficina1)[0];

        if (
          fechaKey &&
          data.kpisOficina1[fechaKey] &&
          data.kpisOficina2[fechaKey]
        ) {
          // Procesar indicadores de la primera oficina
          const indicadoresProc1 = procesarIndicadores(
            data.kpisOficina1[fechaKey],
            data.indicadores
          );
          setIndicadoresOficina1(indicadoresProc1);

          // Procesar indicadores de la segunda oficina
          const indicadoresProc2 = procesarIndicadores(
            data.kpisOficina2[fechaKey],
            data.indicadores
          );
          setIndicadoresOficina2(indicadoresProc2);
        } else {
          setIndicadoresOficina1([]);
          setIndicadoresOficina2([]);
        }
      }
    } catch (err: any) {
      console.error("Error al cargar la comparación de indicadores:", err);
      setError(err.message || "Error al cargar la comparación de indicadores");
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambio de oficina 1
  const handleOficina1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaOficina = e.target.value;
    setFiltros((prev) => ({ ...prev, oficina1: nuevaOficina }));
  };

  // Manejar cambio de oficina 2
  const handleOficina2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaOficina = e.target.value;
    setFiltros((prev) => ({ ...prev, oficina2: nuevaOficina }));
  };

  // Manejar cambio de fecha desde el input personalizado
  const handleFechaChange = (nuevaFecha: string) => {
    setFiltros((prev) => ({ ...prev, fecha: nuevaFecha }));
    setFechaMostrada(formatearFechaParaMostrar(nuevaFecha));
  };

  // Manejar clic en consultar
  const handleConsultar = () => {
    cargarComparacion();
  };

  // Verificar si hay datos para mostrar
  const hayDatos = 
    !cargando && 
    indicadoresOficina1.length > 0 && 
    indicadoresOficina2.length > 0;

  // Verificar si no hay datos pero se ha realizado una consulta
  const sinDatos = 
    !cargando && 
    (!indicadoresOficina1.length || !indicadoresOficina2.length) && 
    comparacionData !== null;

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      {/* Título y última actualización */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Comparación de Indicadores Financieros
        </h1>
        <div className="text-sm text-gray-500">
          <span className="mr-2">Última actualización:</span>
          <span className="font-medium">
            {new Date().toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Componente de filtros */}
      <FiltrosComparacionComponent
        filtros={filtros}
        fechaMostrada={fechaMostrada}
        oficinas={oficinas}
        cargandoOficinas={cargandoOficinas}
        cargando={cargando}
        onOficina1Change={handleOficina1Change}
        onOficina2Change={handleOficina2Change}
        onFechaChange={handleFechaChange}
        onConsultar={handleConsultar}
      />

      {/* Componente de mensajes de estado */}
      <MensajesEstado
        cargando={cargando}
        error={error}
        sinDatos={sinDatos}
      />

      {/* Componente de gráficos de comparación */}
      {hayDatos && (
        <GraficosComparacion
          indicadoresOficina1={indicadoresOficina1}
          indicadoresOficina2={indicadoresOficina2}
          comparacionData={comparacionData}
          fechaMostrada={fechaMostrada}
        />
      )}

      {/* Componente de tabla de comparación */}
      {hayDatos && (
        <TablaComparacion
          indicadoresOficina1={indicadoresOficina1}
          indicadoresOficina2={indicadoresOficina2}
          comparacionData={comparacionData}
        />
      )}

      {/* Componente de detalles de indicadores */}
      {hayDatos && (
        <ListaDetallesIndicadores
          indicadoresOficina1={indicadoresOficina1}
          indicadoresOficina2={indicadoresOficina2}
          comparacionData={comparacionData}
        />
      )}
    </div>
  );
};

export default IndicadoresFinancierosComparacion;

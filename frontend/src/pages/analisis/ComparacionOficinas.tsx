import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import { useOficinas } from "../../context/DataContext";
import { httpClient } from "../../services/httpClient";
import { IndicadorComparacionOficinasDTO, ValorComparacionOficinasIndicadorDTO } from "shared";

const ComparacionOficinas: React.FC = () => {
  const { oficinas } = useOficinas();
  const [data, setData] = useState<{
    indicadores: IndicadorComparacionOficinasDTO[];
    valores: ValorComparacionOficinasIndicadorDTO[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get(`/api/kpi-contables/comparar-indicadores?fecha=${selectedDate}`);
      setData(response.data);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (oficinas.length > 0 && !data) {
      handleSubmit();
    }
  }, [oficinas, data]);

  const renderChart = (indicador: IndicadorComparacionOficinasDTO) => {
    if (!data) return null;

    const valoresOficina = data.valores
      .filter((v) => v.indicadorId === indicador.id)
      .sort((a, b) => b.valor - a.valor);

    // Se mantiene la lógica original para manejar códigos de oficina duplicados.
    for (let i = 0; i < valoresOficina.length; i++) {
      for (let j = i + 1; j < valoresOficina.length; j++) {
        if (valoresOficina[i].oficinaCodigo === valoresOficina[j].oficinaCodigo) {
          // Aseguramos que los valores sean únicos para evitar solapamientos visuales
          // pero sin que afecte la representación de valores cero originales.
          // Si v.valor es 0, sumarle 1 asegura que tenga un valor para ser renderizado distintivamente.
          valoresOficina[j].valor = valoresOficina[i].valor + (valoresOficina[i].valor === 0 ? 1 : 0.01);
        }
      }
    }

    const series = [
      {
        name: indicador.nombre,
        data: valoresOficina.map((v) => ({
          x:
            oficinas.find((o) => o.codigo === v.oficinaCodigo)?.nombre ||
            v.oficinaCodigo,
          y: v.valor,
        })),
      },
    ];

    // Calcular el ancho del gráfico dinámicamente
    // 80-100px por oficina es un buen punto de partida para que las columnas y etiquetas tengan espacio.
    const baseWidthPerOffice = 100; // Ajusta este valor si necesitas más o menos espacio
    const minChartWidth = valoresOficina.length * baseWidthPerOffice;
    // Aseguramos un ancho mínimo para que el gráfico no sea demasiado pequeño si hay pocas oficinas.
    const chartWidth = Math.max(minChartWidth, 500); // 500px como un mínimo razonable

    const options = {
      chart: {
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
          dynamicAnimation: {
            speed: 300,
          },
        },
        zoom: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: false,
          columnWidth: "70%", // Aumentado ligeramente el ancho de columna para hacer las barras más visibles
        },
      },
      colors: [indicador.color],
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: valoresOficina.map(
          (v) =>
            oficinas.find((o) => o.codigo === v.oficinaCodigo)?.nombre ||
            v.oficinaCodigo
        ),
        labels: {
          style: { fontSize: "12px" },
          trim: true,
          minHeight: 40,
          maxHeight: 120,
        },
        padding: {
            left: 20,
            right: 20,
            top: 0,
            bottom: 0
        },
        axisBorder: {
            show: true,
            color: '#e0e0e0',
            height: 1,
            width: '100%',
            offsetX: 0,
            offsetY: 0
        },
        axisTicks: {
            show: true,
            borderType: 'solid',
            color: '#e0e0e0',
            height: 6,
            offsetX: 0,
            offsetY: 0
        },
        tickPlacement: 'on',
      },
      yaxis: {
        title: { text: "Valor" },
        labels: {
          formatter: (val: number) => val.toLocaleString(),
        },
        min: 0,
      },
      tooltip: {
        y: {
          formatter: (val: number) => val.toLocaleString(),
        },
      },
    };

    return (
      <motion.div
        key={indicador.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white w-full overflow-auto p-6 rounded-2xl shadow-md"
      >
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {indicador.nombre}
          </h2>
          <p className="text-sm text-gray-500">{indicador.descripcion}</p>
        </div>
        {/* Contenedor con scroll horizontal para cada gráfico */}
        <div style={{ overflowX: 'auto' }}>
          {/* El `width` aquí es crucial para que el gráfico sea más ancho que su contenedor y habilite el scroll */}
          <div style={{ minWidth: `${chartWidth}px` }}>
            <Chart options={options} series={series} type="bar" height={350} />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">
          Comparación de Oficinas
        </h1>

        <motion.form
          onSubmit={handleSubmit}
          whileHover={{ scale: 1.002 }}
          className="bg-white p-6 rounded-2xl shadow-md mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="date"
                className="block text-gray-700 font-medium mb-2"
              >
                Fecha de Comparación
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Consultar"}
              </motion.button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-red-100 text-red-700 rounded"
            >
              {error}
            </motion.div>
          )}
        </motion.form>

        {loading && (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {data && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-8"
          >
            {data.indicadores.map((indicador) => renderChart(indicador))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ComparacionOficinas;
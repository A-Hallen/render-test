import { useEffect, useState } from "react";
import { ChartCard } from "../../components/dashboard/ChartCard";
import { useCallback } from "react";

// Definimos localmente las interfaces necesarias para evitar problemas de importación
interface IndicadorColor {
    id: string;
    nombre: string;
    color: string;
}

interface IndicadorCalcularPeriodo {
    [key: string]: string | number;
}

interface IndicadorCalcularPeriodoResponse {
    indicadores: IndicadorColor[];
    indicadoresCalculados: IndicadorCalcularPeriodo[];
}

export const IndicadoresChart = () => {
    const [data, setData] = useState<IndicadorCalcularPeriodoResponse | null>(null);

    const onFilterChange = useCallback(() => {
        const today = new Date();
        const startDate = new Date();
        
        // Filtrar por semestre por defecto
        startDate.setMonth(today.getMonth() - 6);

        // Format dates as YYYY-MM-DD
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const fechaInicioStr = formatDate(startDate);
        const fechaFinStr = formatDate(today);
        console.log(fechaInicioStr, fechaFinStr);

        obtenerIndicadoresCalculados(fechaInicioStr, fechaFinStr);
    }, [])

    useEffect(() => {
        onFilterChange();
    }, [onFilterChange]);

    const obtenerIndicadoresCalculados = async (inicio: string, fin: string) => {
        try {
            // Actualizado para usar la nueva ruta del módulo de KPI contables
            const response = await fetch(`/api/kpi-contables/rango-fechas?oficina=TABACUNDO&fechaInicio=${inicio}&fechaFin=${fin}`);
            const result = await response.json();
            console.log("result", result);
            if(result.error){
                throw new Error(result.error);
            }
            // Adaptamos la estructura de datos para que coincida con lo que espera el componente
            setData({
                indicadores: result.indicadores,
                indicadoresCalculados: Object.entries(result.kpisCalculados).map(([fecha, valores]) => {
                    // Aseguramos que valores sea un objeto para evitar errores de tipo
                    const valoresObj = typeof valores === 'object' && valores !== null ? valores : {};
                    return {
                        month: fecha,
                        ...valoresObj
                    };
                })
            });
        } catch (error) {
            setData(null);
            console.error("Error fetching data:", error);
        }
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {data === undefined ? (
                <p className="text-center">Cargando...</p>
            ) : data === null ? (
                <p className="text-center text-red-600">Error al obtener los datos</p>
            ) : (
            <ChartCard
                title="Indicadores Financieros"
                subTitle="Evolución de indicadores clave (últimos 6 meses)"
                type="line"
                data={data?.indicadoresCalculados ? data.indicadoresCalculados : []}
                xDataKey="month"
                series={data ? data.indicadores?.map(indicador => ({
                    dataKey: indicador.nombre, // Convert 'id' to string for dataKey
                    color: indicador.color,
                    name: indicador.nombre,
                })) : []}
                height={350}
            />)}
        </div>
    );
}
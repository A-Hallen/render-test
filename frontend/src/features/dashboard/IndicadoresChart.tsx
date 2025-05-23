import { useEffect, useState, useCallback } from "react";
import { ChartCard } from "../../components/dashboard/ChartCard";
import { IndicadorCalcularPeriodoResponse } from "shared/src/types/indicadores.types";

export const IndicadoresChart = () => {
    const [data, setData] = useState<IndicadorCalcularPeriodoResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

        obtenerIndicadoresCalculados(fechaInicioStr, fechaFinStr);
    }, []);

    useEffect(() => {
        onFilterChange();
    }, [onFilterChange]);

    const obtenerIndicadoresCalculados = async (inicio: string, fin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Actualizado para usar la nueva ruta del módulo de KPI contables
            const response = await fetch(`/api/kpi-contables/rango-fechas?oficina=TABACUNDO&fechaInicio=${inicio}&fechaFin=${fin}`);
            
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            if (!result.indicadores || !result.kpisCalculados) {
                throw new Error('La respuesta no contiene los datos esperados');
            }
            
            // Transformar los datos para el gráfico
            const chartData = transformarDatosParaGrafico(result);
            setData(chartData);
        } catch (error: any) {
            console.error("Error al obtener indicadores:", error);
            setError(error.message || 'Error al cargar los datos');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Función para transformar los datos al formato esperado por el gráfico
    const transformarDatosParaGrafico = (result: any): IndicadorCalcularPeriodoResponse => {
        // Obtener los indicadores
        const indicadores = result.indicadores || [];
        
        // Transformar los KPIs calculados en un formato adecuado para el gráfico
        const indicadoresCalculados = Object.entries(result.kpisCalculados || {}).map(([fecha, kpisDelDia]: [string, any]) => {
            // Crear un objeto base con la fecha
            const datoDelDia: any = { month: fecha };
            
            // Si kpisDelDia es un array, procesarlo
            if (Array.isArray(kpisDelDia)) {
                // Agregar cada KPI al objeto usando el nombre del indicador como clave
                kpisDelDia.forEach((kpi: any) => {
                    // Buscar el indicador correspondiente para obtener su nombre
                    const indicador = indicadores.find((ind: any) => ind.id === kpi.idIndicador);
                    if (indicador) {
                        // Usar el nombre del indicador como clave y el valor del KPI como valor
                        datoDelDia[indicador.nombre] = kpi.valor;
                    }
                });
            }
            
            return datoDelDia;
        });
        
        return {
            indicadores,
            indicadoresCalculados
        };
    };

    // Renderizar diferentes estados
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600 font-medium">Error</p>
                    <p className="text-red-500">{error}</p>
                    <button 
                        onClick={() => onFilterChange()} 
                        className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            );
        }
        
        if (!data || !data.indicadoresCalculados || data.indicadoresCalculados.length === 0) {
            return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-700">No hay datos disponibles para el período seleccionado</p>
                </div>
            );
        }
        
        return (
            <ChartCard
                title="Indicadores Financieros"
                subTitle="Evolución de indicadores clave (últimos 6 meses)"
                type="line"
                data={data.indicadoresCalculados}
                xDataKey="month"
                series={data.indicadores.map(indicador => ({
                    dataKey: indicador.nombre,
                    color: indicador.color,
                    name: indicador.nombre,
                }))}
                height={350}
            />
        );
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            {renderContent()}
        </div>
    );
}
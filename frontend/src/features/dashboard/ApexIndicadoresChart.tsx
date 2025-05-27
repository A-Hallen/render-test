import { useEffect, useState, useCallback } from "react";
import { IndicadorCalcularPeriodoResponse } from "shared/src/types/indicadores.types";
import { OficinasDTO } from "shared/src/types/oficinas.types";
import ReactApexChart from 'react-apexcharts';
import { useOficinas } from "../../context/DataContext";

export const ApexIndicadoresChart = () => {
    const [data, setData] = useState<IndicadorCalcularPeriodoResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'radar'>('line');
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'1m' | '3m' | '6m' | '1y'>('6m');
    
    // Obtener las oficinas del contexto
    const { oficinas, oficinaSeleccionada, setOficinaSeleccionada, fetchOficinasIfNeeded } = useOficinas();

    // Cargar las oficinas al iniciar el componente
    useEffect(() => {
        fetchOficinasIfNeeded();
    }, [fetchOficinasIfNeeded]);
    
    // Función para obtener el texto descriptivo del periodo
    const getDescripcionPeriodo = (periodo: '1m' | '3m' | '6m' | '1y'): string => {
        switch (periodo) {
            case '1m': return 'último mes';
            case '3m': return 'últimos 3 meses';
            case '6m': return 'últimos 6 meses';
            case '1y': return 'último año';
            default: return 'últimos 6 meses';
        }
    };
    
    // Función para calcular las fechas según el periodo seleccionado
    const calcularFechas = useCallback((periodo: '1m' | '3m' | '6m' | '1y') => {
        const today = new Date();
        const startDate = new Date();
        
        // Ajustar la fecha de inicio según el periodo seleccionado
        switch (periodo) {
            case '1m':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case '3m':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case '6m':
                startDate.setMonth(today.getMonth() - 6);
                break;
            case '1y':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
        }

        // Format dates as YYYY-MM-DD
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            inicio: formatDate(startDate),
            fin: formatDate(today)
        };
    }, []);
    
    // Función para actualizar los datos cuando cambian los filtros
    // Función para actualizar los datos cuando cambian los filtros
    const onFilterChange = useCallback(() => {
        if (!oficinaSeleccionada) return;
        
        // Prevenir el scroll hacia arriba guardando la posición actual
        const scrollPos = window.scrollY;
        
        const { inicio, fin } = calcularFechas(periodoSeleccionado);
        obtenerIndicadoresCalculados(inicio, fin, oficinaSeleccionada.codigo)
            .finally(() => {
                // Restaurar la posición del scroll después de que los datos se hayan cargado
                setTimeout(() => window.scrollTo(0, scrollPos), 0);
            });
    }, [periodoSeleccionado, oficinaSeleccionada, calcularFechas]);

    useEffect(() => {
        onFilterChange();
    }, [onFilterChange, oficinaSeleccionada]);

    const obtenerIndicadoresCalculados = async (inicio: string, fin: string, codigoOficina: string): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Actualizado para usar la nueva ruta del módulo de KPI contables con la oficina seleccionada
            const response = await fetch(`/api/kpi-contables/rango-fechas?oficina=${codigoOficina}&fechaInicio=${inicio}&fechaFin=${fin}`);
            
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

    // Preparar las series para ApexCharts
    const prepararSeries = () => {
        if (!data || !data.indicadores || !data.indicadoresCalculados) return [];
        
        return data.indicadores.map(indicador => ({
            name: indicador.nombre,
            data: data.indicadoresCalculados.map(item => ({
                x: new Date(item.month).getTime(), // Convertir a timestamp para mejor manejo de fechas
                y: item[indicador.nombre] || 0
            }))
        }));
    };

    // Configuración de opciones para ApexCharts
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: chartType === 'radar' ? 'radar' : chartType, // Aseguramos que el tipo sea compatible
            height: 350,
            animations: {
                enabled: true,
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            zoom: {
                enabled: true,
                type: 'x', // 'x', 'y', o 'xy'
                autoScaleYaxis: true
            },
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            }
        },
        colors: data?.indicadores?.map(ind => ind.color) || [],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            type: 'datetime',
            labels: {
                format: 'dd/MM/yyyy'
            },
            title: {
                text: 'Fecha'
            }
        },
        yaxis: {
            title: {
                text: 'Valor'
            },
            labels: {
                formatter: (value: number) => value.toFixed(2)
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (value: number) => value.toFixed(2)
            },
            x: {
                format: 'dd MMM yyyy'
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center'
        },
        dataLabels: {
            enabled: false
        },
        grid: {
            borderColor: '#e0e0e0',
            row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
            }
        },
        markers: {
            size: 4,
            hover: {
                size: 6
            }
        }
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
        
        const series = prepararSeries();
        
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Indicadores Financieros</h3>
                        <p className="text-sm text-gray-500 mt-1">Evolución de indicadores clave ({periodoSeleccionado === '1m' ? 'último mes' : 
                                                                 periodoSeleccionado === '3m' ? 'últimos 3 meses' : 
                                                                 periodoSeleccionado === '6m' ? 'últimos 6 meses' : 
                                                                 'último año'})</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Selector de oficina */}
                        <div className="relative">
                            <select
                                value={oficinaSeleccionada?.codigo || ''}
                                onChange={(e) => {
                                    const oficina = oficinas.find(o => o.codigo === e.target.value);
                                    if (oficina) setOficinaSeleccionada(oficina);
                                }}
                                className="appearance-none pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                {oficinas.map(oficina => (
                                    <option key={oficina.codigo} value={oficina.codigo}>
                                        {oficina.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Selector de periodo */}
                        <div className="relative">
                            <select
                                value={periodoSeleccionado}
                                onChange={(e) => setPeriodoSeleccionado(e.target.value as any)}
                                className="appearance-none pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="1m">1 mes</option>
                                <option value="3m">3 meses</option>
                                <option value="6m">6 meses</option>
                                <option value="1y">1 año</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Selector de tipo de gráfico */}
                        <div className="relative">
                            <select 
                                value={chartType} 
                                onChange={(e) => setChartType(e.target.value as any)}
                                className="appearance-none pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="line">Línea</option>
                                <option value="bar">Barras</option>
                                <option value="area">Área</option>
                                <option value="radar">Radar</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => onFilterChange()}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Actualizar datos"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="h-[350px]">
                    <ReactApexChart 
                        options={chartOptions}
                        series={series}
                        type={chartType}
                        height={350}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            {renderContent()}
        </div>
    );
}

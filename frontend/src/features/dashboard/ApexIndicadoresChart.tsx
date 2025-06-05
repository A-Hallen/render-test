import { useEffect, useState, useCallback } from "react";
import { IndicadorCalcularPeriodoResponse } from "shared/src/types/indicadores.types";
import ReactApexChart from 'react-apexcharts';
import { useOficinas } from "../../context/DataContext";
import { obtenerIndicadoresPorRango } from '../../services/indicadores.service';

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
    
    // Función para obtener el texto descriptivo del periodo que se muestra en la UI
    const getDescripcionPeriodoUI = (periodo: '1m' | '3m' | '6m' | '1y'): string => {
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

            // Usar el servicio centralizado para obtener los indicadores
            const result = await obtenerIndicadoresPorRango(codigoOficina, inicio, fin);

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
        
        // Ordenar los datos por fecha para asegurar que se muestren en orden cronológico
        indicadoresCalculados.sort((a, b) => {
            const fechaA = new Date(a.month).getTime();
            const fechaB = new Date(b.month).getTime();
            return fechaA - fechaB;
        });
        
        console.log("Datos transformados para gráfico:", {
            indicadores,
            indicadoresCalculados
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
            data: data.indicadoresCalculados.map(item => {
                // Formatear la fecha correctamente para evitar problemas de zona horaria
                // Usamos el formato YYYY-MM-DD que viene del backend y lo parseamos manualmente
                const fechaStr = String(item.month); // Aseguramos que sea string con formato "YYYY-MM-DD"
                const [year, month, day] = fechaStr.split('-').map((num: string) => parseInt(num, 10));
                // Crear la fecha formateada directamente sin usar el objeto Date
                const fechaFormateada = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                
                return {
                    x: fechaFormateada, // Usamos la fecha formateada directamente
                    y: item[indicador.nombre] || 0
                };
            })
        }));
    };
    
    // Obtener las fechas exactas que tienen datos
    const obtenerFechasExactas = () => {
        if (!data || !data.indicadoresCalculados) return [];
        
        return data.indicadoresCalculados.map(item => {
            const fecha = new Date(item.month);
            return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
        });
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
                enabled: false // Desactivamos el zoom
            },
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            }
        },
        colors: data?.indicadores?.map(ind => ind.color) || [],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            type: 'category',
            categories: obtenerFechasExactas(), // Usar exactamente las fechas que tienen datos
            tickPlacement: 'on',
            labels: {
                rotate: 0,
                rotateAlways: false,
                hideOverlappingLabels: true,
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold'
                },
                formatter: function(value) {
                    return value; // Mostramos el valor tal cual viene formateado
                }
            },
            axisBorder: {
                show: true
            },
            axisTicks: {
                show: true
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

    // Componente de Skeleton Loader para el gráfico con dimensiones exactas
    const ChartSkeletonLoader = () => {
        return (
            // Contenedor con altura fija exactamente igual a la del gráfico real (350px)
            <div className="h-[350px] flex flex-col">
                {/* Área de leyenda */}
                <div className="flex justify-center py-2">
                    <div className="flex space-x-4">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
                
                {/* Área del gráfico - ocupa todo el espacio restante */}
                <div className="flex-grow w-full relative">
                    {/* Eje Y */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between py-4">
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-7 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    
                    {/* Líneas del gráfico */}
                    <div className="absolute left-12 right-4 top-4 bottom-12">
                        <div className="h-1 w-full bg-gray-100 absolute top-1/4 animate-pulse"></div>
                        <div className="h-1 w-full bg-gray-100 absolute top-2/4 animate-pulse"></div>
                        <div className="h-1 w-full bg-gray-100 absolute top-3/4 animate-pulse"></div>
                        
                        {/* Líneas de datos simuladas */}
                        <div className="absolute top-0 left-0 right-0 bottom-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0,50 C20,40 40,60 60,30 S80,50 100,20" stroke="#E2E8F0" strokeWidth="2" fill="none" className="animate-pulse" />
                                <path d="M0,70 C20,65 40,80 60,60 S80,70 100,50" stroke="#CBD5E0" strokeWidth="2" fill="none" className="animate-pulse" />
                                <path d="M0,30 C20,45 40,25 60,40 S80,20 100,40" stroke="#EDF2F7" strokeWidth="2" fill="none" className="animate-pulse" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Eje X */}
                    <div className="absolute left-12 right-4 bottom-0 h-10 flex justify-between items-center">
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar diferentes estados
    const renderChart = () => {
        if (!data || !data.indicadoresCalculados || data.indicadoresCalculados.length === 0) {
            return (
                // Contenedor con altura fija exacta
                <div className="h-[350px] bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center">
                    <div className="text-center px-4">
                        <p className="text-yellow-700 mb-2">No hay datos disponibles para el período seleccionado</p>
                        <p className="text-sm text-yellow-600">Intenta seleccionar otra oficina o período de tiempo</p>
                    </div>
                </div>
            );
        }
        
        const series = prepararSeries();
        
        // Contenedor con altura fija exacta
        return (
            <div className="h-[350px]">
                <ReactApexChart 
                    options={chartOptions}
                    series={series}
                    type={chartType}
                    height={350}
                />
            </div>
        );
    };
    
    // Renderizar mensaje de error
    const renderError = () => {
        if (!error) return null;
        
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center">
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                    onClick={() => onFilterChange()} 
                    className="mt-2 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    };
        
    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md">
                {/* Header y controles - siempre visibles independientemente del estado */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Indicadores Financieros</h3>
                        <p className="text-sm text-gray-500 mt-1">Evolución de indicadores clave ({getDescripcionPeriodoUI(periodoSeleccionado)})</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Selector de oficina - siempre disponible */}
                        <div className="relative">
                            <select
                                value={oficinaSeleccionada?.codigo || ''}
                                onChange={(e) => {
                                    const oficina = oficinas.find(o => o.codigo === e.target.value);
                                    if (oficina) setOficinaSeleccionada(oficina);
                                }}
                                className="appearance-none pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                disabled={oficinas.length === 0} // Solo deshabilitado si no hay oficinas disponibles
                            >
                                {oficinas.length > 0 ? (
                                    oficinas.map(oficina => (
                                        <option key={oficina.codigo} value={oficina.codigo}>
                                            {oficina.nombre}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Cargando oficinas...</option>
                                )}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Selector de periodo - siempre disponible */}
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
                        
                        {/* Selector de tipo de gráfico - siempre disponible */}
                        <div className="relative">
                            <select 
                                value={chartType} 
                                onChange={(e) => setChartType(e.target.value as any)}
                                className="appearance-none pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                disabled={isLoading || !data} // Solo deshabilitado durante la carga o si no hay datos
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
                        
                        {/* Botón de actualizar - siempre disponible */}
                        <button 
                            onClick={() => onFilterChange()}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Actualizar datos"
                            disabled={isLoading} // Solo deshabilitado durante la carga
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Contenedor con altura fija para evitar cambios en el layout */}
                <div className="h-[350px]">
                    {/* Mostrar mensaje de error si existe */}
                    {renderError()}
                    
                    {/* Contenido principal - cambia según el estado */}
                    {isLoading ? (
                        // Skeleton loader durante la carga
                        <ChartSkeletonLoader />
                    ) : (
                        // Gráfico o mensaje de no hay datos
                        renderChart()
                    )}
                </div>
            </div>
        </div>
    );
}

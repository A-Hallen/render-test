"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteContabilidadRepository = void 0;
const saldos_repository_1 = require("../../saldosContables/saldos.repository");
const configuracion_reportes_contabilidad_repository_1 = require("../../configuracion-reportes/contabilidad/configuracion-reportes-contabilidad.repository");
const cuentas_contables_repository_1 = require("../../cuentas-contables/cuentas-contables.repository");
class ReporteContabilidadRepository {
    constructor() {
        /**
         * Genera un reporte de contabilidad basado en los parámetros proporcionados
         * @param reporteData Datos para generar el reporte
         * @returns Resultado del reporte de contabilidad
         */
        this.generarReporteContabilidad = async (reporteData) => {
            try {
                // Validar la configuración del reporte
                const configuracion = await this.configuracionReportesContabilidadRepository.obtenerConfiguracion(reporteData.nombreConfiguracion);
                if (!configuracion) {
                    return {
                        success: false,
                        message: 'Configuración de reporte no encontrada o inactiva'
                    };
                }
                // Determinar si es un reporte por fecha o por rango
                let saldos = [];
                let fechaReporte;
                let descripcionPeriodo = '';
                const cuentas = configuracion.categorias.flatMap((categoria) => categoria.cuentas);
                if (reporteData.fechaInicio && reporteData.fechaFin) {
                    // Reporte por rango de fechas
                    const fechaInicio = new Date(Date.parse(reporteData.fechaInicio + 'T00:00:00'));
                    const fechaFin = new Date(Date.parse(reporteData.fechaFin + 'T00:00:00'));
                    // Determinar si es reporte diario o mensual
                    const tipoReporte = reporteData.tipoReporte || 'mensual';
                    console.log(`[repository] Generando reporte ${tipoReporte} de ${reporteData.fechaInicio} a ${reporteData.fechaFin}`);
                    // Generar array de fechas en el rango según el tipo de reporte
                    const fechas = [];
                    if (tipoReporte === 'diario') {
                        // Para reportes diarios, incluir cada día en el rango
                        const fechaActual = new Date(fechaInicio);
                        while (fechaActual <= fechaFin) {
                            fechas.push(new Date(fechaActual));
                            fechaActual.setDate(fechaActual.getDate() + 1);
                        }
                        descripcionPeriodo = `Reporte diario del ${reporteData.fechaInicio} al ${reporteData.fechaFin}`;
                    }
                    else {
                        // Para reportes mensuales, incluir solo el último día de cada mes
                        let currentMonth = fechaInicio.getMonth();
                        let currentYear = fechaInicio.getFullYear();
                        // Iterar por cada mes en el rango
                        while (new Date(currentYear, currentMonth + 1, 0) <= fechaFin) {
                            // El día 0 del mes siguiente es el último día del mes actual
                            const ultimoDiaMes = new Date(currentYear, currentMonth + 1, 0);
                            fechas.push(new Date(ultimoDiaMes));
                            // Avanzar al siguiente mes
                            currentMonth++;
                            if (currentMonth > 11) {
                                currentMonth = 0;
                                currentYear++;
                            }
                        }
                        descripcionPeriodo = `Reporte mensual del ${fechaInicio.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} al ${fechaFin.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
                    }
                    // Obtener saldos para todas las fechas en el rango
                    if (fechas.length > 0) {
                        saldos = await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(reporteData.oficina, fechas, cuentas);
                    }
                    // Usar las fechas de inicio y fin para el reporte
                    fechaReporte = reporteData.fechaFin;
                }
                else if (reporteData.fecha) {
                    // Reporte por fecha específica (mantener compatibilidad)
                    const fecha = new Date(Date.parse(reporteData.fecha + 'T00:00:00'));
                    saldos = await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(reporteData.oficina, [fecha], cuentas);
                    fechaReporte = reporteData.fecha;
                    descripcionPeriodo = `Reporte del ${reporteData.fecha}`;
                }
                else {
                    return {
                        success: false,
                        message: 'Debe proporcionar una fecha o un rango de fechas'
                    };
                }
                if (!saldos || saldos.length === 0) {
                    return {
                        success: false,
                        message: 'No se encontraron saldos para la oficina y fecha especificadas'
                    };
                }
                // Extraer fechas únicas de los saldos para usar como columnas
                const fechasUnicas = [...new Set(saldos.map((s) => s.fecha))].sort();
                // Procesar las categorías definidas en la configuración
                const categoriasProcesadas = [];
                const totalesGeneralesPorFecha = {};
                const diferenciasGenerales = {};
                // Inicializar totales generales por fecha
                fechasUnicas.forEach(fecha => {
                    totalesGeneralesPorFecha[fecha] = 0;
                });
                for (const categoria in configuracion.categorias) {
                    const category = configuracion.categorias[categoria];
                    const cuentasData = await this.obtenerNombresCuenta(category.cuentas);
                    // Calcular los totales por cuenta y por fecha
                    const cuentasDetalle = [];
                    const totalesPorFecha = {};
                    const diferenciasPorFecha = {};
                    // Inicializar totales por fecha para esta categoría
                    fechasUnicas.forEach(fecha => {
                        totalesPorFecha[fecha] = 0;
                    });
                    for (const cuenta of cuentasData) {
                        // Inicializar valores por fecha para esta cuenta
                        const valoresPorFecha = {};
                        const diferenciasCuenta = {};
                        // Inicializar con ceros para todas las fechas
                        fechasUnicas.forEach(fecha => {
                            valoresPorFecha[fecha] = 0;
                        });
                        // Agrupar saldos por fecha para esta cuenta
                        for (const saldo of saldos) {
                            if (saldo.codigoCuentaContable === cuenta.CODIGO) {
                                // Sumar al valor existente para esa fecha (por si hay múltiples registros)
                                valoresPorFecha[saldo.fecha] = (valoresPorFecha[saldo.fecha] || 0) + saldo.saldo;
                                // Sumar al total de la categoría para esa fecha
                                totalesPorFecha[saldo.fecha] = (totalesPorFecha[saldo.fecha] || 0) + saldo.saldo;
                            }
                        }
                        // Calcular diferencias entre períodos para esta cuenta
                        for (let i = 1; i < fechasUnicas.length; i++) {
                            const fechaActual = fechasUnicas[i];
                            const fechaAnterior = fechasUnicas[i - 1];
                            const valorActual = valoresPorFecha[fechaActual];
                            const valorAnterior = valoresPorFecha[fechaAnterior];
                            const diferencia = valorActual - valorAnterior;
                            let porcentaje = 0;
                            if (valorAnterior !== 0) {
                                porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
                            }
                            else if (diferencia !== 0) {
                                // Si el valor anterior es 0 pero hay diferencia, es un incremento del 100%
                                porcentaje = diferencia > 0 ? 100 : -100;
                            }
                            diferenciasCuenta[fechaActual] = {
                                valor: diferencia,
                                porcentaje: parseFloat(porcentaje.toFixed(2))
                            };
                        }
                        console.log(`[repository] Cuenta ${cuenta.CODIGO} - Valores por fecha:`, valoresPorFecha);
                        cuentasDetalle.push({
                            codigo: cuenta.CODIGO,
                            nombre: cuenta.NOMBRE,
                            valoresPorFecha,
                            diferencias: diferenciasCuenta
                        });
                    }
                    // Calcular diferencias entre períodos para la categoría
                    for (let i = 1; i < fechasUnicas.length; i++) {
                        const fechaActual = fechasUnicas[i];
                        const fechaAnterior = fechasUnicas[i - 1];
                        const valorActual = totalesPorFecha[fechaActual];
                        const valorAnterior = totalesPorFecha[fechaAnterior];
                        const diferencia = valorActual - valorAnterior;
                        let porcentaje = 0;
                        if (valorAnterior !== 0) {
                            porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
                        }
                        else if (diferencia !== 0) {
                            porcentaje = diferencia > 0 ? 100 : -100;
                        }
                        diferenciasPorFecha[fechaActual] = {
                            valor: diferencia,
                            porcentaje: parseFloat(porcentaje.toFixed(2))
                        };
                    }
                    // Sumar al total general por fecha
                    Object.entries(totalesPorFecha).forEach(([fecha, total]) => {
                        totalesGeneralesPorFecha[fecha] += total;
                    });
                    categoriasProcesadas.push({
                        nombre: category.nombre,
                        cuentas: cuentasDetalle,
                        totalesPorFecha,
                        diferencias: diferenciasPorFecha
                    });
                }
                // Calcular diferencias generales entre períodos
                for (let i = 1; i < fechasUnicas.length; i++) {
                    const fechaActual = fechasUnicas[i];
                    const fechaAnterior = fechasUnicas[i - 1];
                    const valorActual = totalesGeneralesPorFecha[fechaActual];
                    const valorAnterior = totalesGeneralesPorFecha[fechaAnterior];
                    const diferencia = valorActual - valorAnterior;
                    let porcentaje = 0;
                    if (valorAnterior !== 0) {
                        porcentaje = (diferencia / Math.abs(valorAnterior)) * 100;
                    }
                    else if (diferencia !== 0) {
                        porcentaje = diferencia > 0 ? 100 : -100;
                    }
                    diferenciasGenerales[fechaActual] = {
                        valor: diferencia,
                        porcentaje: parseFloat(porcentaje.toFixed(2))
                    };
                }
                // Ya hemos calculado los totales generales por fecha
                // Crear el resultado del reporte
                const resultado = {
                    fechaInicio: (reporteData.fechaInicio || reporteData.fecha),
                    fechaFin: (reporteData.fechaFin || reporteData.fecha),
                    oficina: reporteData.oficina,
                    nombreConfiguracion: reporteData.nombreConfiguracion,
                    tipoReporte: reporteData.tipoReporte || 'mensual',
                    fechas: fechasUnicas,
                    categorias: categoriasProcesadas,
                    totalesGeneralesPorFecha,
                    diferenciasGenerales,
                    descripcionPeriodo
                };
                return {
                    success: true,
                    message: 'Reporte generado correctamente',
                    data: resultado
                };
            }
            catch (error) {
                console.error('Error al generar reporte de contabilidad:', error);
                return {
                    success: false,
                    message: `Error al generar reporte: ${error.message || 'Error desconocido'}`
                };
            }
        };
        /**
         * Obtiene los nombres de las cuentas contables a partir de sus códigos
         * @param cuentas Códigos de las cuentas contables
         * @returns Información de las cuentas contables
         */
        this.obtenerNombresCuenta = async (cuentas) => {
            if (!cuentas || cuentas.length === 0) {
                return [];
            }
            const cuentasData = this.cuentasContablesRepository.obtenerCuentasPorCodigos(cuentas);
            return cuentasData;
        };
        /**
         * Genera un array de fechas en formato YYYY-MM-DD dentro del rango especificado
         * @param fechaInicio Fecha de inicio del rango
         * @param fechaFin Fecha de fin del rango
         * @returns Array de fechas en formato YYYY-MM-DD
         */
        this._generarFechasEnRango = (fechaInicio, fechaFin) => {
            const fechas = [];
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            // Validar que la fecha de inicio sea anterior a la fecha de fin
            if (inicio > fin) {
                return [];
            }
            // Generar array de fechas (mensual)
            const fechaActual = new Date(inicio);
            while (fechaActual <= fin) {
                fechas.push(fechaActual.toISOString().split('T')[0]);
                // Avanzar al siguiente mes
                fechaActual.setMonth(fechaActual.getMonth() + 1);
            }
            // Asegurar que la fecha final esté incluida
            const ultimaFecha = fechas[fechas.length - 1];
            if (ultimaFecha !== fechaFin) {
                fechas.push(fechaFin);
            }
            return fechas;
        };
        this.saldosRepository = new saldos_repository_1.SaldosRepository();
        this.configuracionReportesContabilidadRepository = new configuracion_reportes_contabilidad_repository_1.ConfiguracionReportesContabilidadRepository();
        this.cuentasContablesRepository = cuentas_contables_repository_1.CuentasContablesRepository.getInstance();
        // Usamos directamente el modelo ConfiguracionReporte para las consultas
    }
}
exports.ReporteContabilidadRepository = ReporteContabilidadRepository;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaldosBaseRepository = void 0;
const saldos_repository_1 = require("../saldosContables/saldos.repository");
const fechas_saldos_service_1 = require("./fechas-saldos.service");
/**
 * Clase base abstracta para repositorios que consultan saldos contables
 * Versión optimizada con las nuevas consultas de Firestore
 */
class SaldosBaseRepository {
    constructor() {
        this.saldosRepository = new saldos_repository_1.SaldosRepository();
        this.fechasSaldosService = new fechas_saldos_service_1.FechasSaldosService();
    }
    /**
     * Obtiene los saldos para las cuentas especificadas en los últimos meses disponibles
     * @param codigoOficina Código de la oficina para la cual obtener los datos
     * @param codigosCuenta Códigos de cuentas contables a consultar
     * @param nombreRepositorio Nombre del repositorio para logs
     * @returns Objeto con la información de saldos y su variación
     */
    async obtenerSaldosContables(codigoOficina, codigosCuenta, nombreRepositorio) {
        try {
            console.log(`[${nombreRepositorio}] Obteniendo saldos contables para oficina ${codigoOficina}`);
            // Paso 1: Obtener la última y penúltima fecha con datos disponibles
            const fechasConDatos = await this.fechasSaldosService.ObtenerUltimaYPenultimaFechaConDatos(codigoOficina, codigosCuenta, nombreRepositorio);
            if (!fechasConDatos || fechasConDatos.length === 0) {
                console.log(`[${nombreRepositorio}] No se encontraron fechas con datos para la oficina ${codigoOficina}`);
                return null;
            }
            // Obtener la fecha más reciente con datos (fecha actual para el reporte)
            const fechaActualStr = fechasConDatos[0].fecha;
            const fechaActualDate = new Date(fechaActualStr);
            // Paso 2: Calcular la fecha del último día del mes anterior (fechaAnterior)
            // Primer día del mes actual
            const primerDiaMesActual = new Date(fechaActualDate.getFullYear(), fechaActualDate.getMonth(), 1);
            // Último día del mes anterior (día 0 del mes actual)
            const ultimoDiaMesAnterior = new Date(primerDiaMesActual);
            ultimoDiaMesAnterior.setDate(0);
            const fechaAnteriorStr = ultimoDiaMesAnterior.toISOString().split('T')[0];
            // Paso 3: Obtener la fecha del día anterior con datos (fechaDiaAnterior)
            // Si tenemos al menos dos fechas con datos, la segunda es la penúltima fecha con datos
            let fechaDiaAnteriorStr = '';
            if (fechasConDatos.length > 1) {
                fechaDiaAnteriorStr = fechasConDatos[1].fecha;
            }
            else {
                // Si solo tenemos una fecha, intentamos encontrar la anterior
                const fechaAnteriorDate = new Date(fechaActualDate);
                fechaAnteriorDate.setDate(fechaActualDate.getDate() - 1);
                fechaDiaAnteriorStr = fechaAnteriorDate.toISOString().split('T')[0];
            }
            // Paso 4: Obtener los saldos para las tres fechas en una sola consulta
            // Rango de fechas desde la más antigua hasta la más reciente
            const fechaInicio = new Date(Math.min(new Date(fechaAnteriorStr).getTime(), new Date(fechaDiaAnteriorStr).getTime()));
            const fechaFin = new Date(fechaActualStr);
            console.log(`[${nombreRepositorio}] Consultando saldos desde ${fechaInicio.toISOString()} hasta ${fechaFin.toISOString()}`);
            // Usar modo diario para obtener todas las fechas específicas
            const saldos = await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(codigoOficina, fechaFin, fechaInicio, codigosCuenta);
            if (!saldos || saldos.length === 0) {
                console.log(`[${nombreRepositorio}] No se encontraron saldos para la oficina ${codigoOficina}`);
                return null;
            }
            // Paso 5: Agrupar saldos por fecha
            const saldosPorFecha = {};
            saldos.forEach((saldo) => {
                // Preferir fechaTimestamp si está disponible
                let fechaStr;
                if (saldo.fechaTimestamp) {
                    fechaStr = saldo.fechaTimestamp.toDate().toISOString().split('T')[0];
                }
                else {
                    fechaStr = typeof saldo.fecha === 'string' ? saldo.fecha : saldo.fecha.toISOString().split('T')[0];
                }
                if (!saldosPorFecha[fechaStr]) {
                    saldosPorFecha[fechaStr] = 0;
                }
                saldosPorFecha[fechaStr] += saldo.saldo;
            });
            // Paso 6: Obtener los montos para cada fecha
            const montoActual = saldosPorFecha[fechaActualStr] || 0;
            const montoAnterior = saldosPorFecha[fechaAnteriorStr] || 0;
            const montoDiaAnterior = saldosPorFecha[fechaDiaAnteriorStr] || 0;
            // Paso 7: Calcular variaciones
            const variacion = montoActual - montoAnterior;
            let variacionPorcentaje = 0;
            if (montoAnterior !== 0) {
                variacionPorcentaje = (variacion / Math.abs(montoAnterior)) * 100;
            }
            else if (variacion !== 0) {
                variacionPorcentaje = variacion > 0 ? 100 : -100;
            }
            const variacionDiaria = montoActual - montoDiaAnterior;
            let variacionPorcentajeDiaria = 0;
            if (montoDiaAnterior !== 0) {
                variacionPorcentajeDiaria = (variacionDiaria / Math.abs(montoDiaAnterior)) * 100;
            }
            else if (variacionDiaria !== 0) {
                variacionPorcentajeDiaria = variacionDiaria > 0 ? 100 : -100;
            }
            // Paso 8: Generar descripción de la comparación
            const mesActual = new Date(fechaActualStr).toLocaleDateString('es-ES', { month: 'long' });
            const mesAnterior = new Date(fechaAnteriorStr).toLocaleDateString('es-ES', { month: 'long' });
            const descripcionComparacion = `${mesActual} vs ${mesAnterior} ${anioAnterior !== anioActual ? anioAnterior : ''}`;
            return {
                fecha: fechaActualStr,
                monto: montoActual,
                fechaAnterior: fechaAnteriorStr,
                montoAnterior: montoAnterior,
                variacion: variacion,
                variacionPorcentaje: parseFloat(variacionPorcentaje.toFixed(2)),
                descripcionComparacion: descripcionComparacion,
                fechaDiaAnterior: fechaDiaAnteriorStr,
                montoDiaAnterior: montoDiaAnterior,
                variacionDiaria: variacionDiaria,
                variacionPorcentajeDiaria: parseFloat(variacionPorcentajeDiaria.toFixed(2))
            };
        }
        catch (error) {
            console.error(`[${nombreRepositorio}] Error al obtener saldos contables:`, error);
            return null;
        }
    }
}
exports.SaldosBaseRepository = SaldosBaseRepository;

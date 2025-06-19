"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionReportesContabilidadRepository = void 0;
const saldos_repository_1 = require("../../saldosContables/saldos.repository");
const base_firebaseRepository_1 = require("../../../base/base.firebaseRepository");
const cuentas_contables_repository_1 = require("../../cuentas-contables/cuentas-contables.repository");
class ConfiguracionReportesContabilidadRepository extends base_firebaseRepository_1.BaseFirebaseRepository {
    constructor() {
        super("configuracionesReportesContabilidad");
        this.obtenerConfiguracionesActivas = async () => {
            const query = this.collection.where("esActivo", "==", true);
            const snapshot = await query.get();
            return snapshot.docs.map((doc) => doc.data());
        };
        this.obtenerConfiguracion = async (nombre) => {
            const query = this.collection.where("nombre", "==", nombre).limit(1);
            const snapshot = await query.get();
            return snapshot.docs.map((doc) => doc.data())[0];
        };
        this.obtenerCuentas = async () => {
            // Usar el nuevo repositorio de Firebase en lugar de la consulta SQL directa
            return this.cuentasContablesRepository.obtenerCuentas();
        };
        this.generarReporteTendencia = async (reporteData) => {
            const periodosValidos = ["diario", "mensual"];
            if (!periodosValidos.includes(reporteData.periodo)) {
                throw new Error("Periodo inválido");
            }
            const periodoNormalizado = reporteData.periodo?.toLowerCase() || "mensual";
            const snapshot = await this.collection
                .where("nombre", "==", reporteData.tipo.nombre)
                .limit(1)
                .get();
            if (snapshot.empty) {
                throw new Error("Configuración no encontrada");
            }
            const configuracion = snapshot.docs[0].data();
            if (!configuracion) {
                throw new Error("Configuración no encontrada");
            }
            const fechas = this.generarFechasPorPeriodo(reporteData.fechaInicio, reporteData.fechaFin, periodoNormalizado);
            // IMPORTANTE: Asegurarse de que la fecha final esté incluida
            if (!fechas.includes(reporteData.fechaFin)) {
                fechas.push(reporteData.fechaFin);
                // Ordenar las fechas cronológicamente
                fechas.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            }
            if (fechas.length === 0) {
                return {
                    success: false,
                    message: "No se generaron fechas para el periodo especificado",
                };
            }
            // Obtener los saldos para todas las fechas
            const saldos = await this.saldosRepository.obtenerSaldosPorOficinaYFecha(reporteData.oficina, fechas.map((fecha) => new Date(Date.parse(fecha + "T00:00:00"))));
            if (!saldos || saldos.length === 0)
                return {
                    success: false,
                    message: "No se encontraron saldos para la oficina especificada",
                };
            const categoriasProcesadas = [];
            for (const categoria in configuracion.categorias) {
                const category = configuracion.categorias[categoria];
                const saldosPorFecha = saldos.reduce((grupo, saldo) => {
                    const fechaStrSaldo = saldo.fecha;
                    const fechaStr = fechaStrSaldo.split("/").map((v) => parseInt(v));
                    const fechaObj = new Date(fechaStr[2], fechaStr[1] - 1, fechaStr[0]);
                    const fechaStrFormateada = fechaObj.toISOString().split("T")[0];
                    if (!grupo[fechaStrFormateada]) {
                        grupo[fechaStrFormateada] = [];
                    }
                    saldo.fecha = fechaStrFormateada;
                    grupo[fechaStrFormateada].push(saldo);
                    return grupo;
                }, {});
                if (!saldosPorFecha)
                    continue;
                const valores = {};
                const cuentasDetalle = [];
                // Inicializar los valores en 0 para cada fecha
                fechas.forEach((fecha) => {
                    valores[fecha] = 0;
                });
                const cuentasData = await this.obtenerNombressCuenta(category.cuentas);
                // Procesar cada cuenta de la categoría
                for (const cuenta of cuentasData) {
                    for (const fecha of fechas) {
                        const saldo = saldosPorFecha[fecha];
                        if (!saldo)
                            continue;
                        const saldoCuenta = saldo.filter((s) => s.codigoCuentaContable === cuenta.CODIGO);
                        // Sumar los saldos de esta cuenta
                        const totalCuenta = saldoCuenta.reduce((total, saldo) => total + saldo.saldo, 0);
                        valores[fecha] = totalCuenta;
                    }
                    cuentasDetalle.push({
                        codigo: cuenta.CODIGO,
                        nombre: cuenta.NOMBRE,
                        valores: valores,
                    });
                }
                categoriasProcesadas.push({
                    nombre: category.nombre,
                    cuentas: cuentasDetalle,
                    valores: valores,
                });
            }
            const resultado = {
                fechas,
                categorias: categoriasProcesadas,
                oficina: reporteData.oficina,
            };
            return {
                success: true,
                message: "Reporte generado correctamente",
                data: resultado,
            };
        };
        this.obtenerNombressCuenta = async (cuentas) => {
            // Usar el nuevo repositorio de Firebase en lugar de la consulta SQL directa
            return this.cuentasContablesRepository.obtenerCuentasPorCodigos(cuentas);
        };
        this.actualizarConfiguracion = async (configuracion) => {
            const snapshot = await this.collection
                .where('nombre', '==', configuracion.nombre)
                .limit(1)
                .get();
            if (snapshot.empty) {
                return {
                    success: false,
                    message: "Configuración no encontrada",
                };
            }
            const docRef = snapshot.docs[0].ref;
            await docRef.update({
                nombre: configuracion.nombre,
                descripcion: configuracion.descripcion,
                categorias: configuracion.categorias,
                esActivo: configuracion.esActivo,
                fechaModificacion: new Date()
            });
            return {
                success: true,
                message: "Configuración actualizada correctamente",
            };
        };
        this.eliminarConfiguracion = async (configuracion) => {
            console.log("[ConfiguracionReportesContabilidadRepository] eliminando configuracion... ", configuracion);
            const snapshot = await this.collection
                .where('nombre', '==', configuracion.nombre)
                .limit(1)
                .get();
            if (snapshot.empty) {
                return false;
            }
            await snapshot.docs[0].ref.delete();
            return true;
        };
        this.saldosRepository = new saldos_repository_1.SaldosRepository();
        this.cuentasContablesRepository = cuentas_contables_repository_1.CuentasContablesRepository.getInstance();
    }
    generarFechasPorPeriodo(fechaDesde, fechaHasta, periodo) {
        // Para el reporte mensual, generar fechas de fin de mes
        if (periodo === "mensual") {
            const fechas = [];
            const fechaInicio = new Date(fechaDesde);
            const fechaFin = new Date(fechaHasta);
            // Comenzar con el mes de la fecha de inicio
            let mesActual = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
            // Generar todos los fines de mes hasta llegar al mes y año de la fecha final
            while (mesActual.getFullYear() < fechaFin.getFullYear() ||
                (mesActual.getFullYear() === fechaFin.getFullYear() &&
                    mesActual.getMonth() < fechaFin.getMonth())) {
                // Obtener el último día del mes actual
                const ultimoDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
                // Solo agregar la fecha si es mayor o igual a la fecha de inicio
                if (ultimoDiaMes >= fechaInicio) {
                    fechas.push(ultimoDiaMes.toISOString().split("T")[0]);
                }
                // Avanzar al siguiente mes
                mesActual = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1);
            }
            // Cuando llegamos al mes y año de la fecha final, usamos directamente fechaHasta
            // Asegurarse de que estamos usando la fecha correcta
            const fechaFinFormateada = fechaHasta; // Usar directamente el string original
            // Solo agregar si no está ya incluida
            if (!fechas.includes(fechaFinFormateada)) {
                fechas.push(fechaFinFormateada);
                // Ordenar fechas cronológicamente
                fechas.sort((a, b) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    return dateA.getTime() - dateB.getTime();
                });
            }
            return fechas;
        }
        else if (periodo === "diario") {
            // Para periodo diario, incluir todas las fechas del rango
            const fechas = [];
            const fechaInicio = new Date(fechaDesde);
            const fechaFin = new Date(fechaHasta);
            // Validar que la fecha de inicio sea anterior a la fecha fin
            if (fechaInicio > fechaFin) {
                return fechas;
            }
            const fechaActual = new Date(fechaInicio);
            while (fechaActual <= fechaFin) {
                fechas.push(fechaActual.toISOString().split("T")[0]);
                fechaActual.setDate(fechaActual.getDate() + 1);
            }
            return fechas;
        }
        // Si no es ni mensual ni diario, devolver un array vacío
        return [];
    }
}
exports.ConfiguracionReportesContabilidadRepository = ConfiguracionReportesContabilidadRepository;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaldosRepository = void 0;
const base_firebaseRepository_1 = require("../../base/base.firebaseRepository");
const admin = __importStar(require("firebase-admin"));
const firebase_admin_1 = require("firebase-admin");
class SaldosRepository extends base_firebaseRepository_1.BaseFirebaseRepository {
    constructor() {
        super('SaldosContables');
    }
    /**
     * Obtiene las fechas de fin de mes dentro del rango especificado
     * @param fechaInicio Fecha de inicio del rango
     * @param fechaFin Fecha de fin del rango
     * @returns Array de fechas correspondientes a los fines de mes dentro del rango
     */
    obtenerFechasFinDeMes(fechaInicio, fechaFin) {
        const fechas = [];
        const fechaActual = new Date(fechaInicio);
        // Ajustar fechaActual al último día del mes si no lo es
        fechaActual.setDate(1); // Ir al primer día del mes
        fechaActual.setMonth(fechaActual.getMonth() + 1); // Ir al primer día del mes siguiente
        fechaActual.setDate(0); // Ir al último día del mes anterior (el mes que queremos)
        while (fechaActual <= fechaFin) {
            fechas.push(new Date(fechaActual));
            // Avanzar al siguiente mes
            fechaActual.setDate(1); // Ir al primer día del mes
            fechaActual.setMonth(fechaActual.getMonth() + 1); // Ir al primer día del mes siguiente
            fechaActual.setDate(0); // Ir al último día del mes
        }
        return fechas;
    }
    /**
     * Obtiene los saldos contables por oficina, rango de fechas y cuentas
     * @param codigoOficina Código de la oficina
     * @param fechaInicio Fecha de inicio del rango
     * @param fechaFin Fecha de fin del rango
     * @param codigosCuentas Array de códigos de cuentas contables
     * @param modoDiario Si es true, consulta todas las fechas en el rango. Si es false (por defecto), consulta solo las fechas de fin de mes
     * @returns Promise con array de saldos contables
     */
    async obtenerSaldosPorOficinaFechaYCuentas(codigoOficina, fechaInicio, fechaFin, codigosCuentas, modoDiario = false) {
        try {
            // Si no hay cuentas, retornar array vacío
            if (!codigosCuentas || codigosCuentas.length === 0) {
                return [];
            }
            // Determinar las fechas a consultar según el modo
            let fechasConsulta = [];
            if (modoDiario) {
                // En modo diario, consultamos por rango de fechas directamente
                fechasConsulta = []; // No necesitamos fechas específicas, usaremos rango
            }
            else {
                // En modo mensual (por defecto), consultamos solo las fechas de fin de mes
                fechasConsulta = this.obtenerFechasFinDeMes(fechaInicio, fechaFin);
                if (fechasConsulta.length === 0) {
                    return [];
                }
            }
            // Crear lotes de códigos de cuentas (máximo 30 por consulta debido a limitaciones de Firestore)
            const lotesCuentas = [];
            for (let i = 0; i < codigosCuentas.length; i += 30) {
                lotesCuentas.push(codigosCuentas.slice(i, i + 30));
            }
            let resultados = [];
            // Procesar cada lote de cuentas
            for (const loteCuentas of lotesCuentas) {
                let query = (0, firebase_admin_1.firestore)()
                    .collection('SaldosContables')
                    .where('codigoOficina', '==', codigoOficina)
                    .where('codigoCuentaContable', 'in', loteCuentas);
                if (modoDiario) {
                    // En modo diario, filtramos por rango de fechas
                    query = query
                        .where('fechaTimestamp', '>=', fechaInicio)
                        .where('fechaTimestamp', '<=', fechaFin);
                }
                else {
                    // En modo mensual, filtramos por fechas específicas de fin de mes
                    const timestampsFechas = fechasConsulta.map(fecha => admin.firestore.Timestamp.fromDate(fecha));
                    query = query.where('fechaTimestamp', 'in', timestampsFechas);
                }
                const snapshot = await query.get();
                const saldos = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id
                    };
                });
                resultados = [...resultados, ...saldos];
            }
            return resultados;
        }
        catch (error) {
            console.error('Error al obtener saldos por oficina, fecha y cuentas:', error);
            throw error;
        }
    }
    /**
     * Obtiene los saldos contables por oficina y fecha
     * @param codigoOficina Código de la oficina
     * @param fechaInicio Fecha de inicio del rango
     * @param fechaFin Fecha de fin del rango
     * @param modoDiario Si es true, consulta todas las fechas en el rango. Si es false (por defecto), consulta solo las fechas de fin de mes
     * @returns Promise con array de saldos contables
     */
    async obtenerSaldosPorOficinaYFecha(codigoOficina, fechaInicio, fechaFin, modoDiario = false) {
        try {
            // Obtener todas las cuentas contables para la oficina
            const snapshot = await (0, firebase_admin_1.firestore)()
                .collection('SaldosContables')
                .where('codigoOficina', '==', codigoOficina)
                .select('codigoCuentaContable')
                .get();
            // Extraer códigos de cuentas únicos
            const codigosCuentas = Array.from(new Set(snapshot.docs.map(doc => {
                const data = doc.data();
                return data.codigoCuentaContable;
            })));
            // Usar el método optimizado para obtener los saldos
            return this.obtenerSaldosPorOficinaFechaYCuentas(codigoOficina, fechaInicio, fechaFin, codigosCuentas, modoDiario);
        }
        catch (error) {
            console.error('Error al obtener saldos por oficina y fecha:', error);
            throw error;
        }
    }
}
exports.SaldosRepository = SaldosRepository;

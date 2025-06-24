"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerSaldosContables = void 0;
const saldos_repository_1 = require("../../saldosContables/saldos.repository");
const obtenerSaldosContables = async (oficina, inicio, fin) => {
    try {
        const saldosRepository = new saldos_repository_1.SaldosRepository();
        try {
            const fechaInicio = inicio ? new Date(inicio) : new Date();
            const fechaFin = fin ? new Date(fin) : new Date();
            // Obtener todas las cuentas contables (o podríamos filtrar por las que nos interesan)
            // Para este caso usamos modo diario ya que queremos todos los datos disponibles
            const saldos = await saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(oficina, fechaInicio, fechaFin, [], // Array vacío para obtener todas las cuentas
            true // Modo diario para obtener todos los datos
            );
            if (!saldos || saldos.length === 0) {
                console.log(`[obtenerSaldosContables] No se encontraron saldos para la oficina ${oficina}. Generando datos de prueba.`);
                return [];
            }
            console.log(`[obtenerSaldosContables] Se encontraron ${saldos.length} saldos para la oficina ${oficina}`);
            return saldos;
        }
        catch (error) {
            console.error("[obtenerSaldosContables] Error al obtener saldos:", error);
            console.log("[obtenerSaldosContables] Generando datos de prueba debido al error.");
            return [];
        }
    }
    catch (error) {
        console.error("[obtenerSaldosContables] Error general:", error);
        // En caso de error general, devolver un array vacío para evitar que la aplicación falle
        return [];
    }
};
exports.obtenerSaldosContables = obtenerSaldosContables;

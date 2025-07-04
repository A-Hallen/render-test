import { SaldosRepository } from "../../saldosContables/saldos.repository";

import { CuentaData } from "shared/src/types/reportes.types";
import { ConfiguracionReportesContabilidadRepository } from "../../configuracion-reportes/contabilidad/configuracion-reportes-contabilidad.repository";
import { CuentasContablesRepository } from "../../cuentas-contables/cuentas-contables.repository";
// Interfaces para las solicitudes y respuestas
interface ReporteContabilidadRequest {
  fechaInicio?: string;
  fechaFin?: string;
  fecha?: string;
  oficina: string;
  nombreConfiguracion: string;
  tipoReporte?: "diario" | "mensual";
}

interface ResultadoReporteContabilidad {
  id?: number;
  fechaInicio: string;
  fechaFin: string;
  oficina: string;
  nombreConfiguracion: string;
  tipoReporte: "diario" | "mensual";
  fechas: string[]; // Array de fechas para las columnas
  categorias: {
    nombre: string;
    cuentas: {
      codigo: number;
      nombre: string;
      valoresPorFecha: { [fecha: string]: number }; // Valores por cada fecha
      diferencias?: { [fecha: string]: { valor: number; porcentaje: number } }; // Diferencias entre períodos
    }[];
    totalesPorFecha: { [fecha: string]: number }; // Totales por fecha para la categoría
    diferencias?: { [fecha: string]: { valor: number; porcentaje: number } }; // Diferencias entre períodos para la categoría
  }[];
  totalesGeneralesPorFecha: { [fecha: string]: number }; // Totales generales por fecha
  diferenciasGenerales?: {
    [fecha: string]: { valor: number; porcentaje: number };
  }; // Diferencias generales entre períodos
  descripcionPeriodo?: string;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
}

export class ReporteContabilidadRepository {
  private saldosRepository: SaldosRepository;
  private configuracionReportesContabilidadRepository: ConfiguracionReportesContabilidadRepository;
  private cuentasContablesRepository: CuentasContablesRepository;

  constructor() {
    this.saldosRepository = new SaldosRepository();
    this.configuracionReportesContabilidadRepository =
      new ConfiguracionReportesContabilidadRepository();
    this.cuentasContablesRepository = CuentasContablesRepository.getInstance();
    // Usamos directamente el modelo ConfiguracionReporte para las consultas
  }

  /**
   * Normaliza un valor de saldo para asegurar que sea un número válido
   * @param saldo El valor del saldo que puede estar en diferentes formatos
   * @returns El saldo convertido a número
   */
  private normalizarSaldo(saldo: any): number {
    // Si ya es un número, lo devolvemos directamente
    if (typeof saldo === 'number') {
      return saldo;
    }
    
    // Si es undefined o null, devolvemos 0
    if (saldo === undefined || saldo === null) {
      return 0;
    }
    
    // Si es string, intentamos convertirlo
    if (typeof saldo === 'string') {
      // Eliminar cualquier coma que pueda existir como separador de miles
      const saldoLimpio = saldo.replace(/,/g, '');
      // Convertir a número
      const saldoNumerico = parseFloat(saldoLimpio);
      // Verificar si es un número válido
      return isNaN(saldoNumerico) ? 0 : saldoNumerico;
    }
    
    // Para cualquier otro caso, intentamos convertir a número o devolvemos 0
    const saldoNumerico = Number(saldo);
    return isNaN(saldoNumerico) ? 0 : saldoNumerico;
  }

  /**
   * Genera un reporte de contabilidad basado en los parámetros proporcionados
   * @param reporteData Datos para generar el reporte
   * @returns Resultado del reporte de contabilidad
   */
  generarReporteContabilidad = async (
    reporteData: ReporteContabilidadRequest
  ) => {
    try {
      // Validar la configuración del reporte
      const configuracion =
        await this.configuracionReportesContabilidadRepository.obtenerConfiguracion(
          reporteData.nombreConfiguracion
        );

      if (!configuracion) {
        return {
          success: false,
          message: "Configuración de reporte no encontrada o inactiva",
        };
      }

      let saldos: any[] = [];
      let fechaReporte: string;
      let descripcionPeriodo: string = "";

      const cuentas = configuracion.categorias.flatMap(
        (categoria) => categoria.cuentas
      );

      if (reporteData.fechaInicio && reporteData.fechaFin) {
        const fechaInicio = new Date(
          Date.parse(reporteData.fechaInicio + "T00:00:00")
        );
        const fechaFin = new Date(
          Date.parse(reporteData.fechaFin + "T00:00:00")
        );

        const modoDiario = reporteData.tipoReporte === "diario";
        saldos =
          await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(
            reporteData.oficina,
            fechaFin,
            fechaInicio,
            cuentas,
            modoDiario
          );

        // Usar las fechas de inicio y fin para el reporte
        fechaReporte = reporteData.fechaFin;
      } else if (reporteData.fecha) {
        // Reporte por fecha específica (mantener compatibilidad)
        const fecha = new Date(Date.parse(reporteData.fecha + "T00:00:00"));
        // Para fecha específica, usamos la misma fecha como inicio y fin
        saldos =
          await this.saldosRepository.obtenerSaldosPorOficinaFechaYCuentas(
            reporteData.oficina,
            fecha,
            fecha,
            cuentas,
            true // Usar modo diario para fecha específica
          );
        fechaReporte = reporteData.fecha;
        descripcionPeriodo = `Reporte del ${reporteData.fecha}`;
      } else {
        return {
          success: false,
          message: "Debe proporcionar una fecha o un rango de fechas",
        };
      }

      if (!saldos || saldos.length === 0) {
        return {
          success: false,
          message:
            "No se encontraron saldos para la oficina y fecha especificadas",
        };
      }

      // Extraer fechas únicas de los saldos para usar como columnas
      const fechasUnicas = [...new Set(saldos.map((s: any) => s.fecha))].sort();

      // Procesar las categorías definidas en la configuración
      const categoriasProcesadas = [];
      const totalesGeneralesPorFecha: { [fecha: string]: number } = {};
      const diferenciasGenerales: {
        [fecha: string]: { valor: number; porcentaje: number };
      } = {};

      // Inicializar totales generales por fecha
      fechasUnicas.forEach((fecha) => {
        totalesGeneralesPorFecha[fecha] = 0;
      });

      for (const categoria in configuracion.categorias) {
        const category = configuracion.categorias[categoria];
        const cuentasData = await this.obtenerNombresCuenta(category.cuentas);

        // Calcular los totales por cuenta y por fecha
        const cuentasDetalle = [];
        const totalesPorFecha: { [fecha: string]: number } = {};
        const diferenciasPorFecha: {
          [fecha: string]: { valor: number; porcentaje: number };
        } = {};

        // Inicializar totales por fecha para esta categoría
        fechasUnicas.forEach((fecha) => {
          totalesPorFecha[fecha] = 0;
        });

        for (const cuenta of cuentasData as CuentaData[]) {
          // Inicializar valores por fecha para esta cuenta
          const valoresPorFecha: { [fecha: string]: number } = {};
          const diferenciasCuenta: {
            [fecha: string]: { valor: number; porcentaje: number };
          } = {};

          // Inicializar con ceros para todas las fechas
          fechasUnicas.forEach((fecha) => {
            valoresPorFecha[fecha] = 0;
          });

          // Agrupar saldos por fecha para esta cuenta
          for (const saldo of saldos) {
            if (saldo.codigoCuentaContable === cuenta.CODIGO) {
              // Normalizar el saldo antes de sumarlo
              const saldoNormalizado = this.normalizarSaldo(saldo.saldo);
              
              // Sumar al valor existente para esa fecha (por si hay múltiples registros)
              valoresPorFecha[saldo.fecha] =
                (valoresPorFecha[saldo.fecha] || 0) + saldoNormalizado;
              // Sumar al total de la categoría para esa fecha
              totalesPorFecha[saldo.fecha] =
                (totalesPorFecha[saldo.fecha] || 0) + saldoNormalizado;
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
            } else if (diferencia !== 0) {
              // Si el valor anterior es 0 pero hay diferencia, es un incremento del 100%
              porcentaje = diferencia > 0 ? 100 : -100;
            }

            diferenciasCuenta[fechaActual] = {
              valor: diferencia,
              porcentaje: parseFloat(porcentaje.toFixed(2)),
            };
          }

          console.log(
            `[repository] Cuenta ${cuenta.CODIGO} - Valores por fecha:`,
            valoresPorFecha
          );

          cuentasDetalle.push({
            codigo: cuenta.CODIGO,
            nombre: cuenta.NOMBRE,
            valoresPorFecha,
            diferencias: diferenciasCuenta,
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
          } else if (diferencia !== 0) {
            porcentaje = diferencia > 0 ? 100 : -100;
          }

          diferenciasPorFecha[fechaActual] = {
            valor: diferencia,
            porcentaje: parseFloat(porcentaje.toFixed(2)),
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
          diferencias: diferenciasPorFecha,
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
        } else if (diferencia !== 0) {
          porcentaje = diferencia > 0 ? 100 : -100;
        }

        diferenciasGenerales[fechaActual] = {
          valor: diferencia,
          porcentaje: parseFloat(porcentaje.toFixed(2)),
        };
      }

      // Ya hemos calculado los totales generales por fecha

      // Crear el resultado del reporte
      const resultado: ResultadoReporteContabilidad = {
        fechaInicio: (reporteData.fechaInicio || reporteData.fecha) as string,
        fechaFin: (reporteData.fechaFin || reporteData.fecha) as string,
        oficina: reporteData.oficina,
        nombreConfiguracion: reporteData.nombreConfiguracion,
        tipoReporte: reporteData.tipoReporte || "mensual",
        fechas: fechasUnicas,
        categorias: categoriasProcesadas,
        totalesGeneralesPorFecha,
        diferenciasGenerales,
        descripcionPeriodo,
      };

      return {
        success: true,
        message: "Reporte generado correctamente",
        data: resultado,
      };
    } catch (error: any) {
      console.error("Error al generar reporte de contabilidad:", error);
      return {
        success: false,
        message: `Error al generar reporte: ${
          error.message || "Error desconocido"
        }`,
      };
    }
  };

  /**
   * Obtiene los nombres de las cuentas contables a partir de sus códigos
   * @param cuentas Códigos de las cuentas contables
   * @returns Información de las cuentas contables
   */
  obtenerNombresCuenta = async (cuentas: string[]) => {
    if (!cuentas || cuentas.length === 0) {
      return [];
    }

    const cuentasData =
      this.cuentasContablesRepository.obtenerCuentasPorCodigos(cuentas);
    return cuentasData;
  };

  /**
   * Genera un array de fechas en formato YYYY-MM-DD dentro del rango especificado
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @returns Array de fechas en formato YYYY-MM-DD
   */
  _generarFechasEnRango = (fechaInicio: string, fechaFin: string): string[] => {
    const fechas: string[] = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (inicio > fin) {
      return [];
    }

    // Generar array de fechas (mensual)
    const fechaActual = new Date(inicio);

    while (fechaActual <= fin) {
      fechas.push(fechaActual.toISOString().split("T")[0]);
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
}

import { BaseRepository } from "../../base/base.repository";
import { ConfiguracionReporte } from "./reportes.model";
import { SaldosRepository } from "../saldosContables/saldos.repository";
import { SaldosContables } from "../saldosContables/saldos.model";
import { sequelize } from "../../database/database.connection";
import { QueryTypes, WhereOptions } from "sequelize";
import {
  TABLA_CONFIGURACIONES_REPORTES,
  TABLA_CUENTACONTABLE,
  TABLA_DIVISION,
} from "../../database/database.constants";

// Definimos localmente las interfaces necesarias para evitar problemas de importación
interface ConfiguracionReporteDTO {
  nombre: string;
  descripcion: string | null;
  categorias: Array<{
    nombre: string;
    cuentas: string[];
  }>;
  esActivo: boolean;
  fechaCreacion: Date;
  fechaModificacion: Date;
}

interface CuentaData {
  CODIGO: number;
  NOMBRE: string;
}

interface ReporteTendenciaRequest {
  tipo: ConfiguracionReporteDTO;
  oficina: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
}

export class ReportesRepository extends BaseRepository<ConfiguracionReporte> {
  constructor() {
    super(ConfiguracionReporte);
    this.saldosRepository = new SaldosRepository();
    this.sequelize = sequelize;
  }

  private sequelize;
  private saldosRepository;

  obtenerConfiguracionesActivas = async () => {
    return this.model.findAll({ where: { esActivo: true } });
  };

  obtenerCuentas = async (): Promise<CuentaData[]> => {
    const query = `
        SELECT D.CODIGO, D.NOMBRE
        FROM \`${TABLA_DIVISION}\` D 
        INNER JOIN \`${TABLA_CUENTACONTABLE}\` CC ON CC.SECUENCIALDIVISION = D.SECUENCIAL
        WHERE CC.ESTAACTIVA = TRUE
      `;
    const cuentaData = await this.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    return cuentaData as CuentaData[];
  };

  generarReporteTendencia = async (reporteData: ReporteTendenciaRequest) => {
    const periodosValidos = ["diario", "mensual"];
    if (!periodosValidos.includes(reporteData.periodo)) {
      throw new Error("Periodo inválido");
    }
    const periodoNormalizado = reporteData.periodo?.toLowerCase() || "mensual";
    const configuracion = await this.model.findOne({
      where: { nombre: reporteData.tipo.nombre },
    });
    if (!configuracion) {
      throw new Error("Configuración no encontrada");
    }
    const fechas = this.generarFechasPorPeriodo(
      reporteData.fechaInicio,
      reporteData.fechaFin,
      periodoNormalizado as "mensual" | "diario"
    );
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
    const saldos = await this.saldosRepository.obtenerSaldosPorOficinaYFecha(
      reporteData.oficina,
      fechas // Ya tenemos las fechas en formato YYYY-MM-DD
    );

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
      }, {} as Record<string, SaldosContables[]>);
      if (!saldosPorFecha) continue;
      const valores = {} as Record<string, number>;
      const cuentasDetalle = [];
      // Inicializar los valores en 0 para cada fecha
      fechas.forEach((fecha) => {
        valores[fecha] = 0;
      });

      const cuentasData = await this.obtenerNombressCuenta(category.cuentas);
      // Procesar cada cuenta de la categoría
      for (const cuenta of cuentasData as CuentaData[]) {
        for (const fecha of fechas) {
          const saldo = saldosPorFecha[fecha];
          if (!saldo) continue;
          const saldoCuenta = saldo.filter(
            (s) => s.codigoCuentaContable === cuenta.CODIGO
          );

          // Sumar los saldos de esta cuenta
          const totalCuenta = saldoCuenta.reduce(
            (total, saldo) => total + saldo.saldo,
            0
          );
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

  obtenerNombressCuenta = async (cuentas: string[]) => {
    const query = `
        SELECT D.CODIGO, D.NOMBRE
        FROM \`${TABLA_DIVISION}\` D 
        INNER JOIN \`${TABLA_CUENTACONTABLE}\` CC ON CC.SECUENCIALDIVISION = D.SECUENCIAL
        WHERE D.CODIGO IN (:cuentas)
        AND CC.ESTAACTIVA = TRUE
      `;
    const cuentaData = await this.sequelize.query(query, {
      replacements: { cuentas },
      type: QueryTypes.SELECT,
    });
    return cuentaData;
  };

  /**
   * Formatea una fecha a formato YYYY-MM-DD
   * @param {Date} fecha - Fecha a formatear
   * @returns {string} - Fecha formateada
   */
  formatearFecha(fecha: Date) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  generarFechasPorPeriodo(
    fechaDesde: string,
    fechaHasta: string,
    periodo: "mensual" | "diario"
  ): string[] {
    // Para el reporte mensual, generar fechas de fin de mes
    if (periodo === "mensual") {
      const fechas: string[] = [];
      const fechaInicio = new Date(fechaDesde);
      const fechaFin = new Date(fechaHasta);

      // Comenzar con el mes de la fecha de inicio
      let mesActual = new Date(
        fechaInicio.getFullYear(),
        fechaInicio.getMonth(),
        1
      );

      // Generar todos los fines de mes hasta llegar al mes y au00f1o de la fecha final
      while (
        mesActual.getFullYear() < fechaFin.getFullYear() ||
        (mesActual.getFullYear() === fechaFin.getFullYear() &&
          mesActual.getMonth() < fechaFin.getMonth())
      ) {
        // Obtener el u00faltimo du00eda del mes actual
        const ultimoDiaMes = new Date(
          mesActual.getFullYear(),
          mesActual.getMonth() + 1,
          0
        );
        // Solo agregar la fecha si es mayor o igual a la fecha de inicio
        if (ultimoDiaMes >= fechaInicio) {
          fechas.push(this.formatearFecha(ultimoDiaMes));
        }

        // Avanzar al siguiente mes
        mesActual = new Date(
          mesActual.getFullYear(),
          mesActual.getMonth() + 1,
          1
        );
      }

      // Cuando llegamos al mes y au00f1o de la fecha final, usamos directamente fechaHasta
      // Asegurarse de que estamos usando la fecha correcta
      const fechaFinFormateada = fechaHasta; // Usar directamente el string original

      // Solo agregar si no estu00e1 ya incluida
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
    } else if (periodo === "diario") {
      // Para periodo diario, incluir todas las fechas del rango
      const fechas: string[] = [];
      const fechaInicio = new Date(fechaDesde);
      const fechaFin = new Date(fechaHasta);

      // Validar que la fecha de inicio sea anterior a la fecha fin
      if (fechaInicio > fechaFin) {
        return fechas;
      }

      const fechaActual = new Date(fechaInicio);
      while (fechaActual <= fechaFin) {
        fechas.push(this.formatearFecha(fechaActual));
        fechaActual.setDate(fechaActual.getDate() + 1);
      }

      return fechas;
    }

    // Si no es ni mensual ni diario, devolver un array vacío
    return [];
  }

  actualizarConfiguracion = async (configuracion: ConfiguracionReporteDTO) => {
    const response = await this.sequelize.query(
      `UPDATE \`${TABLA_CONFIGURACIONES_REPORTES}\` SET nombre = :nombre, descripcion = :descripcion, categorias = :categorias, esActivo = :esActivo, fechaModificacion = :fechaModificacion WHERE nombre = :nombre`,
      {
        replacements: {
          nombre: configuracion.nombre,
          descripcion: configuracion.descripcion,
          categorias: JSON.stringify(configuracion.categorias),
          esActivo: configuracion.esActivo,
          fechaModificacion: new Date(),
        },
        type: QueryTypes.UPDATE,
      }
    );
    return {
      success: true,
      message: "Configuración actualizada correctamente",
    };
  };

  eliminarConfiguracion = async (configuracion: ConfiguracionReporteDTO) => {
    console.log("[ReportesRepository] eliminando configuracion... ", configuracion);
    const whereCondition: WhereOptions = { nombre: configuracion.nombre };
    const result = await this.model.destroy({ where: whereCondition });
    return result > 0;
  };
}

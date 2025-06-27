import { sequelize } from "../../database/database.connection";
import { QueryTypes } from "sequelize";
import { ULTIMA_FECHA_AWS_QUERY, COUNT_SALDOS_CONTABLES_QUERY, SALDOS_CONTABLES_QUERY } from "./sincronizacion.queries";

export class AwsSyncService {
  async obtenerUltimaFecha(): Promise<string | null> {
    const resultadosFecha: { ultimaFechaConSaldos: string }[] =
      await sequelize.query(ULTIMA_FECHA_AWS_QUERY, { type: QueryTypes.SELECT });
    
    return resultadosFecha[0]?.ultimaFechaConSaldos || null;
  }

  async calcularNumeroDeRegistros(fechaInicio: string): Promise<number> {
    const result: { totalSaldosContables: number }[] = await sequelize.query(
      COUNT_SALDOS_CONTABLES_QUERY,
      {
        replacements: { fechaInicio },
        type: QueryTypes.SELECT,
      }
    );
    return result[0]?.totalSaldosContables || 0;
  }

  async exportarDatosPorFecha(fecha: string): Promise<any[]> {
    return await sequelize.query(SALDOS_CONTABLES_QUERY, {
      replacements: { fecha },
      type: QueryTypes.SELECT,
    });
  }
}
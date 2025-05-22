import { BaseFirebaseRepository } from "../../base/base.firebaseRepository";
import { Indicador } from "./indicadores.model";
import { calcularSaldosContables } from "./transformers/obtenerSaldosContables";
import {
  indicadoresCalculadosPorfecha,
  indicadoresCalculadosPorMes,
  indicadoresCalculadosPorPeriodo,
} from "./transformers/promediarIndicadoresPorFecha";
import { IndicadorColor } from "shared/src/types/indicadores.types";

export class IndicadoresRepository extends BaseFirebaseRepository<Indicador> {
  constructor() {
    super("Indicadores");
  }

  async crear(data: Partial<Indicador>): Promise<Indicador> {
    console.log("creando indicador", data)
    const docRef = this.collection.doc();
    data.id = docRef.id;
    await docRef.set(data);
    return data as Indicador;
  }

  async obtenerPromedioIndicadoresOficina(
    oficina: string,
    fechaInicio: string,
    fechaFin: string
  ) {
    const indicadores = await this.obtenerTodos();
    const saldosContables = await calcularSaldosContables(
      indicadores,
      oficina,  
      fechaInicio,
      fechaFin
    );
    console.log("saldos extraidos", saldosContables.length);
    const indicadoresPorFecha = indicadoresCalculadosPorfecha(
      saldosContables,
      indicadores
    );
    const indicadoresPorPeriodo = indicadoresCalculadosPorPeriodo(
      indicadoresPorFecha,
      fechaInicio,
      fechaFin
    );
    const indicadoresPorMes = indicadoresCalculadosPorMes(
      indicadoresPorPeriodo,
      indicadores
    );

    const indicadoresColor: IndicadorColor[] = indicadores.map((i) => {
      return { id: i.id, nombre: i.nombre, color: i.color };
    });

    return {
      indicadores: indicadoresColor,
      indicadoresCalculados: indicadoresPorMes,
    };
  }
}

import { Indicador } from "../indicadores.model";
import { SaldosRepository } from "../../saldosContables/saldos.repository";
import { CalculoIndicador, IndicadorCalculado } from "../interfaces/IndicadorCalculado.interface";
import { calcularIndicador } from "./calcularIndicador";
import { SaldosContables } from "../../saldosContables/saldos.model";


export const calcularSaldosContables = async (
  indicadores: Indicador[],
  oficina: string,
  inicio?: string,
  fin?: string
) => {
  const saldos = await obtenerSaldosContables(oficina, inicio, fin);
  console.log('saldos extraidos', saldos.length);
  const saldosPorFecha = saldos.reduce((grupo, saldo) => {
    const fechaStr = saldo.fecha;
    if (!grupo[fechaStr]) {
      grupo[fechaStr] = [];
    }
    grupo[fechaStr].push(saldo);
    return grupo;
  }, {} as Record<string, SaldosContables[]>);

  const indicadoresPorFecha: { [key: string]: IndicadorCalculado[] } = {};

  Object.entries(saldosPorFecha).forEach(([fecha, saldos]) => {
    const fechaObj = new Date(fecha);
    const fechaStr = fechaObj.toISOString().split('T')[0];
    console.log("fecha", fechaStr, saldos.length);
    const indicadoresCalculados: IndicadorCalculado[] = [];
    indicadores.forEach((indicador) => {
        const resultado: CalculoIndicador = calcularIndicador(indicador, saldos);
        const indicadorCalculado: IndicadorCalculado = {
          fecha: fechaStr,
          idIndicador: indicador.id,
          codigoOficina: oficina,
          valor: resultado.valor,
          componentes: resultado.componentes,
        };
        indicadoresCalculados.push(indicadorCalculado);
    })
    indicadoresPorFecha[fechaStr] = indicadoresCalculados;
  })

  console.log("indicadores calculados", Object.entries(indicadoresPorFecha).length);

  return indicadoresPorFecha;
};

export const obtenerSaldosContables = async (
  oficina: string,
  inicio?: string,
  fin?: string
) => {
  const fechas = obtenerFechasEntrePeriodo(inicio, fin);
  const saldosRepository = new SaldosRepository();

  try {
    
    const saldos = await saldosRepository.obtenerSaldosPorOficinaYFecha(
      oficina,
      fechas
    );

    return saldos;
  } catch (error) {
    console.error("Error al obtener saldos:", error);
    throw error;
  }
};

const obtenerFechasEntrePeriodo = (inicio?: string, fin?: string): Date[] => {
  const fechaInicio = inicio ? new Date(inicio) : new Date("2015-01-01");
  const fechaFin = fin ? new Date(fin) : new Date();
  const fechas = [];

  // Asegurarnos de que la fecha de inicio sea el último día del mes
  let fechaActual = new Date(
    fechaInicio.getFullYear(),
    fechaInicio.getMonth() + 1,
    0
  );

  while (fechaActual <= fechaFin) {
    fechas.push(new Date(fechaActual));

    // Avanzar al último día del siguiente mes
    fechaActual = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() + 2,
      0
    );
  }

  console.log(
    `Se calcularán indicadores para ${fechas.length} meses: ${fechas
      .map((f) => f.toISOString().split("T")[0])
      .join(", ")}`
  );
  return fechas;
};

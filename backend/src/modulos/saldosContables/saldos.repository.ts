import { BaseFirebaseRepository } from "../../base/base.firebaseRepository";
import { SaldosContables } from "./saldos.model";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";

export class SaldosRepository extends BaseFirebaseRepository<SaldosContables> {
  constructor() {
    super("SaldosContables");
  }

  /**
   * Obtiene las fechas de fin de mes dentro del rango especificado
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @returns Array de fechas correspondientes a los fines de mes dentro del rango
   */
  private obtenerFechasFinDeMes(fechaInicio: Date, fechaFin: Date): Date[] {
    const fechas: Date[] = [];
    if(fechaInicio.getTime() === fechaFin.getTime()){
      fechas.push(fechaInicio);
      return fechas;
    }

    // Crear una copia de la fecha de inicio para no modificar la original
    let currentYear = fechaInicio.getFullYear();
    let currentMonth = fechaInicio.getMonth();

    // Avanzar al último día del mes actual
    const primerFechaMes = new Date(currentYear, currentMonth + 1, 0);

    // Si la primera fecha de fin de mes es posterior a la fecha de inicio, incluirla
    if (primerFechaMes >= fechaInicio && primerFechaMes <= fechaFin) {
      fechas.push(new Date(primerFechaMes));
    }

    // Avanzar al siguiente mes
    currentMonth++;

    // Iterar por cada mes hasta llegar o superar la fecha fin
    while (true) {
      // Si el mes es 12, avanzar al siguiente año
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }

      // Calcular el último día del mes actual
      const ultimoDiaMes = new Date(currentYear, currentMonth + 1, 0);

      // Si ya superamos la fecha fin, salir del bucle
      if (ultimoDiaMes > fechaFin) {
        break;
      }

      // Agregar la fecha de fin de mes al array
      fechas.push(new Date(ultimoDiaMes));

      // Avanzar al siguiente mes
      currentMonth++;
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
  async obtenerSaldosPorOficinaFechaYCuentas(
    codigoOficina: string,
    fechaInicio: Date,
    fechaFin: Date,
    codigosCuentas: string[],
    modoDiario: boolean = false
  ): Promise<SaldosContables[]> {
    try {
      // Si no hay cuentas, retornar array vacío
      if (!codigosCuentas || codigosCuentas.length === 0) {
        return [];
      }

      // Determinar las fechas a consultar según el modo
      let fechasConsulta: Date[] = [];
      if (modoDiario) {
        // En modo diario, consultamos por rango de fechas directamente
        fechasConsulta = []; // No necesitamos fechas específicas, usaremos rango
      } else {
        // En modo mensual (por defecto), consultamos solo las fechas de fin de mes
        fechasConsulta = this.obtenerFechasFinDeMes(fechaFin, fechaInicio);
        if (fechasConsulta.length === 0) {
          return [];
        }
      }

      // Array para almacenar todas las promesas de consultas
      const promesasConsultas: Promise<SaldosContables[]>[] = [];

      if (modoDiario) {
        // En modo diario, usamos rangos de fechas y lotes de cuentas
        // Crear lotes de códigos de cuentas (máximo 30 por consulta)
        const lotesCuentas = this.crearLotes(codigosCuentas, 30);
        const inicioTimestamp = admin.firestore.Timestamp.fromDate(fechaInicio);
        const finTimestamp = admin.firestore.Timestamp.fromDate(fechaFin);

        // Crear una promesa para cada lote de cuentas
        for (const loteCuentas of lotesCuentas) {
          const query = firestore()
            .collection("SaldosContables")
            .where("codigoOficina", "==", codigoOficina)
            .where("codigoCuentaContable", "in", loteCuentas)
            .where("fechaTimestamp", ">=", inicioTimestamp)
            .where("fechaTimestamp", "<=", finTimestamp);

          // Agregar la promesa al array sin esperar a que se resuelva
          promesasConsultas.push(this.ejecutarConsulta(query));
        }
      } else {
        // En modo mensual, necesitamos manejar tanto lotes de cuentas como lotes de fechas
        // para evitar superar el límite de 30 elementos en la cláusula 'in'

        // Convertir fechas a timestamps
        const timestampsFechas = fechasConsulta.map((fecha) =>
          admin.firestore.Timestamp.fromDate(fecha)
        );

        // Calcular el tamaño máximo de lote de cuentas basado en el número de fechas
        // Asegurando que cuentas + fechas <= 30
        const tamanoMaximoLote = Math.max(1, Math.floor(30 / timestampsFechas.length));
        const lotesCuentas = this.crearLotes(codigosCuentas, tamanoMaximoLote);

        // Crear una promesa para cada lote de cuentas
        for (const loteCuentas of lotesCuentas) {
          const query = firestore()
            .collection("SaldosContables")
            .where("codigoOficina", "==", codigoOficina)
            .where("codigoCuentaContable", "in", loteCuentas)
            .where("fechaTimestamp", "in", timestampsFechas);

          // Agregar la promesa al array sin esperar a que se resuelva
          promesasConsultas.push(this.ejecutarConsulta(query));
        }
      }

      // Esperar a que todas las promesas se resuelvan en paralelo
      const resultadosLotes = await Promise.all(promesasConsultas);
      
      // Combinar todos los resultados en un solo array
      return resultadosLotes.flat();
    } catch (error) {
      console.error(
        "Error al obtener saldos por oficina, fecha y cuentas:",
        error
      );
      throw error;
    }
  }

  /**
   * Crea lotes de elementos con un tamaño máximo especificado
   * @param items Array de elementos a dividir en lotes
   * @param tamanoLote Tamaño máximo de cada lote
   * @returns Array de arrays, cada uno con un máximo de tamanoLote elementos
   */
  private crearLotes<T>(items: T[], tamanoLote: number): T[][] {
    const lotes: T[][] = [];
    for (let i = 0; i < items.length; i += tamanoLote) {
      lotes.push(items.slice(i, i + tamanoLote));
    }
    return lotes;
  }

  /**
   * Ejecuta una consulta Firestore y mapea los resultados
   * @param query Consulta Firestore a ejecutar
   * @returns Promise con array de resultados mapeados
   */
  private async ejecutarConsulta(
    query: firestore.Query
  ): Promise<SaldosContables[]> {
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => {
      const data = doc.data() as SaldosContables;
      return {
        ...data,
        id: doc.id,
      };
    });
  }

  /**
   * Obtiene los saldos contables por oficina y fecha
   * @param codigoOficina Código de la oficina
   * @param fechaInicio Fecha de inicio del rango
   * @param fechaFin Fecha de fin del rango
   * @param modoDiario Si es true, consulta todas las fechas en el rango. Si es false (por defecto), consulta solo las fechas de fin de mes
   * @returns Promise con array de saldos contables
   */
  async obtenerSaldosPorOficinaYFecha(
    codigoOficina: string,
    fechaInicio: Date,
    fechaFin: Date,
    modoDiario: boolean = false
  ): Promise<SaldosContables[]> {
    try {
      // Obtener todas las cuentas contables para la oficina
      const query = firestore()
        .collection("SaldosContables")
        .where("codigoOficina", "==", codigoOficina)
        .select("codigoCuentaContable");

      const snapshot = await query.get();

      // Extraer códigos de cuentas únicos
      const codigosCuentas = Array.from(
        new Set(
          snapshot.docs.map((doc) => {
            const data = doc.data();
            return data.codigoCuentaContable;
          })
        )
      );

      // Usar el método general para obtener los saldos
      return this.obtenerSaldosPorOficinaFechaYCuentas(
        codigoOficina,
        fechaInicio,
        fechaFin,
        codigosCuentas,
        modoDiario
      );
    } catch (error) {
      console.error("Error al obtener saldos por oficina y fecha:", error);
      throw error;
    }
  }
}

/**
 * Tipos y interfaces para la comparación de indicadores financieros
 */

// Interfaz para un indicador financiero procesado
export interface IndicadorFinanciero {
  id: string;
  nombre: string;
  valor: number;
  rendimiento: "DEFICIENTE" | "ACEPTABLE" | "BUENO";
  color: string;
  componentes?: {
    numerador: number;
    denominador: number;
    detalle: {
      numerador: Record<string, number>;
      denominador: Record<string, number>;
    };
  };
}

// Interfaz para los filtros de comparación
export interface FiltrosComparacion {
  oficina1: string;
  oficina2: string;
  fecha: string;
}

// Interfaz para los datos de comparación recibidos del backend
export interface ComparacionData {
  indicadores: {
    id: string;
    nombre: string;
    color: string;
  }[];
  kpisOficina1: {
    [key: string]: any[];
  };
  kpisOficina2: {
    [key: string]: any[];
  };
  fecha: string;
  nombreOficina1: string;
  nombreOficina2: string;
  mensaje?: string;
}

// Funciones de utilidad para formateo de fechas
export function formatearFechaParaInput(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatearFechaParaMostrar(fechaStr: string): string {
  if (!fechaStr || !fechaStr.includes("-")) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
}

// Funciones de utilidad para determinar rendimiento y color
export function determinarRendimiento(valor: number): "DEFICIENTE" | "ACEPTABLE" | "BUENO" {
  if (valor < 40) return "DEFICIENTE";
  if (valor < 70) return "ACEPTABLE";
  return "BUENO";
}

export function determinarColor(valor: number): string {
  if (valor < 40) return "#FF8C42"; // Naranja para deficiente
  if (valor < 70) return "#FFD166"; // Amarillo para aceptable
  return "#06D6A0"; // Verde para bueno
}

// Función para procesar los indicadores recibidos del backend
export function procesarIndicadores(
  kpis: any[],
  indicadoresInfo: any[]
): IndicadorFinanciero[] {
  return kpis.map((kpi) => {
    // Buscar el indicador correspondiente en la lista de indicadores
    const indicadorInfo = indicadoresInfo.find(
      (ind) => ind.id === kpi.idIndicador
    );

    // Multiplicar el valor por 100 para convertirlo a porcentaje
    const valorPorcentaje = kpi.valor * 100;

    return {
      id: kpi.idIndicador,
      nombre: indicadorInfo?.nombre || kpi.idIndicador,
      valor: valorPorcentaje,
      rendimiento: determinarRendimiento(valorPorcentaje),
      color: indicadorInfo?.color || determinarColor(valorPorcentaje),
      componentes: kpi.componentes,
    };
  });
}

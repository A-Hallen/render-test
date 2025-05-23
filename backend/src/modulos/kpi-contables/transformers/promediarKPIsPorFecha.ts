import { IndicadorCalcularPeriodo } from "shared/src/types/indicadores.types";
import { IndicadorContable } from "../../indicadores-contables/interfaces/IndicadorContable.interface";
import { KPICalculado } from "../interfaces/KPICalculado.interface";

interface MonthlyData {
    month: string;
    sums: Record<string, number>;
    counts: Record<string, number>;
}

export const kpisCalculadosPorfecha = (responseData: {
    [key: string]: KPICalculado[];
}, indicatorMapping: IndicadorContable[]): IndicadorCalcularPeriodo[] => {
    // Obtener todas las fechas únicas y ordenarlas
    const dates = Object.keys(responseData).sort();

    // Transformar cada fecha en un objeto para el gráfico
    return dates.map(dateStr => {
        const date = new Date(dateStr + 'T00:00:00Z');
        const monthName = date.toLocaleString('es-ES', { month: 'short', timeZone: 'UTC' });
        const monthAbbr = monthName.charAt(0).toUpperCase() + monthName.slice(1, 3);

        // Crear objeto base con el mes
        const result: IndicadorCalcularPeriodo = { date: dateStr, month: monthAbbr };

        // Procesar cada KPI para esta fecha
        responseData[dateStr].forEach(kpiCalculado => {
            const indicador = indicatorMapping.find(i => i.id === kpiCalculado.idIndicador);

            if (indicador) {
                // Convertir el valor a porcentaje (multiplicar por 100) y redondear a 2 decimales
                result[indicador.nombre] = Math.round(kpiCalculado.valor * 100 * 100) / 100;
            } else {
                console.log("indicador no encontrado", kpiCalculado.idIndicador, indicatorMapping.length);
            }
        });

        return result;
    });
}

export const kpisCalculadosPorPeriodo = (data: IndicadorCalcularPeriodo[], inicio: string, fin: string): IndicadorCalcularPeriodo[] => {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    return data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= fechaInicio && itemDate <= fechaFin;
    }).map(item => item);
}

export const kpisCalculadosPorMes = (data: IndicadorCalcularPeriodo[], indicadores: IndicadorContable[]): IndicadorCalcularPeriodo[] => {
    // 1. Obtener nombres de indicadores
    const indicatorNames: string[] = indicadores.map(ind => ind.nombre);

    const monthlyData = new Map<string, MonthlyData>();

    for (const item of data) {
        const monthYear = item.month as string;

        if (!monthlyData.has(monthYear)) {
            const sums = Object.fromEntries(indicatorNames.map(name => [name, 0]));
            const counts = Object.fromEntries(indicatorNames.map(name => [name, 0]));

            monthlyData.set(monthYear, {
                month: monthYear,
                sums,
                counts
            });
        }

        const currentMonth = monthlyData.get(monthYear)!;

        for (const indicator of indicatorNames) {
            const value = item[indicator];
            if (typeof value === 'number') {
                currentMonth.sums[indicator] += value;
                currentMonth.counts[indicator]++;
            }
        }
    }

    // 5. Calcular promedios y formatear resultado
    return Array.from(monthlyData.values()).map(monthData => {
        const result: IndicadorCalcularPeriodo = { month: monthData.month };

        for (const indicator of indicatorNames) {
            const count = monthData.counts[indicator];
            result[indicator] = count > 0
                ? Math.round((monthData.sums[indicator] / count) * 100) / 100
                : 0;
        }

        return result;
    });
}

export const obtenerColorKPIPorUmbral = (indicador: IndicadorContable) => {
    const umbrales = indicador.umbrales;

    // Si no hay umbrales, devolver un color por defecto
    if (!umbrales?.umbrales?.length) {
        return '#CCCCCC'; // Gris por defecto
    }

    // 1. Calcular el promedio de los valores mínimos y máximos de los umbrales
    const sumaValores = umbrales.umbrales.reduce((acc, umbral) => {
        return acc + umbral.valorMin + umbral.valorMax;
    }, 0);

    const promedio = sumaValores / (umbrales.umbrales.length * 2);

    // 2. Buscar el umbral que contiene el promedio
    const umbralPromedio = umbrales.umbrales.find(
        (u) => promedio >= u.valorMin && promedio <= u.valorMax
    );

    // 3. Si se encontró, devolver su color; si no, el del umbral más cercano
    if (umbralPromedio) {
        return umbralPromedio.color;
    } else {
        // Si el promedio está fuera de los rangos, encontrar el umbral más cercano
        const umbralCercano = umbrales.umbrales.reduce((prev, curr) => {
            const distanciaPrev = Math.abs(promedio - (prev.valorMin + prev.valorMax) / 2);
            const distanciaCurr = Math.abs(promedio - (curr.valorMin + curr.valorMax) / 2);
            return distanciaPrev < distanciaCurr ? prev : curr;
        });

        return umbralCercano.color;
    }
};

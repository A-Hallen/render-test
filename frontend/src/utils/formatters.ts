/**
 * Formatea un número como moneda en formato USD
 * @param value Valor numérico a formatear
 * @returns Cadena formateada como moneda
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formatea un porcentaje con el signo y precisión especificada
 * @param value Valor numérico a formatear
 * @param precision Número de decimales (por defecto 1)
 * @returns Cadena formateada como porcentaje
 */
export const formatPercentage = (value: number, precision: number = 1): string => {
  const formattedValue = value.toFixed(precision);
  return `${value >= 0 ? '+' : ''}${formattedValue}%`;
};

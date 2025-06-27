/**
 * Formatea un valor numérico como moneda en formato ecuatoriano
 * Usa espacio como separador de miles y coma como separador decimal
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    useGrouping: true,
    currencyDisplay: 'symbol',
  }).format(value).replace(/\./g, ' ');
};

/**
 * Formatea un porcentaje con 2 decimales
 */
export const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return '0.00';
  console.log("value", value);
  return Math.abs(parseFloat(value.toFixed(2))).toFixed(2);
};

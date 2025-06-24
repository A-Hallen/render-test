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

/**
 * Formatea una fecha en formato legible
 * @param fechaStr Fecha en formato string
 * @returns Fecha formateada
 */
export const formatearFecha = (fechaStr: string | null): string => {
  if (!fechaStr) return 'Nunca';
  
  try {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (err) {
    return fechaStr;
  }
};

/**
 * Formatea una duración en segundos a formato legible
 * @param segundos Duración en segundos
 * @returns Duración formateada
 */
export const formatearDuracion = (segundos: number): string => {
  if (segundos < 60) {
    return `${segundos} seg`;
  } else if (segundos < 3600) {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos} min ${segs} seg`;
  } else {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas} h ${minutos} min`;
  }
};

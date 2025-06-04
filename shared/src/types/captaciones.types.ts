/**
 * Tipos para el módulo de captaciones
 */

export interface Captacion {
  fecha: string;
  monto: number;
  fechaAnterior?: string;
  montoAnterior?: number;
  variacion?: number;
  variacionPorcentaje?: number;
  descripcionComparacion?: string;
  tipoCaptacion: 'vista' | 'plazo';
  codigoCuenta: string;
}

export interface CaptacionResponse {
  captacionActual: Captacion | null;
  mensaje?: string;
}

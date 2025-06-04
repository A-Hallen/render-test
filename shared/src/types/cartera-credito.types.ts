export interface CarteraCredito {
  fecha: string;
  monto: number;
  variacion?: number;
  variacionPorcentaje?: number;
  mensaje?: string; // Mensaje informativo opcional (ej: cuando no hay datos suficientes)
  fechaAnterior?: string; // Fecha del mes anterior para comparación
  montoAnterior?: number; // Monto del mes anterior para comparación
  descripcionComparacion?: string; // Descripción de la comparación (ej: "Mayo vs Abril 2025")
}

export interface CarteraCreditoResponse {
  carteraActual: CarteraCredito;
  mensaje?: string;
}

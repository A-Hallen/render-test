/**
 * Interfaz para los indicadores contables
 */
export interface IndicadorContable {
  id: string;
  nombre: string;
  descripcion: string;
  formula: string;
  color: string;
  unidad: string;
  formatoNumero: string;
  orden: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  umbrales?: {
    umbrales: Array<{
      valorMin: number;
      valorMax: number;
      color: string;
    }>;
  };
}

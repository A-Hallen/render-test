import { IndicadorContable } from "./interfaces/IndicadorContable.interface";

export class IndicadorContableModel implements IndicadorContable {
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
  
  constructor(data: Partial<IndicadorContable>) {
    this.id = data.id || '';
    this.nombre = data.nombre || '';
    this.descripcion = data.descripcion || '';
    this.formula = data.formula || '';
    this.color = data.color || '#000000';
    this.unidad = data.unidad || '';
    this.formatoNumero = data.formatoNumero || '0,0.00';
    this.orden = data.orden || 0;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaActualizacion = data.fechaActualizacion || new Date().toISOString();
  }
}

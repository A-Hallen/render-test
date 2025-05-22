import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../database/database.connection';
import { TABLA_REPORTES_CONTABILIDAD } from '../../../database/database.constants';

/**
 * Modelo para los reportes de contabilidad
 */
export class ReporteContabilidad extends Model {
  public id!: number;
  public fechaInicio!: string;
  public fechaFin!: string;
  public oficina!: string;
  public nombreConfiguracion!: string;
  public tipoReporte!: 'diario' | 'mensual';
  public categorias!: {
    nombre: string;
    cuentas: {
      codigo: number;
      nombre: string;
      valor: number;
    }[];
    total: number;
  }[];
  // Field removed or made optional to match the interface structure
  public esActivo!: boolean;
  public fechaCreacion!: Date;
  public fechaModificacion!: Date;
}

ReporteContabilidad.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    oficina: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    nombreConfiguracion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tipoReporte: {
      type: DataTypes.ENUM('diario', 'mensual'),
      allowNull: false,
      defaultValue: 'mensual',
    },
    categorias: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    esActivo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fechaModificacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ReporteContabilidad',
    tableName: TABLA_REPORTES_CONTABILIDAD,
    timestamps: false,
  }
);

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.connection';
import { TABLA_CONFIGURACIONES_REPORTES } from '../../database/database.constants';

/**
 * Modelo para representar una configuración de reporte
 * Este modelo define la estructura de una configuración de reporte, incluyendo sus categorías y estado.
 */
export class ConfiguracionReporte extends Model {
    public nombre!: string;
    public descripcion!: string | null;
    public categorias!: {
        nombre: string;
        cuentas: string[];
    }[];
    public esActivo!: boolean;
    public fechaCreacion!: Date;
    public fechaModificacion!: Date;

    /**
     * Valida que los datos del modelo sean correctos.
     * @returns {boolean} Verdadero si los datos son     válidos.
     */
    public esValido(): boolean {
        if (!this.nombre || this.nombre.trim() === '') {
            return false;
        }
        return true;
    }

    /**
     * Convierte el modelo a un objeto plano para almacenar en la base de datos.
     * @returns {Object} Objeto plano con los datos del modelo.
     */
    public toDbObject(): Record<string, any> {
        return {
            nombre: this.nombre,
            descripcion: this.descripcion,
            categorias: this.categorias,
            esActivo: this.esActivo,
            fechaCreacion: this.fechaCreacion,
            fechaModificacion: this.fechaModificacion
        };
    }
}

ConfiguracionReporte.init(
    {
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            field: 'nombre'
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'descripcion'
        },
        categorias: {
            type: DataTypes.JSON,
            allowNull: false,
            field: 'categorias'
        },
        esActivo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'esActivo'
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'fechaCreacion'
        },
        fechaModificacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'fechaModificacion'
        }
    },
    {
        sequelize,
        modelName: 'ConfiguracionReporte',
        tableName: TABLA_CONFIGURACIONES_REPORTES,
        timestamps: true,
        createdAt: 'fechaCreacion',
        updatedAt: 'fechaModificacion',
    }
);
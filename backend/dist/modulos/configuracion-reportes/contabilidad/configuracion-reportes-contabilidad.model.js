"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionReporteContabilidad = void 0;
const sequelize_1 = require("sequelize");
const database_connection_1 = require("../../../database/database.connection");
const database_constants_1 = require("../../../database/database.constants");
/**
 * Modelo para representar una configuración de reporte de contabilidad
 * Este modelo define la estructura de una configuración de reporte de contabilidad, incluyendo sus categorías y estado.
 */
class ConfiguracionReporteContabilidad extends sequelize_1.Model {
    /**
     * Valida que los datos del modelo sean correctos.
     * @returns {boolean} Verdadero si los datos son válidos.
     */
    esValido() {
        if (!this.nombre || this.nombre.trim() === '') {
            return false;
        }
        return true;
    }
    /**
     * Convierte el modelo a un objeto plano para almacenar en la base de datos.
     * @returns {Object} Objeto plano con los datos del modelo.
     */
    toDbObject() {
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
exports.ConfiguracionReporteContabilidad = ConfiguracionReporteContabilidad;
ConfiguracionReporteContabilidad.init({
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        field: 'nombre'
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        field: 'descripcion'
    },
    categorias: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        field: 'categorias'
    },
    esActivo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'esActivo'
    },
    fechaCreacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: 'fechaCreacion'
    },
    fechaModificacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: 'fechaModificacion'
    }
}, {
    sequelize: database_connection_1.sequelize,
    modelName: 'ConfiguracionReporteContabilidad',
    tableName: database_constants_1.TABLA_CONFIGURACIONES_REPORTES,
    timestamps: true,
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaModificacion',
});

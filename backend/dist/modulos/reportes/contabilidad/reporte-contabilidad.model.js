"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteContabilidad = void 0;
const sequelize_1 = require("sequelize");
const database_connection_1 = require("../../../database/database.connection");
const database_constants_1 = require("../../../database/database.constants");
/**
 * Modelo para los reportes de contabilidad
 */
class ReporteContabilidad extends sequelize_1.Model {
}
exports.ReporteContabilidad = ReporteContabilidad;
ReporteContabilidad.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fechaInicio: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    fechaFin: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    oficina: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    nombreConfiguracion: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    tipoReporte: {
        type: sequelize_1.DataTypes.ENUM('diario', 'mensual'),
        allowNull: false,
        defaultValue: 'mensual',
    },
    categorias: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    esActivo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    fechaCreacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    fechaModificacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_connection_1.sequelize,
    modelName: 'ReporteContabilidad',
    tableName: database_constants_1.TABLA_REPORTES_CONTABILIDAD,
    timestamps: false,
});

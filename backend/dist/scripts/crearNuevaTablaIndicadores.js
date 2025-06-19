"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearTablaIndicadoresFinancieros = void 0;
const sequelize_1 = require("sequelize");
const database_connection_1 = require("../database/database.connection");
const database_constants_1 = require("../database/database.constants");
const crearTablaIndicadoresFinancieros = async () => {
    const sequelize = (0, database_connection_1.getSequelize)();
    const queryInterface = sequelize.getQueryInterface();
    try {
        console.log(`[Script] Verificando si la tabla ${database_constants_1.TABLA_INDICADORES_FINANCIEROS} existe...`);
        const tablasExistentes = await queryInterface.showAllTables();
        console.log(`[Script] Tablas existentes: ${tablasExistentes.join(', ')}`);
        if (tablasExistentes.includes(database_constants_1.TABLA_INDICADORES_FINANCIEROS)) {
            console.log(`[Script] La tabla ${database_constants_1.TABLA_INDICADORES_FINANCIEROS} ya existe. No se realizará ninguna acción.`);
            return;
        }
        console.log(`[Script] Creando tabla: ${database_constants_1.TABLA_INDICADORES_FINANCIEROS}`);
        await queryInterface.createTable(database_constants_1.TABLA_INDICADORES_FINANCIEROS, {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombre: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            descripcion: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            meta: {
                type: sequelize_1.DataTypes.DECIMAL,
                allowNull: false,
                defaultValue: 0.0,
            },
            mayorEsMejor: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'mayor_es_mejor',
            },
            estaActivo: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'esta_activo',
            },
            umbrales: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false,
                defaultValue: {
                    umbrales: [
                        {
                            color: '#28a745',
                            nivel: 'excelente',
                            valorMax: 0,
                            valorMin: 0,
                            descripcion: 'Rendimiento excelente',
                        },
                        {
                            color: '#20c997',
                            nivel: 'bueno',
                            valorMax: 0,
                            valorMin: 0,
                            descripcion: 'Rendimiento bueno',
                        },
                        {
                            color: '#ffc107',
                            nivel: 'aceptable',
                            valorMax: 0,
                            valorMin: 0,
                            descripcion: 'Rendimiento aceptable',
                        },
                        {
                            color: '#fd7e14',
                            nivel: 'deficiente',
                            valorMax: 0,
                            valorMin: 0,
                            descripcion: 'Rendimiento deficiente',
                        },
                        {
                            color: '#dc3545',
                            nivel: 'critico',
                            valorMax: 0,
                            valorMin: 0,
                            descripcion: 'Rendimiento crítico',
                        },
                    ],
                    configuracion: {
                        decimales: 2,
                        invertido: false,
                        mostrarTendencia: true,
                        formatoVisualizacion: 'porcentaje',
                    },
                    alerta: 0.0,
                    advertencia: 0.0,
                },
            },
            estaEnPantallaInicial: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'esta_en_pantalla_principal',
            },
            ordenMuestra: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'orden_muestra',
            },
            numerador: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false,
            },
            denominador: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false,
            },
            numeradorAbsoluto: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'numerador_absoluto',
            },
            denominadorAbsoluto: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'denominador_absoluto',
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
            },
        });
        console.log(`[Script] Tabla ${database_constants_1.TABLA_INDICADORES_FINANCIEROS} creada exitosamente.`);
    }
    catch (error) {
        console.error(`[Script] Error al crear la tabla ${database_constants_1.TABLA_INDICADORES_FINANCIEROS}:`, error);
    }
    finally {
        await sequelize.close();
    }
};
exports.crearTablaIndicadoresFinancieros = crearTablaIndicadoresFinancieros;
(0, exports.crearTablaIndicadoresFinancieros)();

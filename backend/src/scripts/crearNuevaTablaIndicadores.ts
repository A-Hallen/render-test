import { DataTypes, QueryInterface } from 'sequelize';
import { getSequelize } from '../database/database.connection';
import { TABLA_INDICADORES_FINANCIEROS } from '../database/database.constants';

export const crearTablaIndicadoresFinancieros = async () => {
    const sequelize = getSequelize();
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    try {
        console.log(`[Script] Verificando si la tabla ${TABLA_INDICADORES_FINANCIEROS} existe...`);

        const tablasExistentes = await queryInterface.showAllTables();
        console.log(`[Script] Tablas existentes: ${tablasExistentes.join(', ')}`);
        if (tablasExistentes.includes(TABLA_INDICADORES_FINANCIEROS)) {
            console.log(`[Script] La tabla ${TABLA_INDICADORES_FINANCIEROS} ya existe. No se realizará ninguna acción.`);
            return;
        }

        console.log(`[Script] Creando tabla: ${TABLA_INDICADORES_FINANCIEROS}`);

        await queryInterface.createTable(TABLA_INDICADORES_FINANCIEROS, {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombre: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            descripcion: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            meta: {
                type: DataTypes.DECIMAL,
                allowNull: false,
                defaultValue: 0.0,
            },
            mayorEsMejor: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'mayor_es_mejor',
            },
            estaActivo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'esta_activo',
            },
            umbrales: {
                type: DataTypes.JSON,
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
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'esta_en_pantalla_principal',
            },
            ordenMuestra: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'orden_muestra',
            },
            numerador: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            denominador: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            numeradorAbsoluto: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'numerador_absoluto',
            },
            denominadorAbsoluto: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'denominador_absoluto',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
            },
        });

        console.log(`[Script] Tabla ${TABLA_INDICADORES_FINANCIEROS} creada exitosamente.`);
    } catch (error) {
        console.error(`[Script] Error al crear la tabla ${TABLA_INDICADORES_FINANCIEROS}:`, error);
    } finally {
        await sequelize.close();
    }
};

crearTablaIndicadoresFinancieros();
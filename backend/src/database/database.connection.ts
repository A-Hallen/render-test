/**
 * Configuración de la conexión a la base de datos
 */
import { Sequelize } from 'sequelize';

require('custom-env').env()



let sequelizeInstance: Sequelize | null = null;

/**
 * Obtiene una instancia de Sequelize para conectar a la base de datos
 * @returns {Sequelize} Instancia de Sequelize
 */
export const getSequelize = (): Sequelize => {
    if (sequelizeInstance) {
        return sequelizeInstance;
    }

console.log(process.env);

    const dbName = process.env.DB_NAME as string;
    const dbUser = process.env.DB_USER as string;
    const dbPassword = process.env.DB_PASSWORD as string;
    const dbHost = process.env.DB_HOST as string;
    const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
    const dialect = (process.env.SQL_DIALECT || 'mysql') as any;
    
    console.log('[Database] Creando conexión a la base de datos');
    console.log(`[Database] DB_NAME: ${dbName}`);
    console.log(`[Database] DB_USER: ${dbUser}`);
    console.log(`[Database] DB_HOST: ${dbHost}`);
    console.log(`[Database] DB_PORT: ${dbPort}`);
    console.log(`[Database] SQL_DIALECT: ${dialect}`);

    sequelizeInstance = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: dialect,
        logging: false, // Desactivar logs de SQL
        define: {
            timestamps: false, // No usar timestamps por defecto
            freezeTableName: true, // No pluralizar nombres de tablas
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: {
            // Opciones específicas para MySQL
            multipleStatements: true, // Permitir múltiples declaraciones en una sola consulta
        },
    });

    return sequelizeInstance;
};

/**
 * Prueba la conexión a la base de datos
 * @returns {Promise<boolean>} True si la conexión es exitosa
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        const sequelize = getSequelize();
        await sequelize.authenticate();
        console.log('[Database] Conexión establecida correctamente');
        return true;
    } catch (error) {
        console.error('[Database] Error al conectar a la base de datos:', error);
        return false;
    }
};

// Exportar la instancia de Sequelize para uso directo
export const sequelize = getSequelize();
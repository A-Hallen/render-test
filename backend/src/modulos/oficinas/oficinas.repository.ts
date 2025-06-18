import { BaseFirebaseRepository } from '../../base/base.firebaseRepository';
import { Oficina } from './oficinas.model';

export class OficinasRepository extends BaseFirebaseRepository<Oficina> {
    
    constructor() {
        super('oficinas');
    }

    /**
     * Método mantenido para compatibilidad con código existente
     * Obtiene todas las oficinas desde Firebase
     */
    async obtenerTodas(): Promise<Oficina[]> {
        return this.obtenerTodos();
    }
    
    /**
     * Método legacy para obtener oficinas desde SQL
     * @deprecated Use obtenerTodas() instead
     */
    // async obtenerTodasDesdeSQL(): Promise<Oficina[]> {
    //     const query = `SELECT D.CODIGO codigo, D.NOMBRE as nombre 
    //             FROM \`${TABLA_DIVISION}\` D 
    //             INNER JOIN \`${TABLA_OFICINA}\` O ON O.SECUENCIALDIVISION = D.SECUENCIAL
    //             UNION
    //             SELECT D.CODIGO codigo, D.NOMBRE as nombre 
    //             FROM \`${TABLA_DIVISION}\` D
    //             WHERE D.NOMBRE = 'Consolidado'
    //             ORDER BY nombre ASC`;
    //     const [results] = await this.sequelize.query(query);
    //     return results as Oficina[];
    // }
}

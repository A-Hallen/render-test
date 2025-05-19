import { BaseRepository } from '../../base/base.repository';
import { Oficina } from './oficinas.model';
import { getSequelize } from '../../database/database.connection';
import { TABLA_DIVISION, TABLA_OFICINA } from '../../database/database.constants';

export class OficinasRepository {
    private sequelize = getSequelize(); 

    async obtenerTodas(): Promise<Oficina[]> {
        const query = `SELECT D.CODIGO codigo, D.NOMBRE as nombre 
                FROM \`${TABLA_DIVISION}\` D 
                INNER JOIN \`${TABLA_OFICINA}\` O ON O.SECUENCIALDIVISION = D.SECUENCIAL
                UNION
                SELECT D.CODIGO codigo, D.NOMBRE as nombre 
                FROM \`${TABLA_DIVISION}\` D
                WHERE D.NOMBRE = 'Consolidado'
                ORDER BY nombre ASC`;
        const [results] = await this.sequelize.query(query);
        return results as Oficina[];
    }
}

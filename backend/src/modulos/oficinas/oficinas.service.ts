import { OficinasRepository } from './oficinas.repository';
import {ObtenerOficinasResponse} from 'shared/src/types/oficinas.types'

export class OficinaService {
    private oficinasRepository: OficinasRepository;

    constructor() {
        this.oficinasRepository = new OficinasRepository();
    }

    async obtenerTodas(): Promise<ObtenerOficinasResponse> {
        const oficinas = await this.oficinasRepository.obtenerTodas();
        return {
            oficinas: oficinas
        }
    }
}

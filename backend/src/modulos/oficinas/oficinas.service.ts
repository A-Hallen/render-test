import { Oficina } from './oficinas.model';
import { OficinasRepository } from './oficinas.repository';

// Definimos localmente las interfaces necesarias para evitar problemas de importación
interface OficinasDTO {
    nombre: string;
    codigo: string;
}

interface ObtenerOficinasResponse {
    oficinas: OficinasDTO[];
}

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

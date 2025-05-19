import { IndicadorContable } from './interfaces/IndicadorContable.interface';
import { IndicadoresContablesRepository } from './indicadores-contables.repository';

export class IndicadoresContablesService {
    private indicadoresContablesRepository: IndicadoresContablesRepository;

    constructor() {
        this.indicadoresContablesRepository = new IndicadoresContablesRepository();
    }

    // Obtener todos los indicadores contables
    async obtenerTodos(): Promise<IndicadorContable[]> {
        console.log('[service] Obteniendo todos los indicadores contables...');
        const indicadores = await this.indicadoresContablesRepository.obtenerTodos();
        return indicadores;
    }

    // Obtener un indicador contable por ID
    async obtenerPorId(id: string): Promise<IndicadorContable | null> {
        return await this.indicadoresContablesRepository.obtenerPorId(id);
    }

    // Crear un nuevo indicador contable
    async crear(indicador: IndicadorContable): Promise<IndicadorContable> {
        return await this.indicadoresContablesRepository.crear(indicador);
    }

    // Actualizar un indicador contable existente
    async actualizar(id: string, datosActualizados: IndicadorContable): Promise<IndicadorContable | null> {
        return await this.indicadoresContablesRepository.actualizar(id, datosActualizados);
    }

    // Eliminar un indicador contable
    async eliminar(id: string): Promise<boolean> {
        return await this.indicadoresContablesRepository.eliminar(id);
    }
}

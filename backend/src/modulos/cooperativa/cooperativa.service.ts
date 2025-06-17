import { CooperativaRepository } from './cooperativa.repository';
import { CooperativaDTO } from 'shared/src/types/cooperativa.types';

export class CooperativaService {
  private static instance: CooperativaService;
  private repository: CooperativaRepository;

  private constructor() {
    this.repository = CooperativaRepository.getInstance();
  }

  public static getInstance(): CooperativaService {
    if (!CooperativaService.instance) {
      CooperativaService.instance = new CooperativaService();
    }
    return CooperativaService.instance;
  }

  /**
   * Obtiene la información de la cooperativa
   */
  async obtenerCooperativa(): Promise<CooperativaDTO | null> {
    return await this.repository.obtenerCooperativa();
  }

  /**
   * Actualiza la información de la cooperativa
   * @param data Datos a actualizar
   */
  async actualizarCooperativa(data: Partial<CooperativaDTO>): Promise<CooperativaDTO> {
    return await this.repository.actualizarCooperativa(data);
  }

  /**
   * Crea la información de la cooperativa
   * @param data Datos a crear
   */
  async crearCooperativa(data: CooperativaDTO): Promise<CooperativaDTO> {
    return await this.repository.crear(data);
  }
}

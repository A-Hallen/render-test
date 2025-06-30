import { CuentasContablesRepository } from './cuentas-contables.repository';
import { CuentaData } from 'shared/src/types/reportes.types';

export class CuentasContablesService {
  private repository: CuentasContablesRepository;

  constructor() {
    this.repository = CuentasContablesRepository.getInstance();
  }

  /**
   * Obtiene todas las cuentas contables activas
   */
  async obtenerCuentas(): Promise<CuentaData[]> {
    return this.repository.obtenerCuentas();
  }

  /**
   * Obtiene cuentas contables específicas por sus códigos
   * @param codigos Array de códigos de cuenta a buscar
   */
  async obtenerCuentasPorCodigos(codigos: string[]): Promise<CuentaData[]> {
    return this.repository.obtenerCuentasPorCodigos(codigos);
  }
}

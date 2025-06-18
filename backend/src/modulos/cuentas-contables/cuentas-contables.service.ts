import { CuentasContablesRepository } from './cuentas-contables.repository';
import { CuentaData } from 'shared/src/types/reportes.types';

/**
 * Servicio para gestionar las cuentas contables
 * Proporciona una capa de abstracción sobre el repositorio
 */
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

  /**
   * Crea una nueva cuenta contable
   * @param cuenta Datos de la cuenta a crear
   */
  async crearCuenta(cuenta: { codigo: number; nombre: string }): Promise<CuentaData> {
    return this.repository.crearCuenta(cuenta);
  }

  /**
   * Actualiza una cuenta contable existente
   * @param codigo Código de la cuenta a actualizar
   * @param datos Nuevos datos para la cuenta
   */
  async actualizarCuenta(codigo: number, datos: { nombre?: string; estaActiva?: boolean }): Promise<CuentaData | null> {
    return this.repository.actualizarCuenta(codigo, datos);
  }

  /**
   * Elimina una cuenta contable (marcándola como inactiva)
   * @param codigo Código de la cuenta a eliminar
   */
  async eliminarCuenta(codigo: number): Promise<boolean> {
    return this.repository.eliminarCuenta(codigo);
  }
}

/**
 * Servicio de autorizaciu00f3n basado en CASL
 * Implementa el control de acceso basado en roles (RBAC)
 */

import { AbilityBuilder, Ability, AbilityClass } from '@casl/ability';
import { DatoFinanciero } from '../features/visualizacion/modelo/DatoFinanciero';

// Definir tipos de acciones
export enum Accion {
  CREAR = 'crear',
  LEER = 'leer',
  ACTUALIZAR = 'actualizar',
  ELIMINAR = 'eliminar',
  GESTIONAR = 'gestionar'
}

// Definir tipos de roles
export enum Rol {
  ADMINISTRADOR = 'administrador',
  GERENTE_GENERAL = 'gerente_general',
  GERENTE_OFICINA = 'gerente_oficina',
  ANALISTA = 'analista'
}

// Definir tipo para usuario
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  oficinaId?: string;
  permisos?: string[];
}

// Definir tipo para las habilidades
type AppSubjects = 'all' | 'DatoFinanciero' | { type: 'DatoFinanciero', [key: string]: any };
type Habilidades = [Accion, AppSubjects];
type AppAbility = Ability<Habilidades>;
const AppAbility = Ability as AbilityClass<AppAbility>;

/**
 * Servicio de autorizaciu00f3n que gestiona los permisos basados en roles
 */
export class AutorizacionService {
  private ability: AppAbility;
  private usuario: Usuario | null = null;
  
  constructor() {
    this.ability = this.definirHabilidades(null);
  }
  
  /**
   * Define las habilidades del usuario segu00fan su rol
   */
  definirHabilidades(usuario: Usuario | null): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);
    
    if (!usuario) {
      // Usuario no autenticado
      cannot(Accion.GESTIONAR, 'all');
      return build();
    }
    
    // Asignar permisos segu00fan el rol
    switch (usuario.rol) {
      case Rol.ADMINISTRADOR:
        // Administrador puede hacer todo
        can(Accion.GESTIONAR, 'all');
        break;
        
      case Rol.GERENTE_GENERAL:
        // Gerente general puede ver todo y gestionar algunos datos
        can(Accion.LEER, 'all');
        can([Accion.CREAR, Accion.ACTUALIZAR], 'DatoFinanciero');
        cannot(Accion.ELIMINAR, 'DatoFinanciero');
        break;
        
      case Rol.GERENTE_OFICINA:
        // Gerente de oficina solo puede ver y gestionar datos de su oficina
        can(Accion.LEER, 'DatoFinanciero', { 'dimensiones.oficina': usuario.oficinaId });
        can([Accion.CREAR, Accion.ACTUALIZAR], 'DatoFinanciero', { 'dimensiones.oficina': usuario.oficinaId });
        cannot(Accion.ELIMINAR, 'DatoFinanciero');
        break;
        
      case Rol.ANALISTA:
        // Analista solo puede ver datos
        can(Accion.LEER, 'DatoFinanciero');
        if (usuario.oficinaId) {
          // Si tiene oficina asignada, solo ve datos de esa oficina
          cannot(Accion.LEER, 'DatoFinanciero', { 'dimensiones.oficina': { $ne: usuario.oficinaId } });
        }
        cannot([Accion.CREAR, Accion.ACTUALIZAR, Accion.ELIMINAR], 'DatoFinanciero');
        break;
        
      default:
        // Por defecto, no puede hacer nada
        cannot(Accion.GESTIONAR, 'all');
    }
    
    // Aplicar permisos adicionales si existen
    if (usuario.permisos) {
      // Implementar lu00f3gica para permisos personalizados
    }
    
    return build();
  }
  
  /**
   * Establece el usuario actual y actualiza las habilidades
   */
  setUsuario(usuario: Usuario | null) {
    this.usuario = usuario;
    this.ability = this.definirHabilidades(usuario);
  }
  
  /**
   * Obtiene el usuario actual
   */
  getUsuario(): Usuario | null {
    return this.usuario;
  }
  
  /**
   * Verifica si el usuario puede realizar una acciu00f3n sobre un sujeto
   */
  puede(accion: Accion, sujeto: string | { type: string, [key: string]: any }): boolean {
    if (typeof sujeto === 'string') {
      return this.ability.can(accion, sujeto as AppSubjects);
    } else {
      const tipoSujeto = { ...sujeto, type: sujeto.type as 'DatoFinanciero' };
      return this.ability.can(accion, tipoSujeto as AppSubjects);
    }
  }
  
  /**
   * Filtra una lista de datos segu00fan los permisos del usuario
   */
  filtrarDatosPermitidos(datos: DatoFinanciero[]): DatoFinanciero[] {
    if (!this.usuario) return [];
    
    return datos.filter(dato => {
      // Convertir el dato a un objeto con type para que CASL lo reconozca correctamente
      const subject = { ...dato, type: 'DatoFinanciero' as const };
      return this.ability.can(Accion.LEER, subject as AppSubjects);
    });
  }
}

// Exportar una instancia del servicio para uso global
export const autorizacionService = new AutorizacionService();

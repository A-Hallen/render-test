import { BaseFirebaseRepository } from '../../base/base.firebaseRepository';
import { CooperativaDTO } from 'shared/src/types/cooperativa.types';

export class CooperativaRepository extends BaseFirebaseRepository<CooperativaDTO> {
  private static instance: CooperativaRepository;

  private constructor() {
    super('cooperativa');
  }

  public static getInstance(): CooperativaRepository {
    if (!CooperativaRepository.instance) {
      CooperativaRepository.instance = new CooperativaRepository();
    }
    return CooperativaRepository.instance;
  }

  /**
   * Obtiene la información de la cooperativa.
   * Como solo existe una cooperativa, devolvemos el primer documento de la colección.
   */
  async obtenerCooperativa(): Promise<CooperativaDTO | null> {
    try {
      const snapshot = await this.collection.limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = doc.data() as Omit<CooperativaDTO, 'id'>;
      
      // Asegurarnos de que el ID es correcto y que todos los campos requeridos existen
      // con valores predeterminados si es necesario
      const cooperativa: CooperativaDTO = {
        ...data,  // Primero copiamos todos los datos existentes
        id: doc.id, // Luego aseguramos que el ID es correcto
        // Establecemos valores predeterminados para campos obligatorios si no existen
        nombre: data.nombre || '',
        ruc: data.ruc || '',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        email: data.email || '',
        zonaHoraria: data.zonaHoraria || '',
        formatoFecha: data.formatoFecha || '',
        idioma: data.idioma || ''
      };
      
      console.log('Cooperativa obtenida:', cooperativa);
      return cooperativa;
    } catch (error) {
      console.error('Error al obtener la cooperativa:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información de la cooperativa.
   * Si no existe, la crea.
   */
  async actualizarCooperativa(data: Partial<CooperativaDTO>): Promise<CooperativaDTO> {
    try {
      // Verificar si ya existe una cooperativa
      const cooperativaExistente = await this.obtenerCooperativa();
      
      if (cooperativaExistente) {
        // Actualizar la cooperativa existente
        const updatedData = {
          ...data,
          updatedAt: Date.now()
        };
        
        // Verificar si el documento existe antes de actualizarlo
        const docRef = this.collection.doc(cooperativaExistente.id);
        const docSnapshot = await docRef.get();
        
        if (!docSnapshot.exists) {
          console.log(`El documento con ID ${cooperativaExistente.id} no existe. Creando uno nuevo.`);
          // Si el documento no existe, crear uno nuevo
          await docRef.set({
            ...cooperativaExistente,
            ...updatedData
          });
        } else {
          // Si el documento existe, actualizarlo
          await docRef.update(updatedData);
        }
        
        return {
          ...cooperativaExistente,
          ...updatedData
        } as CooperativaDTO;
      } else {
        // Crear una nueva cooperativa
        const newData = {
          ...data,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        const docRef = this.collection.doc();
        await docRef.set(newData);
        
        return {
          id: docRef.id,
          ...newData
        } as CooperativaDTO;
      }
    } catch (error) {
      console.error('Error al actualizar la cooperativa:', error);
      throw error;
    }
  }
}

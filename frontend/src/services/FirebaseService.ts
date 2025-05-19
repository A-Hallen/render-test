/**
 * Servicio para la gestión de datos financieros en Firebase
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { DatoFinanciero } from '../features/visualizacion/modelo/DatoFinanciero';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDjw_g1kQZAofU-DOsdsCjgkf3_06R2UEk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ais-asistente.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ais-asistente',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ais-asistente.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '100878286150069711628',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:100878286150069711628:web:5881666b40a94302955807'
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Servicio para gestionar datos financieros en Firebase
 */
export class FirebaseService {
  private datosCollection = collection(db, 'datos_financieros');
  
  /**
   * Obtiene todos los datos financieros
   */
  async obtenerDatosFinancieros(): Promise<DatoFinanciero[]> {
    try {
      const snapshot = await getDocs(this.datosCollection);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tipo: data.tipo,
          fuente: data.fuente,
          fecha: data.fecha.toDate(),
          dimensiones: data.dimensiones,
          metricas: data.metricas,
          atributos: data.atributos
        } as DatoFinanciero;
      });
    } catch (error) {
      console.error('Error al obtener datos financieros:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene datos financieros filtrados por tipo
   */
  async obtenerDatosPorTipo(tipo: string): Promise<DatoFinanciero[]> {
    try {
      const q = query(this.datosCollection, where('tipo', '==', tipo));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tipo: data.tipo,
          fuente: data.fuente,
          fecha: data.fecha.toDate(),
          dimensiones: data.dimensiones,
          metricas: data.metricas,
          atributos: data.atributos
        } as DatoFinanciero;
      });
    } catch (error) {
      console.error(`Error al obtener datos de tipo ${tipo}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene datos financieros filtrados por oficina
   */
  async obtenerDatosPorOficina(oficinaId: string): Promise<DatoFinanciero[]> {
    try {
      const q = query(this.datosCollection, where('dimensiones.oficina', '==', oficinaId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tipo: data.tipo,
          fuente: data.fuente,
          fecha: data.fecha.toDate(),
          dimensiones: data.dimensiones,
          metricas: data.metricas,
          atributos: data.atributos
        } as DatoFinanciero;
      });
    } catch (error) {
      console.error(`Error al obtener datos de la oficina ${oficinaId}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene indicadores financieros aplicando múltiples filtros
   * @param filtros Objeto con los filtros a aplicar
   */
  async obtenerIndicadoresFinancieros(filtros: {
    modulo?: string;
    oficina?: string;
    producto?: string;
    periodo?: string;
  }): Promise<DatoFinanciero[]> {
    try {
      let q = query(this.datosCollection);
      
      // Aplicar filtros si están definidos
      if (filtros.modulo) {
        q = query(q, where('dimensiones.modulo', '==', filtros.modulo));
      }
      
      if (filtros.oficina) {
        q = query(q, where('dimensiones.oficina', '==', filtros.oficina));
      }
      
      if (filtros.producto) {
        q = query(q, where('dimensiones.producto', '==', filtros.producto));
      }
      
      // Filtrar por período (últimos X meses/año)
      if (filtros.periodo) {
        const fechaLimite = new Date();
        switch (filtros.periodo) {
          case '1m':
            fechaLimite.setMonth(fechaLimite.getMonth() - 1);
            break;
          case '3m':
            fechaLimite.setMonth(fechaLimite.getMonth() - 3);
            break;
          case '6m':
            fechaLimite.setMonth(fechaLimite.getMonth() - 6);
            break;
          case '1y':
            fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
            break;
        }
        
        q = query(q, where('fecha', '>=', fechaLimite));
      }
      
      // Ordenar por fecha descendente y limitar resultados
      q = query(q, orderBy('fecha', 'desc'), limit(100));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tipo: data.tipo,
          fuente: data.fuente,
          fecha: data.fecha.toDate(),
          dimensiones: data.dimensiones,
          metricas: data.metricas,
          atributos: data.atributos
        } as DatoFinanciero;
      });
    } catch (error) {
      console.error('Error al obtener indicadores financieros con filtros:', error);
      throw error;
    }
  }
  
  /**
   * Guarda un dato financiero en Firebase
   */
  async guardarDatoFinanciero(dato: DatoFinanciero): Promise<string> {
    try {
      const docRef = await addDoc(this.datosCollection, {
        tipo: dato.tipo,
        fuente: dato.fuente,
        fecha: dato.fecha,
        dimensiones: dato.dimensiones,
        metricas: dato.metricas,
        atributos: dato.atributos || {}
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al guardar dato financiero:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un dato financiero existente
   */
  async actualizarDatoFinanciero(id: string, dato: Partial<DatoFinanciero>): Promise<void> {
    try {
      const docRef = doc(this.datosCollection, id);
      await updateDoc(docRef, dato as any);
    } catch (error) {
      console.error(`Error al actualizar dato financiero ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Elimina un dato financiero
   */
  async eliminarDatoFinanciero(id: string): Promise<void> {
    try {
      const docRef = doc(this.datosCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error al eliminar dato financiero ${id}:`, error);
      throw error;
    }
  }
}

// Exportar una instancia del servicio para uso global
export const firebaseService = new FirebaseService();

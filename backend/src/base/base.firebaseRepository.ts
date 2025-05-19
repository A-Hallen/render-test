import { DocumentSnapshot } from '@google-cloud/firestore';
import { CollectionReference, DocumentData } from '@google-cloud/firestore';
import { firestore } from '../config/firebase.config';

export abstract class BaseFirebaseRepository<T extends DocumentData> {
    protected collection: CollectionReference;

    constructor(collectionName: string) {
        this.collection = firestore.collection(collectionName);
    }

    async obtenerTodos(): Promise<T[]> {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => doc.data() as T);
    }

    async obtenerPorId(id: string): Promise<T | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        return doc.exists ? doc.data() as T : null;
    }

    async crear(data: Partial<T>): Promise<T> {
        const docRef = this.collection.doc();
        await docRef.set(data);
        return data as T;
    }

    async actualizar(id: string, data: Partial<T>): Promise<T | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return null;
        }
        
        await docRef.update(data);
        return { ...doc.data(), ...data } as T;
    }

    async eliminar(id: string): Promise<boolean> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return false;
        }
        
        await docRef.delete();
        return true;
    }

    // Método adicional para obtener documentos con filtros
    async obtenerConFiltros(query: any): Promise<T[]> {
        const snapshot = await query.get();
        return snapshot.docs.map((doc: DocumentSnapshot<T>) => doc.data());
    }
}
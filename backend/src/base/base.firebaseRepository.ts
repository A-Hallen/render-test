import { DocumentSnapshot } from '@google-cloud/firestore';
import { CollectionReference } from '@google-cloud/firestore';
import { firestore } from '../config/firebase.config';

export abstract class BaseFirebaseRepository<Object> {
    protected collection: CollectionReference;

    constructor(collectionName: string) {
        this.collection = firestore.collection(collectionName);
    }

    async obtenerTodos(): Promise<Object[]> {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => doc.data() as Object);
    }

    async obtenerPorId(id: string): Promise<Object | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        return doc.exists ? doc.data() as Object : null;
    }

    async crear(data: Partial<Object>): Promise<Object> {
        const docRef = this.collection.doc();
        await docRef.set(data);
        return data as Object;
    }

    async actualizar(id: string, data: Partial<Object>): Promise<Object | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return null;
        }
        
        await docRef.update(data);
        return { ...doc.data(), ...data } as Object;
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
    async obtenerConFiltros(query: any): Promise<Object[]> {
        const snapshot = await query.get();
        return snapshot.docs.map((doc: DocumentSnapshot<Object>) => doc.data());
    }
}
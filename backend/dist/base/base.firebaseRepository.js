"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseFirebaseRepository = void 0;
const firebase_config_1 = require("../config/firebase.config");
class BaseFirebaseRepository {
    constructor(collectionName) {
        this.collection = firebase_config_1.firestore.collection(collectionName);
    }
    async obtenerTodos() {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => doc.data());
    }
    async obtenerPorId(id) {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        return doc.exists ? doc.data() : null;
    }
    async crear(data) {
        const docRef = this.collection.doc();
        await docRef.set(data);
        return data;
    }
    async actualizar(id, data) {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }
        await docRef.update(data);
        return { ...doc.data(), ...data };
    }
    async eliminar(id) {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return false;
        }
        await docRef.delete();
        return true;
    }
    // Método adicional para obtener documentos con filtros
    async obtenerConFiltros(query) {
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => doc.data());
    }
}
exports.BaseFirebaseRepository = BaseFirebaseRepository;

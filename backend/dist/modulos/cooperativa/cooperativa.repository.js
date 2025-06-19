"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CooperativaRepository = void 0;
const base_firebaseRepository_1 = require("../../base/base.firebaseRepository");
class CooperativaRepository extends base_firebaseRepository_1.BaseFirebaseRepository {
    constructor() {
        super('cooperativa');
    }
    static getInstance() {
        if (!CooperativaRepository.instance) {
            CooperativaRepository.instance = new CooperativaRepository();
        }
        return CooperativaRepository.instance;
    }
    /**
     * Obtiene la información de la cooperativa.
     * Como solo existe una cooperativa, devolvemos el primer documento de la colección.
     */
    async obtenerCooperativa() {
        try {
            const snapshot = await this.collection.limit(1).get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            const data = doc.data();
            // Asegurarnos de que el ID es correcto y que todos los campos requeridos existen
            // con valores predeterminados si es necesario
            const cooperativa = {
                ...data, // Primero copiamos todos los datos existentes
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
        }
        catch (error) {
            console.error('Error al obtener la cooperativa:', error);
            throw error;
        }
    }
    /**
     * Actualiza la información de la cooperativa.
     * Si no existe, la crea.
     */
    async actualizarCooperativa(data) {
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
                }
                else {
                    // Si el documento existe, actualizarlo
                    await docRef.update(updatedData);
                }
                return {
                    ...cooperativaExistente,
                    ...updatedData
                };
            }
            else {
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
                };
            }
        }
        catch (error) {
            console.error('Error al actualizar la cooperativa:', error);
            throw error;
        }
    }
}
exports.CooperativaRepository = CooperativaRepository;

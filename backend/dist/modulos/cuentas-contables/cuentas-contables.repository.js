"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuentasContablesRepository = void 0;
const base_firebaseRepository_1 = require("../../base/base.firebaseRepository");
/**
 * Repositorio para gestionar las cuentas contables en Firebase
 * Reemplaza las consultas a las tablas TABLA_DIVISION y TABLA_CUENTACONTABLE
 */
class CuentasContablesRepository extends base_firebaseRepository_1.BaseFirebaseRepository {
    constructor() {
        super('CuentasContables');
    }
    /**
     * Implementa el patrón Singleton para asegurar una sola instancia
     */
    static getInstance() {
        if (!CuentasContablesRepository.instance) {
            CuentasContablesRepository.instance = new CuentasContablesRepository();
        }
        return CuentasContablesRepository.instance;
    }
    /**
     * Obtiene todas las cuentas contables activas
     * Reemplaza la consulta SQL que unía TABLA_DIVISION y TABLA_CUENTACONTABLE
     */
    async obtenerCuentas() {
        try {
            const snapshot = await this.collection.get();
            const res = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    CODIGO: data.CODIGO,
                    NOMBRE: data.NOMBRE
                };
            });
            return res;
        }
        catch (error) {
            console.error('Error al obtener cuentas contables:', error);
            throw error;
        }
    }
    /**
     * Obtiene cuentas contables específicas por sus códigos
     * @param codigos Array de códigos de cuenta a buscar
     */
    async obtenerCuentasPorCodigos(codigos) {
        try {
            // Firebase no permite consultas IN con más de 10 valores
            // Si hay más de 10 códigos, dividimos en múltiples consultas
            const resultadosConDuplicados = [];
            // Procesar en lotes de 10
            for (let i = 0; i < codigos.length; i += 10) {
                const lote = codigos.slice(i, i + 10);
                const query = this.collection
                    .where('CODIGO', 'in', lote);
                const snapshot = await query.get();
                const cuentasLote = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return data;
                });
                resultadosConDuplicados.push(...cuentasLote);
            }
            // Eliminar duplicados usando un Map para mantener solo una cuenta por código
            const cuentasPorCodigo = new Map();
            for (const cuenta of resultadosConDuplicados) {
                if (!cuentasPorCodigo.has(cuenta.CODIGO.toString())) {
                    cuentasPorCodigo.set(cuenta.CODIGO.toString(), cuenta);
                }
            }
            // Convertir el Map de vuelta a un array
            const resultadosSinDuplicados = Array.from(cuentasPorCodigo.values());
            return resultadosSinDuplicados;
        }
        catch (error) {
            console.error('Error al obtener cuentas por códigos:', error);
            throw error;
        }
    }
    /**
     * Crea una nueva cuenta contable
     * @param cuenta Datos de la cuenta a crear
     */
    async crearCuenta(cuenta) {
        try {
            // Verificar si ya existe una cuenta con el mismo código
            const query = this.collection.where('codigo', '==', cuenta.codigo);
            const snapshot = await query.get();
            if (!snapshot.empty) {
                throw new Error(`Ya existe una cuenta con el código ${cuenta.codigo}`);
            }
            // Crear la nueva cuenta
            const docRef = this.collection.doc();
            const nuevaCuenta = {
                codigo: cuenta.codigo,
                nombre: cuenta.nombre,
                estaActiva: true,
                fechaCreacion: new Date(),
                fechaModificacion: new Date()
            };
            await docRef.set(nuevaCuenta);
            return {
                CODIGO: nuevaCuenta.codigo,
                NOMBRE: nuevaCuenta.nombre
            };
        }
        catch (error) {
            console.error('Error al crear cuenta contable:', error);
            throw error;
        }
    }
    /**
     * Actualiza una cuenta contable existente
     * @param codigo Código de la cuenta a actualizar
     * @param datos Nuevos datos para la cuenta
     */
    async actualizarCuenta(codigo, datos) {
        try {
            // Buscar la cuenta por código
            const query = this.collection.where('codigo', '==', codigo);
            const snapshot = await query.get();
            if (snapshot.empty) {
                return null;
            }
            // Actualizar el documento
            const docRef = snapshot.docs[0].ref;
            const datosActualizacion = {
                ...datos,
                fechaModificacion: new Date()
            };
            await docRef.update(datosActualizacion);
            // Obtener los datos actualizados
            const docActualizado = await docRef.get();
            const dataActualizada = docActualizado.data();
            if (!dataActualizada) {
                return null;
            }
            return {
                CODIGO: dataActualizada.codigo,
                NOMBRE: dataActualizada.nombre
            };
        }
        catch (error) {
            console.error('Error al actualizar cuenta contable:', error);
            throw error;
        }
    }
    /**
     * Elimina una cuenta contable (marcándola como inactiva)
     * @param codigo Código de la cuenta a eliminar
     */
    async eliminarCuenta(codigo) {
        try {
            // Buscar la cuenta por código
            const query = this.collection.where('codigo', '==', codigo);
            const snapshot = await query.get();
            if (snapshot.empty) {
                return false;
            }
            // Marcar como inactiva en lugar de eliminar físicamente
            const docRef = snapshot.docs[0].ref;
            await docRef.update({
                estaActiva: false,
                fechaModificacion: new Date()
            });
            return true;
        }
        catch (error) {
            console.error('Error al eliminar cuenta contable:', error);
            throw error;
        }
    }
    /**
     * Elimina permanentemente una cuenta contable
     * @param codigo Código de la cuenta a eliminar permanentemente
     */
    async eliminarCuentaPermanente(codigo) {
        try {
            // Buscar la cuenta por código
            const query = this.collection.where('codigo', '==', codigo);
            const snapshot = await query.get();
            if (snapshot.empty) {
                return false;
            }
            // Eliminar físicamente el documento
            await snapshot.docs[0].ref.delete();
            return true;
        }
        catch (error) {
            console.error('Error al eliminar permanentemente cuenta contable:', error);
            throw error;
        }
    }
}
exports.CuentasContablesRepository = CuentasContablesRepository;

import * as admin from 'firebase-admin';

export interface SincronizacionModel {
    fecha: admin.firestore.Timestamp;
    ultimaFechaProcesada: admin.firestore.Timestamp;
    status: "idle" | "syncing" | "success" | "error" | "paused" | "stopped";
    registrosProcesados: number;
    registrosFallidos: number;
    duracion: string;
}

export interface SaldoContableAws {
    fecha: string;
    nombreOficina: string;
    codigoOficina: string;
    codigoCuentaContable: string;
    nombreCuentaContable: string;
    esDeudora: boolean;
    saldo: number;
}

export interface SaldoContableFirebase {
    fecha: string;
    nombreOficina: string;
    codigoOficina: string;
    codigoCuentaContable: string;
    nombreCuentaContable: string;
    esDeudora: boolean;
    saldo: number;
    fechaTimestamp: admin.firestore.Timestamp;
}
export interface RespuestaEstadoSincronizacion {
  status: "idle" | "syncing" | "success" | "error" | "paused" | "stopped";
  lastSync: string;
  firebaseData?: {
    ultimaFecha: string;
  };
  awsData?: {
    ultimaFecha: string;
  };
  syncData?: {
    rangoFechas: string;
    registrosNuevos: number;
    tiempoEstimado: string;
  };
}

export interface HistorialSincronizacion {
  fecha: string;
  status: "idle" | "syncing" | "success" | "error" | "paused" | "stopped";
  registrosProcesados: number;
  registrosFallidos: number;
  duracion: string;
}

export interface RespuestaHistorialSincronizacion {
  success: boolean;
  message: string;
  historial: HistorialSincronizacion[];
}

export interface  SyncData {
  desdeFecha: string;
  registrosProcesados: number;
  registrosFallidos: number;
  fechaActual: string;
  syncProgress: number;
  startTime: Date;
  tiempoEstimado?: string; // Tiempo estimado restante en formato legible
  tiempoTranscurrido?: string; // Tiempo transcurrido desde el inicio
  velocidadPromedio?: number; // Registros procesados por segundo
  status?: "idle" | "syncing" | "success" | "error" | "paused" | "stopped";
}
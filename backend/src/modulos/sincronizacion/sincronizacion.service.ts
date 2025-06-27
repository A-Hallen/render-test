import { HistorialSincronizacion, RespuestaEstadoSincronizacion } from "shared";
import { SincronizacionRepository } from "./sincronizacion.repository";
import { Response } from "express";

export class SincronizacionService {
    private sincronizacionRepository: SincronizacionRepository;
    constructor(){
        this.sincronizacionRepository = new SincronizacionRepository();
    }

    obtenerEstadoSincronizacion(): Promise<RespuestaEstadoSincronizacion> {
        return this.sincronizacionRepository.obtenerEstadoSincronizacion();
    }

    async iniciarSincronizacion(usuarioId: string): Promise<void> {
        await this.sincronizacionRepository.iniciarSincronizacion(usuarioId);
    }

    async obtenerHistorialSincronizacion(): Promise<HistorialSincronizacion[]> {
        return this.sincronizacionRepository.obtenerHistorialSincronizacion();
    }

    /**
     * Suscribe un cliente a las actualizaciones de progreso de sincronización
     * @param res Objeto Response de Express
     */
    subscribeToProgressUpdates(res: Response): void {
        this.sincronizacionRepository.subscribeToProgressUpdates(res);
    }

    pausarSincronizacion(usuarioId: string): Promise<void> {
        return this.sincronizacionRepository.pausarSincronizacion();
    }

    detenerSincronizacion(usuarioId: string): Promise<void> {
        return this.sincronizacionRepository.detenerSincronizacion();
    }
}

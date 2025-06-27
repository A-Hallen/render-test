import { EventEmitter } from "events";
import { SyncData } from "shared";

export class ProgressService {
  private progressEmitter: EventEmitter;
  private exportProgress: SyncData;
  private _isPaused: boolean = false;
  private _isStopped: boolean = false;

  constructor() {
    this.progressEmitter = new EventEmitter();
    this.progressEmitter.setMaxListeners(50);
    this.exportProgress = this.createInitialProgress();
  }

  pause() {
    this._isPaused = true;
    this._isStopped = false;
    this.updateProgress({ status: "paused" });
  }

  resume() {
    this._isPaused = false;
    this.updateProgress({ status: "syncing" });
  }

  stop() {
    this._isStopped = true;
    this._isPaused = false;
    this.updateProgress({ status: "stopped" });
  }

  isPaused(): boolean {
    return this._isPaused;
  }

  isStopped(): boolean {
    return this._isStopped;
  }

  private createInitialProgress(): SyncData {
    return {
      desdeFecha: "",
      registrosProcesados: 0,
      registrosFallidos: 0,
      fechaActual: "",
      syncProgress: 0,
      startTime: new Date(),
      tiempoEstimado: "Calculando...",
      tiempoTranscurrido: "0s",
      velocidadPromedio: 0,
      status: "idle"
    };
  }

  updateProgress(updates: Partial<SyncData>) {
    this.exportProgress = { ...this.exportProgress, ...updates };
    this.emitProgressUpdate();
  }

  resetProgress() {
    this.exportProgress = this.createInitialProgress();
    this._isPaused = false;
    this._isStopped = false;
    this.emitProgressUpdate();
  }

  subscribeToProgressUpdates(res: any) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (this.exportProgress.startTime) {
      const initialData = JSON.stringify(this.exportProgress);
      res.write(`event: progressUpdate\ndata: ${initialData}\n\n`);
    }

    const progressHandler = (data: SyncData) => {
      res.write(`event: progressUpdate\ndata: ${JSON.stringify(data)}\n\n`);
    };

    this.progressEmitter.on("progressUpdate", progressHandler);
    res.on("close", () => {
      this.progressEmitter.removeListener("progressUpdate", progressHandler);
      res.end();
    });
  }

  formatearDuracion(duracionMs: number): string {
    const segundos = Math.floor(duracionMs / 1000);
    if (segundos < 60) return `${segundos} segundos`;

    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    if (minutos < 60) return `${minutos} minutos y ${segundosRestantes} segundos`;

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas} horas, ${minutosRestantes} minutos y ${segundosRestantes} segundos`;
  }

  calcularTiempoEstimado(): { tiempoEstimado: string, tiempoTranscurrido: string, velocidadPromedio: number } {
    const ahora = new Date();
    const tiempoTranscurridoMs = ahora.getTime() - this.exportProgress.startTime.getTime();
    const velocidadPromedio = this.exportProgress.registrosProcesados / (tiempoTranscurridoMs / 1000);
    const tiempoTranscurridoStr = this.formatearDuracion(tiempoTranscurridoMs);
    
    if (tiempoTranscurridoMs < 3000 || this.exportProgress.registrosProcesados === 0) {
      return {
        tiempoEstimado: "Calculando...",
        tiempoTranscurrido: tiempoTranscurridoStr,
        velocidadPromedio: velocidadPromedio || 0
      };
    }
    
    const porcentajeCompletado = this.exportProgress.syncProgress / 100;
    
    if (porcentajeCompletado < 0.01 && this.exportProgress.registrosProcesados > 0) {
      const registrosEstimadosTotales = this.exportProgress.registrosProcesados * 100;
      const tiempoRestanteMs = ((registrosEstimadosTotales - this.exportProgress.registrosProcesados) / velocidadPromedio) * 1000;
      return {
        tiempoEstimado: this.formatearDuracion(tiempoRestanteMs),
        tiempoTranscurrido: tiempoTranscurridoStr,
        velocidadPromedio
      };
    }
    
    if (porcentajeCompletado > 0) {
      const tiempoTotalEstimadoMs = tiempoTranscurridoMs / porcentajeCompletado;
      const tiempoRestanteMs = tiempoTotalEstimadoMs - tiempoTranscurridoMs;
      return {
        tiempoEstimado: this.formatearDuracion(tiempoRestanteMs),
        tiempoTranscurrido: tiempoTranscurridoStr,
        velocidadPromedio
      };
    }
    
    return {
      tiempoEstimado: "Calculando...",
      tiempoTranscurrido: tiempoTranscurridoStr,
      velocidadPromedio
    };
  }

  emitProgressUpdate() {
    const { tiempoEstimado, tiempoTranscurrido, velocidadPromedio } = this.calcularTiempoEstimado();
    this.exportProgress.tiempoEstimado = tiempoEstimado;
    this.exportProgress.tiempoTranscurrido = tiempoTranscurrido;
    this.exportProgress.velocidadPromedio = velocidadPromedio;
    this.progressEmitter.emit("progressUpdate", this.exportProgress);
  }

  getCurrentProgress(): SyncData {
    return this.exportProgress;
  }
}
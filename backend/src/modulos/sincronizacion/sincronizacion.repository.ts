import { BaseFirebaseRepository } from "../../base/base.firebaseRepository";
import { HistorialSincronizacion, RespuestaEstadoSincronizacion } from "shared";
import { SaldoContableAws, SincronizacionModel } from "./sincronizacion.model";
import { SyncNotificationService } from "./sincronizacion.notifications";
import { ProgressService } from "./sincronizacion.progress";
import { SyncUtils } from "./sincronizacion.utils";
import { FirebaseSyncService } from "./sincronizacion.firebase";
import { AwsSyncService } from "./sincronizacion.aws";
import { Timestamp } from "firebase-admin/firestore";

export class SincronizacionRepository extends BaseFirebaseRepository<SincronizacionModel> {
  private syncNotificationService: SyncNotificationService;
  private progressService: ProgressService;
  private firebaseSyncService: FirebaseSyncService;
  private awsSyncService: AwsSyncService;

  constructor() {
    super("Sincronizaciones");
    this.syncNotificationService = new SyncNotificationService();
    this.progressService = new ProgressService();
    this.firebaseSyncService = new FirebaseSyncService();
    this.awsSyncService = new AwsSyncService();
  }

  private currentSyncPromise: Promise<void> | null = null;

  async exportarDatosPorFecha(fecha: string) {
    const resultados = await this.awsSyncService.exportarDatosPorFecha(fecha);

    if (resultados.length === 0) {
      console.log(`No hay datos contables para ${fecha}`);
      return 0;
    }

    // Guardar en Firebase
    await this.firebaseSyncService.guardarEnFirebase(
      resultados as SaldoContableAws[]
    );
    return resultados.length;
  }

  private formatearDuracion(duracionMs: number): string {
    const segundos = Math.floor(duracionMs / 1000);

    if (segundos < 60) {
      return `${segundos} segundos`;
    }

    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    if (minutos < 60) {
      return `${minutos} minutos y ${segundosRestantes} segundos`;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    return `${horas} horas, ${minutosRestantes} minutos y ${segundosRestantes} segundos`;
  }

  /**
   * Suscribe un cliente SSE al flujo de progreso de sincronización
   * @param res - Objeto response de Express para enviar eventos SSE
   */
  subscribeToProgressUpdates(res: any) {
    this.progressService.subscribeToProgressUpdates(res);
  }

  async obtenerHistorialSincronizacion(): Promise<HistorialSincronizacion[]> {
    const snapshot = await this.collection.orderBy("fecha", "desc").get();
    const historial = snapshot.docs.map((doc) => doc.data() as SincronizacionModel);
    return historial.map(h => ({
      ...h,
      fecha: SyncUtils.formatDateToHumanReadable(h.fecha.toDate(), { 
        includeWeekday: false, 
        includeTime: true, 
        timeFormat: '12h',
        locale: 'es-ES'
      }),
    }));
  }

  async iniciarSincronizacion(usuarioId: string) {
    if (this.progressService.getCurrentProgress().status === "syncing") {
      console.log("Sincronización ya en curso.");
      return;
    }

    this.progressService.resetProgress();
    this.progressService.updateProgress({ status: "syncing" });
    this.syncNotificationService.notificarAdministradores({
      title: "Sincronización de datos contables iniciada",
      body: "Se ha iniciado la sincronización de datos contables",
      type: "info",
    });

    this.currentSyncPromise = (async () => {
      try {
        const ultimaFechaFirebase =
          await this.firebaseSyncService.obtenerUltimaFecha();

        const fechaActual = new Date();
        const desdeFecha = ultimaFechaFirebase
          ? ultimaFechaFirebase
          : new Date(
              fechaActual.getFullYear() - 1,
              fechaActual.getMonth(),
              fechaActual.getDate()
            )
              .toISOString()
              .split("T")[0];
        const hastaFecha = fechaActual.toISOString().split("T")[0];

        await this.syncNotificationService.notificarAdministradores({
          title: "Sincronización de datos contables iniciada",
          body: `Se ha iniciado la sincronización de datos contables del ${desdeFecha} al ${hastaFecha}`,
          type: "info",
          data: {
            desdeFecha,
            hastaFecha,
          },
        });

        const fechas = SyncUtils.generarRangoFechas(desdeFecha, hastaFecha);

        this.progressService.updateProgress({
          desdeFecha,
          registrosProcesados: 0,
          registrosFallidos: 0,
          fechaActual: fechas[0],
          syncProgress: 0,
          startTime: new Date(),
          tiempoEstimado: "Calculando...",
          tiempoTranscurrido: "0s",
          velocidadPromedio: 0,
        });

        this.progressService.emitProgressUpdate();

        for (let i = 0; i < fechas.length; i++) {
          if (this.progressService.isStopped()) {
            console.log("Sincronización detenida por el usuario.");
            break;
          }
          while (this.progressService.isPaused()) {
            console.log("Sincronización pausada. Esperando para reanudar...");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            if (this.progressService.isStopped()) {
              console.log("Sincronización detenida mientras estaba pausada.");
              break;
            }
          }
          if (this.progressService.isStopped()) {
            break;
          }

          const fecha = fechas[i];
          try {
            const registros = await this.exportarDatosPorFecha(fecha);
            this.progressService.updateProgress({
              registrosProcesados:
                this.progressService.getCurrentProgress().registrosProcesados +
                registros,
              syncProgress: Math.round(((i + 1) / fechas.length) * 100),
              fechaActual: fecha,
            });

            this.progressService.emitProgressUpdate();

            if (
              [25, 50, 75].includes(
                this.progressService.getCurrentProgress().syncProgress
              )
            ) {
              await this.syncNotificationService.notificarProgreso(
                this.progressService,
                desdeFecha,
                i + 1,
                fechas.length
              );
            }
          } catch (error) {
            console.error(`Error al procesar fecha ${fecha}:`, error);
            this.progressService.updateProgress({
              registrosFallidos:
                this.progressService.getCurrentProgress().registrosFallidos + 1,
            });
            this.progressService.emitProgressUpdate();
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (this.progressService.isStopped()) {
          this.progressService.updateProgress({ status: "stopped" });
        } else if (this.progressService.isPaused()) {
          this.progressService.updateProgress({ status: "paused" });
        } else {
          try {
            await this.guardarSincronizacion("success");
          } catch (error) {
            console.error("Error al guardar la sincronización:", error);
          }
        }
      } catch (error: any) {
        console.error(
          "Error durante la exportación de datos contables:",
          error
        );

        try {
          await this.guardarSincronizacion("error");
        } catch (error) {
          console.error("Error al guardar la sincronización:", error);
        }

        this.syncNotificationService.notificarAdministradores({
          title: "Error en exportación de datos contables",
          body: `Se ha producido un error durante la exportación: ${error.message}`,
          type: "error",
          data: {
            error: error.message,
            exito: "false",
          },
        });
        this.progressService.updateProgress({ status: "error" });
      } finally {
        this.currentSyncPromise = null;
        this.progressService.emitProgressUpdate(); // Emit final status
      }
    })();
    return this.currentSyncPromise;
  }

  async guardarSincronizacion(status: "stopped" | "idle" | "syncing" | "success" | "error" | "paused") {
    const duracion =
      new Date().getTime() -
        this.progressService.getCurrentProgress().startTime.getTime() || 0;
    const duracionFormateada = this.formatearDuracion(duracion);
    const mensaje = `Exportación completada en ${duracionFormateada}. ${
      this.progressService.getCurrentProgress().registrosProcesados
    } registros procesados.`;

    this.crear({
      fecha: Timestamp.fromDate(new Date()),
      ultimaFechaProcesada: Timestamp.fromDate(new Date(this.progressService.getCurrentProgress().fechaActual)),
      status: status,
      registrosProcesados:
        this.progressService.getCurrentProgress().registrosProcesados,
      registrosFallidos:
        this.progressService.getCurrentProgress().registrosFallidos,
      duracion: duracionFormateada,
    });

    const progress = this.progressService.getCurrentProgress();

    await this.syncNotificationService.notificarAdministradores({
      title: "Exportación de datos contables completada",
      body: mensaje,
      type: "success",
      data: {
        desdeFecha: progress.desdeFecha,
        hastaFecha: progress.fechaActual,
        registrosProcesados: progress.registrosProcesados.toString(),
        duracion: duracionFormateada,
      },
    });
    this.progressService.updateProgress({ status: "success" });
  }

  async pausarSincronizacion() {
    if (
      this.progressService.getCurrentProgress().status === "syncing" &&
      !this.progressService.isPaused()
    ) {
      this.progressService.pause();
      console.log("Sincronización pausada.");
      return;
    }
    if (this.progressService.isPaused()) {
      console.log("Sincronización reanudada.");
      this.progressService.resume();
      return;
    }
  }

  async detenerSincronizacion() {
    if (
      this.progressService.getCurrentProgress().status === "syncing" ||
      this.progressService.getCurrentProgress().status === "paused"
    ) {
      this.progressService.stop();
      console.log("Sincronización detenida.");
      if (this.currentSyncPromise) {
        this.currentSyncPromise = null;
        try {
          await this.guardarSincronizacion("stopped");
        } catch (error) {
          console.error("Error al guardar la sincronización:", error);
        }
      }
    }
  }

  async obtenerEstadoSincronizacion(): Promise<RespuestaEstadoSincronizacion> {
    const ultimaFechaAWS = await this.awsSyncService.obtenerUltimaFecha();
    const ultimaFechaFirebase = await this.firebaseSyncService.obtenerUltimaFecha();

    if (ultimaFechaAWS === null) {
      return {
        status: "idle",
        lastSync: "N/A",
        firebaseData: {
          ultimaFecha: "N/A",
        },
        awsData: {
          ultimaFecha: "N/A",
        },
        syncData: {
          rangoFechas: "",
          registrosNuevos: 0,
          tiempoEstimado: "indefinido",
        },
      };
    }

    const fechaFirebase = ultimaFechaFirebase?.split("T")[0];

    const numeroRegistros = fechaFirebase
      ? await this.awsSyncService.calcularNumeroDeRegistros(fechaFirebase)
      : 0;

    const rangoFechas = fechaFirebase
      ? SyncUtils.generarRangoFechas(fechaFirebase, ultimaFechaAWS)
      : [];

    //calcular tiempo estimado, por cada fecha equivale a 3 segundos
    const tiempoEstimado = rangoFechas.length * 10000;
    const tiempoEstimadoFormateado = fechaFirebase
      ? this.formatearDuracion(tiempoEstimado)
      : "indefinido";

    return {
      status: this.progressService.getCurrentProgress().status || "idle",
      lastSync: ultimaFechaFirebase ? SyncUtils.formatDateToHumanReadable(new Date(ultimaFechaFirebase)) : "N/A",
      firebaseData: {
        ultimaFecha: fechaFirebase || "N/A",
      },
      awsData: {
        ultimaFecha: ultimaFechaAWS,
      },
      syncData: {
        rangoFechas: fechaFirebase
          ? `${fechaFirebase} - ${ultimaFechaAWS}`
          : `hasta ${ultimaFechaAWS}`,
        registrosNuevos: fechaFirebase ? numeroRegistros : 0,
        tiempoEstimado: tiempoEstimadoFormateado,
      },
    };
  }
}

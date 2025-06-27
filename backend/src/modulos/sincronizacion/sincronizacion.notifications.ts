import { firestore } from "../../config/firebase.config";
import { NotificationService } from "../notifications";
import { ProgressService } from "./sincronizacion.progress";

export class SyncNotificationService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async notificarAdministradores(notificacion: {
    title: string;
    body: string;
    type: "info" | "success" | "error";
    data?: any;
  }): Promise<void> {
    try {
      const usersRef = firestore.collection("users");
      const snapshot = await usersRef.where("role", "==", "admin").get();

      if (snapshot.empty) {
        console.log("No se encontraron usuarios administradores");
        return;
      }

      const adminUserIds = snapshot.docs.map((doc) => doc.id);

      if (adminUserIds.length > 0) {
        await this.notificationService.sendNotificationToMultipleUsers(
          adminUserIds,
          notificacion
        );
      }
    } catch (error) {
      console.error("Error al notificar a administradores:", error);
    }
  }

  async notificarProgreso(
    progressService: ProgressService,
    fechaInicio: string,
    fechasProcesadas: number,
    totalFechas: number
  ): Promise<void> {
    const progress = progressService.getCurrentProgress();
    await this.notificarAdministradores({
      title: `Exportación de datos contables: ${progress.syncProgress}% completado`,
      body: `Se han procesado ${fechasProcesadas} de ${totalFechas} fechas. ${progress.tiempoTranscurrido} transcurridos.`,
      type: "info",
      data: {
        fechaInicio,
        porcentaje: progress.syncProgress.toString(),
        procesadas: fechasProcesadas.toString(),
        total: totalFechas.toString(),
      },
    });
  }
}
import { firestore } from "../../config/firebase.config";
import { Timestamp } from "firebase-admin/firestore";
import { SaldoContableAws } from "./sincronizacion.model";

export class FirebaseSyncService {
  private coleccionSaldosContables = "SaldosContablesTemp";

  async guardarEnFirebase(resultados: SaldoContableAws[]): Promise<void> {
    const batch = firestore.batch();

    for (const registro of resultados) {
      const date = new Date(registro.fecha);
      const docRef = firestore.collection(this.coleccionSaldosContables).doc();
      batch.set(docRef, {
        ...registro,
        fechaTimestamp: Timestamp.fromDate(date),
      });
    }
    await batch.commit();
  }

  async obtenerUltimaFecha(): Promise<string | null> {
    const ultimaFecha = await firestore.collection(this.coleccionSaldosContables)
      .orderBy("fechaTimestamp", "desc")
      .limit(1)
      .get();

    if (ultimaFecha.empty) return null;
    
    const timestamp = ultimaFecha.docs[0].data().fechaTimestamp;
    return timestamp.toDate().toISOString();
  }
}
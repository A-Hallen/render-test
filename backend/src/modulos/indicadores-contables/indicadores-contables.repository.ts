import { BaseFirebaseRepository } from "../../base/base.firebaseRepository";
import { IndicadorContable } from "./interfaces/IndicadorContable.interface";
// Eliminamos la importaciu00f3n problemu00e1tica


export class IndicadoresContablesRepository extends BaseFirebaseRepository<IndicadorContable> {
  constructor() {
    super("Indicadores");
  }

  async crear(data: Partial<IndicadorContable>): Promise<IndicadorContable> {
    console.log("creando indicador contable", data);
    const docRef = this.collection.doc();
    data.id = docRef.id;
    await docRef.set(data);
    return data as IndicadorContable;
  }
}

export interface SaldosContables {
  codigoCuentaContable: number;
  codigoOficina: string;
  esDeudora: number;
  fecha: string;
  nombreCuentaContable: string;
  nombreOficina: string;
  saldo: number;
}

export class Saldo {
  constructor(data: SaldosContables) {
    Object.assign(this, data);
  }
}
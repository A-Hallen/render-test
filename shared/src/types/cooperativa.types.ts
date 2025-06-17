export interface CooperativaDTO {
  id: string;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  zonaHoraria: string;
  formatoFecha: string;
  idioma: string;
  logo?: string;
  createdAt: number;
  updatedAt: number;
}

export enum FormatoFecha {
  DDMMYYYY = "DD/MM/YYYY",
  MMDDYYYY = "MM/DD/YYYY",
  YYYYMMDD = "YYYY-MM-DD"
}

export enum Idioma {
  ESPANOL = "es-EC",
  INGLES = "en-US"
}

export enum ZonaHoraria {
  GUAYAQUIL = "America/Guayaquil",
  QUITO = "America/Quito"
}

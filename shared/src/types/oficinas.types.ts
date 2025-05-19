export interface OficinasDTO {
    nombre: string;
    codigo: string;
}

export interface ObtenerOficinasResponse {
    oficinas: OficinasDTO[];
}
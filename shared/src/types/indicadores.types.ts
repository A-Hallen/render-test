export interface IndicadorCalcularPeriodoResponse {
    indicadores: IndicadorColor[];
    indicadoresCalculados: IndicadorCalcularPeriodo[];
}

export interface IndicadorColor {
    id: string;
    nombre: string;
    color: string;
}


export interface IndicadorCalcularPeriodo {
    [key: string]: string | number;
}

export interface Umbral {
    umbrales: Array<{
        color: string;
        nivel: string;
        valorMax: number;
        valorMin: number;
        descripcion: string;
    }>;
    configuracion: {
        decimales: number;
        invertido: boolean;
        mostrarTendencia: boolean;
        formatoVisualizacion: string;
    };
    alerta: number;
    advertencia: number;
}

export interface IndicadorResponse {
    id: string;
    nombre: string;
    color: string;
    descripcion: string;
    meta: number;
    mayorEsMejor: boolean;
    estaActivo: boolean;
    umbrales: Umbral;
    estaEnPantallaInicial: boolean;
    ordenMuestra: number;
    numerador: Component;
    denominador: Component;
    numeradorAbsoluto: boolean;
    denominadorAbsoluto: boolean;
}

export interface Component {
    componentes: {coeficiente: number, cuentas: string[]}[];
}

export interface IndicadorComparacionOficinasDTO {
    id: string;
    nombre: string;
    descripcion: string;
    color: string;
}

export interface ValorComparacionOficinasIndicadorDTO {
    oficinaCodigo: string;
    indicadorId: string;
    valor: number;
    fecha: string;
}

export interface ComparacionOficinasData {
    indicadores: IndicadorComparacionOficinasDTO[];
    valores: ValorComparacionOficinasIndicadorDTO[];
}

export interface ComparacionOficinasResponse {
    status: "success" | "error";
    message: string;
    data?: ComparacionOficinasData;
}
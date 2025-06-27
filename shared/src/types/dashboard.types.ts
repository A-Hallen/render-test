export interface DashboardCardDataResponse {
    message: string;
    status: string;
    dashboardCards:  DashboardData[]; //quiero agregar la propiedad titulo podemos aqui crear algun tipo de modificacion sin modificar el tipo original
}

export interface DashboardData {
    title?: string;
    fecha: string;
    monto: number;
    fechaAnterior?: string;
    montoAnterior?: number;
    variacion?: number;
    variacionPorcentaje?: number;
    descripcionComparacion?: string;
    // Comparación con día anterior
    fechaDiaAnterior?: string;
    montoDiaAnterior?: number;
    variacionDiaria?: number;
    variacionPorcentajeDiaria?: number;
}
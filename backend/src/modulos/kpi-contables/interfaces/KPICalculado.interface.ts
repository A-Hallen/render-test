export interface KPICalculado {
    fecha: string; // Fecha del cálculo
    idIndicador: string; // ID del indicador
    codigoOficina: string; // Código de la oficina
    valor: number; // Valor calculado del KPI
    componentes: Componente; // Componentes del KPI
}

interface Componente {
    numerador: number;
    denominador: number;
    detalle: {
        numerador: {
            [key: string]: number;
        };
        denominador: {
            [key: string]: number;
        };
    };
}

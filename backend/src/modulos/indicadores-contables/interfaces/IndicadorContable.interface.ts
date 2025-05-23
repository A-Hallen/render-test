import { Component } from "shared/src/types/indicadores.types";

export interface IndicadorContable {
    id: string;
    nombre: string;
    descripcion: string;
    meta: number;
    color: string;
    mayorEsMejor: boolean;
    estaActivo: boolean;
    umbrales: {
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
    };
    estaEnPantallaInicial: boolean;
    ordenMuestra: number;
    numerador: Component;
    denominador: Component;
    numeradorAbsoluto: boolean;
    denominadorAbsoluto: boolean;
    createdAt: Date;
    updatedAt: Date;
}
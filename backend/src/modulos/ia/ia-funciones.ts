import { GoogleGenAI } from '@google/genai';
import { IndicadoresContablesIAService } from '../indicadores-contables/indicadores-contables-ia.service';
import { KPIContablesIAService } from '../kpi-contables/kpi-contables-ia.service';
import { ReporteContabilidadIAService } from '../reportes/contabilidad/reporte-contabilidad-ia.service';

/**
 * Servicio para la gestión de funciones de IA
 */
export class IAFuncionesService {
    private ai: GoogleGenAI;
    private indicadoresContablesIAService: IndicadoresContablesIAService;
    private kpiContablesIAService: KPIContablesIAService;
    private reporteContabilidadIAService: ReporteContabilidadIAService;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.indicadoresContablesIAService = new IndicadoresContablesIAService();
        this.kpiContablesIAService = new KPIContablesIAService();
        this.reporteContabilidadIAService = new ReporteContabilidadIAService();
    }

    /**
     * Obtiene todas las declaraciones de funciones disponibles
     * @returns Array con las declaraciones de funciones
     */
    obtenerDeclaracionesFunciones() {
        console.log('[IAFuncionesService] Obteniendo declaraciones de funciones');
        
        // Obtener las declaraciones de funciones desde los servicios especializados
        const fetchIndicatorDataFunctionDeclaration = this.indicadoresContablesIAService.getFunctionDeclaration();
        const fetchKpiDataFunctionDeclaration = this.kpiContablesIAService.getFunctionDeclaration();
        const fetchAccountingReportFunctionDeclaration = this.reporteContabilidadIAService.getFunctionDeclaration();
        
        return [
            fetchIndicatorDataFunctionDeclaration,
            fetchKpiDataFunctionDeclaration,
            fetchAccountingReportFunctionDeclaration,
        ];
    }

    /**
     * Procesa una llamada a función de la IA
     * @param functionCall Llamada a función de la IA
     * @param message Mensaje original del usuario
     * @returns Promesa con la respuesta procesada
     */
    async procesarLlamadaFuncion(functionCall: any, message: string): Promise<string> {
        console.log(`[IAFuncionesService] Procesando llamada a función: ${functionCall.name}`);
        
        let prompt: string;
        
        // Delegar el procesamiento al servicio especializado correspondiente
        switch (functionCall.name) {
            case 'fetch_indicator_data':
                console.log("[IAFuncionesService] Procesando solicitud de indicadores contables");
                prompt = await this.indicadoresContablesIAService.processFunctionCall(message);
                break;
                
            case 'fetch_kpi_data':
                console.log("[IAFuncionesService] Procesando solicitud de KPIs contables");
                prompt = await this.kpiContablesIAService.processFunctionCall(functionCall.args, message);
                break;
                
            case 'fetch_accounting_report':
                console.log("[IAFuncionesService] Procesando solicitud de reporte de contabilidad");
                prompt = await this.reporteContabilidadIAService.processFunctionCall(functionCall.args, message);
                break;
                
            default:
                return `Función no reconocida: ${functionCall.name}`;
        }
        
        // Generar respuesta usando el prompt generado por el servicio especializado
        try {
            const aiResponse = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [prompt],
            });
            
            return aiResponse.text || 'No se pudo generar una respuesta adecuada.';
        } catch (error: any) {
            console.error(`[IAFuncionesService] Error al generar respuesta para ${functionCall.name}:`, error);
            
            // Manejar específicamente el error de sobrecarga del modelo
            if (error.message && (
                error.message.includes("The model is overloaded") ||
                error.message.includes("503 Service Unavailable")
            )) {
                return "Lo siento, el servicio de inteligencia artificial está experimentando alta demanda en este momento. " +
                       "Por favor, espera unos minutos e intenta nuevamente. Este es un problema temporal del servicio.";
            }
            
            return `Ocurrió un error al procesar la solicitud: ${error.message}`;
        }
    }
}

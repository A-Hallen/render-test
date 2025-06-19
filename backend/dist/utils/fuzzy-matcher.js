"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuzzyMatcher = void 0;
/**
 * Utilidad para realizar coincidencias difusas (fuzzy matching) entre textos
 * Permite encontrar la mejor coincidencia entre un texto de entrada y una lista de opciones
 */
class FuzzyMatcher {
    /**
     * Encuentra la mejor coincidencia entre un texto de entrada y una lista de opciones
     * @param entrada Texto ingresado por el usuario
     * @param opciones Lista de opciones válidas
     * @param umbralPorcentaje Porcentaje máximo de diferencia permitido (0-100)
     * @returns La mejor coincidencia o undefined si no hay coincidencias aceptables
     */
    static encontrarMejorCoincidencia(entrada, opciones, umbralPorcentaje = 40) {
        if (!entrada || opciones.length === 0) {
            return undefined;
        }
        // Normalizar la entrada (minúsculas, sin acentos, etc.)
        const entradaNormalizada = this.normalizarTexto(entrada);
        // Buscar coincidencia exacta primero (después de normalizar)
        const coincidenciaExacta = opciones.find(opcion => this.normalizarTexto(opcion) === entradaNormalizada);
        if (coincidenciaExacta) {
            return coincidenciaExacta;
        }
        // Buscar coincidencia parcial (si la entrada está contenida en alguna opción o viceversa)
        const coincidenciaParcial = opciones.find(opcion => {
            const opcionNormalizada = this.normalizarTexto(opcion);
            return opcionNormalizada.includes(entradaNormalizada) ||
                entradaNormalizada.includes(opcionNormalizada);
        });
        if (coincidenciaParcial) {
            return coincidenciaParcial;
        }
        // Calcular similitud usando distancia de Levenshtein
        let mejorCoincidencia;
        let mejorPuntuacion = Number.MAX_VALUE;
        for (const opcion of opciones) {
            const opcionNormalizada = this.normalizarTexto(opcion);
            const distancia = this.calcularDistanciaLevenshtein(entradaNormalizada, opcionNormalizada);
            const umbralMaximo = Math.max(entradaNormalizada.length, opcionNormalizada.length) * (umbralPorcentaje / 100);
            if (distancia < mejorPuntuacion && distancia <= umbralMaximo) {
                mejorPuntuacion = distancia;
                mejorCoincidencia = opcion;
            }
        }
        return mejorCoincidencia;
    }
    /**
     * Normaliza un texto para comparaciones (minúsculas, sin acentos, etc.)
     */
    static normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .replace(/[^a-z0-9]/g, ""); // Eliminar caracteres especiales
    }
    /**
     * Calcula la distancia de Levenshtein entre dos cadenas
     * (número mínimo de operaciones para transformar una cadena en otra)
     */
    static calcularDistanciaLevenshtein(a, b) {
        if (a.length === 0)
            return b.length;
        if (b.length === 0)
            return a.length;
        const matrix = [];
        // Inicializar la primera fila y columna
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        // Rellenar la matriz
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const costo = a[j - 1] === b[i - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, // Eliminación
                matrix[i][j - 1] + 1, // Inserción
                matrix[i - 1][j - 1] + costo // Sustitución
                );
            }
        }
        return matrix[b.length][a.length];
    }
}
exports.FuzzyMatcher = FuzzyMatcher;

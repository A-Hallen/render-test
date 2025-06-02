/**
 * Módulo para formatear los resultados de los indicadores financieros
 * Contiene funciones para dar formato a los resultados de los cálculos
 */

/**
 * Formatea los resultados de los indicadores financieros
 * @param {Object} resultados - Resultados de los cálculos
 * @param {Object} opciones - Opciones de formato
 * @returns {Object} - Resultados formateados
 */
function formatearResultados(resultados, opciones = {}) {
  const { indicadores, indicadoresCalculados } = resultados;
  
  // Si no hay resultados, devolver objeto vacío
  if (!indicadoresCalculados || Object.keys(indicadoresCalculados).length === 0) {
    return {
      indicadores: [],
      indicadoresCalculados: {}
    };
  }
  
  // Formatear indicadores básicos
  const indicadoresFormateados = indicadores.map(indicador => ({
    id: indicador.id,
    nombre: indicador.nombre,
    color: indicador.color
  }));
  
  // Formatear indicadores calculados
  const indicadoresCalculadosFormateados = {};
  
  Object.entries(indicadoresCalculados).forEach(([fecha, indicadoresFecha]) => {
    indicadoresCalculadosFormateados[fecha] = indicadoresFecha.map(indicador => {
      // Aplicar formato según configuración del indicador
      const indicadorConfig = indicadores.find(i => i.id === indicador.idIndicador);
      
      return {
        fecha: indicador.fecha,
        idIndicador: indicador.idIndicador,
        codigoOficina: indicador.codigoOficina,
        valor: formatearValor(indicador.valor, indicadorConfig),
        valorRaw: indicador.valor, // Mantener valor sin formato para cálculos
        componentes: {
          numerador: indicador.componentes.numerador,
          denominador: indicador.componentes.denominador,
          detalle: indicador.componentes.detalle
        }
      };
    });
  });
  
  return {
    indicadores: indicadoresFormateados,
    indicadoresCalculados: indicadoresCalculadosFormateados
  };
}

/**
 * Formatea un valor según la configuración del indicador
 * @param {number} valor - Valor a formatear
 * @param {Object} indicadorConfig - Configuración del indicador
 * @returns {string|number} - Valor formateado
 */
function formatearValor(valor, indicadorConfig) {
  if (!indicadorConfig || !indicadorConfig.umbrales || !indicadorConfig.umbrales.configuracion) {
    // Si no hay configuración, devolver con 2 decimales por defecto
    return Number(valor.toFixed(2));
  }
  
  const { decimales, formatoVisualizacion } = indicadorConfig.umbrales.configuracion;
  
  // Aplicar decimales
  const valorRedondeado = Number(valor.toFixed(decimales || 2));
  
  // Aplicar formato de visualización si existe
  if (formatoVisualizacion) {
    switch (formatoVisualizacion.toLowerCase()) {
      case 'porcentaje':
        return `${(valorRedondeado * 100).toFixed(decimales || 2)}%`;
      case 'moneda':
        return valorRedondeado.toLocaleString('es-ES', {
          style: 'currency',
          currency: 'EUR'
        });
      case 'numero':
      default:
        return valorRedondeado;
    }
  }
  
  return valorRedondeado;
}

/**
 * Calcula el color de un indicador según su valor y umbrales
 * @param {number} valor - Valor del indicador
 * @param {Object} indicadorConfig - Configuración del indicador
 * @returns {string} - Color del indicador
 */
function calcularColorIndicador(valor, indicadorConfig) {
  if (!indicadorConfig || !indicadorConfig.umbrales || !indicadorConfig.umbrales.umbrales) {
    return '#808080'; // Gris por defecto
  }
  
  const { umbrales } = indicadorConfig.umbrales;
  const { invertido } = indicadorConfig.umbrales.configuracion || { invertido: false };
  const mayorEsMejor = indicadorConfig.mayorEsMejor !== undefined ? indicadorConfig.mayorEsMejor : true;
  
  // Determinar si se debe invertir la lógica
  const invertirLogica = invertido ? !mayorEsMejor : mayorEsMejor;
  
  // Encontrar el umbral correspondiente
  for (const umbral of umbrales) {
    const { valorMin, valorMax, color } = umbral;
    
    if (valor >= valorMin && valor <= valorMax) {
      return color;
    }
  }
  
  // Si no se encuentra umbral, usar color del indicador
  return indicadorConfig.color || '#808080';
}

/**
 * Agrupa los indicadores por categoría
 * @param {Array} indicadores - Lista de indicadores
 * @param {Array} resultados - Resultados de los cálculos
 * @returns {Object} - Indicadores agrupados por categoría
 */
function agruparPorCategoria(indicadores, resultados) {
  // Implementar si es necesario
  return {};
}

module.exports = {
  formatearResultados,
  formatearValor,
  calcularColorIndicador,
  agruparPorCategoria
};

/**
 * Módulo principal para el cálculo de indicadores financieros
 * Este módulo expone las funciones necesarias para calcular indicadores financieros
 * a partir de saldos contables obtenidos de Firebase
 */

const { calcularIndicadorFinanciero } = require('./calculador-indicadores');
const { formatearResultados } = require('./formateador-resultados');

/**
 * Calcula todos los indicadores financieros para una oficina en un rango de fechas
 * @param {Array} indicadores - Lista de indicadores configurados
 * @param {Array} saldos - Lista de saldos contables
 * @param {string} codigoOficina - Código de la oficina
 * @returns {Object} - Objeto con los indicadores calculados
 */
function calcularIndicadoresFinancieros(indicadores, saldos, codigoOficina) {
  try {
    console.log(`Calculando indicadores financieros para oficina: ${codigoOficina}`);
    console.log(`Número de indicadores configurados: ${indicadores.length}`);
    console.log(`Número de saldos disponibles: ${saldos.length}`);

    // Agrupar saldos por fecha
    const saldosPorFecha = agruparSaldosPorFecha(saldos);
    
    // Objeto para almacenar los resultados
    const indicadoresPorFecha = {};
    
    // Calcular indicadores para cada fecha
    Object.entries(saldosPorFecha).forEach(([fecha, saldosFecha]) => {
      const indicadoresCalculados = [];
      
      // Calcular cada indicador
      indicadores.forEach(indicador => {
        try {
          const resultado = calcularIndicadorFinanciero(indicador, saldosFecha);
          
          // Crear objeto con el resultado
          const indicadorCalculado = {
            fecha,
            idIndicador: indicador.id,
            codigoOficina,
            valor: resultado.valor,
            componentes: resultado.componentes
          };
          
          indicadoresCalculados.push(indicadorCalculado);
        } catch (error) {
          console.error(`Error al calcular indicador ${indicador.id}:`, error);
          
          // Agregar un indicador con valor 0 para que no falle la visualización
          indicadoresCalculados.push({
            fecha,
            idIndicador: indicador.id,
            codigoOficina,
            valor: 0,
            componentes: {
              numerador: 0,
              denominador: 1,
              detalle: {
                numerador: {},
                denominador: {}
              }
            }
          });
        }
      });
      
      indicadoresPorFecha[fecha] = indicadoresCalculados;
    });
    
    // Verificar si hay indicadores calculados
    if (Object.keys(indicadoresPorFecha).length === 0) {
      console.log('No hay indicadores calculados');
      return {
        indicadores: [],
        indicadoresCalculados: {},
        mensaje: 'No hay datos disponibles para calcular indicadores'
      };
    }
    
    // Extraer información básica de los indicadores para la respuesta
    const indicadoresInfo = indicadores.map(i => ({
      id: i.id,
      nombre: i.nombre,
      color: i.color
    }));
    
    return {
      indicadores: indicadoresInfo,
      indicadoresCalculados: indicadoresPorFecha,
      mensaje: 'Indicadores calculados correctamente'
    };
  } catch (error) {
    console.error("Error general al calcular indicadores:", error);
    return {
      indicadores: [],
      indicadoresCalculados: {},
      mensaje: `Error al calcular los indicadores: ${error.message || 'Error desconocido'}`
    };
  }
}

/**
 * Agrupa los saldos contables por fecha
 * @param {Array} saldos - Lista de saldos contables
 * @returns {Object} - Objeto con saldos agrupados por fecha
 */
function agruparSaldosPorFecha(saldos) {
  return saldos.reduce((grupo, saldo) => {
    // Asegurar que la fecha esté en formato YYYY-MM-DD
    let fechaStr = saldo.fecha;
    
    // Si la fecha viene en formato DD/MM/YYYY, convertirla a YYYY-MM-DD
    if (fechaStr && fechaStr.includes('/')) {
      const [dia, mes, anio] = fechaStr.split('/');
      fechaStr = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    if (!grupo[fechaStr]) {
      grupo[fechaStr] = [];
    }
    grupo[fechaStr].push(saldo);
    return grupo;
  }, {});
}

/**
 * Calcula indicadores financieros para una fecha específica
 * @param {Array} indicadores - Lista de indicadores configurados
 * @param {Array} saldos - Lista de saldos contables para una fecha específica
 * @param {string} codigoOficina - Código de la oficina
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Array} - Lista de indicadores calculados
 */
function calcularIndicadoresPorFecha(indicadores, saldos, codigoOficina, fecha) {
  const indicadoresCalculados = [];
  
  indicadores.forEach(indicador => {
    try {
      const resultado = calcularIndicadorFinanciero(indicador, saldos);
      
      indicadoresCalculados.push({
        fecha,
        idIndicador: indicador.id,
        codigoOficina,
        valor: resultado.valor,
        componentes: resultado.componentes
      });
    } catch (error) {
      console.error(`Error al calcular indicador ${indicador.id}:`, error);
      
      indicadoresCalculados.push({
        fecha,
        idIndicador: indicador.id,
        codigoOficina,
        valor: 0,
        componentes: {
          numerador: 0,
          denominador: 1,
          detalle: {
            numerador: {},
            denominador: {}
          }
        }
      });
    }
  });
  
  return indicadoresCalculados;
}

module.exports = {
  calcularIndicadoresFinancieros,
  calcularIndicadoresPorFecha
};

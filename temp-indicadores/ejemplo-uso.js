/**
 * Ejemplo de uso del módulo de indicadores financieros
 * Este archivo muestra cómo utilizar el módulo para calcular indicadores financieros
 * a partir de saldos contables obtenidos de Firebase
 */

// Importar el módulo de indicadores financieros
const { calcularIndicadoresFinancieros } = require('./indicadores-financieros');

/**
 * Función principal que muestra cómo calcular indicadores financieros
 * @param {Array} saldosContables - Saldos contables obtenidos de Firebase
 * @returns {Object} - Objeto con los indicadores calculados
 */
async function calcularIndicadores(saldosContables) {
  try {
    // Obtener configuración de indicadores (esto debe ser implementado según tu aplicación)
    const indicadores = await obtenerIndicadoresDesdeFirebase();
    
    // Código de oficina (debe ser proporcionado según tu aplicación)
    const codigoOficina = '001';
    
    // Calcular indicadores financieros
    const resultado = calcularIndicadoresFinancieros(indicadores, saldosContables, codigoOficina);
    
    return resultado;
  } catch (error) {
    console.error('Error al calcular indicadores:', error);
    throw error;
  }
}

/**
 * Ejemplo de función para obtener indicadores desde Firebase
 * Esta función debe ser implementada según tu aplicación
 * @returns {Promise<Array>} - Promesa que resuelve a un array de indicadores
 */
async function obtenerIndicadoresDesdeFirebase() {
  // Esta implementación es solo un ejemplo
  // Debes reemplazarla con tu propia lógica para obtener indicadores desde Firebase
  
  // Ejemplo de estructura de un indicador
  return [
    {
      id: 'ind1',
      nombre: 'Liquidez',
      descripcion: 'Indicador de liquidez',
      meta: 1.5,
      color: '#4CAF50',
      mayorEsMejor: true,
      estaActivo: true,
      umbrales: {
        umbrales: [
          {
            color: '#FF0000',
            nivel: 'Crítico',
            valorMax: 0.8,
            valorMin: 0,
            descripcion: 'Nivel crítico'
          },
          {
            color: '#FFA500',
            nivel: 'Advertencia',
            valorMax: 1.2,
            valorMin: 0.8,
            descripcion: 'Nivel de advertencia'
          },
          {
            color: '#4CAF50',
            nivel: 'Óptimo',
            valorMax: 10,
            valorMin: 1.2,
            descripcion: 'Nivel óptimo'
          }
        ],
        configuracion: {
          decimales: 2,
          invertido: false,
          mostrarTendencia: true,
          formatoVisualizacion: 'numero'
        },
        alerta: 0.8,
        advertencia: 1.2
      },
      estaEnPantallaInicial: true,
      ordenMuestra: 1,
      numerador: {
        componentes: [
          {
            coeficiente: 1,
            cuentas: ['11', '12', '13'] // Activos corrientes
          }
        ]
      },
      denominador: {
        componentes: [
          {
            coeficiente: 1,
            cuentas: ['21', '22', '23'] // Pasivos corrientes
          }
        ]
      },
      numeradorAbsoluto: false,
      denominadorAbsoluto: false
    },
    {
      id: 'ind2',
      nombre: 'Endeudamiento',
      descripcion: 'Indicador de endeudamiento',
      meta: 0.5,
      color: '#2196F3',
      mayorEsMejor: false,
      estaActivo: true,
      umbrales: {
        umbrales: [
          {
            color: '#4CAF50',
            nivel: 'Óptimo',
            valorMax: 0.5,
            valorMin: 0,
            descripcion: 'Nivel óptimo'
          },
          {
            color: '#FFA500',
            nivel: 'Advertencia',
            valorMax: 0.7,
            valorMin: 0.5,
            descripcion: 'Nivel de advertencia'
          },
          {
            color: '#FF0000',
            nivel: 'Crítico',
            valorMax: 1,
            valorMin: 0.7,
            descripcion: 'Nivel crítico'
          }
        ],
        configuracion: {
          decimales: 2,
          invertido: true,
          mostrarTendencia: true,
          formatoVisualizacion: 'porcentaje'
        },
        alerta: 0.7,
        advertencia: 0.5
      },
      estaEnPantallaInicial: true,
      ordenMuestra: 2,
      numerador: {
        componentes: [
          {
            coeficiente: 1,
            cuentas: ['2'] // Pasivos totales
          }
        ]
      },
      denominador: {
        componentes: [
          {
            coeficiente: 1,
            cuentas: ['1'] // Activos totales
          }
        ]
      },
      numeradorAbsoluto: false,
      denominadorAbsoluto: false
    }
  ];
}

/**
 * Ejemplo de cómo usar el módulo con datos de prueba
 */
function ejemploConDatosDePrueba() {
  // Datos de prueba (saldos contables)
  const saldosDePrueba = [
    {
      codigoCuentaContable: 11,
      codigoOficina: '001',
      esDeudora: 1,
      fecha: '2025-05-29',
      nombreCuentaContable: 'Caja',
      nombreOficina: 'Oficina Principal',
      saldo: 10000
    },
    {
      codigoCuentaContable: 12,
      codigoOficina: '001',
      esDeudora: 1,
      fecha: '2025-05-29',
      nombreCuentaContable: 'Bancos',
      nombreOficina: 'Oficina Principal',
      saldo: 50000
    },
    {
      codigoCuentaContable: 13,
      codigoOficina: '001',
      esDeudora: 1,
      fecha: '2025-05-29',
      nombreCuentaContable: 'Inversiones',
      nombreOficina: 'Oficina Principal',
      saldo: 20000
    },
    {
      codigoCuentaContable: 21,
      codigoOficina: '001',
      esDeudora: 0,
      fecha: '2025-05-29',
      nombreCuentaContable: 'Proveedores',
      nombreOficina: 'Oficina Principal',
      saldo: 30000
    },
    {
      codigoCuentaContable: 22,
      codigoOficina: '001',
      esDeudora: 0,
      fecha: '2025-05-29',
      nombreCuentaContable: 'Obligaciones Financieras',
      nombreOficina: 'Oficina Principal',
      saldo: 20000
    }
  ];
  
  // Calcular indicadores con datos de prueba
  calcularIndicadores(saldosDePrueba)
    .then(resultado => {
      console.log('Indicadores calculados:');
      console.log(JSON.stringify(resultado, null, 2));
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Exportar funciones
module.exports = {
  calcularIndicadores,
  ejemploConDatosDePrueba
};

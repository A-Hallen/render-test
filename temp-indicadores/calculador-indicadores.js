/**
 * Módulo para el cálculo de indicadores financieros
 * Contiene la lógica principal para calcular indicadores financieros
 * a partir de saldos contables
 */

/**
 * Calcula un indicador financiero basado en su configuración y los saldos contables
 * @param {Object} indicador - Configuración del indicador
 * @param {Array} saldos - Lista de saldos contables
 * @returns {Object} - Resultado del cálculo
 */
function calcularIndicadorFinanciero(indicador, saldos) {
  try {
    // Calcular numerador
    const resultadoNumerador = calcularParteDeLaFormula(
      saldos,
      indicador.numerador,
      indicador.numeradorAbsoluto
    );

    // Calcular denominador
    const resultadoDenominador = calcularParteDeLaFormula(
      saldos,
      indicador.denominador,
      indicador.denominadorAbsoluto
    );

    // Evitar división por cero
    if (resultadoDenominador.total === 0) {
      console.log(`Denominador es cero para ${indicador.nombre}`);
      return {
        valor: 0,
        componentes: {
          numerador: resultadoNumerador.total,
          denominador: resultadoDenominador.total,
          detalle: {
            numerador: resultadoNumerador.valoresPorCuenta,
            denominador: resultadoDenominador.valoresPorCuenta
          }
        }
      };
    }

    // Calcular valor final
    const valor = resultadoNumerador.total / resultadoDenominador.total;

    return {
      valor,
      componentes: {
        numerador: resultadoNumerador.total,
        denominador: resultadoDenominador.total,
        detalle: {
          numerador: resultadoNumerador.valoresPorCuenta,
          denominador: resultadoDenominador.valoresPorCuenta
        }
      }
    };
  } catch (error) {
    console.error(`Error al calcular indicador ${indicador.nombre}:`, error);
    throw new Error(`Error al calcular indicador ${indicador.nombre}: ${error.message}`);
  }
}

/**
 * Calcula una parte de la fórmula (numerador o denominador)
 * @param {Array} saldos - Lista de saldos contables
 * @param {Object|Array} parte - Configuración de la parte de la fórmula
 * @param {boolean} aplicarValorAbsoluto - Indica si se debe aplicar valor absoluto
 * @returns {Object} - Resultado del cálculo
 */
function calcularParteDeLaFormula(saldos, parte, aplicarValorAbsoluto = false) {
  // Objeto para almacenar los valores por cuenta
  const valoresPorCuenta = {};
  
  // Si es un array simple de códigos (formato antiguo)
  if (Array.isArray(parte)) {
    const total = filtrarPorCodigos(saldos, parte, aplicarValorAbsoluto);
    
    // Calcular valores individuales por cuenta
    saldos.forEach(saldo => {
      if (parte.some(codigo => saldo.codigoCuentaContable.toString() === codigo.toString())) {
        const valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
        valoresPorCuenta[saldo.codigoCuentaContable] = valor;
      }
    });

    return {
      total,
      valoresPorCuenta
    };
  }

  // Si es el formato con base, suma y resta
  if (parte.base || parte.suma || parte.resta) {
    // Calcular valor base
    const valorBase = parte.base ? filtrarPorCodigos(saldos, parte.base, aplicarValorAbsoluto) : 0;
    
    // Calcular valores individuales para base
    if (parte.base) {
      saldos.forEach(saldo => {
        if (parte.base.some(codigo => saldo.codigoCuentaContable.toString() === codigo.toString())) {
          const valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
          valoresPorCuenta[saldo.codigoCuentaContable] = valor;
        }
      });
    }

    // Calcular valor a sumar
    const valorSuma = parte.suma ? filtrarPorCodigos(saldos, parte.suma, aplicarValorAbsoluto) : 0;

    // Calcular valores individuales para suma
    if (parte.suma) {
      saldos.forEach(saldo => {
        if (parte.suma.some(codigo => saldo.codigoCuentaContable.toString() === codigo.toString())) {
          const valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
          valoresPorCuenta[saldo.codigoCuentaContable] = valor;
        }
      });
    }

    // Calcular valor a restar
    const valorResta = parte.resta ? filtrarPorCodigos(saldos, parte.resta, aplicarValorAbsoluto) : 0;

    // Calcular valores individuales para resta
    if (parte.resta) {
      saldos.forEach(saldo => {
        if (parte.resta.some(codigo => saldo.codigoCuentaContable.toString() === codigo.toString())) {
          const valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
          valoresPorCuenta[saldo.codigoCuentaContable] = -valor; // Valor negativo para resta
        }
      });
    }

    // Calcular total
    const total = valorBase + valorSuma - valorResta;

    return {
      total,
      valoresPorCuenta
    };
  }

  // Si es el formato con componentes
  if (parte.componentes && Array.isArray(parte.componentes)) {
    let total = 0;

    // Calcular el valor para cada componente
    parte.componentes.forEach(componente => {
      const valorComponente = calcularComponenteConCoeficiente(
        saldos,
        componente,
        aplicarValorAbsoluto
      );

      total += valorComponente;

      // Calcular valores individuales por cuenta
      componente.cuentas.forEach(codigo => {
        saldos.forEach(saldo => {
          if (saldo.codigoCuentaContable.toString() === codigo.toString()) {
            let valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
            valor = valor * componente.coeficiente;
            valoresPorCuenta[saldo.codigoCuentaContable] = valor;
          }
        });
      });
    });

    return {
      total,
      valoresPorCuenta
    };
  }

  // Si no se reconoce el formato, devolver 0
  return {
    total: 0,
    valoresPorCuenta: {}
  };
}

/**
 * Filtra los saldos por códigos de cuenta contable
 * @param {Array} saldos - Lista de saldos contables
 * @param {Array} codigos - Lista de códigos de cuenta contable
 * @param {boolean} aplicarValorAbsoluto - Indica si se debe aplicar valor absoluto
 * @returns {number} - Suma de los saldos filtrados
 */
function filtrarPorCodigos(saldos, codigos, aplicarValorAbsoluto = false) {
  return saldos
    .filter(s => codigos.some(codigo => s.codigoCuentaContable.toString() === codigo.toString()))
    .reduce((sum, s) => {
      const valor = aplicarValorAbsoluto ? Math.abs(s.saldo) : s.saldo;
      return sum + valor;
    }, 0);
}

/**
 * Calcula el valor de un componente con coeficiente
 * @param {Array} saldos - Lista de saldos contables
 * @param {Object} componente - Configuración del componente
 * @param {boolean} aplicarValorAbsoluto - Indica si se debe aplicar valor absoluto
 * @returns {number} - Valor calculado
 */
function calcularComponenteConCoeficiente(saldos, componente, aplicarValorAbsoluto = false) {
  const valorCuentas = filtrarPorCodigos(saldos, componente.cuentas, aplicarValorAbsoluto);
  return valorCuentas * componente.coeficiente;
}

module.exports = {
  calcularIndicadorFinanciero,
  calcularParteDeLaFormula,
  filtrarPorCodigos,
  calcularComponenteConCoeficiente
};

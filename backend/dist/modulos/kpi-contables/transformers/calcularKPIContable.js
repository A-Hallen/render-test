"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularKPIContable = void 0;
const calcularKPIContable = (indicador, saldos) => {
    try {
        console.log("entra a calcularKPIContable");
        // Calcular numerador
        const resultadoNumerador = _calcularParteDeLaFormula(saldos, indicador.numerador, indicador.numeradorAbsoluto);
        // Calcular denominador
        const resultadoDenominador = _calcularParteDeLaFormula(saldos, indicador.denominador, indicador.denominadorAbsoluto);
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
        console.log(`Resultado para ${indicador.nombre}: ${valor}`);
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
    }
    catch (error) {
        console.error(`Error al calcular KPI ${indicador.nombre}:`, error);
        throw new Error(`Error al calcular KPI ${indicador.nombre}: ${error.message}`);
    }
};
exports.calcularKPIContable = calcularKPIContable;
const _calcularParteDeLaFormula = (saldos, parte, aplicarValorAbsoluto = false) => {
    // Objeto para almacenar los valores por cuenta
    const valoresPorCuenta = {};
    // Si es un array simple de códigos (formato antiguo)
    if (Array.isArray(parte)) {
        const total = _filtrarPorCodigos(saldos, parte, aplicarValorAbsoluto);
        console.log("total revisar", total);
        // Calcular valores individuales por cuenta
        saldos.forEach(saldo => {
            // Verificar si parte es un array antes de usar el mu00e9todo some()
            if (Array.isArray(parte) && parte.some(codigo => saldo.codigoCuentaContable === Number(codigo))) {
                console.log("entro al if", saldo.codigoCuentaContable);
                const valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
                valoresPorCuenta[saldo.codigoCuentaContable] = valor;
            }
        });
        return {
            total,
            valoresPorCuenta
        };
    }
    console.log("vaa al segundo");
    // Si es el formato antiguo con base, suma y resta
    if (parte.base || parte.suma || parte.resta) {
        // Calcular valor base
        const valorBase = parte.base ? _filtrarPorCodigos(saldos, parte.base, aplicarValorAbsoluto) : 0;
        console.log("valorBase revisar", valorBase);
        // Calcular valores individuales para base
        if (parte.base) {
            saldos.forEach(saldo => {
                if (parte.base?.some(codigo => saldo.codigoCuentaContable === Number(codigo))) {
                    console.log("entro al if", saldo.codigoCuentaContable);
                    const valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
                    valoresPorCuenta[saldo.codigoCuentaContable] = valor;
                }
            });
        }
        // Calcular valor a sumar
        const valorSuma = parte.suma ? _filtrarPorCodigos(saldos, parte.suma, aplicarValorAbsoluto) : 0;
        // Calcular valores individuales para suma
        if (parte.suma) {
            saldos.forEach(saldo => {
                if (parte.suma?.some(codigo => saldo.codigoCuentaContable === Number(codigo))) {
                    const valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
                    valoresPorCuenta[saldo.codigoCuentaContable] = valor;
                }
            });
        }
        // Calcular valor a restar
        const valorResta = parte.resta ? _filtrarPorCodigos(saldos, parte.resta, aplicarValorAbsoluto) : 0;
        // Calcular valores individuales para resta
        if (parte.resta) {
            saldos.forEach(saldo => {
                if (parte.resta?.some(codigo => saldo.codigoCuentaContable === Number(codigo))) {
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
    console.log("vaa al tercero");
    // Si es el formato nuevo con componentes
    if (parte.componentes && Array.isArray(parte.componentes)) {
        let total = 0;
        // Calcular el valor para cada componente
        parte.componentes.forEach(componente => {
            const valorComponente = _calcularComponenteConCoeficiente(saldos, componente, aplicarValorAbsoluto);
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
};
const _filtrarPorCodigos = (saldos, codigos, aplicarValorAbsoluto = false) => {
    return saldos
        .filter(s => {
        // Verificar si alguno de los códigos coincide exactamente con el código de cuenta
        return codigos.some(codigo => s.codigoCuentaContable.toString() === codigo.toString());
    })
        .reduce((sum, s) => {
        // Aplicar valor absoluto si es necesario, de lo contrario usar el valor tal cual
        const valor = aplicarValorAbsoluto ? Math.abs(s.saldo) : s.saldo;
        return sum + valor;
    }, 0);
};
const _calcularComponenteConCoeficiente = (saldos, componente, aplicarValorAbsoluto = false) => {
    const valorCuentas = _filtrarPorCodigos(saldos, componente.cuentas, aplicarValorAbsoluto);
    return valorCuentas * componente.coeficiente;
};

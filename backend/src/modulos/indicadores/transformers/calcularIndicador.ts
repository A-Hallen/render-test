import { SaldosContables } from "../../saldosContables/saldos.model";
import { Indicador } from "../indicadores.model";

export const calcularIndicador = (indicador: Indicador, saldos: SaldosContables[]) => {
    try {
        // Calcular numerador
        const resultadoNumerador = _calcularParteDeLaFormula(
            saldos,
            indicador.numerador as Parte | string[],
            indicador.numeradorAbsoluto
        );

        // Calcular denominador
        const resultadoDenominador = _calcularParteDeLaFormula(
            saldos,
            indicador.denominador as Parte | string[],
            indicador.denominadorAbsoluto
        );

        // Evitar divisiu00f3n por cero
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
    } catch (error: any) {
        console.error(`Error al calcular indicador ${indicador.nombre}:`, error);
        throw new Error(`Error al calcular indicador ${indicador.nombre}: ${error.message}`);
    }
}

interface Componente {
    cuentas: string[]; // Códigos de cuenta contable
    coeficiente: number; // Coeficiente para el componente
}

interface Parte {
    base?: string[];
    suma?: string[];
    resta?: string[];
    componentes?: Componente[];
}

const _calcularParteDeLaFormula = (saldos: SaldosContables[], parte: Parte | string[], aplicarValorAbsoluto = false) => {
    // Objeto para almacenar los valores por cuenta
    const valoresPorCuenta: Record<string, number> = {};
    // Si es un array simple de cu00f3digos (formato antiguo)
    if (Array.isArray(parte)) {
        const total = _filtrarPorCodigos(saldos, parte, aplicarValorAbsoluto);

        // Calcular valores individuales por cuenta
        saldos.forEach(saldo => {
            if (parte.some(codigo => saldo.codigoCuentaContable.toString() === codigo)) {
                const valor = aplicarValorAbsoluto ? Math.abs(saldo.saldo) : saldo.saldo;
                valoresPorCuenta[saldo.codigoCuentaContable] = valor;
            }
        });

        return {
            total,
            valoresPorCuenta
        };
    }

    // Si es el formato antiguo con base, suma y resta
    if (parte.base || parte.suma || parte.resta) {
        // Calcular valor base
        const valorBase = parte.base ? _filtrarPorCodigos(saldos, parte.base, aplicarValorAbsoluto) : 0;

        // Calcular valores individuales para base
        if (parte.base) {
            saldos.forEach(saldo => {
                if (parte.base?.some(codigo => saldo.codigoCuentaContable === Number(codigo))) {
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

    // Si es el formato nuevo con componentes
    if (parte.componentes && Array.isArray(parte.componentes)) {
        let total = 0;

        // Calcular el valor para cada componente
        parte.componentes.forEach(componente => {
            const valorComponente = _calcularComponenteConCoeficiente(
                saldos,
                componente,
                aplicarValorAbsoluto
            );

            total += valorComponente;

            // Calcular valores individuales por cuenta
            componente.cuentas.forEach(codigo => {
                saldos.forEach(saldo => {
                    if (saldo.codigoCuentaContable.toString() === codigo) {
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

const _filtrarPorCodigos = (saldos: SaldosContables[], codigos: string[], aplicarValorAbsoluto = false) => {
    const saldosFiltrados = saldos.filter(s => {
        // Verificar si alguno de los códigos coincide exactamente con el código de cuenta
        return codigos.some(codigo =>
            s.codigoCuentaContable.toString() === codigo
        );
    })  
    const saldosReducidos = saldosFiltrados.reduce((sum, s) => {
        // Aplicar valor absoluto si es necesario, de lo contrario usar el valor tal cual
        const valor = aplicarValorAbsoluto ? Math.abs(s.saldo) : s.saldo;
        return sum + valor;
    }, 0);

    return saldosReducidos;
}

const _calcularComponenteConCoeficiente = (saldos: SaldosContables[], componente: Componente, aplicarValorAbsoluto = false) => {
    const valorCuentas = _filtrarPorCodigos(saldos, componente.cuentas, aplicarValorAbsoluto);
    return valorCuentas * componente.coeficiente;
}
import { IndicadorResponse } from "shared/src/types/indicadores.types";

export const FormulaPreview = ({ indicador }: { indicador: IndicadorResponse }) => {
    // Función para generar la representación de texto de un componente
    const renderComponente = (componente: {coeficiente: number, cuentas: string[]}, index: any) => {
      // Solo agregar el signo + si no es el primer componente
      const signo = index > 0 ? ' + ' : '';
      const coeficiente = componente.coeficiente !== 1 ? `${componente.coeficiente} × ` : '';
      const cuentas = componente.cuentas
        .filter(cuenta => cuenta.trim() !== '')
        .map(cuenta => `[${cuenta}]`)
        .join(' + ');

      return cuentas ? `${signo}${coeficiente}${cuentas}` : '';
    };

    // Generar representación del numerador
    const numeradorTexto = indicador.numerador.componentes
      .map((comp, index) => renderComponente(comp, index))
      .filter(texto => texto)
      .join('');

    // Generar representación del denominador
    const denominadorTexto = indicador.denominador.componentes
      .map((comp, index) => renderComponente(comp, index))
      .filter(texto => texto)
      .join('');

    // Aplicar valor absoluto si está marcado
    const numeradorFinal = indicador.numeradorAbsoluto ? `|${numeradorTexto}|` : numeradorTexto || '0';
    const denominadorFinal = indicador.denominadorAbsoluto ? `|${denominadorTexto}|` : denominadorTexto || '1';

    return (
      <div className="formula-preview p-3 bg-light rounded border">
        <div className="text-center">
          <div className="numerator mb-1">{numeradorFinal}</div>
          <div className="divider position-relative">
            <hr className="m-0" />
          </div>
          <div className="denominator mt-1">{denominadorFinal}</div>
        </div>
      </div>
    );
  };

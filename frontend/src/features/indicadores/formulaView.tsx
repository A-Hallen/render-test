import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Component, IndicadorResponse } from "shared/src/types/indicadores.types";
import {FormulaPreview} from "./FormulaPreview";

type ModalProps = {
  indicador?: IndicadorResponse | null;
  setIndicadores?: (indicador: IndicadorResponse) => void;
  acceptText?: string;
};

export type ModalHandle = {
  openModal: () => void;
  closeModal: () => void;
};

const Modal = forwardRef<ModalHandle, ModalProps>(
  ({ indicador, setIndicadores, acceptText = "Guardar" }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [numerador, setNumerador] = useState("");
    const [denominador, setDenominador] = useState("");
    const [numeradorAbsoluto, setNumeradorAbsoluto] = useState(indicador?.numeradorAbsoluto || false);
    const [denominadorAbsoluto, setDenominadorAbsoluto] = useState(indicador?.denominadorAbsoluto || false);

    const openModal = () => {
      setIsOpen(true);
      setTimeout(() => setIsVisible(true), 100);
    };

    const closeModal = () => {
      setIsVisible(false);
      // Espera a que termine la animación antes de cerrar
      setTimeout(() => setIsOpen(false), 300);
    };

    // Expone las funciones al componente padre
    useImperativeHandle(ref, () => ({
      openModal,
      closeModal,
    }));

    // Cierra el modal al presionar Escape
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          closeModal();
        }
      };

      const cargarForula = () => {
        const numeradorTexto = indicador?.numerador.componentes
          .map((comp, index) => {
            const coeficiente =
              comp.coeficiente !== 1 ? `${comp.coeficiente}*` : "";
            const cuenta =
              comp.cuentas && comp.cuentas.length > 0 ? comp.cuentas[0] : "";
            return `${coeficiente}${cuenta}`;
          })
          .filter((t) => t)
          .join("+");

        // Generar texto del denominador
        const denominadorTexto = indicador?.denominador.componentes
          .map((comp, index) => {
            const coeficiente =
              comp.coeficiente !== 1 ? `${comp.coeficiente}*` : "";
            const cuenta =
              comp.cuentas && comp.cuentas.length > 0 ? comp.cuentas[0] : "";
            return `${coeficiente}${cuenta}`;
          })
          .filter((t) => t)
          .join("+");

        setNumerador(numeradorTexto || "");
        setDenominador(denominadorTexto || "");
        setNumeradorAbsoluto(indicador?.numeradorAbsoluto || false);
        setDenominadorAbsoluto(indicador?.denominadorAbsoluto || false);
      };

      cargarForula();

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    if (!isOpen) return null;

    const save = () => {
        if(!indicador) return;
        const nuevoIndicador = {...indicador};
        const _numerador = procesarComponente(numerador);
        const _denominador = procesarComponente(denominador);
        nuevoIndicador.numerador = _numerador;
        nuevoIndicador.denominador = _denominador;
        nuevoIndicador.numeradorAbsoluto = numeradorAbsoluto;
        nuevoIndicador.denominadorAbsoluto = denominadorAbsoluto;
        closeModal();
        if(nuevoIndicador !== indicador && setIndicadores){
            setIndicadores(nuevoIndicador);
        }
    }

    const procesarComponente = (texto: string): Component => {
         // Analizar la expresión para extraer componentes
         let componentesTexto: string[] = [];

         // Si hay texto, dividirlo por +
         if (texto.trim()) {
           componentesTexto = texto.split('+').map(t => t.trim()).filter(t => t);
         }

         // Procesar cada componente
         const componentes = componentesTexto.map(compTexto => {
           // Verificar si hay un coeficiente (búsqueda de *)
           const partes = compTexto.split('*');
           let coeficiente = 1;
           let cuentasTexto = compTexto;

           if (partes.length > 1) {
             // Si hay un *, el primer elemento es el coeficiente
             const coefStr = partes[0].trim();
             coeficiente = parseFloat(coefStr) || 1;
             cuentasTexto = partes.slice(1).join('*').trim(); // Todo lo demás son cuentas
           }

           // Obtener las cuentas (puede ser solo una)
           const cuentas = [cuentasTexto].filter(c => c.trim() !== '');

           return {
                coeficiente,
                cuentas: cuentas.length > 0 ? cuentas : ['']
           };
    });
    return {
        componentes: componentes
    }
};

    return (
      <>
        {/* Backdrop con animación */}
        <div
          style={{ margin: 0 }}
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        {/* Modal con animación */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={closeModal}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div
            className="relative w-full max-w-2xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {indicador?.nombre}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* Modal body */}
              <div className="p-4 md:p-5 flex gap-1 flex-wrap">
                <div className="bg-gray-100 px-2 py-4 rounded-md flex-1">
                  <div className="flex items-center">
                    <label className="text-sm" htmlFor="numerador">
                      Numerador:
                    </label>

                    <label className="inline-flex items-center ml-auto cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        checked={numeradorAbsoluto}
                        onChange={(e) => setNumeradorAbsoluto(e.target.checked)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                      Valor Absoluto
                      </span>
                    </label>
                  </div>

                  <input
                    type="text"
                    id="numerador"
                    value={numerador}
                    onChange={(e) => setNumerador(e.target.value)}
                    className="w-full p-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Numerador"
                  />
                </div>
                <div className="bg-gray-100 px-2 py-4 rounded-md flex-1">
                  <div className="flex items-center">
                    <label className="text-sm" htmlFor="denominador">
                      Denominador:
                    </label>

                    <label className="inline-flex items-center ml-auto cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        checked={denominadorAbsoluto}
                        onChange={(e) => setDenominadorAbsoluto(e.target.checked)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                      Valor Absoluto
                      </span>
                    </label>
                  </div>
                  <input
                  id="denominador"
                    type="text"
                    value={denominador}
                    onChange={(e) => setDenominador(e.target.value)}
                    className="w-full p-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Denominador"
                  />
                </div>

                <div className="bg-gray-100 p-4 rounded-md mt-4 w-full">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-300">
                    Vista Previa
                  </h4>
                  {indicador && <FormulaPreview indicador={indicador}/>}
                </div>

              </div>

              {/* Modal footer */}
              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  onClick={save}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {acceptText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

Modal.displayName = "Modal";

export default Modal;

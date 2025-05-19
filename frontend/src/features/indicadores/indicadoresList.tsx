import { IndicadorResponse } from "shared/src/types/indicadores.types";
import { Trash2, Calculator } from 'lucide-react';
import clsx from "clsx";

interface IndicadoresListProps {
    indicadores: IndicadorResponse[],
    setShowEditor: (show: boolean) => void,
    setEditIndicador: (indicador: IndicadorResponse | null) => void,    
    setFormulaSelected: (indicador: IndicadorResponse) => void,
    handleDelete: (indicador: IndicadorResponse) => void
};

export const IndicadoresList = ({ indicadores, setShowEditor, setEditIndicador, setFormulaSelected, handleDelete }: IndicadoresListProps) => {
    console.log("indicadores", indicadores);
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Indicador
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Criterio
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Meta
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fórmula
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {indicadores?.map((indicador) => (
                            <tr key={indicador.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{indicador.nombre}</div>
                                    <div className="text-sm text-gray-500">{indicador.descripcion}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={clsx("px-2 py-1 text-xs font-medium rounded-full", { "bg-green-100 text-green-800": indicador.mayorEsMejor, 'bg-blue-100 text-blue-800': !indicador.mayorEsMejor })}>
                                        {indicador.mayorEsMejor ? "Mayor es mejor" : "Menor es mejor"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {indicador.meta}
                                </td>
                                <td className="text-center py-4">
                                    <button
                                        onClick={() => setFormulaSelected(indicador)}
                                        className="text-sm text-center m-auto bg-blue-50 text-blue-700 rounded-md px-2 py-1 hover:bg-blue-200 hover:text-blue-800 transition-colors">Ver Fórmula</button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => {
                                            setShowEditor(true);
                                            setEditIndicador(indicador);
                                        }}
                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded-md"
                                    >
                                        <Calculator size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(indicador)}
                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-md ml-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
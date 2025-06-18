import { CreditCard, PiggyBank, Save, Users } from "lucide-react";

// Componente para la página de configuración de umbrales
export const ThresholdsSettings: React.FC = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Umbrales</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard size={20} className="text-blue-600" />
                <h3 className="text-base font-medium">Cartera</h3>
              </div>
  
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Morosidad
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Advertencia"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={3}
                      />
                      <span className="text-xs text-gray-500">Advertencia %</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Crítico"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={5}
                      />
                      <span className="text-xs text-gray-500">Crítico %</span>
                    </div>
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crecimiento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Mínimo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={1}
                      />
                      <span className="text-xs text-gray-500">Mínimo %</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Objetivo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={3}
                      />
                      <span className="text-xs text-gray-500">Objetivo %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Users size={20} className="text-green-600" />
                <h3 className="text-base font-medium">Socios</h3>
              </div>
  
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retención
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Advertencia"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={90}
                      />
                      <span className="text-xs text-gray-500">Advertencia %</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Crítico"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={85}
                      />
                      <span className="text-xs text-gray-500">Crítico %</span>
                    </div>
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crecimiento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Mínimo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={2}
                      />
                      <span className="text-xs text-gray-500">Mínimo %</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Objetivo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={5}
                      />
                      <span className="text-xs text-gray-500">Objetivo %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <PiggyBank size={20} className="text-purple-600" />
                <h3 className="text-base font-medium">Captaciones</h3>
              </div>
  
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Concentración
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Advertencia"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={20}
                      />
                      <span className="text-xs text-gray-500">Advertencia %</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Crítico"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={25}
                      />
                      <span className="text-xs text-gray-500">Crítico %</span>
                    </div>
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crecimiento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Mínimo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={1.5}
                      />
                      <span className="text-xs text-gray-500">Mínimo %</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Objetivo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        defaultValue={4}
                      />
                      <span className="text-xs text-gray-500">Objetivo %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="mt-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition">
              <Save className="mr-2" size={18} />
              <span>Guardar umbrales</span>
            </button>
          </div>
        </div>
      </div>
    );
  };
// Componente para la página de configuración de fuentes de datos
export const DataSourceSettings: React.FC = () => {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Fuentes de Datos</h2>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-800">
              Configure las fuentes de datos que serán utilizadas por el sistema para generar informes y análisis.
            </p>
          </div>
  
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Core Bancario</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Conexión
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="api">API REST</option>
                  <option value="database">Conexión de Base de Datos</option>
                  <option value="sftp">SFTP (Archivos)</option>
                </select>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Servicio
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://api.core-bancario.com/v1"
                />
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario de Autenticación
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña / API Key
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo de Sincronización
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="15">Cada 15 minutos</option>
                  <option value="30">Cada 30 minutos</option>
                  <option value="60">Cada hora</option>
                  <option value="360">Cada 6 horas</option>
                  <option value="720">Cada 12 horas</option>
                  <option value="1440">Diariamente</option>
                </select>
              </div>
  
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">
                  Probar conexión
                </button>
  
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Guardar configuración
                </button>
              </div>
            </div>
          </div>
  
          <div className="mt-4">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              + Añadir nueva fuente de datos
            </button>
          </div>
        </div>
      </div>
    );
  };
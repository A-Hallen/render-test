import React, { useState } from 'react';
import { KpiFormulaEditor } from '../components/settings/KpiFormulaEditor';
import { UserManagement } from '../components/settings/UserManagement';
import { CooperativaConfig } from '../components/settings/CooperativaConfig';
import {
  Globe,
  User,
  Lock,
  Database,
  Bell,
  Save,
  CreditCard,
  Users,
  PiggyBank,
  Calculator,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from 'shared/src/types/auth.types';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const {user} = useAuth();

  //solo los usuarios con rol de administrador pueden ver el apartado de general
  if (user?.role !== UserRole.ADMIN) {
    return <div>Acceso denegado</div>;
  }

  const tabs = [];

  if (user?.role === UserRole.ADMIN) {
    tabs.push({ id: 'general', name: 'General', icon: <Globe size={18} /> });
  }

  tabs.push({ id: 'indicadores', name: 'Indicadores', icon: <Calculator size={18} /> });
  tabs.push({ id: 'user', name: 'Usuario', icon: <User size={18} /> });
  tabs.push({ id: 'security', name: 'Seguridad', icon: <Lock size={18} /> });
  tabs.push({ id: 'dataSource', name: 'Fuentes de Datos', icon: <Database size={18} /> });
  tabs.push({ id: 'notifications', name: 'Notificaciones', icon: <Bell size={18} /> });
  tabs.push({ id: 'thresholds', name: 'Umbrales', icon: <AlertTriangle size={18} /> });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`w-full flex items-center space-x-2 py-2 px-3 rounded-md text-sm ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            {activeTab === 'general' && (
              <CooperativaConfig/>
            )}

            {activeTab === 'indicadores' && (
              <KpiFormulaEditor />
            )}
            
            {activeTab === 'user' && (
              <UserManagement />
            )}

            {activeTab === 'thresholds' && (
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
            )}

            {activeTab === 'dataSource' && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
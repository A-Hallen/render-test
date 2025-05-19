import React, { useState } from "react";
import { Umbral } from "shared/src/types/indicadores.types";

interface UmbralesEditorProps {
  umbrales: Umbral;
  onUmbralesChange: (umbrales: Umbral) => void;
}

export const UmbralesEditor: React.FC<UmbralesEditorProps> = ({
  umbrales,
  onUmbralesChange,
}) => {

  const handleThresholdChange = (index: number, field: string, value: any) => {
    const newUmbrales = { ...umbrales };
    if (field === "color") {
      newUmbrales.umbrales[index].color = value;
    } else if (field === "nivel") {
      newUmbrales.umbrales[index].nivel = value;
    } else if (field === "valorMin") {
      newUmbrales.umbrales[index].valorMin = Number(value);
    } else if (field === "valorMax") {
      newUmbrales.umbrales[index].valorMax = Number(value);
    } else if (field === "descripcion") {
      newUmbrales.umbrales[index].descripcion = value;
    }
    onUmbralesChange(newUmbrales);
  };

  const handleConfigChange = (field: string, value: any) => {
    const newUmbrales = { ...umbrales };
    if (field === "decimales") {
      newUmbrales.configuracion.decimales = Number(value);
    } else if (field === "invertido") {
      newUmbrales.configuracion.invertido = value;
    } else if (field === "mostrarTendencia") {
      newUmbrales.configuracion.mostrarTendencia = value;
    } else if (field === "formatoVisualizacion") {
      newUmbrales.configuracion.formatoVisualizacion = value;
    }
    onUmbralesChange(newUmbrales);
  };

  const handleAlertChange = (field: string, value: any) => {
    const newUmbrales = { ...umbrales };
    if (field === "alerta") {
      newUmbrales.alerta = Number(value);
    } else if (field === "advertencia") {
      newUmbrales.advertencia = Number(value);
    }
    onUmbralesChange(newUmbrales);
  };

  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Umbral Configurations */}
        <div>
          <h2 className="text-lg font-bold mb-4">Configuración de Umbral</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimales
              </label>
              <select
                value={umbrales.configuracion.decimales}
                onChange={(e) => handleConfigChange("decimales", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invertido
              </label>
              <select
                value={umbrales.configuracion.invertido ? "true" : "false"}
                onChange={(e) => handleConfigChange("invertido", e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mostrar Tendencia
              </label>
              <select
                value={umbrales.configuracion.mostrarTendencia ? "true" : "false"}
                onChange={(e) => handleConfigChange("mostrarTendencia", e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formato Visualización
              </label>
              <select
                value={umbrales.configuracion.formatoVisualizacion}
                onChange={(e) => handleConfigChange("formatoVisualizacion", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal</option>
                <option value="porcentaje">Porcentaje</option>
              </select>
            </div>
          </div>
        </div>

        {/* Threshold Levels */}
        <div>
          <h2 className="text-lg font-bold mb-4">Niveles de Umbral</h2>
          <div className="space-y-4">
            {umbrales.umbrales.map((umbral, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-bold mb-4">Umbral {index + 1}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={umbral.color}
                      onChange={(e) => handleThresholdChange(index, "color", e.target.value)}
                      className="w-24 h-8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel
                    </label>
                    <input
                      type="text"
                      value={umbral.nivel}
                      onChange={(e) => handleThresholdChange(index, "nivel", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Mínimo
                      </label>
                      <input
                        type="number"
                        value={umbral.valorMin}
                        onChange={(e) => handleThresholdChange(index, "valorMin", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Máximo
                      </label>
                      <input
                        type="number"
                        value={umbral.valorMax}
                        onChange={(e) => handleThresholdChange(index, "valorMax", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={umbral.descripcion}
                      onChange={(e) => handleThresholdChange(index, "descripcion", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert and Warning Levels */}
        <div>
          <h2 className="text-lg font-bold mb-4">Niveles de Alerta</h2>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alerta
              </label>
              <input
                type="number"
                value={umbrales.alerta}
                onChange={(e) => handleAlertChange("alerta", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advertencia
              </label>
              <input
                type="number"
                value={umbrales.advertencia}
                onChange={(e) => handleAlertChange("advertencia", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

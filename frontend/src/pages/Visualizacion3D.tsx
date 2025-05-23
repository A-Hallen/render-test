/**
 * Pu00e1gina de visualizaciones 3D
 * Muestra la demostraciu00f3n de visualizaciones 3D con la arquitectura genu00e9rica
 */

import React from 'react';
import DemoVisualizacion from '../features/visualizacion/ejemplos/DemoVisualizacion';

export const Visualizacion3D: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Visualizaciones Financieras 3D</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <DemoVisualizacion />
      </div>
    </div>
  );
};

export default Visualizacion3D;

import React from 'react';

interface IndicadorCircularProps {
  valor: number;
  etiqueta: string;
  color: string;
}

export const IndicadorCircular: React.FC<IndicadorCircularProps> = ({ valor, etiqueta, color }) => {
  // Formatear el valor como porcentaje
  const valorFormateado = valor.toFixed(2) + '%';
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <div 
        className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-xl"
        style={{ backgroundColor: color }}
      >
        {valorFormateado}
      </div>
      <div className="absolute bottom-2 text-xs uppercase font-medium text-center w-full">
        RENDIMIENTO<br />
        {etiqueta}
      </div>
    </div>
  );
};

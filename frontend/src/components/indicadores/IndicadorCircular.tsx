import React from 'react';

interface IndicadorCircularProps {
  valor: number;
  etiqueta: string;
  color: string;
  onClick?: () => void;
}

export const IndicadorCircular: React.FC<IndicadorCircularProps> = ({ valor, etiqueta, color, onClick }) => {
  // Formatear el valor como porcentaje
  // Usar menos decimales para números grandes y más para números pequeños
  const valorFormateado = valor >= 100 ? Math.round(valor) + '%' : 
                         valor >= 10 ? valor.toFixed(1) + '%' : 
                         valor.toFixed(2) + '%';
  
  // Calcular el ángulo para el arco del indicador (360 grados * porcentaje / 100)
  const radius = 50;
  const strokeDasharray = 2 * Math.PI * radius; // Circunferencia del círculo (2 * PI * r)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * Math.min(valor, 100)) / 100;
  
  // Determinar el color de fondo basado en el rendimiento (usando tonos más elegantes)
  const bgColor = {
    'DEFICIENTE': 'rgba(236, 240, 241, 0.8)', // Gris claro elegante
    'ACEPTABLE': 'rgba(236, 240, 241, 0.8)',  // Gris claro elegante
    'BUENO': 'rgba(236, 240, 241, 0.8)'       // Gris claro elegante
  }[etiqueta] || 'rgba(236, 240, 241, 0.8)';  // Fondo neutro para todos los estados
  
  return (
    <div 
      className={`flex flex-col items-center justify-center p-4 w-full ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''}`}
      onClick={onClick}
    >
      <div className="relative w-40 h-40 flex items-center justify-center mx-auto">
        {/* Círculo de fondo con sombra elegante */}
        <div 
          className="absolute inset-0 rounded-full shadow-inner"
          style={{ backgroundColor: bgColor }}
        />
        
        {/* Indicador circular SVG con estilo más elegante */}
        <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
          <circle
            cx="80"
            cy="80"
            r="50"
            fill="transparent"
            stroke="#f5f5f5"
            strokeWidth="4"
          />
          <circle
            cx="80"
            cy="80"
            r="50"
            fill="transparent"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Valor central con tipografía mejorada */}
        <div className="z-10 flex flex-col items-center justify-center w-full max-w-[85%]">
          <span 
            className="font-bold text-center" 
            style={{ 
              color, 
              fontSize: valor >= 100 ? '1.2rem' : 
                       valor >= 10 ? '1.4rem' : '1.6rem',
              lineHeight: '1.1'
            }}
          >
            {valorFormateado}
          </span>
          <div className="mt-1 px-1.5 py-0.5 rounded-full bg-white shadow-sm border border-gray-100">
            <span className="text-[10px] font-medium text-gray-600">{etiqueta}</span>
          </div>
        </div>
      </div>
      
      {/* Etiqueta de rendimiento con estilo mejorado */}
      <div className="mt-3 text-center">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">RENDIMIENTO</span>
      </div>
    </div>
  );
};

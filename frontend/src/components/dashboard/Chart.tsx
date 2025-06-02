import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

type ChartType = 'line' | 'bar' | 'area';

interface DataPoint {
  [key: string]: string | number;
}

interface ChartProps {
  type: ChartType;
  data: DataPoint[];
  xDataKey: string;
  series: {
    dataKey: string;
    color: string;
    name?: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  stackedBars?: boolean;
}

export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  xDataKey,
  series,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  stackedBars = false,
}) => {
  // Filtrar los datos para eliminar puntos donde todas las series tienen valor 0 o null/undefined
  const filteredData = data.filter(point => {
    // Verificar si al menos una serie tiene datos válidos
    return series.some(s => {
      const value = point[s.dataKey];
      return value !== null && value !== undefined && value !== 0 && value !== '';
    });
  });
  
  // Extraer solo las fechas válidas para el eje X
  const validXValues = filteredData.map(item => item[xDataKey]);
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={filteredData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis 
              dataKey={xDataKey} 
              tick={{ fontSize: 12 }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false} 
              ticks={validXValues}
              interval="preserveStartEnd"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false} 
              width={40}
            />
            {showTooltip && <RechartsTooltip />}
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />}
            {series.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={filteredData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis 
              dataKey={xDataKey} 
              tick={{ fontSize: 12 }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false}
              ticks={validXValues}
              interval="preserveStartEnd"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false} 
              width={40}
            />
            {showTooltip && <RechartsTooltip />}
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />}
            {series.map((s) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                fill={s.color}
                stackId={stackedBars ? 'stack' : undefined}
                radius={stackedBars ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart data={filteredData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis 
              dataKey={xDataKey} 
              tick={{ fontSize: 12 }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false}
              ticks={validXValues}
              interval="preserveStartEnd"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false} 
              width={40}
            />
            {showTooltip && <RechartsTooltip />}
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />}
            {series.map((s) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.2}
              />
            ))}
          </AreaChart>
        );
      
      default:
        return null;
    }
  };

  // Asegurarse de que siempre devolvemos un elemento React válido
  const chartElement = renderChart();
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      {chartElement || <div>No hay datos disponibles</div>}
    </ResponsiveContainer>
  );
};
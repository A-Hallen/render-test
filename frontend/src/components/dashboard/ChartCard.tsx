import React, { useState } from 'react';
import { Chart } from './Chart';
import { ChevronDown, MoreHorizontal, Download, RefreshCw } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subTitle?: string;
  type: 'line' | 'bar' | 'area';
  data: any[];
  xDataKey: string;
  series: {
    dataKey: string;
    color: string;
    name?: string;
  }[];
  height?: number;
  filters?: string[];
  onFilterChange?: (selectedFilter: string) => void; // Nuevo callback opcional
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subTitle,
  type,
  data,
  xDataKey,
  series,
  height = 300,
  filters = ['Último mes', 'Último trimestre', 'Último año', 'Personalizado'],
  onFilterChange
}) => {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [showFilters, setShowFilters] = useState(false);

  const selectFilter = (filter: string) => {
    setSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter); // Invocamos el callback si está definido
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {subTitle && <p className="text-sm text-gray-500 mt-1">{subTitle}</p>}
        </div>

        <div className="flex items-center space-x-2">
          {filters && filters.length > 0 && onFilterChange && (
            <div className="relative">
              <button
                className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-1.5"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>{selectedFilter}</span>
                <ChevronDown size={16} />
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      className={`block w-full text-left px-4 py-2 text-sm ${filter === selectedFilter
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      onClick={() => {
                        selectFilter(filter);
                        setShowFilters(false);
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="relative group">
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
              <MoreHorizontal size={18} />
            </button>

            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200 hidden group-hover:block">
              <button className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Download size={16} />
                <span>Exportar datos</span>
              </button>
              <button className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <RefreshCw size={16} />
                <span>Actualizar datos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Chart
        type={type}
        data={data}
        xDataKey={xDataKey}
        series={series}
        height={height}
        showGrid={true}
        showLegend={true}
      />
    </div>
  );
};
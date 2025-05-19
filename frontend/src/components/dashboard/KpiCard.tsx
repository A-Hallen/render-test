import React from 'react';
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  description?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  description,
  color = 'blue',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'red':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = () => {
    if (!change) return null;
    return change > 0 ? (
      <ArrowUpRight size={16} className="text-green-600" />
    ) : (
      <ArrowDownRight size={16} className="text-red-600" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            {description && (
              <Tooltip content={description}>
                <span><HelpCircle size={14} className="text-gray-400" /></span>
              </Tooltip>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-2 rounded-full ${getColorClasses()}`}>
          {icon}
        </div>
      </div>
      
      {change !== undefined && (
        <div className="mt-3 flex items-center">
          {getChangeIcon()}
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {Math.abs(change)}%
          </span>
          <span className="ml-1 text-xs text-gray-500">
            {changeLabel || 'vs último período'}
          </span>
        </div>
      )}
    </div>
  );
};
import React from 'react';
// Nota: Es necesario instalar react-datepicker: npm install react-datepicker @types/react-datepicker
// Comentamos temporalmente la importación hasta que se instale la dependencia
// import ReactDatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

/**
 * Componente DatePicker personalizado (versión simplificada)
 * Nota: En una implementación real, se recomienda usar react-datepicker
 */
interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  dateFormat?: string;
  maxDate?: Date;
  minDate?: Date;
  placeholderText?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  className = '',
  maxDate,
  minDate,
  placeholderText
}) => {
  // Formato simple YYYY-MM-DD para el input nativo
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      onChange(null);
      return;
    }
    
    try {
      const newDate = new Date(value + 'T00:00:00');
      
      // Validar contra minDate y maxDate
      if (minDate && newDate < minDate) return;
      if (maxDate && newDate > maxDate) return;
      
      onChange(newDate);
    } catch (err) {
      console.error('Error parsing date:', err);
    }
  };

  return (
    <input
      type="date"
      value={formatDateForInput(selected)}
      onChange={handleChange}
      className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      max={maxDate ? formatDateForInput(maxDate) : undefined}
      min={minDate ? formatDateForInput(minDate) : undefined}
      placeholder={placeholderText}
    />
  );
};

/**
 * Componente Progress personalizado
 */
interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = ''
}) => {
  // Asegurar que el valor esté entre 0 y max
  const safeValue = Math.min(Math.max(0, value), max);
  const percentage = (safeValue / max) * 100;
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

/**
 * Componente Checkbox personalizado
 */
interface CheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  className = '',
  disabled = false
}) => {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
      disabled={disabled}
    />
  );
};

/**
 * Componente Input personalizado
 */
interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  type = 'text'
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full ${className}`}
    />
  );
};

/**
 * Componente Switch personalizado
 */
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  className = '',
  disabled = false,
  'aria-label': ariaLabel
}) => {
  return (
    <div className={`relative inline-block w-10 h-6 ${className}`}>
      <input
        type="checkbox"
        className="opacity-0 w-0 h-0"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      <span
        className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ease-in-out ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
        onClick={() => !disabled && onCheckedChange(!checked)}
      >
        <span
          className={`absolute left-0.5 bottom-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${
            checked ? 'transform translate-x-4' : ''
          }`}
        ></span>
      </span>
    </div>
  );
};

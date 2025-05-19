import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
  };

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
        className: `${children.props.className || ''} cursor-help`,
      })}
      
      {isVisible && (
        <div
          className={`absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm max-w-xs opacity-100 whitespace-normal ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div
            className={`tooltip-arrow absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full -mt-1 left-1/2 -ml-1' :
              position === 'right' ? 'right-full -mr-1 top-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -ml-1' :
              'left-full -ml-1 top-1/2 -mt-1'
            }`}
          />
        </div>
      )}
    </div>
  );
};
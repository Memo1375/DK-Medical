import React from 'react';

interface EcgWatermarkProps {
  opacity?: number;
  className?: string;
}

export const EcgWatermark: React.FC<EcgWatermarkProps> = ({ opacity = 0.09, className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 overflow-hidden select-none z-0 ${className}`}
      style={{ opacity }}
    >
      <div className="w-[200%] flex animate-pulse-flow">
        <div className="w-1/2 flex-shrink-0 h-16 sm:h-20 bg-repeat-x" style={{ backgroundImage: 'url(/images/ecg-line.svg)', backgroundSize: '600px 100%' }} />
        <div className="w-1/2 flex-shrink-0 h-16 sm:h-20 bg-repeat-x" style={{ backgroundImage: 'url(/images/ecg-line.svg)', backgroundSize: '600px 100%' }} />
      </div>
    </div>
  );
};

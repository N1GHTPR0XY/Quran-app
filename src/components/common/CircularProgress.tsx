import React from 'react';

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number; // width & height in px
  strokeWidth?: number;
  color?: string; // hex or tailwind-compatible color
  trackColor?: string;
  gradient?: {
    from: string;
    to: string;
    id: string;
  };
  showPercentage?: boolean;
  centerText?: React.ReactNode;
  sublabel?: string;
  className?: string;
  roundedCaps?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 100,
  strokeWidth = 8,
  color = '#C5A059',
  trackColor = 'currentColor',
  gradient,
  showPercentage = true,
  centerText,
  sublabel,
  className = '',
  roundedCaps = true
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {gradient && (
          <defs>
            <linearGradient id={gradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
          </defs>
        )}

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={trackColor}
          fill="transparent"
          className="opacity-20 transition-all duration-300"
        />

        {/* Dynamic progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={gradient ? `url(#${gradient.id})` : color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap={roundedCaps ? 'round' : 'butt'}
          fill="transparent"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none">
        {centerText ? (
          centerText
        ) : showPercentage ? (
          <>
            <div className="flex items-baseline justify-center leading-none">
              <span className="font-bold tracking-tight text-current" style={{ fontSize: size * 0.24 }}>
                {Math.round(clampedValue)}
              </span>
              <span className="font-semibold text-xs ml-0.5 opacity-80" style={{ fontSize: size * 0.12 }}>
                %
              </span>
            </div>
            {sublabel && (
              <span
                className="text-[10px] uppercase font-bold tracking-wider opacity-75 mt-0.5"
                style={{ fontSize: Math.max(9, size * 0.08) }}
              >
                {sublabel}
              </span>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

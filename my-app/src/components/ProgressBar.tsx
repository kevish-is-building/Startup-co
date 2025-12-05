"use client"

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'teal' | 'blue' | 'green';
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const colorClasses = {
  teal: 'bg-teal-600',
  blue: 'bg-blue-600',
  green: 'bg-green-600',
};

export default function ProgressBar({
  percentage,
  label,
  showPercentage = true,
  size = 'md',
  color = 'teal',
}: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">{clampedPercentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
          role="progressbar"
          aria-valuenow={clampedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

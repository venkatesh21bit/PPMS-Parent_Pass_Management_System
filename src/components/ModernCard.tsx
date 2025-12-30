'use client';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function ModernCard({ children, className = '', hover = false, glow = false }: ModernCardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-xl shadow-sm
        ${hover ? 'hover:shadow-md hover:scale-[1.02] transition-all duration-200' : ''}
        ${glow ? 'ring-1 ring-blue-500/20 dark:ring-blue-400/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon, color = 'blue', trend }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <ModernCard hover>
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <p className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg flex-shrink-0 ${colorClasses[color]}`}>
            <div className="w-5 h-5 sm:w-6 sm:h-6">
              {icon}
            </div>
          </div>
        </div>
      </div>
    </ModernCard>
  );
}

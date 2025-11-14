import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, color = 'text-gray-900' }) => {
  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-white/50">
      <div>
        <div className="flex items-center justify-between text-gray-500">
          <h4 className="text-sm font-medium tracking-wide">{title}</h4>
          {icon}
        </div>
        <p className={`text-3xl font-bold mt-2 truncate ${color}`} title={value}>{value}</p>
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );
};

export default KpiCard;
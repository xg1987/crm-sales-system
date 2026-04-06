import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  variant?: 'default' | 'primary';
  subLabel?: string;
}

export default function StatsCard({ icon, value, label, variant = 'default', subLabel }: StatsCardProps) {
  if (variant === 'primary') {
    return (
      <div className="bg-primary p-8 rounded-xl flex flex-col gap-6 h-48 text-white relative overflow-hidden shadow-xl shadow-primary/20">
        <div className="relative z-10 space-y-4">
          <div className="text-white/90">{icon}</div>
          <div>
            <div className="text-3xl font-headline font-black tracking-tight">{value}</div>
            <div className="text-white/80 text-sm font-bold tracking-wide mt-1">{label}</div>
            {subLabel && <div className="text-white/60 text-[10px] mt-1">{subLabel}</div>}
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 scale-150">
          {icon}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-6 h-48 group hover:bg-surface-container-high transition-all duration-300 border border-outline-variant/10">
      <div className="text-primary/80">{icon}</div>
      <div className="space-y-1">
        <div className="text-3xl font-headline font-black tracking-tight text-on-surface">{value}</div>
        <div className="text-secondary text-sm font-bold tracking-wide">{label}</div>
      </div>
    </div>
  );
}

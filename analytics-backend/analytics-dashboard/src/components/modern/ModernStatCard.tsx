import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ModernStatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    className?: string;
    variant?: 'default' | 'emerald' | 'rose' | 'blue' | 'amber' | 'purple';
}

export function ModernStatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    className,
    variant = 'default'
}: ModernStatCardProps) {

    const variants = {
        default: "from-zinc-800/50 to-zinc-900/50 border-zinc-800/50 hover:border-zinc-700",
        emerald: "from-emerald-950/30 to-zinc-900/50 border-emerald-900/30 hover:border-emerald-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]",
        rose: "from-rose-950/30 to-zinc-900/50 border-rose-900/30 hover:border-rose-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.1)]",
        blue: "from-blue-950/30 to-zinc-900/50 border-blue-900/30 hover:border-blue-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.1)]",
        amber: "from-amber-950/30 to-zinc-900/50 border-amber-900/30 hover:border-amber-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.1)]",
        purple: "from-purple-950/30 to-zinc-900/50 border-purple-900/30 hover:border-purple-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.1)]",
    };

    const iconBgVariants = {
        default: "bg-zinc-800/50 text-zinc-400",
        emerald: "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]",
        rose: "bg-rose-500/10 text-rose-400 shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]",
        blue: "bg-blue-500/10 text-blue-400 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]",
        amber: "bg-amber-500/10 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]",
        purple: "bg-purple-500/10 text-purple-400 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]",
    };

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 bg-gradient-to-br backdrop-blur-xl",
            variants[variant],
            className
        )}>
            {/* Ambient Glow Effect */}
            <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none",
                variant === 'emerald' && "bg-emerald-500",
                variant === 'rose' && "bg-rose-500",
                variant === 'blue' && "bg-blue-500",
                variant === 'amber' && "bg-amber-500",
                variant === 'purple' && "bg-purple-500",
                variant === 'default' && "bg-white"
            )} />

            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl transition-colors duration-300", iconBgVariants[variant])}>
                    {icon}
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm",
                        trend.isPositive
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    )}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        {trend.label && <span className="opacity-60 font-normal ml-1">{trend.label}</span>}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-zinc-400 text-sm font-medium mb-1 tracking-wide uppercase opacity-80">{title}</h3>
                <div className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">{value}</div>
                {subtitle && (
                    <p className="text-zinc-500 text-xs mt-2 font-medium">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

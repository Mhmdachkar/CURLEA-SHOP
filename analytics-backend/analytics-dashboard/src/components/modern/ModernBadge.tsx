import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ModernBadgeProps {
    children: ReactNode;
    variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'violet';
    className?: string;
}

export function ModernBadge({ children, variant = 'neutral', className }: ModernBadgeProps) {
    const variants = {
        neutral: "bg-zinc-800 text-zinc-300 border-zinc-700",
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    };

    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ModernCardProps {
    title?: string;
    subtitle?: string;
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function ModernCard({ title, subtitle, children, actions, className, noPadding = false }: ModernCardProps) {
    return (
        <div className={cn(
            "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden",
            className
        )}>
            {(title || actions) && (
                <div className="px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                        {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            <div className={cn(noPadding ? "" : "p-6")}>
                {children}
            </div>
        </div>
    );
}

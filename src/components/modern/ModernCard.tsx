import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModernCardProps {
    title?: string;
    subtitle?: string;
    children: ReactNode;
    actions?: ReactNode;
    noPadding?: boolean;
    className?: string;
}

export function ModernCard({ title, subtitle, children, actions, noPadding, className }: ModernCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "relative bg-gradient-to-br from-zinc-900/90 via-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl overflow-hidden",
                "shadow-xl hover:shadow-2xl transition-all duration-300",
                "hover:border-zinc-700/50",
                className
            )}
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />

            {title && (
                <div className="relative px-6 py-5 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-transparent">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                            {subtitle && (
                                <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
                            )}
                        </div>
                        {actions && (
                            <div className="flex items-center gap-2">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={cn(
                "relative",
                !noPadding && "p-6"
            )}>
                {children}
            </div>
        </motion.div>
    );
}

import { ModernSidebar } from './ModernSidebar';
import { ReactNode } from 'react';

interface ModernLayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    headerActions?: ReactNode;
    title?: string;
    subtitle?: string;
}

export function ModernLayout({
    children,
    activeTab,
    onTabChange,
    headerActions,
    title,
    subtitle
}: ModernLayoutProps) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30">
            <ModernSidebar activeTab={activeTab} onTabChange={onTabChange} />

            <main className="lg:ml-64 min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">{title || 'Dashboard'}</h1>
                            {subtitle && <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>}
                        </div>
                        {headerActions && (
                            <div className="flex items-center gap-3">
                                {headerActions}
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

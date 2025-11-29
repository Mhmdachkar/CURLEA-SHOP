import { useRecentEvents, useRecentVisits } from '@/hooks/useSupabaseRawData';
import { ModernCard } from './ModernCard';
import { Activity, ShoppingCart, Eye, MousePointer, CreditCard } from 'lucide-react';

export function RealtimeView() {
    const { data: events, loading: eventsLoading } = useRecentEvents('all', 1); // Last 24h
    const { data: visits, loading: visitsLoading } = useRecentVisits(1); // Last 24h

    // Combine and sort events
    const feed = [
        ...(events?.map(e => ({
            type: 'event',
            id: e.id,
            title: e.event_name,
            subtitle: e.event_category,
            time: e.created_at,
            icon: e.event_name.includes('cart') ? ShoppingCart : e.event_name.includes('purchase') ? CreditCard : MousePointer,
            color: e.event_name.includes('purchase') ? 'text-emerald-400' : 'text-violet-400'
        })) || []),
        ...(visits?.map(v => ({
            type: 'visit',
            id: v.id,
            title: 'New Visit',
            subtitle: `${v.city || 'Unknown'}, ${v.country || 'Unknown'}`,
            time: v.created_at,
            icon: Eye,
            color: 'text-blue-400'
        })) || [])
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 50);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernCard
                title="Live Activity Feed"
                subtitle="Real-time user actions"
                actions={
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium text-emerald-400">Live</span>
                    </div>
                }
            >
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                    {feed.map((item) => (
                        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <item.icon size={16} className={item.color} />
                            </div>

                            {/* Content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-zinc-200 text-sm">{item.title}</div>
                                    <time className="font-mono text-xs text-zinc-500">{new Date(item.time).toLocaleTimeString()}</time>
                                </div>
                                <div className="text-zinc-400 text-xs">{item.subtitle}</div>
                            </div>
                        </div>
                    ))}

                    {feed.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </ModernCard>

            <div className="space-y-6">
                <ModernCard title="Active Sessions" subtitle="Users currently on site">
                    <div className="flex items-center justify-center h-64 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                        <div className="text-center">
                            <Activity size={48} className="mx-auto text-zinc-700 mb-4" />
                            <p className="text-zinc-500">Real-time session tracking coming soon</p>
                        </div>
                    </div>
                </ModernCard>
            </div>
        </div>
    );
}

import { useRecentVisits } from '@/hooks/useSupabaseRawData';
import { ModernCard } from './ModernCard';
import { ModernTable } from './ModernTable';
import { Smartphone, Monitor } from 'lucide-react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export function BehaviorView() {
    const { data: visits, loading: visitsLoading } = useRecentVisits(30);

    // Aggregate Devices
    const devices = useMemo(() => {
        if (!visits) return [];

        const deviceMap = new Map<string, {
            id: string;
            type: string;
            count: number;
        }>();

        visits.forEach(visit => {
            let type = 'Desktop';
            if (visit.is_mobile) type = 'Mobile';
            if (visit.is_tablet) type = 'Tablet';

            const current = deviceMap.get(type) || {
                id: type,
                type: type,
                count: 0,
            };

            current.count += 1;
            deviceMap.set(type, current);
        });

        return Array.from(deviceMap.values())
            .sort((a, b) => b.count - a.count);
    }, [visits]);

    // Aggregate Time of Day
    const timeOfDay = useMemo(() => {
        if (!visits) return [];

        const hourMap = new Map<number, {
            id: number;
            hour: string;
            count: number;
        }>();

        // Initialize all hours
        for (let i = 0; i < 24; i++) {
            hourMap.set(i, {
                id: i,
                hour: `${i}:00`,
                count: 0
            });
        }

        visits.forEach(visit => {
            const date = new Date(visit.created_at);
            const hour = date.getHours();
            const current = hourMap.get(hour)!;
            current.count += 1;
        });

        return Array.from(hourMap.values());
    }, [visits]);

    const maxCount = Math.max(...timeOfDay.map(h => h.count), 1);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Device Breakdown */}
                <div className="lg:col-span-1">
                    <ModernCard
                        title="Device Usage"
                        subtitle="Visitors by device type"
                        noPadding
                    >
                        <ModernTable
                            data={devices}
                            loading={visitsLoading}
                            emptyMessage="No device data found"
                            columns={[
                                {
                                    key: 'type',
                                    header: 'Device',
                                    render: (val) => (
                                        <div className="flex items-center gap-2">
                                            {val === 'Mobile' ? <Smartphone size={16} className="text-zinc-400" /> : <Monitor size={16} className="text-zinc-400" />}
                                            <span className="text-white font-medium">{val}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'count',
                                    header: 'Visits',
                                    align: 'right',
                                    render: (val) => <span className="font-bold text-white">{val}</span>
                                },
                            ]}
                        />
                    </ModernCard>
                </div>

                {/* Time of Day Analysis */}
                <div className="lg:col-span-2">
                    <ModernCard
                        title="Peak Traffic Hours"
                        subtitle="Visits by time of day (24h)"
                    >
                        <div className="h-72 flex items-end gap-1 pt-6">
                            {timeOfDay.map((hour, index) => {
                                const height = (hour.count / maxCount) * 100;

                                return (
                                    <motion.div
                                        key={hour.id}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: index * 0.02, duration: 0.5 }}
                                        className="flex-1 flex flex-col items-center group relative"
                                    >
                                        <div
                                            className="w-full bg-gradient-to-t from-violet-600 via-violet-500 to-violet-400 rounded-t-lg transition-all relative overflow-hidden shadow-lg"
                                            style={{ height: `${height}%`, minHeight: hour.count > 0 ? '4px' : '0' }}
                                        >
                                            {/* Glow effect */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                <div className="bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-zinc-700">
                                                    <div className="font-bold text-violet-400">{hour.count} visits</div>
                                                    <div className="text-zinc-400">at {hour.hour}</div>
                                                </div>
                                                <div className="w-2 h-2 bg-zinc-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b border-zinc-700" />
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-zinc-600 mt-2">
                                            {hour.id % 3 === 0 ? hour.id : ''}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ModernCard>
                </div>
            </div>
        </div>
    );
}

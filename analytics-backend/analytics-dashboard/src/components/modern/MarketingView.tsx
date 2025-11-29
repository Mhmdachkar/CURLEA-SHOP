import { useRecentVisits } from '@/hooks/useSupabaseRawData';
import { ModernCard } from './ModernCard';
import { ModernTable } from './ModernTable';
import { Megaphone, Globe } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function MarketingView() {
    const { data: visits, loading: visitsLoading } = useRecentVisits(30);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(true);

    // Fetch Campaign Performance from SQL View
    useEffect(() => {
        async function fetchCampaigns() {
            try {
                setCampaignsLoading(true);
                const { data, error } = await supabase
                    .from('campaign_performance')
                    .select('*')
                    .order('visits', { ascending: false });

                if (!error && data) {
                    setCampaigns(data);
                }
            } catch (e) {
                console.error('Error fetching campaigns:', e);
            } finally {
                setCampaignsLoading(false);
            }
        }
        fetchCampaigns();
    }, []);

    // Aggregate Traffic Sources (Keep client-side for now as traffic_sources view might be similar)
    // Actually, let's try to use traffic_sources view if available, but fallback to visits aggregation
    const trafficSources = useMemo(() => {
        if (!visits) return [];

        const sourceMap = new Map<string, {
            id: string;
            source: string;
            visitors: number;
        }>();

        visits.forEach(visit => {
            const source = visit.referrer ? new URL(visit.referrer).hostname : 'Direct';
            const current = sourceMap.get(source) || {
                id: source,
                source: source,
                visitors: 0,
            };

            current.visitors += 1;
            sourceMap.set(source, current);
        });

        return Array.from(sourceMap.values())
            .sort((a, b) => b.visitors - a.visitors)
            .slice(0, 10);
    }, [visits]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Campaigns */}
                <ModernCard
                    title="Campaign Performance"
                    subtitle="Traffic by UTM Campaign"
                    actions={
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Megaphone size={16} />
                            <span>{campaigns.length} Active</span>
                        </div>
                    }
                    noPadding
                >
                    <ModernTable
                        data={campaigns}
                        loading={campaignsLoading}
                        emptyMessage="No campaign data found"
                        columns={[
                            {
                                key: 'campaign',
                                header: 'Campaign',
                                render: (val, row) => (
                                    <div>
                                        <div className="font-medium text-white">{val || row.utm_campaign || 'Unknown'}</div>
                                        <div className="text-xs text-zinc-500">{row.source || row.utm_source} / {row.medium || row.utm_medium}</div>
                                    </div>
                                )
                            },
                            {
                                key: 'visits',
                                header: 'Visits',
                                align: 'right',
                                render: (val) => <span className="font-medium text-zinc-300">{val}</span>
                            },
                            {
                                key: 'orders',
                                header: 'Orders',
                                align: 'right',
                                render: (val) => <span className="font-medium text-emerald-400">{val || 0}</span>
                            },
                            {
                                key: 'revenue',
                                header: 'Revenue',
                                align: 'right',
                                render: (val) => <span className="font-medium text-emerald-400">${val || 0}</span>
                            },
                        ]}
                    />
                </ModernCard>

                {/* Traffic Sources */}
                <ModernCard
                    title="Traffic Sources"
                    subtitle="Top referring domains"
                    noPadding
                >
                    <ModernTable
                        data={trafficSources}
                        loading={visitsLoading}
                        emptyMessage="No traffic data found"
                        columns={[
                            {
                                key: 'source',
                                header: 'Source',
                                render: (val) => (
                                    <div className="flex items-center gap-2">
                                        <Globe size={14} className="text-zinc-500" />
                                        <span className="text-white">{val}</span>
                                    </div>
                                )
                            },
                            {
                                key: 'visitors',
                                header: 'Visitors',
                                align: 'right',
                                render: (val) => <span className="font-medium text-zinc-300">{val}</span>
                            },
                        ]}
                    />
                </ModernCard>
            </div>
        </div>
    );
}

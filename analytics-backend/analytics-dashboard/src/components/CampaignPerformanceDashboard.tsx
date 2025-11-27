/**
 * Campaign Performance Dashboard
 * Comprehensive campaign analytics with real SQL data
 */

import { useState, useEffect } from 'react';
import { getCampaignMetrics, getDailyCampaignPerformance, getCampaignFunnel, getTopCampaigns, CampaignMetrics } from '@/utils/supabase/campaignAnalytics';
import { ShopifyCard } from '@/components/dashboard/ShopifyCard';
import { ShopifyTable } from '@/components/dashboard/ShopifyTable';
import { ShopifyBadge } from '@/components/dashboard/ShopifyBadge';
import { ShopifyStatCard } from '@/components/dashboard/ShopifyStatCard';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Target, Zap } from 'lucide-react';

export default function CampaignPerformanceDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignMetrics[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<any[] | null>(null);
  const [funnelData, setFunnelData] = useState<any | null>(null);
  const [topCampaigns, setTopCampaigns] = useState<CampaignMetrics[] | null>(null);

  useEffect(() => {
    loadCampaignData();
    loadTopCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      loadCampaignDetails(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const loadCampaignData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCampaignMetrics();
      if (result.error) {
        setError(result.error);
      } else {
        setCampaigns(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTopCampaigns = async () => {
    try {
      const result = await getTopCampaigns('revenue', 5);
      if (!result.error) {
        setTopCampaigns(result.data);
      }
    } catch (err) {
      console.error('Error loading top campaigns:', err);
    }
  };

  const loadCampaignDetails = async (campaignId: string) => {
    try {
      // Load daily performance
      const dailyResult = await getDailyCampaignPerformance(campaignId, 30);
      if (!dailyResult.error) {
        setDailyData(dailyResult.data);
      }

      // Load funnel
      const funnelResult = await getCampaignFunnel(campaignId);
      if (!funnelResult.error) {
        setFunnelData(funnelResult.data);
      }
    } catch (err) {
      console.error('Error loading campaign details:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatPercentage = (num: number) => {
    return `${(num || 0).toFixed(2)}%`;
  };

  // Calculate overall metrics
  const totalSpend = campaigns?.reduce((sum, c) => sum + c.cost, 0) || 0;
  const totalRevenue = campaigns?.reduce((sum, c) => sum + c.total_revenue, 0) || 0;
  const totalOrders = campaigns?.reduce((sum, c) => sum + c.orders_completed, 0) || 0;
  const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
  const overallRO AS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="space-y-6">
      {/* Overall Campaign Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <ShopifyStatCard
          title="Total Ad Spend"
          value={formatCurrency(totalSpend)}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="All campaigns"
        />
        <ShopifyStatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          subtitle="From campaigns"
        />
        <ShopifyStatCard
          title="Total Orders"
          value={formatNumber(totalOrders)}
          icon={<ShoppingBag className="w-5 h-5" />}
          subtitle="Campaign attributed"
        />
        <ShopifyStatCard
          title="Overall ROAS"
          value={overallROAS.toFixed(2) + 'x'}
          icon={<Zap className="w-5 h-5 text-blue-600" />}
          subtitle="Return on ad spend"
        />
        <ShopifyStatCard
          title="Overall ROI"
          value={formatPercentage(overallROI)}
          icon={overallROI > 0 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
          subtitle="Net profit margin"
        />
      </div>

      {/* Top Performing Campaigns */}
      {topCampaigns && topCampaigns.length > 0 && (
        <ShopifyCard
          title="Top 5 Campaigns by Revenue"
          subtitle="Best performing campaigns"
        >
          <div className="space-y-3">
            {topCampaigns.map((campaign, index) => (
              <div
                key={campaign.campaign_id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedCampaignId(campaign.campaign_id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{campaign.campaign_name}</div>
                    <div className="text-sm text-gray-500">
                      {campaign.utm_source} • {campaign.utm_medium}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 text-lg">
                    {formatCurrency(campaign.total_revenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatNumber(campaign.orders_completed)} orders • {formatPercentage(campaign.roi_percentage)} ROI
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ShopifyCard>
      )}

      {/* All Campaigns Table */}
      <ShopifyCard
        title="Campaign Performance Metrics"
        subtitle={loading ? 'Loading campaigns...' : `${campaigns?.length || 0} campaigns tracked`}
        noPadding
      >
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-semibold">Error loading campaigns:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        <ShopifyTable
          columns={[
            {
              key: 'campaign_name',
              header: 'Campaign',
              render: (val, row) => (
                <div>
                  <div className="font-medium text-gray-900">{val}</div>
                  <div className="text-xs text-gray-500">
                    {row.utm_source} • {row.utm_medium}
                  </div>
                </div>
              ),
            },
            {
              key: 'is_active',
              header: 'Status',
              render: (val) => (
                <ShopifyBadge variant={val ? 'success' : 'neutral'}>
                  {val ? 'Active' : 'Paused'}
                </ShopifyBadge>
              ),
            },
            {
              key: 'cost',
              header: 'Spend',
              align: 'right',
              render: (val) => <span className="font-medium">{formatCurrency(val)}</span>,
            },
            {
              key: 'total_visits',
              header: 'Visits',
              align: 'right',
              render: (val) => formatNumber(val),
            },
            {
              key: 'orders_completed',
              header: 'Orders',
              align: 'right',
              render: (val) => <span className="font-medium">{formatNumber(val)}</span>,
            },
            {
              key: 'total_revenue',
              header: 'Revenue',
              align: 'right',
              render: (val) => (
                <span className="font-semibold text-green-600">{formatCurrency(val)}</span>
              ),
            },
            {
              key: 'conversion_rate',
              header: 'CVR',
              align: 'right',
              render: (val) => formatPercentage(val),
            },
            {
              key: 'cost_per_acquisition',
              header: 'CPA',
              align: 'right',
              render: (val) => formatCurrency(val),
            },
            {
              key: 'return_on_ad_spend',
              header: 'ROAS',
              align: 'right',
              render: (val) => `${val.toFixed(2)}x`,
            },
            {
              key: 'roi_percentage',
              header: 'ROI',
              align: 'right',
              render: (val) => {
                const isPositive = val > 0;
                return (
                  <span className={isPositive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {isPositive ? '+' : ''}{formatPercentage(val)}
                  </span>
                );
              },
            },
            {
              key: 'campaign_id',
              header: 'Actions',
              render: (val) => (
                <button
                  onClick={() => setSelectedCampaignId(selectedCampaignId === val ? null : val)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedCampaignId === val ? 'Hide Details' : 'View Details'}
                </button>
              ),
            },
          ]}
          data={campaigns || []}
          loading={loading}
          emptyMessage={error || 'No campaigns found. Launch campaigns with UTM parameters to track them here.'}
        />
      </ShopifyCard>

      {/* Campaign Details (when selected) */}
      {selectedCampaignId && funnelData && (
        <ShopifyCard
          title="Campaign Conversion Funnel"
          subtitle="Step-by-step performance breakdown"
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Visits</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(funnelData.visits)}
              </div>
              <div className="text-xs text-gray-500 mt-1">100%</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-2">Product Views</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(funnelData.product_views)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {funnelData.visits > 0 ? formatPercentage((funnelData.product_views / funnelData.visits) * 100) : '0%'}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-2">Add to Cart</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(funnelData.add_to_cart)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {funnelData.visits > 0 ? formatPercentage((funnelData.add_to_cart / funnelData.visits) * 100) : '0%'}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-2">Checkout</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(funnelData.checkout_initiated)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {funnelData.visits > 0 ? formatPercentage((funnelData.checkout_initiated / funnelData.visits) * 100) : '0%'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-700 mb-2">Orders</div>
              <div className="text-2xl font-bold text-green-700">
                {formatNumber(funnelData.orders_completed)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {funnelData.visits > 0 ? formatPercentage((funnelData.orders_completed / funnelData.visits) * 100) : '0%'}
              </div>
            </div>
          </div>
        </ShopifyCard>
      )}

      {/* Daily Performance Chart Data */}
      {selectedCampaignId && dailyData && dailyData.length > 0 && (
        <ShopifyCard
          title="Daily Performance Trend"
          subtitle="Last 30 days"
          noPadding
        >
          <ShopifyTable
            columns={[
              { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
              { key: 'visits', header: 'Visits', align: 'right', render: (val) => formatNumber(val) },
              { key: 'orders', header: 'Orders', align: 'right', render: (val) => formatNumber(val) },
              { key: 'revenue', header: 'Revenue', align: 'right', render: (val) => formatCurrency(val) },
              {
                key: 'orders',
                header: 'CVR',
                align: 'right',
                render: (val, row) => {
                  const cvr = row.visits > 0 ? (val / row.visits) * 100 : 0;
                  return formatPercentage(cvr);
                },
              },
            ]}
            data={dailyData}
            loading={false}
            emptyMessage="No daily data available"
          />
        </ShopifyCard>
      )}
    </div>
  );
}


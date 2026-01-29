/**
 * useDashboardTables Hook
 * 
 * Fetches data for all dashboard tables (Orders, Customers, Visited Links, Inventory)
 */

import { useState, useEffect } from 'react';
import {
  fetchOrdersData,
  fetchCustomersData,
  fetchVisitedLinksData,
  fetchInventoryData,
  fetchPageViewsData,
  fetchVisitsData,
  fetchCartEventsData,
  type OrderRow,
  type CustomerRow,
  type VisitedLinkRow,
  type InventoryRow,
  type PageViewRow,
  type VisitRow,
  type CartEventRow,
} from '@/services/dashboardTablesService';

interface UseDashboardTablesReturn {
  orders: OrderRow[];
  customers: CustomerRow[];
  visitedLinks: VisitedLinkRow[];
  inventory: InventoryRow[];
  pageViews: PageViewRow[];
  visits: VisitRow[];
  cartEvents: CartEventRow[];
  loading: boolean;
  error: string | null;
}

export function useDashboardTables(dateRangeDays: number = 90): UseDashboardTablesReturn {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [visitedLinks, setVisitedLinks] = useState<VisitedLinkRow[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [pageViews, setPageViews] = useState<PageViewRow[]>([]);
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [cartEvents, setCartEvents] = useState<CartEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching dashboard tables data for last ${dateRangeDays} days...`);
        
        // Fetch all data in parallel
        const [
          ordersData,
          customersData,
          linksData,
          inventoryData,
          pageViewsData,
          visitsData,
          cartEventsData,
        ] = await Promise.all([
          fetchOrdersData(50),
          fetchCustomersData(50),
          fetchVisitedLinksData(50),
          fetchInventoryData(),
          fetchPageViewsData(50),
          fetchVisitsData(50),
          fetchCartEventsData(50),
        ]);

        if (isMounted) {
          console.log(`Fetched ${ordersData.length} orders, ${customersData.length} customers, ${pageViewsData.length} page views, ${visitsData.length} visits, ${cartEventsData.length} cart events`);
          setOrders(ordersData);
          setCustomers(customersData);
          setVisitedLinks(linksData);
          setInventory(inventoryData);
          setPageViews(pageViewsData);
          setVisits(visitsData);
          setCartEvents(cartEventsData);
        }
      } catch (err: any) {
        console.error('Error loading dashboard tables data:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [dateRangeDays]);

  return {
    orders,
    customers,
    visitedLinks,
    inventory,
    pageViews,
    visits,
    cartEvents,
    loading,
    error,
  };
}


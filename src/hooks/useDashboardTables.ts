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
  fetchCartEventsData,
  fetchVisitsData,
  type OrderRow,
  type CustomerRow,
  type VisitedLinkRow,
  type InventoryRow,
  type CartEventRow,
  type VisitRow,
} from '@/services/dashboardTablesService';

interface UseDashboardTablesReturn {
  orders: OrderRow[];
  customers: CustomerRow[];
  visitedLinks: VisitedLinkRow[];
  inventory: InventoryRow[];
  cartEvents: CartEventRow[];
  visits: VisitRow[];
  loading: boolean;
  error: string | null;
}

export function useDashboardTables(days: number = 30): UseDashboardTablesReturn {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [visitedLinks, setVisitedLinks] = useState<VisitedLinkRow[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [cartEvents, setCartEvents] = useState<CartEventRow[]>([]);
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [ordersData, customersData, linksData, inventoryData, cartEventsData, visitsData] = await Promise.all([
          fetchOrdersData(50, days),
          fetchCustomersData(50, days),
          fetchVisitedLinksData(50, days),
          fetchInventoryData(),
          fetchCartEventsData(50, days),
          fetchVisitsData(50, days),
        ]);

        setOrders(ordersData);
        setCustomers(customersData);
        setVisitedLinks(linksData);
        setInventory(inventoryData);
        setCartEvents(cartEventsData);
        setVisits(visitsData);
      } catch (err: any) {
        console.error('Error loading dashboard tables data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [days]);

  return {
    orders,
    customers,
    visitedLinks,
    inventory,
    cartEvents,
    visits,
    loading,
    error,
  };
}


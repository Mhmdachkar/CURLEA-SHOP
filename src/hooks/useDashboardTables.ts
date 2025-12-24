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
  type OrderRow,
  type CustomerRow,
  type VisitedLinkRow,
  type InventoryRow,
} from '@/services/dashboardTablesService';

interface UseDashboardTablesReturn {
  orders: OrderRow[];
  customers: CustomerRow[];
  visitedLinks: VisitedLinkRow[];
  inventory: InventoryRow[];
  loading: boolean;
  error: string | null;
}

export function useDashboardTables(): UseDashboardTablesReturn {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [visitedLinks, setVisitedLinks] = useState<VisitedLinkRow[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [ordersData, customersData, linksData, inventoryData] = await Promise.all([
          fetchOrdersData(50),
          fetchCustomersData(50),
          fetchVisitedLinksData(50),
          fetchInventoryData(),
        ]);

        setOrders(ordersData);
        setCustomers(customersData);
        setVisitedLinks(linksData);
        setInventory(inventoryData);
      } catch (err: any) {
        console.error('Error loading dashboard tables data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return {
    orders,
    customers,
    visitedLinks,
    inventory,
    loading,
    error,
  };
}


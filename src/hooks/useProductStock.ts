import { useState, useEffect } from 'react';
import {
    getVariantStockNormalized,
    getStockStatus,
    getTotalProductStock
} from '@/services/inventoryService';

export interface StockInfo {
    available: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    isInStock: boolean;
    loading: boolean;
}

/**
 * Hook to get real-time stock for a specific product variant
 * Fetches from Supabase database
 */
export function useProductStock(
    productId: string,
    size: string = 'Standard',
    color: string | null = null
): StockInfo {
    const [stockInfo, setStockInfo] = useState<StockInfo>({
        available: 0,
        status: 'out_of_stock',
        isInStock: false,
        loading: true
    });

    useEffect(() => {
        let mounted = true;

        async function fetchStock() {
            try {
                setStockInfo(prev => ({ ...prev, loading: true }));

                // Fetch variant stock from Supabase
                const variant = await getVariantStockNormalized(productId, size, color);

                if (!mounted) return;

                if (variant) {
                    const available = variant.available_quantity || 0;
                    const status = await getStockStatus(productId, size, color);

                    setStockInfo({
                        available,
                        status,
                        isInStock: available > 0,
                        loading: false
                    });
                } else {
                    // Variant not found or database not set up yet
                    setStockInfo({
                        available: 0,
                        status: 'out_of_stock',
                        isInStock: false,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching stock:', error);
                if (mounted) {
                    setStockInfo({
                        available: 0,
                        status: 'out_of_stock',
                        isInStock: false,
                        loading: false
                    });
                }
            }
        }

        fetchStock();

        return () => {
            mounted = false;
        };
    }, [productId, size, color]);

    return stockInfo;
}

/**
 * Hook to get total stock across all variants of a product
 * Fetches from Supabase database
 */
export function useTotalProductStock(productId: string): { total: number; loading: boolean } {
    const [state, setState] = useState({ total: 0, loading: true });

    useEffect(() => {
        let mounted = true;

        async function fetchTotalStock() {
            try {
                const totalStock = await getTotalProductStock(productId);

                if (mounted) {
                    setState({ total: totalStock, loading: false });
                }
            } catch (error) {
                console.error('Error fetching total stock:', error);
                if (mounted) {
                    setState({ total: 0, loading: false });
                }
            }
        }

        fetchTotalStock();

        return () => {
            mounted = false;
        };
    }, [productId]);

    return state;
}

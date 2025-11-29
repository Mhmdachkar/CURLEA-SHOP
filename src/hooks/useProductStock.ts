import { useState, useEffect } from 'react';
import { inventoryStore } from '@/utils/inventoryManager';

export interface StockInfo {
    available: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    isInStock: boolean;
}

export function useProductStock(productId: string, size: string = 'default', color: string = 'default'): StockInfo {
    const [stockInfo, setStockInfo] = useState<StockInfo>({
        available: 0,
        status: 'out_of_stock',
        isInStock: false
    });

    useEffect(() => {
        const available = inventoryStore.getStock(productId, size, color);
        const status = inventoryStore.getStockStatus(productId, size, color);
        const isInStock = available > 0;

        setStockInfo({
            available,
            status,
            isInStock
        });
    }, [productId, size, color]);

    return stockInfo;
}

// Hook to get total stock across all variants of a product
export function useTotalProductStock(productId: string): number {
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const totalStock = inventoryStore.getTotalStock(productId);
        setTotal(totalStock);
    }, [productId]);

    return total;
}

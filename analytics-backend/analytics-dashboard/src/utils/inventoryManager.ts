/**
 * Inventory Management System
 * @deprecated This file contains LEGACY hardcoded data - DO NOT USE
 * Use @/hooks/useInventory.ts and @/utils/inventoryService.ts instead
 * These connect to the real database via Supabase
 * 
 * IMPORTANT: All inventory now managed in Supabase product_variants table
 * Color mapping: brown → Latte
 * Size mapping: large → Large (UI shows as "Original")
 */

export interface InventoryItem {
    productId: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    sellingPrice: number; // From CSV: Selling_Price
    costPerUnit: number;  // From CSV: Cost_per_unit
    profit: number;       // From CSV: Profit
    key: string; // Format: productId|size|color
}


// Color mapping from inventory names to product names
const colorMap: Record<string, string[]> = {
    purple: ['Mulberry', 'Royal Purple', 'MULBERRY', 'PURPLE'],
    pink: ['Candy', 'Rose Gold', 'CANDY', 'PINK'],
    brown: ['Latte', 'Earl Grey', 'LATTE', 'BROWN'],
    green: ['Olive', 'Olive Lux', 'OLIVE', 'GREEN'],
};

// Normalize color names for matching
export function normalizeColor(color: string): string {
    const lowerColor = color.toLowerCase();
    for (const [key, values] of Object.entries(colorMap)) {
        if (values.some(v => v.toLowerCase() === lowerColor)) {
            return key;
        }
    }
    return lowerColor;
}

// Current Inventory Data (from CSV dataset with pricing)
const inventoryData: InventoryItem[] = [
    // Full Sets (DreamCurl™ Original Set) - Price: $22.99-$24.99
    { productId: 'dreamcurl-original', productName: 'CURLEA DreamCurl™ Original Set', size: 'large', color: 'purple', quantity: 6, sellingPrice: 24.99, costPerUnit: 7, profit: 17.99, key: 'dreamcurl-original|large|purple' },
    { productId: 'dreamcurl-original', productName: 'CURLEA DreamCurl™ Original Set', size: 'large', color: 'pink', quantity: 2, sellingPrice: 24.99, costPerUnit: 7, profit: 17.99, key: 'dreamcurl-original|large|pink' },
    { productId: 'dreamcurl-original', productName: 'CURLEA DreamCurl™ Original Set', size: 'large', color: 'brown', quantity: 10, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-original|large|brown' },
    { productId: 'dreamcurl-original', productName: 'CURLEA DreamCurl™ Original Set', size: 'large', color: 'green', quantity: 9, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-original|large|green' },

    { productId: 'dreamcurl-jumbo', productName: 'CURLEA DreamCurl™ Jumbo Size', size: 'jumbo', color: 'brown', quantity: 10, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-jumbo|jumbo|brown' },
    { productId: 'dreamcurl-jumbo', productName: 'CURLEA DreamCurl™ Jumbo Size', size: 'jumbo', color: 'purple', quantity: 11, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-jumbo|jumbo|purple' },
    { productId: 'dreamcurl-jumbo', productName: 'CURLEA DreamCurl™ Jumbo Size', size: 'jumbo', color: 'green', quantity: 11, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-jumbo|jumbo|green' },
    { productId: 'dreamcurl-jumbo', productName: 'CURLEA DreamCurl™ Jumbo Size', size: 'jumbo', color: 'pink', quantity: 12, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-jumbo|jumbo|pink' },

    { productId: 'dreamcurl-midi', productName: 'CURLEA DreamCurl™ Midi', size: 'midi', color: 'green', quantity: 11, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-midi|midi|green' },
    { productId: 'dreamcurl-midi', productName: 'CURLEA DreamCurl™ Midi', size: 'midi', color: 'purple', quantity: 12, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-midi|midi|purple' },
    { productId: 'dreamcurl-midi', productName: 'CURLEA DreamCurl™ Midi', size: 'midi', color: 'pink', quantity: 12, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-midi|midi|pink' },
    { productId: 'dreamcurl-midi', productName: 'CURLEA DreamCurl™ Midi', size: 'midi', color: 'brown', quantity: 11, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-midi|midi|brown' },

    { productId: 'zero-heat-mini', productName: 'CURLEA Zero Heat Mini Set', size: 'small', color: 'purple', quantity: 9, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'zero-heat-mini|small|purple' },
    { productId: 'zero-heat-mini', productName: 'CURLEA Zero Heat Mini Set', size: 'small', color: 'brown', quantity: 8, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'zero-heat-mini|small|brown' },
    { productId: 'zero-heat-mini', productName: 'CURLEA Zero Heat Mini Set', size: 'small', color: 'pink', quantity: 11, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'zero-heat-mini|small|pink' },
    { productId: 'zero-heat-mini', productName: 'CURLEA Zero Heat Mini Set', size: 'small', color: 'green', quantity: 11, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'zero-heat-mini|small|green' },

    // Single Sets (DreamCurl™ Short Set) - Price: $16.99-$22.99
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'mini', color: 'pink', quantity: 2, sellingPrice: 18.50, costPerUnit: 3.5, profit: 15.00, key: 'dreamcurl-short-set|mini|pink' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'mini', color: 'brown', quantity: 3, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-short-set|mini|brown' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'mini', color: 'purple', quantity: 3, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-short-set|mini|purple' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'mini', color: 'green', quantity: 3, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-short-set|mini|green' },

    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'midi', color: 'green', quantity: 3, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-short-set|midi|green' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'midi', color: 'purple', quantity: 2, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-short-set|midi|purple' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'midi', color: 'pink', quantity: 3, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-short-set|midi|pink' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'midi', color: 'brown', quantity: 3, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-short-set|midi|brown' },

    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'original', color: 'green', quantity: 3, sellingPrice: 16.99, costPerUnit: 4, profit: 12.99, key: 'dreamcurl-short-set|original|green' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'original', color: 'brown', quantity: 1, sellingPrice: 16.99, costPerUnit: 4, profit: 12.99, key: 'dreamcurl-short-set|original|brown' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'original', color: 'purple', quantity: 2, sellingPrice: 20.00, costPerUnit: 3, profit: 17.00, key: 'dreamcurl-short-set|original|purple' },

    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'jumbo', color: 'brown', quantity: 2, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-short-set|jumbo|brown' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'jumbo', color: 'pink', quantity: 2, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-short-set|jumbo|pink' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'jumbo', color: 'purple', quantity: 3, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-short-set|jumbo|purple' },
    { productId: 'dreamcurl-short-set', productName: 'CURLEA DreamCurl™ Short Set', size: 'jumbo', color: 'green', quantity: 2, sellingPrice: 22.99, costPerUnit: 4, profit: 18.99, key: 'dreamcurl-short-set|jumbo|green' },

    // Heat Bun Bons - Price: $19.99
    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'mini', color: 'purple', quantity: 3, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|mini|purple' },
    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'mini', color: 'green', quantity: 3, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|mini|green' },
    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'mini', color: 'brown', quantity: 3, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|mini|brown' },

    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'midi', color: 'green', quantity: 1, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|midi|green' },
    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'midi', color: 'brown', quantity: 2, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|midi|brown' },

    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'original', color: 'green', quantity: 1, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|original|green' },
    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'original', color: 'brown', quantity: 2, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|original|brown' },

    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'jumbo', color: 'brown', quantity: 3, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|jumbo|brown' },
    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'jumbo', color: 'purple', quantity: 2, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|jumbo|purple' },
    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'jumbo', color: 'pink', quantity: 1, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|jumbo|pink' },
    { productId: 'heatless-5', productName: 'CURLEA Bun Bons Heatless Curling System', size: 'jumbo', color: 'green', quantity: 3, sellingPrice: 19.99, costPerUnit: 4, profit: 15.99, key: 'heatless-5|jumbo|green' },

    // Hair Accessories (from CSV) - Price: $11.99
    { productId: 'satin-scrunchies-french-5pc', productName: 'CURLEA Satin Scrunchies Luxury French 5 Piece', size: 'default', color: 'default', quantity: 42, sellingPrice: 11.99, costPerUnit: 4.50, profit: 7.49, key: 'satin-scrunchies-french-5pc|default|default' },
    { productId: 'curly-claw-1', productName: 'CURLEA Geometric Flower Hair Claw Clip Set', size: 'default', color: 'default', quantity: 40, sellingPrice: 11.99, costPerUnit: 4.50, profit: 7.49, key: 'curly-claw-1|default|default' },
    { productId: 'curly-clip-1', productName: 'CURLEA Flat Clips 5pcs', size: 'default', color: 'default', quantity: 149, sellingPrice: 11.99, costPerUnit: 6.21, profit: 5.78, key: 'curly-clip-1|default|default' },
    { productId: 'curly-scarf-1', productName: 'CURLEA Bow Tie', size: 'default', color: 'default', quantity: 22, sellingPrice: 11.99, costPerUnit: 5.53, profit: 6.46, key: 'curly-scarf-1|default|default' },
];


// In-memory inventory store
class InventoryStore {
    private inventory: Map<string, InventoryItem>;

    constructor() {
        this.inventory = new Map();
        this.loadInventory();
    }

    private loadInventory() {
        inventoryData.forEach(item => {
            this.inventory.set(item.key, { ...item });
        });
    }

    // Get stock for a specific variant
    getStock(productId: string, size: string = 'default', color: string = 'default'): number {
        const normalizedColor = normalizeColor(color);
        const key = `${productId}|${size.toLowerCase()}|${normalizedColor}`;
        const item = this.inventory.get(key);
        return item?.quantity || 0;
    }

    // Get total stock for a product (all variants)
    getTotalStock(productId: string): number {
        let total = 0;
        this.inventory.forEach(item => {
            if (item.productId === productId) {
                total += item.quantity;
            }
        });
        return total;
    }

    // Check if product variant is in stock
    isInStock(productId: string, size: string = 'default', color: string = 'default'): boolean {
        return this.getStock(productId, size, color) > 0;
    }

    // Get stock status
    getStockStatus(productId: string, size: string = 'default', color: string = 'default'): 'in_stock' | 'low_stock' | 'out_of_stock' {
        const stock = this.getStock(productId, size, color);
        if (stock === 0) return 'out_of_stock';
        if (stock <= 5) return 'low_stock';
        return 'in_stock';
    }

    // Deduct stock (for orders)
    deductStock(productId: string, size: string, color: string, quantity: number): boolean {
        const normalizedColor = normalizeColor(color);
        const key = `${productId}|${size.toLowerCase()}|${normalizedColor}`;
        const item = this.inventory.get(key);

        if (!item || item.quantity < quantity) {
            return false; // Not enough stock
        }

        item.quantity -= quantity;
        this.inventory.set(key, item);
        return true;
    }

    // Get all inventory items
    getAllInventory(): InventoryItem[] {
        return Array.from(this.inventory.values());
    }

    // Get inventory by product
    getInventoryByProduct(productId: string): InventoryItem[] {
        return Array.from(this.inventory.values()).filter(
            item => item.productId === productId
        );
    }
}

// Singleton instance
export const inventoryStore = new InventoryStore();

// Helper function for cart validation
export function canAddToCart(productId: string, size: string, color: string, requestedQty: number): {
    canAdd: boolean;
    availableQty: number;
    message?: string;
} {
    const availableQty = inventoryStore.getStock(productId, size, color);

    if (availableQty === 0) {
        return {
            canAdd: false,
            availableQty: 0,
            message: 'This item is out of stock'
        };
    }

    if (requestedQty > availableQty) {
        return {
            canAdd: false,
            availableQty,
            message: `Only ${availableQty} item(s) available`
        };
    }

    return {
        canAdd: true,
        availableQty
    };
}

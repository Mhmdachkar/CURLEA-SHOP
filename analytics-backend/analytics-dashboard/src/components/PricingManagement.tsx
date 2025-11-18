/**
 * Professional Pricing Management Component
 * Allows admins to view and update product prices in Supabase (source of truth)
 */

import { useState, useEffect } from 'react';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { updateProductPrice, batchUpdateProductPrices } from '@/utils/supabase/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, DollarSign } from 'lucide-react';

interface ProductPriceRow {
  productId: string;
  name: string;
  currentPrice: number;
  compareAtPrice: number | null;
  cost: number | null;
  localPrice: string; // Original price from local products.ts
  isEditing: boolean;
  editedPrice: string;
  editedCompareAtPrice: string;
  editedCost: string;
}

export function PricingManagement() {
  const { products: supabaseProducts, loading: productsLoading, reload } = useSupabaseProducts();
  const [priceRows, setPriceRows] = useState<ProductPriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);

  // Initialize price rows from Supabase and local products
  useEffect(() => {
    const initializePriceRows = async () => {
      setLoading(true);
      try {
        const { products: localProducts } = await import('@/data/products');
        
        const rows: ProductPriceRow[] = localProducts.map((localProduct) => {
          // Find matching Supabase product
          const supabaseProduct = supabaseProducts?.find(
            (sp) => sp.product_id === localProduct.id
          );

          const localPriceNum = parseFloat(localProduct.price.replace(/[^0-9.]/g, '')) || 0;
          
          return {
            productId: localProduct.id,
            name: localProduct.name,
            currentPrice: supabaseProduct?.price || localPriceNum,
            compareAtPrice: supabaseProduct?.compare_at_price || null,
            cost: supabaseProduct?.cost || null,
            localPrice: localProduct.price,
            isEditing: false,
            editedPrice: String(supabaseProduct?.price || localPriceNum),
            editedCompareAtPrice: supabaseProduct?.compare_at_price 
              ? String(supabaseProduct.compare_at_price) 
              : '',
            editedCost: supabaseProduct?.cost ? String(supabaseProduct.cost) : '',
          };
        });

        setPriceRows(rows);
      } catch (error: any) {
        toast.error('Failed to load products: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!productsLoading) {
      initializePriceRows();
    }
  }, [supabaseProducts, productsLoading]);

  const handleEdit = (productId: string) => {
    setPriceRows((rows) =>
      rows.map((row) =>
        row.productId === productId
          ? { ...row, isEditing: true }
          : row
      )
    );
  };

  const handleCancel = (productId: string) => {
    setPriceRows((rows) =>
      rows.map((row) =>
        row.productId === productId
          ? {
              ...row,
              isEditing: false,
              editedPrice: String(row.currentPrice),
              editedCompareAtPrice: row.compareAtPrice ? String(row.compareAtPrice) : '',
              editedCost: row.cost ? String(row.cost) : '',
            }
          : row
      )
    );
  };

  const handlePriceChange = (productId: string, field: 'price' | 'compareAtPrice' | 'cost', value: string) => {
    setPriceRows((rows) =>
      rows.map((row) =>
        row.productId === productId
          ? { ...row, [`edited${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }
          : row
      )
    );
  };

  const handleSave = async (productId: string) => {
    const row = priceRows.find((r) => r.productId === productId);
    if (!row) return;

    setSaving(productId);

    try {
      const price = parseFloat(row.editedPrice);
      const compareAtPrice = row.editedCompareAtPrice
        ? parseFloat(row.editedCompareAtPrice)
        : null;
      const cost = row.editedCost ? parseFloat(row.editedCost) : null;

      if (isNaN(price) || price < 0) {
        toast.error('Invalid price. Please enter a positive number.');
        setSaving(null);
        return;
      }

      if (compareAtPrice !== null && (isNaN(compareAtPrice) || compareAtPrice <= price)) {
        toast.error('Compare at price must be greater than the sale price.');
        setSaving(null);
        return;
      }

      if (cost !== null && (isNaN(cost) || cost < 0)) {
        toast.error('Invalid cost. Please enter a positive number.');
        setSaving(null);
        return;
      }

      const result = await updateProductPrice(productId, price, compareAtPrice, cost);

      if (result.success) {
        toast.success(`Price updated for ${row.name}`);
        
        // Update local state
        setPriceRows((rows) =>
          rows.map((r) =>
            r.productId === productId
              ? {
                  ...r,
                  isEditing: false,
                  currentPrice: price,
                  compareAtPrice: compareAtPrice,
                  cost: cost,
                }
              : r
          )
        );

        // Reload from Supabase to ensure consistency
        await reload();
      } else {
        toast.error(`Failed to update price: ${result.error}`);
      }
    } catch (error: any) {
      toast.error('Error updating price: ' + error.message);
    } finally {
      setSaving(null);
    }
  };

  const handleBulkSave = async () => {
    const editedRows = priceRows.filter((row) => row.isEditing);
    if (editedRows.length === 0) {
      toast.info('No changes to save');
      return;
    }

    setBulkSaving(true);

    try {
      const updates = editedRows.map((row) => {
        const price = parseFloat(row.editedPrice);
        const compareAtPrice = row.editedCompareAtPrice
          ? parseFloat(row.editedCompareAtPrice)
          : null;
        const cost = row.editedCost ? parseFloat(row.editedCost) : null;

        return {
          productId: row.productId,
          price: isNaN(price) ? row.currentPrice : price,
          compareAtPrice: compareAtPrice && !isNaN(compareAtPrice) ? compareAtPrice : null,
          cost: cost && !isNaN(cost) ? cost : null,
        };
      });

      const result = await batchUpdateProductPrices(updates);

      if (result.failed === 0) {
        toast.success(`Successfully updated ${result.success} products`);
        
        // Reload data
        await reload();
        
        // Reset editing state
        setPriceRows((rows) =>
          rows.map((row) => ({
            ...row,
            isEditing: false,
          }))
        );
      } else {
        toast.error(`Updated ${result.success} products, failed ${result.failed}`);
        if (result.errors.length > 0) {
          console.error('Errors:', result.errors);
        }
      }
    } catch (error: any) {
      toast.error('Error bulk updating prices: ' + error.message);
    } finally {
      setBulkSaving(false);
    }
  };

  const filteredRows = priceRows.filter((row) => {
    const matchesFilter = row.name.toLowerCase().includes(filter.toLowerCase()) ||
                         row.productId.toLowerCase().includes(filter.toLowerCase());
    
    if (showOnlyChanged) {
      const priceChanged = parseFloat(row.editedPrice) !== row.currentPrice;
      const compareChanged = row.editedCompareAtPrice !== (row.compareAtPrice ? String(row.compareAtPrice) : '');
      const costChanged = row.editedCost !== (row.cost ? String(row.cost) : '');
      return matchesFilter && (priceChanged || compareChanged || costChanged);
    }
    
    return matchesFilter;
  });

  const hasChanges = priceRows.some((row) => row.isEditing);

  if (loading || productsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading products...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Professional Pricing Management
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Manage product prices in Supabase (source of truth). Changes here override local product prices.
              </CardDescription>
            </div>
            {hasChanges && (
              <Button onClick={handleBulkSave} disabled={bulkSaving} className="w-full sm:w-auto">
                {bulkSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Save All Changes</span>
                    <span className="sm:hidden">Save All</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search products by name or ID..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showChanged"
                checked={showOnlyChanged}
                onChange={(e) => setShowOnlyChanged(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="showChanged" className="text-xs sm:text-sm">Show only changed</Label>
            </div>
          </div>

          {/* Price Table - Desktop */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Current Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Compare At</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Cost (COGS)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Local Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.productId} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{row.name}</div>
                            <div className="text-xs text-muted-foreground">{row.productId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {row.isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.editedPrice}
                              onChange={(e) => handlePriceChange(row.productId, 'price', e.target.value)}
                              className="w-24"
                            />
                          ) : (
                            <span className="font-semibold">${row.currentPrice.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.editedCompareAtPrice}
                              onChange={(e) => handlePriceChange(row.productId, 'compareAtPrice', e.target.value)}
                              placeholder="Original price"
                              className="w-24"
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              {row.compareAtPrice ? `$${row.compareAtPrice.toFixed(2)}` : '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.editedCost}
                              onChange={(e) => handlePriceChange(row.productId, 'cost', e.target.value)}
                              placeholder="Cost"
                              className="w-24"
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              {row.cost ? `$${row.cost.toFixed(2)}` : '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{row.localPrice}</span>
                        </td>
                        <td className="px-4 py-3">
                          {row.isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSave(row.productId)}
                                disabled={saving === row.productId}
                              >
                                {saving === row.productId ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(row.productId)}
                                disabled={saving === row.productId}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleEdit(row.productId)}>
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Cards - Mobile */}
          <div className="md:hidden space-y-4">
            {filteredRows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products found
              </div>
            ) : (
              filteredRows.map((row) => (
                <div key={row.productId} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <div className="font-medium text-sm">{row.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{row.productId}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">Current Price:</span>
                      {row.isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.editedPrice}
                          onChange={(e) => handlePriceChange(row.productId, 'price', e.target.value)}
                          className="w-24 text-sm"
                        />
                      ) : (
                        <span className="font-semibold text-sm">${row.currentPrice.toFixed(2)}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">Compare At:</span>
                      {row.isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.editedCompareAtPrice}
                          onChange={(e) => handlePriceChange(row.productId, 'compareAtPrice', e.target.value)}
                          placeholder="Original price"
                          className="w-24 text-sm"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {row.compareAtPrice ? `$${row.compareAtPrice.toFixed(2)}` : '-'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">Cost (COGS):</span>
                      {row.isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.editedCost}
                          onChange={(e) => handlePriceChange(row.productId, 'cost', e.target.value)}
                          placeholder="Cost"
                          className="w-24 text-sm"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {row.cost ? `$${row.cost.toFixed(2)}` : '-'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">Local Price:</span>
                      <span className="text-xs text-muted-foreground">{row.localPrice}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    {row.isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(row.productId)}
                          disabled={saving === row.productId}
                          className="flex-1"
                        >
                          {saving === row.productId ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(row.productId)}
                          disabled={saving === row.productId}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(row.productId)}
                        className="w-full"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 text-xs sm:text-sm text-muted-foreground">
            <p>
              <strong>Total Products:</strong> {priceRows.length} | <strong>Showing:</strong> {filteredRows.length}
            </p>
            <p className="mt-2">
              💡 <strong>Tip:</strong> Prices in Supabase override local product prices. Update prices here to change what customers see.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


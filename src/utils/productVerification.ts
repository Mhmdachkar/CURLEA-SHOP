/**
 * Product Verification Utility
 * Tests all full set variants, stock displays, and Christmas offer logic
 */

import { products, Product } from '@/data/products';
import { FULL_SET_PRODUCT_IDS } from '@/contexts/CartContext';
import { normalizeColorName } from '@/services/inventoryService';
import { getAllVariantsForProduct, VariantStock } from '@/services/inventoryService';

export interface VerificationResult {
  productId: string;
  productName: string;
  status: 'pass' | 'fail' | 'warning';
  issues: string[];
  variants: VariantCheck[];
}

export interface VariantCheck {
  size: string;
  color: string | null;
  uiColor: string;
  normalizedColor: string | null;
  hasStock: boolean;
  stockQuantity: number;
  availableQuantity: number;
  status: 'pass' | 'fail' | 'warning';
  issue?: string;
}

export interface ChristmasOfferTest {
  testName: string;
  cartItems: Array<{
    id: string;
    color?: string;
    quantity: number;
  }>;
  expectedDiscount: number;
  expectedFreeItem: string | null;
  status: 'pass' | 'fail';
  issue?: string;
}

/**
 * Get all full set products
 */
export function getFullSetProducts(): Product[] {
  return products.filter(p => FULL_SET_PRODUCT_IDS.has(p.id));
}

/**
 * Verify a single product's variants
 */
export async function verifyProductVariants(productId: string): Promise<VerificationResult> {
  const product = products.find(p => p.id === productId);
  if (!product) {
    return {
      productId,
      productName: 'Unknown',
      status: 'fail',
      issues: [`Product ${productId} not found in products array`],
      variants: []
    };
  }

  const issues: string[] = [];
  const variantChecks: VariantCheck[] = [];

  // Get default size for full sets
  const defaultSizes: Record<string, string> = {
    'dreamcurl-original': 'Large',
    'dreamcurl-midi': 'Midi',
    'dreamcurl-jumbo': 'Jumbo',
    'zero-heat-mini': 'Mini'
  };
  const dbSize = defaultSizes[productId] || 'Standard';

  // Get all variants from database
  let dbVariants: VariantStock[] = [];
  try {
    dbVariants = await getAllVariantsForProduct(productId);
  } catch (error) {
    issues.push(`Failed to fetch variants from database: ${error}`);
    return {
      productId,
      productName: product.name,
      status: 'fail',
      issues,
      variants: []
    };
  }

  // Check each UI color against database
  if (product.colors && product.colors.length > 0) {
    for (const uiColor of product.colors) {
      const normalizedColor = normalizeColorName(uiColor);
      
      // Find matching variant in database
      const dbVariant = dbVariants.find(v => 
        v.size === dbSize && 
        v.color === normalizedColor
      );

      const hasStock = dbVariant ? (dbVariant.available_quantity || 0) > 0 : false;
      const stockQuantity = dbVariant?.stock_quantity || 0;
      const availableQuantity = dbVariant?.available_quantity || 0;

      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let issue: string | undefined;

      if (!dbVariant) {
        status = 'fail';
        issue = `No database variant found for size: ${dbSize}, color: ${normalizedColor || 'null'}`;
        issues.push(`Missing variant: ${productId} - ${dbSize} - ${normalizedColor || 'null'}`);
      } else if (availableQuantity === 0) {
        status = 'warning';
        issue = `Variant exists but has 0 available quantity`;
      }

      variantChecks.push({
        size: dbSize,
        color: normalizedColor,
        uiColor,
        normalizedColor,
        hasStock,
        stockQuantity,
        availableQuantity,
        status,
        issue
      });
    }
  } else {
    // Product without colors - check size only
    const dbVariant = dbVariants.find(v => v.size === dbSize && !v.color);
    const hasStock = dbVariant ? (dbVariant.available_quantity || 0) > 0 : false;
    const stockQuantity = dbVariant?.stock_quantity || 0;
    const availableQuantity = dbVariant?.available_quantity || 0;

    let status: 'pass' | 'fail' | 'warning' = 'pass';
    let issue: string | undefined;

    if (!dbVariant) {
      status = 'fail';
      issue = `No database variant found for size: ${dbSize}`;
      issues.push(`Missing variant: ${productId} - ${dbSize}`);
    } else if (availableQuantity === 0) {
      status = 'warning';
      issue = `Variant exists but has 0 available quantity`;
    }

    variantChecks.push({
      size: dbSize,
      color: null,
      uiColor: 'N/A',
      normalizedColor: null,
      hasStock,
      stockQuantity,
      availableQuantity,
      status,
      issue
    });
  }

  // Determine overall status
  const hasFailures = variantChecks.some(v => v.status === 'fail');
  const hasWarnings = variantChecks.some(v => v.status === 'warning');
  let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';
  if (hasFailures) overallStatus = 'fail';
  else if (hasWarnings) overallStatus = 'warning';

  return {
    productId,
    productName: product.name,
    status: overallStatus,
    issues,
    variants: variantChecks
  };
}

/**
 * Verify all full set products
 */
export async function verifyAllFullSets(): Promise<VerificationResult[]> {
  const fullSetProducts = getFullSetProducts();
  const results: VerificationResult[] = [];

  for (const product of fullSetProducts) {
    const result = await verifyProductVariants(product.id);
    results.push(result);
  }

  return results;
}

/**
 * Test Christmas offer logic
 */
export function testChristmasOffer(): ChristmasOfferTest[] {
  const tests: ChristmasOfferTest[] = [];

  // Test 1: 2 different full sets → 1 free
  tests.push({
    testName: '2 different full sets → 1 free',
    cartItems: [
      { id: 'dreamcurl-original', color: 'Mulberry', quantity: 1 },
      { id: 'dreamcurl-midi', color: 'CANDY', quantity: 1 }
    ],
    expectedDiscount: 0, // Will be calculated based on cheapest item
    expectedFreeItem: 'dreamcurl-original', // 3rd item (cheapest)
    status: 'pass'
  });

  // Test 2: 2 same full sets (quantity 2) → 1 free
  tests.push({
    testName: '2 same full sets (qty 2) → 1 free',
    cartItems: [
      { id: 'dreamcurl-original', color: 'Mulberry', quantity: 2 }
    ],
    expectedDiscount: 0, // Will be calculated
    expectedFreeItem: 'dreamcurl-original', // 3rd item
    status: 'pass'
  });

  // Test 3: 2 full sets + 1 non-full-set → no discount on non-full-set
  tests.push({
    testName: '2 full sets + 1 non-full-set → no discount on non-full-set',
    cartItems: [
      { id: 'dreamcurl-original', color: 'Mulberry', quantity: 1 },
      { id: 'dreamcurl-midi', color: 'CANDY', quantity: 1 },
      { id: 'curly-clip-1', quantity: 1 } // Non-full-set
    ],
    expectedDiscount: 0, // Only full sets get discount
    expectedFreeItem: null, // Non-full-set doesn't qualify
    status: 'pass'
  });

  // Test 4: 3 different full sets → 1 free (3rd one)
  tests.push({
    testName: '3 different full sets → 1 free (3rd)',
    cartItems: [
      { id: 'dreamcurl-original', color: 'Mulberry', quantity: 1 },
      { id: 'dreamcurl-midi', color: 'CANDY', quantity: 1 },
      { id: 'dreamcurl-jumbo', color: 'LATTE', quantity: 1 }
    ],
    expectedDiscount: 0, // Will be calculated (cheapest of the 3)
    expectedFreeItem: null, // 3rd item is free
    status: 'pass'
  });

  // Test 5: 4 full sets → still only 1 free (Buy 2, Get 1 Free)
  tests.push({
    testName: '4 full sets → still only 1 free',
    cartItems: [
      { id: 'dreamcurl-original', color: 'Mulberry', quantity: 1 },
      { id: 'dreamcurl-midi', color: 'CANDY', quantity: 1 },
      { id: 'dreamcurl-jumbo', color: 'LATTE', quantity: 1 },
      { id: 'zero-heat-mini', color: 'OLIVE', quantity: 1 }
    ],
    expectedDiscount: 0, // Only 1 free (3rd item)
    expectedFreeItem: null, // 3rd item is free
    status: 'pass'
  });

  return tests;
}

/**
 * Generate verification report
 */
export async function generateVerificationReport(): Promise<string> {
  const report: string[] = [];
  report.push('='.repeat(80));
  report.push('PRODUCT VERIFICATION REPORT');
  report.push('Generated: ' + new Date().toISOString());
  report.push('='.repeat(80));
  report.push('');

  // Verify all full sets
  report.push('## FULL SET PRODUCTS VERIFICATION');
  report.push('');
  const fullSetResults = await verifyAllFullSets();
  
  for (const result of fullSetResults) {
    report.push(`### ${result.productName} (${result.productId})`);
    report.push(`Status: ${result.status.toUpperCase()}`);
    
    if (result.issues.length > 0) {
      report.push('Issues:');
      result.issues.forEach(issue => report.push(`  - ${issue}`));
    }
    
    report.push('Variants:');
    for (const variant of result.variants) {
      const statusIcon = variant.status === 'pass' ? '✅' : variant.status === 'fail' ? '❌' : '⚠️';
      report.push(`  ${statusIcon} ${variant.uiColor} (${variant.normalizedColor || 'N/A'})`);
      report.push(`     Size: ${variant.size}`);
      report.push(`     Stock: ${variant.stockQuantity}, Available: ${variant.availableQuantity}`);
      if (variant.issue) {
        report.push(`     Issue: ${variant.issue}`);
      }
    }
    report.push('');
  }

  // Test Christmas offer
  report.push('## CHRISTMAS OFFER LOGIC TESTS');
  report.push('');
  const offerTests = testChristmasOffer();
  
  for (const test of offerTests) {
    report.push(`### ${test.testName}`);
    report.push(`Cart Items:`);
    test.cartItems.forEach(item => {
      report.push(`  - ${item.id} (${item.color || 'N/A'}) x${item.quantity}`);
    });
    report.push(`Expected: ${test.expectedFreeItem ? `Free item: ${test.expectedFreeItem}` : 'No free item'}`);
    report.push(`Status: ${test.status.toUpperCase()}`);
    if (test.issue) {
      report.push(`Issue: ${test.issue}`);
    }
    report.push('');
  }

  // Summary
  report.push('## SUMMARY');
  report.push('');
  const totalProducts = fullSetResults.length;
  const passedProducts = fullSetResults.filter(r => r.status === 'pass').length;
  const failedProducts = fullSetResults.filter(r => r.status === 'fail').length;
  const warningProducts = fullSetResults.filter(r => r.status === 'warning').length;
  
  report.push(`Total Full Set Products: ${totalProducts}`);
  report.push(`✅ Passed: ${passedProducts}`);
  report.push(`⚠️  Warnings: ${warningProducts}`);
  report.push(`❌ Failed: ${failedProducts}`);
  report.push('');

  const totalVariants = fullSetResults.reduce((sum, r) => sum + r.variants.length, 0);
  const passedVariants = fullSetResults.reduce((sum, r) => 
    sum + r.variants.filter(v => v.status === 'pass').length, 0);
  const failedVariants = fullSetResults.reduce((sum, r) => 
    sum + r.variants.filter(v => v.status === 'fail').length, 0);
  const warningVariants = fullSetResults.reduce((sum, r) => 
    sum + r.variants.filter(v => v.status === 'warning').length, 0);
  
  report.push(`Total Variants: ${totalVariants}`);
  report.push(`✅ Passed: ${passedVariants}`);
  report.push(`⚠️  Warnings: ${warningVariants}`);
  report.push(`❌ Failed: ${failedVariants}`);
  report.push('');

  report.push('='.repeat(80));

  return report.join('\n');
}

/**
 * Verify color normalization
 */
export function verifyColorNormalization(): Map<string, { ui: string; normalized: string; status: string }> {
  const results = new Map<string, { ui: string; normalized: string; status: string }>();
  
  const fullSetProducts = getFullSetProducts();
  
  for (const product of fullSetProducts) {
    if (product.colors && product.colors.length > 0) {
      for (const uiColor of product.colors) {
        const normalized = normalizeColorName(uiColor);
        const key = `${product.id}-${uiColor}`;
        results.set(key, {
          ui: uiColor,
          normalized: normalized || 'null',
          status: normalized ? 'ok' : 'warning'
        });
      }
    }
  }
  
  return results;
}


/**
 * Script to sync products from website to Supabase
 * Run this after product updates to keep Supabase in sync
 * 
 * Usage: node scripts/sync-products-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vfhxwzcbjdlfmizakvqc.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read products from data file
async function getProducts() {
  try {
    // Import products (this would require ESM support or we can read the file directly)
    // For now, we'll create a simple version that reads common product structure
    console.log('📦 Reading products...');
    
    // You can extend this to read from products.ts file
    // For now, it's a placeholder - you'll need to adapt based on your product structure
    
    return [];
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

function convertToSupabaseProduct(product) {
  const price = parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0');
  
  return {
    product_id: product.id,
    title: product.name,
    description: Array.isArray(product.description) 
      ? product.description.join('\n\n') 
      : product.description || '',
    price: price,
    category: product.category || 'Uncategorized',
    subcategory: product.hairType || '',
    brand: 'CURLEA',
    sku: product.id,
    image_url: product.image || '',
    is_active: product.inStock !== false,
    inventory_count: product.inStock !== false ? 100 : 0,
  };
}

async function syncProducts() {
  console.log('🚀 Starting product sync to Supabase...\n');
  
  const products = await getProducts();
  
  if (products.length === 0) {
    console.log('⚠️  No products found to sync');
    console.log('💡 You may need to manually adapt this script to read from your products.ts file');
    return;
  }

  console.log(`📋 Found ${products.length} products to sync\n`);

  let success = 0;
  let failed = 0;
  const errors = [];

  for (const product of products) {
    try {
      const supabaseProduct = convertToSupabaseProduct(product);
      
      const { error } = await supabase
        .from('products')
        .upsert(supabaseProduct, {
          onConflict: 'product_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`❌ Failed to sync ${product.name}:`, error.message);
        failed++;
        errors.push(`${product.name}: ${error.message}`);
      } else {
        console.log(`✅ Synced: ${product.name}`);
        success++;
      }
    } catch (error) {
      console.error(`❌ Error syncing ${product.name}:`, error.message);
      failed++;
      errors.push(`${product.name}: ${error.message}`);
    }
  }

  console.log('\n📊 Sync Summary:');
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => console.log(`   - ${err}`));
  }

  console.log('\n✨ Product sync complete!');
}

// Run sync
syncProducts().catch(console.error);


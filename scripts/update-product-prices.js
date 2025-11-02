/**
 * Script to update all product prices in Supabase
 * This updates the source of truth (Supabase) with the real prices
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vfhxwzcbjdlfmizakvqc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Product prices mapping
const priceUpdates = [
  { productId: 'dreamcurl-original', price: 22.99 },
  { productId: 'dreamcurl-midi', price: 22.99 },
  { productId: 'dreamcurl-jumbo', price: 22.99 },
  { productId: 'zero-heat-mini', price: 22.99 },
  { productId: 'heatless-5', price: 19.99 },
  { productId: 'dreamcurl-short-set', price: 16.99 },
  { productId: 'curly-clip-1', price: 14.99 },
  { productId: 'curly-claw-1', price: 15.99 },
  { productId: 'curly-scarf-1', price: 6.99 },
  { productId: 'songmay-hair-clips', price: 3.99 },
  { productId: 'curlea-comb', price: 2.99 },
];

async function updatePrices() {
  console.log('🚀 Starting price updates in Supabase...\n');

  let successCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const update of priceUpdates) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          price: update.price,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', update.productId);

      if (error) {
        console.error(`❌ Failed to update ${update.productId}:`, error.message);
        failedCount++;
        errors.push(`${update.productId}: ${error.message}`);
      } else {
        console.log(`✅ Updated ${update.productId}: $${update.price}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.productId}:`, error.message);
      failedCount++;
      errors.push(`${update.productId}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Update Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => console.log(`  - ${err}`));
  }

  console.log('\n✨ Price update complete!');
}

// Run the update
updatePrices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


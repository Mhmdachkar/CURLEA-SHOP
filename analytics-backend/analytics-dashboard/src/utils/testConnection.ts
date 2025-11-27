/**
 * Test Supabase Connection
 * Run this to verify database connection is working
 */

import { supabase } from '@/lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  const tests = [];
  
  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.error('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    tests.push({ test: 'Environment Variables', status: 'FAILED', error: 'Missing .env values' });
  } else {
    console.log(`✅ VITE_SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(`✅ VITE_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 30)}...`);
    tests.push({ test: 'Environment Variables', status: 'PASSED' });
  }
  
  // Test 2: Check visits table exists and count rows
  console.log('\n2️⃣ Testing visits table...');
  try {
    const { data, error, count } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      tests.push({ test: 'visits table', status: 'FAILED', error: error.message });
    } else {
      console.log(`✅ visits table exists with ${count || 0} rows`);
      tests.push({ test: 'visits table', status: 'PASSED', rows: count || 0 });
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    tests.push({ test: 'visits table', status: 'FAILED', error: err.message });
  }
  
  // Test 3: Check page_views table
  console.log('\n3️⃣ Testing page_views table...');
  try {
    const { data, error, count } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      tests.push({ test: 'page_views table', status: 'FAILED', error: error.message });
    } else {
      console.log(`✅ page_views table exists with ${count || 0} rows`);
      tests.push({ test: 'page_views table', status: 'PASSED', rows: count || 0 });
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    tests.push({ test: 'page_views table', status: 'FAILED', error: err.message });
  }
  
  // Test 4: Check events table
  console.log('\n4️⃣ Testing events table...');
  try {
    const { data, error, count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      tests.push({ test: 'events table', status: 'FAILED', error: error.message });
    } else {
      console.log(`✅ events table exists with ${count || 0} rows`);
      tests.push({ test: 'events table', status: 'PASSED', rows: count || 0 });
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    tests.push({ test: 'events table', status: 'FAILED', error: err.message });
  }
  
  // Test 5: Check cart_events table
  console.log('\n5️⃣ Testing cart_events table...');
  try {
    const { data, error, count } = await supabase
      .from('cart_events')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      tests.push({ test: 'cart_events table', status: 'FAILED', error: error.message });
    } else {
      console.log(`✅ cart_events table exists with ${count || 0} rows`);
      tests.push({ test: 'cart_events table', status: 'PASSED', rows: count || 0 });
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    tests.push({ test: 'cart_events table', status: 'FAILED', error: err.message });
  }
  
  // Test 6: Check orders table (analytics)
  console.log('\n6️⃣ Testing orders table (analytics)...');
  try {
    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      tests.push({ test: 'orders table', status: 'FAILED', error: error.message });
    } else {
      console.log(`✅ orders table exists with ${count || 0} rows`);
      tests.push({ test: 'orders table', status: 'PASSED', rows: count || 0 });
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    tests.push({ test: 'orders table', status: 'FAILED', error: err.message });
  }
  
  // Test 7: Check products table
  console.log('\n7️⃣ Testing products table...');
  try {
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      tests.push({ test: 'products table', status: 'FAILED', error: error.message });
    } else {
      console.log(`✅ products table exists with ${count || 0} rows`);
      tests.push({ test: 'products table', status: 'PASSED', rows: count || 0 });
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    tests.push({ test: 'products table', status: 'FAILED', error: err.message });
  }
  
  // Test 8: Check product_variants table
  console.log('\n8️⃣ Testing product_variants table...');
  try {
    const { data, error, count } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      tests.push({ test: 'product_variants table', status: 'FAILED', error: error.message });
    } else {
      console.log(`✅ product_variants table exists with ${count || 0} rows`);
      tests.push({ test: 'product_variants table', status: 'PASSED', rows: count || 0 });
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    tests.push({ test: 'product_variants table', status: 'FAILED', error: err.message });
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = tests.filter(t => t.status === 'PASSED').length;
  const failed = tests.filter(t => t.status === 'FAILED').length;
  
  console.table(tests);
  
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    
    const hasEnvError = tests.find(t => t.test === 'Environment Variables' && t.status === 'FAILED');
    if (hasEnvError) {
      console.log('1. Fix .env file - add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      console.log('2. Get values from Supabase Dashboard → Project Settings → API');
      console.log('3. Restart dev server');
    }
    
    const tableErrors = tests.filter(t => t.error && t.error.includes('does not exist'));
    if (tableErrors.length > 0) {
      console.log('\n📋 Tables missing - run in Supabase SQL Editor:');
      console.log('   analytics-backend/supabase/COMPLETE_SCHEMA.sql');
    }
    
    const emptyTables = tests.filter(t => t.status === 'PASSED' && t.rows === 0);
    if (emptyTables.length > 0) {
      console.log('\n📊 Tables empty - run in Supabase SQL Editor:');
      console.log('   analytics-backend/supabase/INSERT_SAMPLE_DATA.sql');
    }
    
    const authErrors = tests.filter(t => t.error && (t.error.includes('permission denied') || t.error.includes('policy')));
    if (authErrors.length > 0) {
      console.log('\n🔒 RLS blocking access - run in Supabase SQL Editor:');
      console.log('   analytics-backend/supabase/FIX_RLS_POLICIES.sql');
    }
  } else {
    console.log('\n🎉 All tests passed! Dashboard should be working.');
    
    const emptyTables = tests.filter(t => t.rows === 0);
    if (emptyTables.length > 0) {
      console.log('\n⚠️ Note: Some tables are empty. Add sample data:');
      console.log('   analytics-backend/supabase/INSERT_SAMPLE_DATA.sql');
    }
  }
  
  return tests;
}

// Run automatically if called directly
if (import.meta.env.DEV) {
  // Auto-run on page load in dev mode
  // Comment out if you don't want this
  // testSupabaseConnection();
}



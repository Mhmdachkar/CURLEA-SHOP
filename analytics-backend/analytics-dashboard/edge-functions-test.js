// Edge Functions Performance Test
// Test the analytics tracking endpoint performance

import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://vfhxwzcbjdlfmizakvqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaHh3emNiamRsZm1pemFrdnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzUyMjAsImV4cCI6MjA3NTUxMTIyMH0.FaVuiSGPB_B-sg-O9lm-Yj8XIXr9lLXFrQYwjqCI9Ng';

console.log('🔧 Using Supabase URL:', supabaseUrl);
console.log('🔧 Using Supabase Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data for analytics tracking
function generateAnalyticsEvent() {
  return {
    type: 'cart_event',
    data: {
      session_id: `test-session-${Math.random().toString(36).substr(2, 9)}`,
      event_type: 'add',
      external_product_id: 'heatless-curler-1',
      product_title: 'Heatless Hair Curling Rod Set',
      quantity: Math.floor(Math.random() * 5) + 1,
      price: 29.99,
      total_value: 29.99 * (Math.floor(Math.random() * 5) + 1),
    }
  };
}

// Test Edge Function performance
async function testEdgeFunctionPerformance(iterations = 100) {
  console.log(`🧪 Testing Edge Function performance with ${iterations} requests`);
  
  const results = {
    totalRequests: iterations,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0
  };
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      // Call the Edge Function (analytics tracking endpoint)
      const { data, error } = await supabase.functions.invoke('track', {
        body: generateAnalyticsEvent()
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) {
        console.error(`❌ Request ${i + 1} failed:`, error.message);
        results.failedRequests++;
      } else {
        results.successfulRequests++;
        results.responseTimes.push(responseTime);
        results.minResponseTime = Math.min(results.minResponseTime, responseTime);
        results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
      }
      
      // Log progress every 20 requests
      if ((i + 1) % 20 === 0) {
        console.log(`📈 Progress: ${i + 1}/${iterations} requests completed`);
      }
      
    } catch (error) {
      console.error(`❌ Request ${i + 1} error:`, error.message);
      results.failedRequests++;
    }
    
    // Small delay between requests to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // Calculate statistics
  if (results.responseTimes.length > 0) {
    results.averageResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
  }
  
  const successRate = (results.successfulRequests / results.totalRequests) * 100;
  
  console.log('\n📊 EDGE FUNCTION PERFORMANCE RESULTS:');
  console.log('='.repeat(50));
  console.log(`📈 Total Requests: ${results.totalRequests}`);
  console.log(`✅ Successful: ${results.successfulRequests}`);
  console.log(`❌ Failed: ${results.failedRequests}`);
  console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`⏱️  Average Response Time: ${results.averageResponseTime.toFixed(1)}ms`);
  console.log(`🚀 Fastest Response: ${results.minResponseTime}ms`);
  console.log(`🐌 Slowest Response: ${results.maxResponseTime}ms`);
  
  // Calculate requests per second capacity
  const avgRequestsPerSecond = 1000 / results.averageResponseTime;
  console.log(`🎯 Estimated Capacity: ${avgRequestsPerSecond.toFixed(1)} requests/second`);
  
  return results;
}

// Test different load levels
async function loadTestEdgeFunctions() {
  console.log('🧪 EDGE FUNCTIONS LOAD TEST\n');
  
  const testCases = [
    { requests: 50, delay: 100 },   // 50 requests with 100ms delay
    { requests: 100, delay: 50 },   // 100 requests with 50ms delay  
    { requests: 200, delay: 25 },   // 200 requests with 25ms delay
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🔬 Testing ${testCase.requests} requests with ${testCase.delay}ms delay...`);
    
    const startTime = Date.now();
    const result = await testEdgeFunctionPerformance(testCase.requests);
    const endTime = Date.now();
    
    const totalTime = (endTime - startTime) / 1000;
    const actualRate = testCase.requests / totalTime;
    
    results.push({
      ...testCase,
      ...result,
      totalTime,
      actualRate
    });
    
    console.log(`⏱️  Total test time: ${totalTime.toFixed(1)}s`);
    console.log(`🚀 Actual rate: ${actualRate.toFixed(1)} requests/second`);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 FINAL EDGE FUNCTION PERFORMANCE SUMMARY:');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`Test ${index + 1}: ${result.requests} requests`);
    console.log(`  ✅ Success Rate: ${(result.successfulRequests / result.totalRequests * 100).toFixed(1)}%`);
    console.log(`  ⏱️  Avg Response: ${result.averageResponseTime.toFixed(1)}ms`);
    console.log(`  🚀 Actual Rate: ${result.actualRate.toFixed(1)} requests/sec`);
    console.log('');
  });
  
  return results;
}

// Test Edge Function vs Direct Database Insert
async function comparePerformance() {
  console.log('🔬 PERFORMANCE COMPARISON: Edge Function vs Direct Database Insert\n');
  
  const iterations = 50;
  
  // Test 1: Edge Function
  console.log('🧪 Testing Edge Function performance...');
  const edgeFunctionResults = await testEdgeFunctionPerformance(iterations);
  
  // Test 2: Direct Database Insert
  console.log('\n🧪 Testing Direct Database Insert performance...');
  const directInsertResults = await testDirectInsert(iterations);
  
  // Compare results
  console.log('\n📊 PERFORMANCE COMPARISON:');
  console.log('='.repeat(50));
  console.log(`Edge Function:`);
  console.log(`  ⏱️  Average Response: ${edgeFunctionResults.averageResponseTime.toFixed(1)}ms`);
  console.log(`  ✅ Success Rate: ${(edgeFunctionResults.successfulRequests / edgeFunctionResults.totalRequests * 100).toFixed(1)}%`);
  console.log(`Direct Insert:`);
  console.log(`  ⏱️  Average Response: ${directInsertResults.averageResponseTime.toFixed(1)}ms`);
  console.log(`  ✅ Success Rate: ${(directInsertResults.successfulRequests / directInsertResults.totalRequests * 100).toFixed(1)}%`);
  
  const performanceDiff = ((directInsertResults.averageResponseTime - edgeFunctionResults.averageResponseTime) / directInsertResults.averageResponseTime) * 100;
  
  if (performanceDiff > 0) {
    console.log(`\n🎯 Edge Functions are ${performanceDiff.toFixed(1)}% faster than direct inserts!`);
  } else {
    console.log(`\n⚠️  Direct inserts are ${Math.abs(performanceDiff).toFixed(1)}% faster than Edge Functions`);
  }
  
  return {
    edgeFunction: edgeFunctionResults,
    directInsert: directInsertResults,
    performanceImprovement: performanceDiff
  };
}

// Test direct database insert performance
async function testDirectInsert(iterations = 50) {
  console.log(`🧪 Testing Direct Database Insert performance with ${iterations} requests`);
  
  const results = {
    totalRequests: iterations,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0
  };
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      // Direct database insert
      const { error } = await supabase
        .from('cart_events')
        .insert([{
          session_id: `test-session-${Math.random().toString(36).substr(2, 9)}`,
          event_type: 'add',
          external_product_id: 'heatless-curler-1',
          product_title: 'Heatless Hair Curling Rod Set',
          quantity: Math.floor(Math.random() * 5) + 1,
          price: 29.99,
          total_value: 29.99 * (Math.floor(Math.random() * 5) + 1),
        }]);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) {
        console.error(`❌ Request ${i + 1} failed:`, error.message);
        results.failedRequests++;
      } else {
        results.successfulRequests++;
        results.responseTimes.push(responseTime);
        results.minResponseTime = Math.min(results.minResponseTime, responseTime);
        results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
      }
      
    } catch (error) {
      console.error(`❌ Request ${i + 1} error:`, error.message);
      results.failedRequests++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // Calculate statistics
  if (results.responseTimes.length > 0) {
    results.averageResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
  }
  
  return results;
}

// Run the tests
const testType = process.argv[2] || 'all';

switch (testType) {
  case 'edge':
    loadTestEdgeFunctions()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('❌ Edge Function test failed:', error);
        process.exit(1);
      });
    break;
    
  case 'compare':
    comparePerformance()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('❌ Performance comparison failed:', error);
        process.exit(1);
      });
    break;
    
  default:
    console.log('Available tests:');
    console.log('  node edge-functions-test.js edge    - Test Edge Function performance');
    console.log('  node edge-functions-test.js compare - Compare Edge Function vs Direct Insert');
    process.exit(0);
}

export { 
  testEdgeFunctionPerformance, 
  loadTestEdgeFunctions, 
  comparePerformance,
  testDirectInsert
};

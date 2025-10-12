// Load Testing Script for Analytics Dashboard
// Run this to verify event processing capacity

import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://vfhxwzcbjdlfmizakvqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaHh3emNiamRsZm1pemFrdnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzUyMjAsImV4cCI6MjA3NTUxMTIyMH0.FaVuiSGPB_B-sg-O9lm-Yj8XIXr9lLXFrQYwjqCI9Ng';

console.log('🔧 Using Supabase URL:', supabaseUrl);
console.log('🔧 Using Supabase Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data generator
function generateTestEvent() {
  return {
    session_id: `test-session-${Math.random().toString(36).substr(2, 9)}`,
    event_type: 'add',
    external_product_id: 'heatless-curler-1',
    product_title: 'Heatless Hair Curling Rod Set',
    quantity: Math.floor(Math.random() * 5) + 1,
    price: 29.99,
    total_value: 29.99 * (Math.floor(Math.random() * 5) + 1),
    created_at: new Date().toISOString()
  };
}

// Load test function
async function loadTest(eventsPerSecond = 100, durationSeconds = 60) {
  console.log(`🚀 Starting load test: ${eventsPerSecond} events/second for ${durationSeconds} seconds`);
  console.log(`📊 Target: ${eventsPerSecond * durationSeconds} total events`);
  
  const startTime = Date.now();
  const endTime = startTime + (durationSeconds * 1000);
  
  let totalEvents = 0;
  let successfulEvents = 0;
  let failedEvents = 0;
  
  const eventInterval = 1000 / eventsPerSecond; // milliseconds between events
  
  console.log(`⏱️  Event interval: ${eventInterval}ms`);
  
  while (Date.now() < endTime) {
    const eventStartTime = Date.now();
    
    try {
      const testEvent = generateTestEvent();
      
      const { error } = await supabase
        .from('cart_events')
        .insert([testEvent]);
      
      if (error) {
        console.error('❌ Event failed:', error.message);
        failedEvents++;
      } else {
        successfulEvents++;
      }
      
      totalEvents++;
      
      // Log progress every 1000 events
      if (totalEvents % 1000 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = totalEvents / elapsed;
        console.log(`📈 Progress: ${totalEvents} events in ${elapsed.toFixed(1)}s (${rate.toFixed(1)} events/sec)`);
      }
      
    } catch (error) {
      console.error('❌ Unexpected error:', error.message);
      failedEvents++;
      totalEvents++;
    }
    
    // Wait for next event
    const eventDuration = Date.now() - eventStartTime;
    const waitTime = Math.max(0, eventInterval - eventDuration);
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  const totalTime = (Date.now() - startTime) / 1000;
  const actualRate = totalEvents / totalTime;
  const successRate = (successfulEvents / totalEvents) * 100;
  
  console.log('\n📊 LOAD TEST RESULTS:');
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`📈 Total events: ${totalEvents}`);
  console.log(`✅ Successful: ${successfulEvents}`);
  console.log(`❌ Failed: ${failedEvents}`);
  console.log(`📊 Success rate: ${successRate.toFixed(1)}%`);
  console.log(`🚀 Actual rate: ${actualRate.toFixed(1)} events/second`);
  console.log(`🎯 Target rate: ${eventsPerSecond} events/second`);
  
  if (actualRate >= eventsPerSecond * 0.9) {
    console.log('✅ SUCCESS: System can handle the target load!');
  } else {
    console.log('⚠️  WARNING: System may not handle the target load reliably');
  }
  
  return {
    totalEvents,
    successfulEvents,
    failedEvents,
    actualRate,
    successRate
  };
}

// Performance test for different loads
async function performanceTest() {
  console.log('🧪 ANALYTICS SYSTEM PERFORMANCE TEST\n');
  
  const testCases = [
    { rate: 50, duration: 30 },   // 1,500 events in 30s
    { rate: 100, duration: 30 },  // 3,000 events in 30s
    { rate: 200, duration: 30 },  // 6,000 events in 30s
    { rate: 300, duration: 30 },  // 9,000 events in 30s
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🔬 Testing ${testCase.rate} events/second for ${testCase.duration} seconds...`);
    
    const result = await loadTest(testCase.rate, testCase.duration);
    results.push({
      ...testCase,
      ...result
    });
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n📊 FINAL PERFORMANCE SUMMARY:');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`Test ${index + 1}: ${result.rate} events/sec`);
    console.log(`  ✅ Success Rate: ${result.successRate.toFixed(1)}%`);
    console.log(`  🚀 Actual Rate: ${result.actualRate.toFixed(1)} events/sec`);
    console.log(`  📈 Total Events: ${result.totalEvents}`);
    console.log('');
  });
  
  // Find maximum sustainable rate
  const maxRate = results
    .filter(r => r.successRate >= 95)
    .reduce((max, r) => Math.max(max, r.actualRate), 0);
  
  console.log(`🎯 MAXIMUM SUSTAINABLE RATE: ${maxRate.toFixed(1)} events/second`);
  console.log(`📊 HOURLY CAPACITY: ${(maxRate * 3600).toLocaleString()} events/hour`);
  
  return results;
}

// Run the test
performanceTest()
  .then(() => {
    console.log('\n✅ Performance test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

export { loadTest, performanceTest };

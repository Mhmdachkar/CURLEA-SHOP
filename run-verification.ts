/**
 * Run Product Verification Script
 * Execute this script to verify all products, variants, and Christmas offer logic
 * 
 * Usage: npx tsx run-verification.ts
 * Or: node --loader ts-node/esm run-verification.ts
 */

import { 
  verifyAllFullSets, 
  testChristmasOffer, 
  verifyColorNormalization,
  generateVerificationReport
} from './src/utils/productVerification';

async function main() {
  console.log('\n🔍 Starting Product Verification...\n');
  console.log('='.repeat(80));
  
  try {
    // Generate and display full report
    const report = await generateVerificationReport();
    console.log(report);
    
    // Additional detailed checks
    console.log('\n\n📊 DETAILED VERIFICATION RESULTS\n');
    console.log('='.repeat(80));
    
    // Verify all full sets
    console.log('\n1. FULL SET PRODUCTS VERIFICATION\n');
    const fullSetResults = await verifyAllFullSets();
    
    for (const result of fullSetResults) {
      const statusIcon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${statusIcon} ${result.productName} (${result.productId})`);
      console.log(`   Status: ${result.status.toUpperCase()}`);
      
      if (result.issues.length > 0) {
        console.log(`   Issues:`);
        result.issues.forEach(issue => console.log(`     - ${issue}`));
      }
      
      console.log(`   Variants: ${result.variants.length}`);
      result.variants.forEach(variant => {
        const variantIcon = variant.status === 'pass' ? '✅' : variant.status === 'fail' ? '❌' : '⚠️';
        console.log(`     ${variantIcon} ${variant.uiColor} → ${variant.normalizedColor || 'null'}`);
        console.log(`        Size: ${variant.size}, Stock: ${variant.stockQuantity}, Available: ${variant.availableQuantity}`);
        if (variant.issue) {
          console.log(`        ⚠️  ${variant.issue}`);
        }
      });
      console.log('');
    }
    
    // Test Christmas offer
    console.log('\n2. CHRISTMAS OFFER LOGIC TESTS\n');
    const offerTests = testChristmasOffer();
    
    offerTests.forEach((test, idx) => {
      console.log(`Test ${idx + 1}: ${test.testName}`);
      console.log(`   Cart Items: ${test.cartItems.map(i => `${i.id} (${i.color || 'N/A'}) x${i.quantity}`).join(', ')}`);
      console.log(`   Expected: ${test.expectedFreeItem ? `Free item: ${test.expectedFreeItem}` : 'No free item'}`);
      console.log(`   Status: ${test.status.toUpperCase()}`);
      if (test.issue) {
        console.log(`   ⚠️  Issue: ${test.issue}`);
      }
      console.log('');
    });
    
    // Color normalization
    console.log('\n3. COLOR NORMALIZATION VERIFICATION\n');
    const colorResults = verifyColorNormalization();
    
    console.log('Color Mappings:');
    Array.from(colorResults.entries()).forEach(([key, value]) => {
      const statusIcon = value.status === 'ok' ? '✅' : '⚠️';
      console.log(`   ${statusIcon} ${key}`);
      console.log(`      UI: "${value.ui}" → Normalized: "${value.normalized}"`);
    });
    
    // Summary
    console.log('\n\n📈 SUMMARY\n');
    console.log('='.repeat(80));
    
    const totalProducts = fullSetResults.length;
    const passedProducts = fullSetResults.filter(r => r.status === 'pass').length;
    const failedProducts = fullSetResults.filter(r => r.status === 'fail').length;
    const warningProducts = fullSetResults.filter(r => r.status === 'warning').length;
    
    const totalVariants = fullSetResults.reduce((sum, r) => sum + r.variants.length, 0);
    const passedVariants = fullSetResults.reduce((sum, r) => 
      sum + r.variants.filter(v => v.status === 'pass').length, 0);
    const failedVariants = fullSetResults.reduce((sum, r) => 
      sum + r.variants.filter(v => v.status === 'fail').length, 0);
    const warningVariants = fullSetResults.reduce((sum, r) => 
      sum + r.variants.filter(v => v.status === 'warning').length, 0);
    
    console.log(`Products: ${passedProducts}/${totalProducts} passed, ${warningProducts} warnings, ${failedProducts} failed`);
    console.log(`Variants: ${passedVariants}/${totalVariants} passed, ${warningVariants} warnings, ${failedVariants} failed`);
    console.log(`Christmas Offer Tests: ${offerTests.length} tests defined`);
    console.log(`Color Normalizations: ${colorResults.size} mappings verified`);
    
    if (failedProducts === 0 && failedVariants === 0) {
      console.log('\n✅ All critical tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('Verification complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error running verification:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the verification
main().catch(console.error);


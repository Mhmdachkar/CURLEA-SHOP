/**
 * Product Verification Panel Component
 * Displays verification results for all full set products
 */

import React, { useState, useEffect } from 'react';
import { 
  verifyAllFullSets, 
  testChristmasOffer, 
  verifyColorNormalization,
  VerificationResult,
  ChristmasOfferTest
} from '@/utils/productVerification';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export const ProductVerificationPanel: React.FC = () => {
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [offerTests, setOfferTests] = useState<ChristmasOfferTest[]>([]);
  const [colorNormalization, setColorNormalization] = useState<Map<string, { ui: string; normalized: string; status: string }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Verify all full sets
      const results = await verifyAllFullSets();
      setVerificationResults(results);
      
      // Test Christmas offer
      const tests = testChristmasOffer();
      setOfferTests(tests);
      
      // Verify color normalization
      const colorResults = verifyColorNormalization();
      setColorNormalization(colorResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run on mount (only in development)
    if (process.env.NODE_ENV === 'development') {
      runVerification();
    }
  }, []);

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'fail':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Product Verification Panel</h1>
        <button
          onClick={runVerification}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            'Run Verification'
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          Error: {error}
        </div>
      )}

      {/* Full Set Products Verification */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Full Set Products Verification</h2>
        
        {verificationResults.length === 0 && !loading && (
          <p className="text-gray-500">Click "Run Verification" to start</p>
        )}

        {verificationResults.map((result) => (
          <div
            key={result.productId}
            className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center gap-3 mb-3">
              {getStatusIcon(result.status)}
              <div>
                <h3 className="font-semibold text-lg">{result.productName}</h3>
                <p className="text-sm opacity-75">{result.productId}</p>
              </div>
            </div>

            {result.issues.length > 0 && (
              <div className="mb-3">
                <p className="font-semibold mb-1">Issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <p className="font-semibold">Variants:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {result.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border ${
                      variant.status === 'pass'
                        ? 'bg-white border-green-200'
                        : variant.status === 'fail'
                        ? 'bg-white border-red-200'
                        : 'bg-white border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(variant.status)}
                      <span className="font-semibold">{variant.uiColor}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Size: {variant.size}</p>
                      <p>DB Color: {variant.normalizedColor || 'null'}</p>
                      <p>Stock: {variant.stockQuantity}</p>
                      <p>Available: {variant.availableQuantity}</p>
                      {variant.issue && (
                        <p className="text-red-600 text-xs mt-1">{variant.issue}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Christmas Offer Tests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Christmas Offer Logic Tests</h2>
        
        {offerTests.map((test, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 bg-white"
          >
            <div className="flex items-center gap-3 mb-3">
              {getStatusIcon(test.status)}
              <h3 className="font-semibold">{test.testName}</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Cart Items:</p>
              <ul className="list-disc list-inside ml-4">
                {test.cartItems.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    {item.id} ({item.color || 'N/A'}) × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="font-semibold">Expected:</p>
              <p className="ml-4">
                {test.expectedFreeItem 
                  ? `Free item: ${test.expectedFreeItem}` 
                  : 'No free item (only 2 items qualify)'}
              </p>
              {test.issue && (
                <p className="text-red-600 ml-4">Issue: {test.issue}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Color Normalization */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Normalization</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from(colorNormalization.entries()).map(([key, value]) => (
            <div
              key={key}
              className="border rounded-lg p-3 bg-white"
            >
              <p className="font-semibold text-sm mb-2">{key}</p>
              <div className="text-sm space-y-1">
                <p>UI: {value.ui}</p>
                <p>Normalized: {value.normalized}</p>
                <p className={`text-xs ${
                  value.status === 'ok' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  Status: {value.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


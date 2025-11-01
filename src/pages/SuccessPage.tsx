import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, Truck, Mail } from 'lucide-react';
import '../styles/checkout-styles.css';

export default function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  // Countdown to redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FDF8F4] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="cart-container max-w-md text-center animate-fade-in-up"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.2 
          }}
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #A4193D, #D4AF37)',
            boxShadow: '0 10px 40px -10px rgba(212, 175, 55, 0.3)'
          }}
        >
          <CheckCircle className="w-10 h-10" color="white" />
        </motion.div>

        {/* Heading */}
        <h1 
          className="text-3xl font-bold mb-4 gradient-text"
          style={{
            background: 'linear-gradient(135deg, #A4193D, #D4AF37)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Payment Successful! 🎉
        </h1>

        {/* Description */}
        <p className="text-muted mb-6" style={{ color: '#666666' }}>
          Thank you for your purchase. Your order is being processed and you'll receive a confirmation email shortly.
        </p>

        {/* Session ID (if available) */}
        {sessionId && (
          <div 
            className="bg-[#F5E6D3] border border-[#D4AF37] rounded-lg p-4 mb-6"
          >
            <p className="text-sm font-semibold mb-2" style={{ color: '#A4193D' }}>
              Order Confirmation
            </p>
            <p className="text-xs font-mono" style={{ color: '#666666' }}>
              {sessionId}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center justify-center gap-3 text-sm" style={{ color: '#666666' }}>
            <Mail className="w-4 h-4" />
            <span>Email confirmation sent</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm" style={{ color: '#666666' }}>
            <Truck className="w-4 h-4" />
            <span>Free shipping included</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm" style={{ color: '#666666' }}>
            <CheckCircle className="w-4 h-4" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="checkout-btn flex-1"
            style={{
              background: 'linear-gradient(135deg, #A4193D, #D4AF37)',
              color: 'white',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(164, 25, 61, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(212, 175, 55, 0.3)';
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>

        {/* Countdown */}
        {countdown > 0 && (
          <p className="text-xs mt-4" style={{ color: '#666666' }}>
            Redirecting in {countdown} seconds...
          </p>
        )}
      </motion.div>
    </div>
  );
}


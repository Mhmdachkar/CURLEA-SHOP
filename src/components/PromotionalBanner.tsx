import React from 'react';
import { motion } from 'framer-motion';

const PromotionalBanner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-black via-gray-900 to-black border-b border-[#D4AF37]/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3.5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-center text-center"
        >
          {/* Ultra-sharp text with no icons */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <motion.span 
              className="text-sm md:text-base font-black tracking-[0.2em] uppercase bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37] bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                fontWeight: 900,
                letterSpacing: '0.25em',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              BLACK FRIDAY EXCLUSIVE
            </motion.span>
            
            <span className="hidden md:inline text-[#D4AF37]/40 text-sm font-thin px-2">|</span>
            
            <span 
              className="text-white text-sm md:text-base font-bold tracking-wider uppercase"
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              Buy <span className="text-[#F2D06B]">1</span> Full Set, Get a <span className="text-[#F2D06B]">FREE</span> Gift
            </span>
            
            <span className="hidden lg:inline text-[#D4AF37]/40 text-sm font-thin px-2">|</span>
            
            <motion.span 
              className="hidden lg:inline text-[#D4AF37] text-xs md:text-sm font-bold tracking-widest uppercase"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              LIMITED TIME ONLY
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default PromotionalBanner;

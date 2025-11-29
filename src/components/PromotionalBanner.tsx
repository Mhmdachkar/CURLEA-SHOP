import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PromotionalBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide logic if needed, but for Black Friday we keep it visible
  useEffect(() => {
    // Optional: Hide after scroll? No, keep it sticky/visible for BF
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-black text-[#D4AF37] px-4 py-2.5 relative z-50 border-b border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs md:text-sm font-medium tracking-wide"
        >
          <span className="animate-pulse">??</span>
          <span className="font-bold">BLACK FRIDAY EXCLUSIVE:</span>
          <span>Buy 1 Full Set, Get a FREE Gift!</span>
          <span className="hidden md:inline text-white/50 mx-2">|</span>
          <span className="hidden md:inline text-white/80">Limited Time Only</span>
        </motion.div>
      </div>
    </div>
  );
};

export default PromotionalBanner;

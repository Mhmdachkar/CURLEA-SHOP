import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PromotionalBanner = () => {
  const location = useLocation();
  // No rotation needed - only one offer
  const currentOffer = 0;

  // Hide banner on checkout page
  if (location.pathname === '/checkout') {
    return null;
  }

  const offers = [
    {
      id: 0,
      title: "SPECIAL OFFER",
      subtitle: "Buy 2 Items, Get 50% OFF 3rd Item",
      gradient: "from-black via-gray-900 to-black"
    }
  ];

  const currentOfferData = offers[currentOffer];

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] border-b border-[#D4AF37]/30 shadow-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentOffer}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`bg-gradient-to-r ${currentOfferData.gradient}`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3.5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center text-center"
            >
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <motion.span
                  className="text-[#D4AF37] font-extrabold text-xs md:text-sm tracking-[0.15em] uppercase"
                  style={{
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    filter: 'contrast(1.1) brightness(1.1)'
                  }}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {currentOfferData.title}
                </motion.span>

                <motion.span
                  className="hidden md:inline text-[#D4AF37]/40 font-light text-sm"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  •
                </motion.span>

                <motion.span
                  className="text-white font-semibold text-sm md:text-base tracking-wide"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                >
                  {currentOfferData.subtitle}
                </motion.span>
              </div>
            </motion.div>

            {/* Rotation indicator dots */}
            <div className="flex justify-center gap-2 mt-2.5">
              {offers.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentOffer ? 'bg-[#D4AF37] w-6' : 'bg-white/30'
                    }`}
                  animate={{
                    scale: index === currentOffer ? 1.1 : 1,
                    opacity: index === currentOffer ? 1 : 0.5
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PromotionalBanner;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PromotionalBanner = () => {
  const location = useLocation();
  // No rotation needed - only one offer
  const currentOffer = 0;

  // Show/hide based on scroll direction:
  // - scrolling down  -> hide
  // - scrolling up    -> show
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY <= 0) {
            // At very top: always show banner
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY) {
            // Scrolling down: hide banner
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up: show banner
            setIsVisible(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide banner on checkout page
  if (location.pathname === '/checkout') {
    return null;
  }

  const offers = [
    {
      id: 0,
      title: "",
      subtitle: "Buy any 2 full sets and get the third for free",
      gradient: "from-black via-gray-900 to-black"
    }
  ];

  const currentOfferData = offers[currentOffer];

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] border-b border-[#D4AF37]/30 shadow-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentOffer}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromotionalBanner;

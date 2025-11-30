import { useState, useEffect } from 'react';
import { X, Gift, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function BlackFridayPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if popup has been shown in this session
    const hasSeenPromo = sessionStorage.getItem('curlea-bf-promo-seen');

    if (!hasSeenPromo) {
      // Show popup after 2 second delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('curlea-bf-promo-seen', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleShopNow = () => {
    setIsOpen(false);
    // Navigate to a product page or collection
    navigate('/shop');
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999]"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Popup Container - Flying in from bottom */}
          <motion.div
            initial={{ y: '100vh', opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100vh', opacity: 0, scale: 0.8 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 150,
              duration: 0.6
            }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="relative w-full max-w-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                onClick={handleClose}
                className="absolute -top-4 -right-4 z-10 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-100 transition-colors group"
              >
                <X className="w-5 h-5 text-gray-800 group-hover:rotate-90 transition-transform duration-300" />
              </motion.button>

              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.3),transparent_50%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.2),transparent_50%)]" />
                </div>

                {/* Floating Sparkles */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-10 right-10"
                >
                  <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-10 left-10"
                >
                  <Sparkles className="w-6 h-6 text-[#F2D06B]" />
                </motion.div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-12">
                  {/* Badge */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] text-black px-6 py-2 rounded-full mb-6 font-bold text-sm shadow-lg"
                  >
                    <Gift className="w-4 h-4" />
                    <span>BLACK FRIDAY EXCLUSIVE</span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-6xl font-serif mb-4 bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37] bg-clip-text text-transparent bg-[length:200%_auto]"
                    style={{
                      animation: 'gradient 3s ease infinite'
                    }}
                  >
                    Buy 1, Get 1 FREE
                  </motion.h2>

                  {/* Description */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8 space-y-3"
                  >
                    <p className="text-white text-lg md:text-xl leading-relaxed">
                      Purchase any <span className="text-[#D4AF37] font-bold">DreamCurl™ Full Set</span> and receive our
                    </p>
                    <p className="text-white text-lg md:text-xl leading-relaxed">
                      <span className="text-[#F2D06B] font-bold">CURLEA Geometric Flower Hair Claw Clip Set</span>
                    </p>
                    <p className="text-[#D4AF37] text-2xl md:text-3xl font-bold">
                      (Worth $15.99) ABSOLUTELY FREE
                    </p>
                  </motion.div>

                  {/* Features */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                  >
                    {[
                      { icon: '⏰', text: 'Limited Time Only' },
                      { icon: '🎁', text: 'Free Gift Included' },
                      { icon: '✨', text: 'Premium Quality' },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white text-sm font-medium">{item.text}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <button
                      onClick={handleShopNow}
                      className="group flex-1 relative flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B5952F] text-black font-bold text-lg py-4 px-8 rounded-xl shadow-[0_0_30px_-5px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_-5px_rgba(212,175,55,0.7)] transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10">Shop Now</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </button>
                    
                    <button
                      onClick={handleClose}
                      className="sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all duration-300"
                    >
                      Maybe Later
                    </button>
                  </motion.div>

                  {/* Footer Text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 text-center text-gray-400 text-sm"
                  >
                    🔥 Hurry! Limited stock available
                  </motion.p>
                </div>

                {/* Decorative Bottom Border */}
                <div className="h-2 bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37]" />
              </div>
            </div>
          </motion.div>

          {/* Add gradient animation CSS */}
          <style>{`
            @keyframes gradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}


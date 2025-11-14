import { motion } from 'framer-motion';
import { Tag, Sparkles } from 'lucide-react';

export default function PromotionalBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden bg-gradient-to-r from-[#A4193D] to-[#D4AF37] text-white py-3 px-4 rounded-xl shadow-lg mb-6"
    >
      {/* Animated background effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          backgroundSize: '200% 100%',
        }}
      />

      {/* Sparkle decorations */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1 right-4 text-white/40"
      >
        <Sparkles className="w-4 h-4" />
      </motion.div>

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1 left-4 text-white/30"
      >
        <Sparkles className="w-3 h-3" />
      </motion.div>

      {/* Content */}
      <div className="relative flex items-center justify-center gap-3">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Tag className="w-5 h-5" />
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
          <span className="font-bold text-base sm:text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Special Offer!
          </span>
          <span className="text-sm sm:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
            Buy 2 items, get <span className="font-bold">50% OFF</span> the 3rd item
          </span>
        </div>

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-xl"
        >
          🎉
        </motion.div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </motion.div>
  );
}


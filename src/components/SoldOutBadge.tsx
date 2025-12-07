import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, PackageX } from 'lucide-react';

interface SoldOutBadgeProps {
    variant?: 'badge' | 'banner' | 'overlay';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * SoldOutBadge Component
 * Displays a "Sold Out" indicator with various styles
 */
export const SoldOutBadge: React.FC<SoldOutBadgeProps> = ({
    variant = 'badge',
    size = 'md',
    className = ''
}) => {
    // Badge variant (small colored badge)
    if (variant === 'badge') {
        const sizeClasses = {
            sm: 'text-xs px-2 py-1',
            md: 'text-sm px-3 py-1.5',
            lg: 'text-base px-4 py-2'
        };

        return (
            <motion.div
                className={`
          inline-flex items-center gap-1.5 rounded-full
          bg-red-500/10 border border-red-500/30
          text-red-600 font-semibold
          ${sizeClasses[size]}
          ${className}
        `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <AlertCircle size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
                Sold Out
            </motion.div>
        );
    }

    // Banner variant (full-width alert bar)
    if (variant === 'banner') {
        return (
            <motion.div
                className={`
          w-full py-3 px-4 rounded-lg
          bg-gradient-to-r from-red-500/10 to-orange-500/10
          border border-red-500/30
          flex items-center justify-center gap-2
          ${className}
        `}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <PackageX className="text-red-600" size={20} />
                <span className="text-red-600 font-semibold text-sm md:text-base">
                    This Item is Currently Sold Out
                </span>
            </motion.div>
        );
    }

    // Overlay variant (covers product image)
    if (variant === 'overlay') {
        return (
            <motion.div
                className={`
          absolute inset-0 z-10
          bg-gradient-to-br from-gray-900/80 to-gray-900/60
          backdrop-blur-sm
          flex flex-col items-center justify-center
          ${className}
        `}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <PackageX className="w-16 h-16 text-red-400 mx-auto mb-3" />
                    <div className="text-white font-bold text-2xl mb-2">
                        SOLD OUT
                    </div>
                    <div className="text-gray-300 text-sm">
                        Out of Stock
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return null;
};

/**
 * LowStockBadge Component
 * Shows "Only X left!" warning for low stock items
 */
interface LowStockBadgeProps {
    quantity: number;
    threshold?: number;
    className?: string;
}

export const LowStockBadge: React.FC<LowStockBadgeProps> = ({
    quantity,
    threshold = 3,
    className = ''
}) => {
    if (quantity === 0 || quantity > threshold) {
        return null;
    }

    return (
        <motion.div
            className={`
        inline-flex items-center gap-1.5 rounded-full
        bg-amber-500/10 border border-amber-500/30
        text-amber-600 font-semibold text-xs px-3 py-1.5
        ${className}
      `}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <AlertCircle size={12} />
            Only {quantity} left!
        </motion.div>
    );
};

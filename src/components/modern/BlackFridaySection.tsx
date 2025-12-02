import React, { useState, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Gift, Sparkles, ArrowRight, Check } from 'lucide-react';

// Product IDs - Updated free gift
const FREE_GIFT_ID = 'curly-claw-1';
const FREE_GIFT_NAME = 'CURLEA Geometric Flower Hair Claw Clip Set';

// Color mapping to actual product colors
const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
    'Latte': {
        bg: '#D4C5A9', // Latte/beige color
        text: '#3A3428',
        border: '#B8A68A',
    },
    'Candy': {
        bg: '#FFB6C1', // Pink/candy color
        text: '#8B1A3D',
        border: '#FF91A4',
    },
    'Olive': {
        bg: '#9CAF88', // Olive green
        text: '#2D3A1F',
        border: '#7A9368',
    },
    'Mulberry': {
        bg: '#C8A2C8', // Mulberry purple
        text: '#4A2C4A',
        border: '#A67BA6',
    },
    'Purple': {
        bg: '#B19CD9', // Purple
        text: '#3D2A5C',
        border: '#9374B8',
    },
};
const FULL_SETS = [
    {
        id: 'dreamcurl-original',
        name: 'DreamCurl™ Full Set Original',
        price: 24.99,
        colors: {
            'Mulberry': new URL('../../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href,
            'Candy': new URL('../../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_686ff861-b01d-41ef-9c4c-0684df944cd6.webp', import.meta.url).href,
            'Latte': new URL('../../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href,
            'Olive': new URL('../../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
        }
    },
    {
        id: 'dreamcurl-jumbo',
        name: 'DreamCurl™ Full Set Jumbo',
        price: 22.99,
        colors: {
            'Latte': new URL('../../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
            'Candy': new URL('../../assets/Heatless Hair Curling Rod/Jumbo_size/candy_jumbo.webp', import.meta.url).href,
            'Olive': new URL('../../assets/Heatless Hair Curling Rod/Jumbo_size/olive_jumbo.webp4.webp', import.meta.url).href,
            'Mulberry': new URL('../../assets/Heatless Hair Curling Rod/Jumbo_size/purple_jumbo.webp', import.meta.url).href,
        }
    },
    {
        id: 'dreamcurl-midi',
        name: 'DreamCurl™ Full Set Midi',
        price: 20.00,
        colors: {
            'Mulberry': new URL('../../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
            'Candy': new URL('../../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,
            'Latte': new URL('../../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,
            'Olive': new URL('../../assets/Heatless Hair Curling Rod/midi_size/midi_olive.webp', import.meta.url).href,
        }
    },
    {
        id: 'zero-heat-mini',
        name: 'CURLEA Zero Heat Mini Set',
        price: 22.99,
        colors: {
            'Olive': new URL('../../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
            'Latte': new URL('../../assets/Heatless Hair Curling Rod/mini-size/mini-latte.webp', import.meta.url).href,
            'Candy': new URL('../../assets/Heatless Hair Curling Rod/mini-size/mini-candy.webp', import.meta.url).href,
            'Purple': new URL('../../assets/Heatless Hair Curling Rod/mini-size/mini-purple.webp', import.meta.url).href,
        }
    }
];

export const BlackFridaySection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { addToCart, openCart } = useCart();

    const [selectedSetId, setSelectedSetId] = useState(FULL_SETS[0].id);
    const [selectedColor, setSelectedColor] = useState(Object.keys(FULL_SETS[0].colors)[0]);
    const [isAdding, setIsAdding] = useState(false);

    const selectedSet = FULL_SETS.find(s => s.id === selectedSetId) || FULL_SETS[0];
    const availableColors = Object.keys(selectedSet.colors);
    const currentImage = selectedSet.colors[selectedColor as keyof typeof selectedSet.colors];

    // Images - Updated free gift image
    const giftImage = new URL('../../assets/curly hair collection/product3/ppp2.jpg', import.meta.url).href;

    const handleAddToCart = async () => {
        setIsAdding(true);

        // 1. Add the selected Full Set
        addToCart({
            id: selectedSet.id,
            name: selectedSet.name,
            price: `$${selectedSet.price.toFixed(2)}`,
            image: currentImage,
            selectedColor: selectedColor,
        });

        // 2. Add the Free Gift (Claw Clip Set)
        addToCart({
            id: FREE_GIFT_ID,
            name: FREE_GIFT_NAME,
            price: '$0.00', // Free!
            originalPrice: '$15.99',
            image: giftImage,
        });

        // Small delay for animation
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsAdding(false);
        openCart();
    };

    return (
        <section id="black-friday-section" ref={ref} className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 overflow-hidden bg-white">
            {/* Subtle animated pattern background */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.3),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.2),transparent_40%)]" />
            </div>

            {/* Subtle floating sparkles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-[#D4AF37] rounded-full opacity-30"
                    style={{
                        left: `${15 + i * 15}%`,
                        top: `${25 + (i % 2) * 30}%`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.4,
                    }}
                />
            ))}

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Floating Badge - No Icons, Sharp Font - Responsive */}
                <motion.div
                    className="flex justify-center mb-6 sm:mb-8"
                    initial={{ y: -50, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ type: 'spring', damping: 20 }}
                >
                    <div
                        className="inline-flex items-center bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] text-black px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 rounded-full shadow-2xl border-2 border-[#F2D06B]/50"
                        style={{
                            fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 900,
                            letterSpacing: '0.15em',
                            fontSize: '0.75rem',
                            textRendering: 'optimizeLegibility',
                            WebkitFontSmoothing: 'antialiased',
                        }}
                    >
                        <span className="text-xs sm:text-sm md:text-lg">BLACK FRIDAY EXCLUSIVE</span>
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 xl:p-12 border-2 border-gray-200 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Left: Visuals with Enhanced Animations */}
                    <div className="relative">
                        <motion.div
                            className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl group"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {/* Main Product Image */}
                            <motion.img
                                key={selectedColor} // Key to trigger re-render animation
                                src={currentImage}
                                alt={`${selectedSet.name} - ${selectedColor}`}
                                className="w-full h-full object-cover"
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            />

                            {/* Shimmer effect on hover */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.8 }}
                            />

                            {/* Floating Free Gift with better animation - Responsive */}
                            <motion.div
                                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] sm:shadow-[0_0_30px_rgba(212,175,55,0.5)] md:shadow-[0_0_40px_rgba(212,175,55,0.6)] bg-white"
                                initial={{ x: 100, y: 100, opacity: 0, rotate: -10 }}
                                animate={isInView ? {
                                    x: 0,
                                    y: 0,
                                    opacity: 1,
                                    rotate: 0,
                                    scale: [1, 1.05, 1]
                                } : {}}
                                transition={{
                                    delay: 0.5,
                                    duration: 0.6,
                                    scale: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }
                                }}
                            >
                                <motion.div
                                    className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] text-center text-black py-0.5 sm:py-1 md:py-1.5 flex items-center justify-center"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{
                                        fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                        fontWeight: 900,
                                        fontSize: '0.5rem',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    <span className="text-[6px] sm:text-[7px] md:text-[10px]">FREE GIFT</span>
                                </motion.div>
                                <img src={giftImage} alt="Free Gift - CURLEA Geometric Flower Hair Claw Clip Set" className="w-full h-full object-cover" />
                            </motion.div>
                        </motion.div>

                        {/* Value badge - Responsive */}
                        <motion.div
                            className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 md:-top-4 md:-left-4 bg-rose-500 text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full shadow-xl transform -rotate-12 text-xs sm:text-sm md:text-base"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={isInView ? { scale: 1, rotate: -12 } : {}}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        >
                            Save $15.99
                        </motion.div>
                    </div>

                    {/* Right: Enhanced Content */}
                    <div className="text-gray-900 space-y-6 sm:space-y-8">
                        <div>
                            <motion.h2
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-4 sm:mb-6 bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37] bg-clip-text text-transparent"
                                initial={{ opacity: 0, x: -30 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ delay: 0.2 }}
                                style={{
                                    backgroundSize: '200% auto',
                                    animation: 'gradient 3s ease infinite',
                                    fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                    fontWeight: 900,
                                    letterSpacing: '-0.02em',
                                    textRendering: 'optimizeLegibility',
                                    WebkitFontSmoothing: 'antialiased',
                                }}
                            >
                                Buy One, Get One Free
                            </motion.h2>
                            <motion.p
                                className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : {}}
                                transition={{ delay: 0.3 }}
                            >
                                Purchase any <span className="text-black font-bold">DreamCurl™ Full Set</span> and receive our best-selling{' '}
                                <span className="text-black font-bold">{FREE_GIFT_NAME}</span>{' '}
                                <span className="text-[#D4AF37] font-bold text-lg sm:text-xl md:text-2xl block mt-2">(worth $15.99) absolutely FREE</span>
                            </motion.p>
                        </div>

                        {/* Enhanced Selection Controls */}
                        <motion.div
                            className="space-y-4 sm:space-y-6 bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-gray-200"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.4 }}
                        >
                            {/* Product Selector */}
                            <div className="space-y-2 sm:space-y-3">
                                <label
                                    className="text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 text-black"
                                    style={{
                                        fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                        fontWeight: 800,
                                        letterSpacing: '0.15em',
                                    }}
                                >
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Select Your Set
                                </label>
                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                    {FULL_SETS.map((set, index) => (
                                        <motion.button
                                            key={set.id}
                                            onClick={() => {
                                                setSelectedSetId(set.id);
                                                setSelectedColor(Object.keys(set.colors)[0]);
                                            }}
                                            className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${selectedSetId === set.id
                                                    ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#F2D06B]/10 border-[#D4AF37] text-black shadow-lg'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#D4AF37]/50'
                                                }`}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <span className="font-semibold text-sm sm:text-base md:text-lg">{set.name}</span>
                                            <span className="text-base sm:text-lg md:text-xl font-bold">${set.price.toFixed(2)}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector */}
                            <div className="space-y-3">
                                <label
                                    className="text-xs sm:text-sm uppercase tracking-wider text-black"
                                    style={{
                                        fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                        fontWeight: 800,
                                        letterSpacing: '0.15em',
                                    }}
                                >
                                    Select Color: <span className="text-[#D4AF37] text-base sm:text-lg">{selectedColor}</span>
                                </label>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {availableColors.map((color, index) => {
                                        const colorInfo = COLOR_MAP[color] || { bg: '#000', text: '#fff', border: '#000' };
                                        const isSelected = selectedColor === color;

                                        return (
                                            <motion.button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all border-2 ${isSelected
                                                        ? 'shadow-lg scale-105'
                                                        : 'hover:scale-105'
                                                    }`}
                                                style={{
                                                    backgroundColor: isSelected ? colorInfo.bg : 'white',
                                                    color: isSelected ? colorInfo.text : '#374151',
                                                    borderColor: isSelected ? colorInfo.border : '#D1D5DB',
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={isInView ? { opacity: 1, scale: isSelected ? 1.05 : 1 } : {}}
                                                transition={{ delay: 0.7 + index * 0.05 }}
                                            >
                                                {color}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        {/* Enhanced CTA - Sharp Font - Responsive */}
                        <motion.button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="w-full group relative flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37] text-black py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-[0_0_60px_-5px_rgba(212,175,55,0.8)] transition-all duration-300 overflow-hidden disabled:opacity-70"
                            style={{
                                fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                fontWeight: 900,
                                fontSize: '0.875rem',
                                letterSpacing: '0.1em',
                                textRendering: 'optimizeLegibility',
                                WebkitFontSmoothing: 'antialiased',
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.8 }}
                        >
                            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base lg:text-lg">
                                {isAdding ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </motion.div>
                                        <span className="text-xs sm:text-sm md:text-base">Adding to Cart...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs sm:text-sm md:text-base lg:text-lg">CLAIM BLACK FRIDAY OFFER</span>
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                        </motion.button>

                        <motion.p
                            className="text-center text-xs sm:text-sm uppercase tracking-widest"
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ delay: 0.9 }}
                            style={{
                                fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                            }}
                        >
                            <span className="text-rose-500 font-black text-xs sm:text-sm">⚡ LIMITED STOCK AVAILABLE</span>
                            <span className="text-gray-400 mx-1 sm:mx-2">•</span>
                            <span className="text-gray-600 font-bold text-xs sm:text-sm">OFFER ENDS SOON</span>
                        </motion.p>
                    </div>
                </motion.div>
            </div>

            {/* CSS for gradient animation */}
            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>
        </section>
    );
};

import React, { useState, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Gift, Sparkles, ArrowRight, Check } from 'lucide-react';

// Product IDs
const FREE_GIFT_ID = 'curly-claw-1';
const FULL_SETS = [
    {
        id: 'dreamcurl-original',
        name: 'DreamCurl™ Original Set',
        price: 24.99,
        image: new URL('../../assets/Heatless Hair Curling Rod/PRODUCT7/IMG-3641.webp', import.meta.url).href,
        colors: ['Mulberry', 'Candy', 'Latte', 'Olive']
    },
    {
        id: 'dreamcurl-jumbo',
        name: 'DreamCurl™ Jumbo Size',
        price: 22.99,
        image: new URL('../../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
        colors: ['Latte', 'Candy', 'Olive', 'Mulberry']
    },
    {
        id: 'dreamcurl-midi',
        name: 'DreamCurl™ Midi',
        price: 20.00,
        image: new URL('../../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
        colors: ['Mulberry', 'Candy', 'Latte', 'Olive']
    }
];

export const BlackFridaySection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const { addToCart, openCart } = useCart();

    const [selectedSetId, setSelectedSetId] = useState(FULL_SETS[0].id);
    const [selectedColor, setSelectedColor] = useState(FULL_SETS[0].colors[0]);
    const [isAdding, setIsAdding] = useState(false);

    const selectedSet = FULL_SETS.find(s => s.id === selectedSetId) || FULL_SETS[0];

    // Images
    const giftImage = new URL('../../assets/curly hair collection/product4/gold.jpg', import.meta.url).href;

    const handleAddToCart = async () => {
        setIsAdding(true);

        // 1. Add the selected Full Set
        addToCart({
            id: selectedSet.id,
            name: selectedSet.name,
            price: `$${selectedSet.price.toFixed(2)}`,
            image: selectedSet.image,
            selectedColor: selectedColor,
            quantity: 1,
        });

        // 2. Add the Free Gift (Claw Clip)
        addToCart({
            id: FREE_GIFT_ID,
            name: 'Geometric Flower Hair Claw Clip',
            price: '$0.00', // Free!
            originalPrice: '$11.99',
            image: giftImage,
            quantity: 1,
            isFreeGift: true,
        });

        // Small delay for animation
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsAdding(false);
        openCart();
    };

    return (
        <section ref={ref} className="relative py-24 px-4 overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
            
            {/* Animated light beams */}
            <motion.div
                className="absolute inset-0 opacity-20"
                initial={{ backgroundPosition: '0% 50%' }}
                animate={{ backgroundPosition: '100% 50%' }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                    background: 'radial-gradient(circle at 30% 20%, rgba(212,175,55,0.3), transparent 40%), radial-gradient(circle at 70% 80%, rgba(212,175,55,0.2), transparent 40%)',
                    backgroundSize: '200% 200%'
                }}
            />

            {/* Floating sparkles */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-[#D4AF37] rounded-full"
                    style={{
                        left: `${10 + i * 12}%`,
                        top: `${20 + (i % 3) * 20}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                    }}
                />
            ))}

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Floating Badge */}
                <motion.div
                    className="flex justify-center mb-8"
                    initial={{ y: -50, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ type: 'spring', damping: 20 }}
                >
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] text-black font-bold px-8 py-3 rounded-full shadow-2xl border-2 border-[#F2D06B]/50">
                        <Gift className="w-5 h-5" />
                        <span className="text-lg">BLACK FRIDAY EXCLUSIVE</span>
                        <Sparkles className="w-5 h-5" />
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-white/20 shadow-[0_0_80px_-10px_rgba(212,175,55,0.3)]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Left: Visuals with Enhanced Animations */}
                    <div className="relative">
                        <motion.div
                            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl group"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {/* Main Product Image */}
                            <motion.img
                                src={selectedSet.image}
                                alt={selectedSet.name}
                                className="w-full h-full object-cover"
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.6 }}
                            />

                            {/* Shimmer effect on hover */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.8 }}
                            />

                            {/* Floating Free Gift with better animation */}
                            <motion.div
                                className="absolute bottom-6 right-6 w-36 h-36 rounded-2xl overflow-hidden border-4 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.6)] bg-black"
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
                                    className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] text-xs font-bold text-center text-black py-1.5 flex items-center justify-center gap-1"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Gift className="w-3 h-3" />
                                    FREE GIFT
                                </motion.div>
                                <img src={giftImage} alt="Free Gift" className="w-full h-full object-cover" />
                            </motion.div>
                        </motion.div>

                        {/* Value badge */}
                        <motion.div
                            className="absolute -top-4 -left-4 bg-rose-500 text-white font-bold px-6 py-3 rounded-full shadow-xl transform -rotate-12"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={isInView ? { scale: 1, rotate: -12 } : {}}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        >
                            Save $11.99
                        </motion.div>
                    </div>

                    {/* Right: Enhanced Content */}
                    <div className="text-white space-y-8">
                        <div>
                            <motion.h2
                                className="text-5xl md:text-7xl font-serif mb-6 bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37] bg-clip-text text-transparent"
                                initial={{ opacity: 0, x: -30 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ delay: 0.2 }}
                                style={{
                                    backgroundSize: '200% auto',
                                    animation: 'gradient 3s ease infinite'
                                }}
                            >
                                Buy One, Get One Free
                            </motion.h2>
                            <motion.p 
                                className="text-gray-300 text-xl leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : {}}
                                transition={{ delay: 0.3 }}
                            >
                                Purchase any <span className="text-[#D4AF37] font-bold">DreamCurl™ Full Set</span> and receive our best-selling Geometric Flower Hair Claw Clip{' '}
                                <span className="text-[#D4AF37] font-bold text-2xl block mt-2">(worth $11.99) absolutely FREE</span>
                            </motion.p>
                        </div>

                        {/* Enhanced Selection Controls */}
                        <motion.div 
                            className="space-y-6 bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/20 backdrop-blur-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.4 }}
                        >
                            {/* Product Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Select Your Set
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {FULL_SETS.map((set, index) => (
                                        <motion.button
                                            key={set.id}
                                            onClick={() => {
                                                setSelectedSetId(set.id);
                                                setSelectedColor(set.colors[0]);
                                            }}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                                selectedSetId === set.id
                                                    ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#F2D06B]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'
                                            }`}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <span className="font-semibold text-lg">{set.name}</span>
                                            <span className="text-xl font-bold">${set.price.toFixed(2)}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                                    Select Color: <span className="text-white text-lg">{selectedColor}</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {selectedSet.colors.map((color, index) => (
                                        <motion.button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-5 py-3 rounded-xl text-base font-semibold transition-all border-2 ${
                                                selectedColor === color
                                                    ? 'bg-white text-black border-white shadow-lg scale-110'
                                                    : 'bg-transparent text-gray-300 border-white/30 hover:border-white/60 hover:bg-white/10'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={isInView ? { opacity: 1, scale: selectedColor === color ? 1.1 : 1 } : {}}
                                            transition={{ delay: 0.7 + index * 0.05 }}
                                        >
                                            {color}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Enhanced CTA */}
                        <motion.button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37] text-black font-bold text-xl py-5 rounded-2xl shadow-[0_0_40px_-5px_rgba(212,175,55,0.6)] hover:shadow-[0_0_60px_-5px_rgba(212,175,55,0.8)] transition-all duration-300 overflow-hidden disabled:opacity-70"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.8 }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isAdding ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Sparkles className="w-5 h-5" />
                                        </motion.div>
                                        Adding to Cart...
                                    </>
                                ) : (
                                    <>
                                        CLAIM BLACK FRIDAY OFFER
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
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
                            className="text-center text-sm uppercase tracking-widest"
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ delay: 0.9 }}
                        >
                            <span className="text-rose-400 font-bold">⚡ Limited Stock Available</span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className="text-gray-400">Offer Ends Soon</span>
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

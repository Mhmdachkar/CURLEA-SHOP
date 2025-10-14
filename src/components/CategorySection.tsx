import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import categoryImage from "@/assets/category-curly.png";
import dreamcurlHeroImage from "@/assets/hero-2.png";

const categories = [
  {
    id: 1,
    name: "Curlea® DreamCurl™ Collection",
    slug: "wavy",
    image: dreamcurlHeroImage,
    comingSoon: false,
  },
  {
    id: 2,
    name: "Curlea® Everyday Luxe Essentials ™ Collection",
    slug: "curly",
    image: categoryImage,
    comingSoon: false,
  },
  {
    id: 3,
    name: "Curlea® Satin Rituals™ Collection",
    slug: "straight",
    image: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=1000&fit=crop",
    comingSoon: true,
  },
];

export const CategorySection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleCategoryClick = (categorySlug: string, comingSoon: boolean) => {
    if (!comingSoon) {
      navigate(`/category/${categorySlug}`);
    }
    // If coming soon, do nothing - just show the elegant state
  };

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-20 xl:py-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh]"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="relative overflow-hidden cursor-pointer group"
            onMouseEnter={() => setHoveredId(category.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleCategoryClick(category.slug, category.comingSoon)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Image with Ken Burns Effect */}
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: hoveredId === category.id ? 1.1 : 1,
                opacity: hoveredId !== null && hoveredId !== category.id ? 0.4 : 1,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* Coming Soon Overlay */}
            {category.comingSoon && (
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center">
                  <motion.div
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="text-white font-semibold text-sm sm:text-base">Coming Soon</span>
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Text Overlay */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 lg:p-8"
              animate={{
                y: hoveredId === category.id ? -10 : 0,
              }}
              transition={{ duration: 0.4 }}
            >
              <h3 className={`fluid-text-xl sm:fluid-text-2xl lg:fluid-text-3xl font-bold text-center mb-3 sm:mb-4 ${
                category.comingSoon ? 'text-white/70' : 'text-white'
              }`}>
                {category.name}
              </h3>
              
              {/* Explore Button - Only show if not coming soon */}
              {!category.comingSoon && (
                <motion.div
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors touch-target"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: hoveredId === category.id ? 1 : 0.7,
                    y: hoveredId === category.id ? 0 : 10
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="fluid-text-sm font-medium">Explore Collection</span>
                  <motion.div
                    animate={{ x: hoveredId === category.id ? 5 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    →
                  </motion.div>
                </motion.div>
              )}
            </motion.div>

            {/* Hover Border */}
            <motion.div
              className="absolute inset-0 border-4 border-accent pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredId === category.id ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

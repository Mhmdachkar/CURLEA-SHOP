import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";
import { useNavigate } from "react-router-dom";
import { products, Product } from "@/data/products";

export const TrendingProducts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Get trending products (first 6 products)
  const trendingProducts = products.slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 sm:mb-16"
        >
          Trending Now
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {trendingProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                {...product}
                onClick={() => navigate(`/product/${product.id}`)}
                onQuickView={(product) => setQuickViewProduct(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
};

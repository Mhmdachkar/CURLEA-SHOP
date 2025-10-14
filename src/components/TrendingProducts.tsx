import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";
import { useNavigate } from "react-router-dom";
import { products, Product, getCurlyHairCollectionProducts } from "@/data/products";
import { getHeatlessCurlingRodProducts } from "@/pages/CategoryPage";

export const TrendingProducts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Get trending products: 3 from Heatless Hair Curling Rod and 3 from Curly Hair Collection
  const heatlessProducts = getHeatlessCurlingRodProducts().slice(0, 3);
  const curlyProducts = getCurlyHairCollectionProducts().slice(0, 3);
  const trendingProducts = [...heatlessProducts, ...curlyProducts];

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
    <section ref={ref} className="py-8 sm:py-12 lg:py-16 container-fluid bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="fluid-text-3xl sm:fluid-text-4xl lg:fluid-text-5xl font-bold text-center mb-6 sm:mb-8 lg:mb-10"
        >
          Trending Now
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 xl:gap-8"
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

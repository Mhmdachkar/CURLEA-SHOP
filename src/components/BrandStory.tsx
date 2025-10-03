import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const BrandStory = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative py-32 bg-gradient-to-b from-background to-muted overflow-hidden">
      {/* Parallax Background Elements */}
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        style={{ y }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
        style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
      />

      <motion.div 
        className="max-w-6xl mx-auto px-6"
        style={{ opacity }}
      >
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-bold mb-6 text-balance"
              style={{ letterSpacing: "-0.02em" }}
            >
              Crafted by Nature, Perfected by Science
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Every Curlea product is a harmonious blend of pure botanical extracts and cutting-edge haircare technology. We believe in celebrating your natural texture while providing the nourishment your hair deserves.
            </motion.p>
            <motion.p 
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              From ethically sourced argan oil to revolutionary peptide complexes, we've curated the finest ingredients to transform your hair ritual into an experience of luxury and care.
            </motion.p>
            
            <motion.div
              className="flex gap-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div>
                <div className="text-4xl font-bold text-accent mb-2">98%</div>
                <div className="text-sm text-muted-foreground tracking-wider">Natural Ingredients</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">100%</div>
                <div className="text-sm text-muted-foreground tracking-wider">Cruelty Free</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">50K+</div>
                <div className="text-sm text-muted-foreground tracking-wider">Happy Customers</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            <motion.div
              className="aspect-[3/4] bg-muted rounded-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=800&fit=crop"
                alt="Natural ingredients"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mt-12"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=800&fit=crop"
                alt="Luxury products"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

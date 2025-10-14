import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import brandImage1 from "@/assets/Gemini_Generated_Image_6phoy76phoy76pho.png";
import brandImage2 from "@/assets/Gemini_Generated_Image_ka0ob2ka0ob2ka0o.png";

export const BrandStory = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const isTextInView = useInView(textRef, { once: true, margin: "-100px" });
  const isImageInView = useInView(imageRef, { once: true, margin: "-100px" });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  
  // Enhanced scroll animations
  const textY = useTransform(scrollYProgress, [0, 0.5], [50, 0]);
  const imageY = useTransform(scrollYProgress, [0, 0.5], [-50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 2]);

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20 bg-gradient-to-b from-background to-muted overflow-hidden">
      {/* Enhanced Parallax Background Elements */}
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/5 rounded-full blur-3xl"
        style={{ 
          y,
          scale,
          rotate,
          opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.2])
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-accent/5 rounded-full blur-3xl"
        style={{ 
          y: useTransform(scrollYProgress, [0, 1], [-100, 100]),
          scale: useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 0.8]),
          rotate: useTransform(scrollYProgress, [0, 1], [0, -2])
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}

      <motion.div 
        className="max-w-6xl mx-auto px-6"
        style={{ opacity }}
      >
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{ y: textY }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance"
              style={{ letterSpacing: "-0.02em" }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 1.2, 
                ease: [0.43, 0.13, 0.23, 0.96],
                delay: 0.2
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Crafted by Nature,
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-accent"
              >
                Perfected by Science
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8 }}
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
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0, duration: 0.6 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="text-4xl font-bold text-accent mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 1.2, 
                    duration: 1.0,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  98%
                </motion.div>
                <motion.div 
                  className="text-sm text-muted-foreground tracking-wider"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  Natural Ingredients
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.6 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="text-4xl font-bold text-accent mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 1.4, 
                    duration: 1.0,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  100%
                </motion.div>
                <motion.div 
                  className="text-sm text-muted-foreground tracking-wider"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                >
                  Cruelty Free
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.4, duration: 0.6 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="text-4xl font-bold text-accent mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 1.6, 
                    duration: 1.0,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  50K+
                </motion.div>
                <motion.div 
                  className="text-sm text-muted-foreground tracking-wider"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                >
                  Happy Customers
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Image Grid */}
          <motion.div
            ref={imageRef}
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{ y: imageY }}
          >
            <motion.div
              className="aspect-[3/4] bg-muted rounded-lg overflow-hidden relative"
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay: 0.2, 
                duration: 1.0,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                z: 50,
                transition: { duration: 0.4 }
              }}
              style={{ 
                transformStyle: "preserve-3d",
                perspective: 1000
              }}
            >
              <motion.img
                src={brandImage1}
                alt="Natural ingredients"
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
                whileHover={{ scale: 1.1 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </motion.div>
            
            <motion.div
              className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mt-12 relative"
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay: 0.4, 
                duration: 1.0,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              whileHover={{ 
                scale: 1.05,
                rotateY: -5,
                z: 50,
                transition: { duration: 0.4 }
              }}
              style={{ 
                transformStyle: "preserve-3d",
                perspective: 1000
              }}
            >
              <motion.img
                src={brandImage2}
                alt="Luxury products"
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
                whileHover={{ scale: 1.1 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import hero1 from "@/assets/hero-luxury-1.jpg";
import hero2 from "@/assets/hero-luxury-2.jpg";
import hero3 from "@/assets/hero-luxury-3.jpg";

const slides = [
  {
    image: hero1,
    video: "https://cdn.pixabay.com/video/2023/05/02/161033-822263015_large.mp4",
    title: "Embrace Your Natural Shine",
    subtitle: "Discover luxurious care for every hair type",
  },
  {
    image: hero2,
    video: "https://cdn.pixabay.com/video/2022/02/17/108265-678761960_large.mp4",
    title: "Curl Is Power",
    subtitle: "Embrace your natural form with confidence",
  },
  {
    image: hero3,
    video: "https://cdn.pixabay.com/video/2021/08/25/86733-595229851_large.mp4",
    title: "Define Your Beauty",
    subtitle: "Embrace your natural power",
  },
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [useVideo, setUseVideo] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={heroRef} className="relative h-screen-safe w-full overflow-hidden pt-16 sm:pt-20">
      {/* Background Video/Image Layer with Elegant Crossfade & Parallax */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0"
          style={{ y }}
        >
          <div className="absolute inset-0 w-full h-full">
            {useVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                onError={() => setUseVideo(false)}
              >
                <source src={slides[currentSlide].video} type="video/mp4" />
              </video>
            ) : (
              <motion.img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 8, ease: "easeOut" }}
              />
            )}
          </div>

          {/* Enhanced Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content with Subtle Parallax */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8"
        style={{ opacity }}
      >
        <AnimatedTitle text={slides[currentSlide].title} key={`title-${currentSlide}`} />
        
        <motion.p
          key={`subtitle-${currentSlide}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="text-white/95 fluid-text-base sm:fluid-text-lg lg:fluid-text-xl mb-6 sm:mb-8 lg:mb-12 max-w-3xl font-light tracking-wider"
        >
          {slides[currentSlide].subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <MagneticCTAButton />
        </motion.div>

        {/* Animated Scroll Indicator */}
        <motion.div
          className="absolute bottom-16 sm:bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white/60 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>

    </section>
  );
};

// Animated Title with Word-by-Word Reveal and Glow Effect
const AnimatedTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");

  return (
    <h1 className="fluid-text-4xl sm:fluid-text-5xl lg:fluid-text-6xl xl:fluid-text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl leading-tight">
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            delay: index * 0.12,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
          className="inline-block mr-1 sm:mr-2 lg:mr-3"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
};

// Enhanced Magnetic CTA Button with Glow Effect
const MagneticCTAButton = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const handleClick = () => {
    navigate('/collection');
  };

  return (
    <motion.button
      ref={buttonRef}
      className="relative px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 bg-white text-primary font-semibold tracking-widest overflow-hidden group shadow-2xl fluid-text-sm sm:fluid-text-base touch-target-comfortable"
      animate={{ x: mousePosition.x, y: mousePosition.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      whileHover={{ scale: 1.05, boxShadow: "0 25px 70px rgba(0,0,0,0.4)" }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-accent to-[hsl(35,80%,65%)]"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "0%" : "-100%" }}
        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
      <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center gap-3">
        Shop Now
        <motion.span
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ duration: 0.3 }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );
};

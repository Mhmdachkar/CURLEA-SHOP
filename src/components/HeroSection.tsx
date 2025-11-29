import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Button } from "@/components/ui/button";
import hero1 from "@/assets/hero-luxury-1.jpg";
import hero2 from "@/assets/hero-luxury-2.jpg";
import hero3 from "@/assets/hero-luxury-3.jpg";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const HeroContainer = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
  overflow: hidden;
  padding-top: 4rem; /* Account for navbar */

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding-top: 5rem;
  }
`;

const BackgroundLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  will-change: transform, opacity;
`;

const MediaContainer = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const HeroImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.3), rgba(0,0,0,0.7)),
    linear-gradient(to right, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.3)),
    linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  will-change: auto;
`;

const ContentContainer = styled(motion.div)`
  position: relative;
  z-index: ${({ theme }) => theme.zIndex.base + 10};
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  will-change: opacity;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing['2xl']};
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: #ffffff;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  max-width: 90vw;

  @media ${({ theme }) => theme.mediaQueries.mobileLarge} {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['6xl']};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    max-width: 80vw;
  }
`;

const TitleWord = styled(motion.span)`
  display: inline-block;
  margin-right: 0.25rem;
  will-change: transform, opacity;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    margin-right: 0.5rem;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    margin-right: 0.75rem;
  }
`;

const Subtitle = styled(motion.p)`
  color: rgba(255, 255, 255, 0.95);
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  max-width: 90vw;
  font-weight: ${({ theme }) => theme.typography.fontWeight.light};
  letter-spacing: 0.05em;

  @media ${({ theme }) => theme.mediaQueries.mobileLarge} {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    max-width: 48rem;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  }
`;

const CTAButton = styled(motion.button)`
  position: relative;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: #ffffff;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-radius: 0;
  cursor: pointer;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  min-width: ${({ theme }) => theme.touchTargets.comfortable};
  min-height: ${({ theme }) => theme.touchTargets.comfortable};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    gap: ${({ theme }) => theme.spacing.md};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing['3xl']};
  }
`;

const CTAGradient = styled(motion.span)`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.gradients.gold};
`;

const CTAText = styled.span`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: color 0.3s ease;

  ${CTAButton}:hover & {
    color: #ffffff;
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  will-change: auto;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    bottom: 5rem;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    bottom: 6rem;
  }
`;

const ScrollIndicatorContainer = styled.div`
  width: 1.5rem;
  height: 2.5rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0.5rem 0;
`;

const ScrollIndicatorDot = styled(motion.div)`
  width: 0.375rem;
  height: 0.375rem;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  will-change: transform;
`;

/* ============================================
   SLIDE DATA
   ============================================ */

const slides = [
  {
    image: hero1,
    title: "Embrace Your Natural Shine",
    subtitle: "Discover luxurious care for every hair type",
  },
  {
    image: hero2,
    title: "Curl Is Power",
    subtitle: "Embrace your natural form with confidence",
  },
  {
    image: hero3,
    title: "Define Your Beauty",
    subtitle: "Embrace your natural power",
  },
];

/* ============================================
   ANIMATED TITLE COMPONENT
   ============================================ */

interface AnimatedTitleProps {
  text: string;
}

const AnimatedTitle = ({ text }: AnimatedTitleProps) => {
  const words = text.split(" ");

  return (
    <Title>
      {words.map((word, index) => (
        <TitleWord
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: index * 0.08,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        >
          {word}
        </TitleWord>
      ))}
    </Title>
  );
};

/* ============================================
   MAGNETIC CTA BUTTON COMPONENT
   ============================================ */

const MagneticCTAButton = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Disable magnetic effect on mobile/tablet
  const isMagneticEnabled = !isMobile && !isTablet;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isMagneticEnabled || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    if (!isMagneticEnabled) return;
    setMousePosition({ x: 0, y: 0 });
  };

  const handleClick = () => {
    navigate('/collection');
  };

  return (
    <CTAButton
      ref={buttonRef}
      animate={isMagneticEnabled ? { x: mousePosition.x, y: mousePosition.y } : {}}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      whileHover={{ scale: 1.05, boxShadow: "0 25px 70px rgba(0,0,0,0.4)" }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <CTAGradient
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "0%" : "-100%" }}
        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
      <CTAText>
        Shop Now
        <motion.span
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ duration: 0.3 }}
        >
          →
        </motion.span>
      </CTAText>
    </CTAButton>
  );
};

/* ============================================
   HERO SECTION COMPONENT
   ============================================ */

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { isMobile, isTablet } = useBreakpoint();

  // Always create scroll tracking but disable effects during page loading
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });

  // Disable parallax on mobile for performance - REDUCED parallax
  const shouldUseParallax = !isMobile && !isTablet;
  const y = useTransform(scrollYProgress, [0, 1], ["0%", (shouldUseParallax && !isPageLoading) ? "20%" : "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.9, 0.6]);

  // Check if page is still loading and disable scroll effects
  useEffect(() => {
    const checkPageLoading = () => {
      const isLoading = document.documentElement.classList.contains('page-loading');
      setIsPageLoading(isLoading);
    };

    // Check immediately
    checkPageLoading();

    // Set up observer to watch for page-loading class changes
    const observer = new MutationObserver(checkPageLoading);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Also check when component mounts to ensure proper state
    const timeout = setTimeout(() => {
      checkPageLoading();
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  // Scroll prevention during page loading - Less aggressive
  useEffect(() => {
    if (!isPageLoading) return;

    const preventScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      // Only prevent wheel and touch events during page loading
      heroElement.addEventListener('wheel', preventScroll, { passive: false });
      heroElement.addEventListener('touchmove', preventScroll, { passive: false });
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener('wheel', preventScroll);
        heroElement.removeEventListener('touchmove', preventScroll);
      }
    };
  }, [isPageLoading]);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <HeroContainer
      ref={heroRef}
      className={`hero-section ${isPageLoading ? 'page-loading-hero' : ''}`}>
      {/* Background Video/Image Layer with Elegant Crossfade & Parallax */}
      <AnimatePresence mode="sync">
        <BackgroundLayer
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          style={{
            y: (shouldUseParallax && !isPageLoading) ? y : 0,
            willChange: "auto",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)"
          }}
        >
          <MediaContainer>
            <HeroImage
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              initial={{ scale: 1 }}
              animate={{ scale: 1.02 }}
              transition={{ duration: 12, ease: "easeOut" }}
            />
          </MediaContainer>

          <GradientOverlay />
        </BackgroundLayer>
      </AnimatePresence>
      {/* Content */}
      <ContentContainer style={{ opacity: isPageLoading ? 1 : opacity }}>
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Black Friday <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F2D06B]">
            Event
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Our biggest offer of the year. Buy any full set and receive a luxury gift on us.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/product/dreamcurl-original">
            <Button
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B5952F] text-black font-bold px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]"
            >
              Shop the Offer
            </Button>
          </Link>
          <Link to="/collection">
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
            >
              View Collection
            </Button>
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <ScrollIndicator
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <ScrollIndicatorContainer>
            <ScrollIndicatorDot
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </ScrollIndicatorContainer>
        </ScrollIndicator>
      </ContentContainer>
    </HeroContainer>
  );
};

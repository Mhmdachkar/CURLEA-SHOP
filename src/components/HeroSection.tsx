import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";
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

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
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
  const [useVideo, setUseVideo] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const { isMobile, isTablet } = useBreakpoint();
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Disable parallax on mobile for performance
  const shouldUseParallax = !isMobile && !isTablet;
  const y = useTransform(scrollYProgress, [0, 1], ["0%", shouldUseParallax ? "50%" : "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Disable video on mobile for performance
  useEffect(() => {
    if (isMobile || isTablet) {
      setUseVideo(false);
    }
  }, [isMobile, isTablet]);

  return (
    <HeroContainer ref={heroRef} className="hero-section">
      {/* Background Video/Image Layer with Elegant Crossfade & Parallax */}
      <AnimatePresence mode="sync">
        <BackgroundLayer
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          style={{ y: shouldUseParallax ? y : 0 }}
        >
          <MediaContainer>
            {useVideo ? (
              <Video
                autoPlay
                muted
                loop
                playsInline
                onError={() => setUseVideo(false)}
              >
                <source src={slides[currentSlide].video} type="video/mp4" />
              </Video>
            ) : (
              <HeroImage
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                initial={{ scale: 1 }}
                animate={{ scale: 1.02 }}
                transition={{ duration: 12, ease: "easeOut" }}
              />
            )}
          </MediaContainer>

          <GradientOverlay />
        </BackgroundLayer>
      </AnimatePresence>

      {/* Content */}
      <ContentContainer style={{ opacity }}>
        <AnimatedTitle text={slides[currentSlide].title} key={`title-${currentSlide}`} />
        
        <Subtitle
          key={`subtitle-${currentSlide}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          {slides[currentSlide].subtitle}
        </Subtitle>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <MagneticCTAButton />
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

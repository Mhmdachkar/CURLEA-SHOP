import { useRef } from "react";
import styled from "styled-components";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import brandImage1 from "@/assets/Gemini_Generated_Image_6phoy76phoy76pho.png";
import brandImage2 from "@/assets/Gemini_Generated_Image_ka0ob2ka0ob2ka0o.png";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const Section = styled.section`
  position: relative;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  background: linear-gradient(to bottom, 
    ${({ theme }) => theme.colors.background}, 
    ${({ theme }) => theme.colors.muted}
  );
  overflow: hidden;
  width: 100%;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing['3xl']} 0;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing['4xl']} 0;
  }
`;

const ParallaxBlob1 = styled(motion.div)`
  position: absolute;
  top: 5rem;
  right: 2.5rem;
  width: 20rem;
  height: 20rem;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent}1a, 
    ${({ theme }) => theme.colors.primary}0d
  );
  border-radius: ${({ theme }) => theme.borderRadius.full};
  filter: blur(60px);

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    width: 24rem;
    height: 24rem;
    filter: blur(80px);
  }
`;

const ParallaxBlob2 = styled(motion.div)`
  position: absolute;
  bottom: 5rem;
  left: 2.5rem;
  width: 20rem;
  height: 20rem;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.secondary}1a, 
    ${({ theme }) => theme.colors.accent}0d
  );
  border-radius: ${({ theme }) => theme.borderRadius.full};
  filter: blur(60px);

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    width: 24rem;
    height: 24rem;
    filter: blur(80px);
  }
`;

const FloatingParticle = styled(motion.div)<{ $left: string; $top: string }>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  width: 0.5rem;
  height: 0.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: 0.2;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const Container = styled(motion.div)`
  max-width: ${({ theme }) => theme.breakpoints.desktop}px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  position: relative;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: 0 ${({ theme }) => theme.spacing.xl};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    max-width: ${({ theme }) => theme.breakpoints.desktopLarge}px;
    padding: 0 ${({ theme }) => theme.spacing['2xl']};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: center;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing['2xl']};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    gap: ${({ theme }) => theme.spacing['3xl']};
  }
`;

const TextContent = styled(motion.div)`
  order: 2;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    order: 1;
  }
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  letter-spacing: -0.02em;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const TitleLine = styled(motion.span)`
  display: block;
`;

const AccentText = styled.span`
  color: ${({ theme }) => theme.colors.accent};
`;

const Description = styled(motion.p)`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.mutedForeground};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const StatsContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    gap: ${({ theme }) => theme.spacing['2xl']};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    gap: ${({ theme }) => theme.spacing['3xl']};
  }
`;

const StatItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled(motion.div)`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.accent};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }
`;

const StatLabel = styled(motion.div)`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.mutedForeground};
  letter-spacing: 0.1em;
  text-transform: uppercase;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const ImageGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  order: 1;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    order: 2;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const ImageContainer = styled(motion.div)<{ $offset?: boolean }>`
  aspect-ratio: 3 / 4;
  background-color: ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;

  ${({ $offset }) => $offset && `
    margin-top: 3rem;

    @media (min-width: 768px) {
      margin-top: 3rem;
    }
  `}
`;

const Image = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
`;

/* ============================================
   DATA
   ============================================ */

const stats = [
  { value: "98%", label: "Natural Ingredients" },
  { value: "100%", label: "Cruelty Free" },
  { value: "50K+", label: "Happy Customers" },
];

/* ============================================
   BRAND STORY COMPONENT
   ============================================ */

export const BrandStory = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useBreakpoint();
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const isTextInView = useInView(textRef, { once: true, margin: "-100px" });
  const isImageInView = useInView(imageRef, { once: true, margin: "-100px" });

  // Disable parallax on mobile for performance
  const shouldUseParallax = !isMobile && !isTablet;
  const y = useTransform(scrollYProgress, [0, 1], shouldUseParallax ? [100, -100] : [0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], shouldUseParallax ? [50, 0] : [0, 0]);
  const imageY = useTransform(scrollYProgress, [0, 0.5], shouldUseParallax ? [-50, 0] : [0, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const rotate = useTransform(scrollYProgress, [0, 1], shouldUseParallax ? [0, 2] : [0, 0]);

  return (
    <Section ref={sectionRef}>
      {/* Enhanced Parallax Background Elements */}
      <ParallaxBlob1
        style={shouldUseParallax ? { y, scale, rotate } : {}}
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
      <ParallaxBlob2
        style={shouldUseParallax ? { 
          y: useTransform(scrollYProgress, [0, 1], [-100, 100]),
          scale: useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 0.8]),
          rotate: useTransform(scrollYProgress, [0, 1], [0, -2])
        } : {}}
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
      
      {/* Floating Particles - hidden on mobile for performance */}
      {!isMobile && [...Array(6)].map((_, i) => (
        <FloatingParticle
          key={i}
          $left={`${15 + i * 15}%`}
          $top={`${20 + (i % 3) * 25}%`}
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

      <Container style={{ opacity }}>
        <Grid>
          {/* Left Content */}
          <TextContent
            ref={textRef}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={shouldUseParallax ? { y: textY } : {}}
          >
            <Title>
              <TitleLine
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96], delay: 0.2 }}
              >
                Crafted by Nature,
              </TitleLine>
              <TitleLine
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <AccentText>Perfected by Science</AccentText>
              </TitleLine>
            </Title>

            <Description
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Every Curlea product is a harmonious blend of pure botanical extracts and cutting-edge haircare technology. We believe in celebrating your natural texture while providing the nourishment your hair deserves.
            </Description>

            <Description
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              From ethically sourced argan oil to revolutionary peptide complexes, we've curated the finest ingredients to transform your hair ritual into an experience of luxury and care.
            </Description>
            
            <StatsContainer
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              {stats.map((stat, index) => (
                <StatItem
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 + index * 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <StatValue
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: 1.4 + index * 0.2, 
                      duration: 1.0,
                      type: "spring",
                      stiffness: 100
                    }}
                  >
                    {stat.value}
                  </StatValue>
                  <StatLabel
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.6 + index * 0.2, duration: 0.6 }}
                  >
                    {stat.label}
                  </StatLabel>
                </StatItem>
              ))}
            </StatsContainer>
          </TextContent>

          {/* Right Image Grid */}
          <ImageGrid
            ref={imageRef}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={shouldUseParallax ? { y: imageY } : {}}
          >
            <ImageContainer
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 1.0, ease: [0.43, 0.13, 0.23, 0.96] }}
              whileHover={shouldUseParallax ? { scale: 1.05, rotateY: 5, z: 50, transition: { duration: 0.4 } } : {}}
            >
              <Image
                src={brandImage1}
                alt="Natural ingredients"
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
                whileHover={{ scale: 1.1 }}
              />
              <ImageOverlay
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </ImageContainer>
            
            <ImageContainer
              $offset
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1.0, ease: [0.43, 0.13, 0.23, 0.96] }}
              whileHover={shouldUseParallax ? { scale: 1.05, rotateY: -5, z: 50, transition: { duration: 0.4 } } : {}}
            >
              <Image
                src={brandImage2}
                alt="Luxury products"
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
                whileHover={{ scale: 1.1 }}
              />
              <ImageOverlay
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </ImageContainer>
          </ImageGrid>
        </Grid>
      </Container>
    </Section>
  );
};

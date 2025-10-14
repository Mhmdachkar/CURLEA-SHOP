import { useRef, useState } from "react";
import styled from "styled-components";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import categoryImage from "@/assets/category-curly.png";
import dreamcurlHeroImage from "@/assets/hero-2.png";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const Section = styled.section`
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  width: 100%;
  overflow: hidden;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing['3xl']} 0;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing['4xl']} 0;
  }
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  height: clamp(40vh, 50vh, 60vh);
  width: 100%;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    grid-template-columns: repeat(3, 1fr);
    height: clamp(50vh, 60vh, 70vh);
  }
`;

const CategoryCard = styled(motion.div)<{ $comingSoon?: boolean }>`
  position: relative;
  overflow: hidden;
  cursor: ${({ $comingSoon }) => ($comingSoon ? 'default' : 'pointer')};
  width: 100%;
  height: 100%;
`;

const ImageContainer = styled(motion.div)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
`;

const ComingSoonOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ComingSoonBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: 1px solid rgba(255, 255, 255, 0.3);

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  }
`;

const PulsingDot = styled(motion.div)`
  width: 0.5rem;
  height: 0.5rem;
  background-color: #ffffff;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const ComingSoonText = styled.span`
  color: #ffffff;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const TextOverlay = styled(motion.div)<{ $comingSoon?: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing.md};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const CategoryTitle = styled.h3<{ $comingSoon?: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-align: center;
  color: ${({ $comingSoon }) => ($comingSoon ? 'rgba(255, 255, 255, 0.7)' : '#ffffff')};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  @media ${({ theme }) => theme.mediaQueries.desktopLarge} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }
`;

const ExploreButton = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: rgba(255, 255, 255, 0.8);
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  min-height: ${({ theme }) => theme.touchTargets.min};
  justify-content: center;
  transition: color 0.3s ease;

  &:hover {
    color: #ffffff;
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const HoverBorder = styled(motion.div)`
  position: absolute;
  inset: 0;
  border: 4px solid ${({ theme }) => theme.colors.accent};
  pointer-events: none;
`;

/* ============================================
   DATA
   ============================================ */

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

/* ============================================
   CATEGORY SECTION COMPONENT
   ============================================ */

export const CategorySection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { isMobile, isTablet } = useBreakpoint();

  const handleCategoryClick = (categorySlug: string, comingSoon: boolean) => {
    if (!comingSoon) {
      navigate(`/category/${categorySlug}`);
    }
  };

  // Disable hover effects on mobile/tablet for performance
  const shouldUseHoverEffects = !isMobile && !isTablet;

  return (
    <Section ref={ref}>
      <Grid
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            $comingSoon={category.comingSoon}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            onMouseEnter={() => shouldUseHoverEffects && setHoveredId(category.id)}
            onMouseLeave={() => shouldUseHoverEffects && setHoveredId(null)}
            onClick={() => handleCategoryClick(category.slug, category.comingSoon)}
            whileHover={shouldUseHoverEffects && !category.comingSoon ? { scale: 1.02 } : {}}
            whileTap={!category.comingSoon ? { scale: 0.98 } : {}}
          >
            {/* Image with Ken Burns Effect */}
            <ImageContainer
              animate={shouldUseHoverEffects ? {
                scale: hoveredId === category.id ? 1.1 : 1,
                opacity: hoveredId !== null && hoveredId !== category.id ? 0.4 : 1,
              } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <CategoryImage
                src={category.image}
                alt={category.name}
                loading="lazy"
              />
            </ImageContainer>

            {/* Gradient Overlay */}
            <GradientOverlay />

            {/* Coming Soon Overlay */}
            {category.comingSoon && (
              <ComingSoonOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ComingSoonBadge
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <PulsingDot
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
                  <ComingSoonText>Coming Soon</ComingSoonText>
                  <PulsingDot
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
                </ComingSoonBadge>
              </ComingSoonOverlay>
            )}

            {/* Text Overlay */}
            <TextOverlay
              $comingSoon={category.comingSoon}
              animate={shouldUseHoverEffects ? {
                y: hoveredId === category.id ? -10 : 0,
              } : {}}
              transition={{ duration: 0.4 }}
            >
              <CategoryTitle $comingSoon={category.comingSoon}>
                {category.name}
              </CategoryTitle>
              
              {/* Explore Button - Only show if not coming soon */}
              {!category.comingSoon && (
                <ExploreButton
                  initial={{ opacity: 0, y: 10 }}
                  animate={shouldUseHoverEffects ? { 
                    opacity: hoveredId === category.id ? 1 : 0.7,
                    y: hoveredId === category.id ? 0 : 10
                  } : { opacity: 0.7, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>Explore Collection</span>
                  <motion.span
                    animate={shouldUseHoverEffects && hoveredId === category.id ? { x: 5 } : { x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    →
                  </motion.span>
                </ExploreButton>
              )}
            </TextOverlay>

            {/* Hover Border */}
            {shouldUseHoverEffects && (
              <HoverBorder
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredId === category.id ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </CategoryCard>
        ))}
      </Grid>
    </Section>
  );
};

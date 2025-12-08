import { useRef } from "react";
import styled from "styled-components";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { getCurlyHairCollectionProducts } from "@/data/products";
import { getHeatlessCurlingRodProducts } from "@/pages/CategoryPage";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const Section = styled.section`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background};
  width: 100%;
  overflow: hidden;
  position: relative; /* Fix for Framer Motion scroll offset calculation */

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.xl};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing['2xl']};
  }
`;

const Container = styled.div`
  max-width: ${({ theme }) => theme.breakpoints.desktopLarge}px;
  margin: 0 auto;
  width: 100%;
`;

const Title = styled(motion.h2)`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.foreground};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  }
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.lg};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    gap: ${({ theme }) => theme.spacing.xl};
  }

  @media ${({ theme }) => theme.mediaQueries.desktopLarge} {
    gap: ${({ theme }) => theme.spacing['2xl']};
  }
`;

/* ============================================
   TRENDING PRODUCTS COMPONENT
   ============================================ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.4,
      duration: 0.8,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.9,
    filter: "blur(8px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const titleVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.0,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export const TrendingProducts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  // Get specific trending products: DreamCurl™ Single Set, DreamCurl™ Full Set Midi, Curved Resin Hair Clip
  const allProducts = [...getHeatlessCurlingRodProducts(), ...getCurlyHairCollectionProducts()];
  const trendingProducts = allProducts.filter(product =>
    product.id === 'dreamcurl-short-set' ||
    product.id === 'dreamcurl-midi' ||
    product.id === 'curly-clip-1' ||
    product.id === 'heatless-5'
  );

  return (
    <Section ref={ref}>
      <Container>
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Title>Trending Now</Title>
        </motion.div>

        <Grid
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {trendingProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
            >
              <ProductCard
                {...product}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            </motion.div>
          ))}
        </Grid>

      </Container>
    </Section>
  );
};

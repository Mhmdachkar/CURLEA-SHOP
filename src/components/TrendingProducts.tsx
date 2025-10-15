import { useRef, useState } from "react";
import styled from "styled-components";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";
import { Product, getCurlyHairCollectionProducts } from "@/data/products";
import { getHeatlessCurlingRodProducts } from "@/pages/CategoryPage";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const Section = styled.section`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background};
  width: 100%;
  overflow: hidden;

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
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    },
  },
};

export const TrendingProducts = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Get trending products: 3 from Heatless Hair Curling Rod and 3 from Curly Hair Collection
  const heatlessProducts = getHeatlessCurlingRodProducts().slice(0, 3);
  const curlyProducts = getCurlyHairCollectionProducts().slice(0, 3);
  const trendingProducts = [...heatlessProducts, ...curlyProducts];

  return (
    <Section ref={ref}>
      <Container>
        <Title
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          Trending Now
        </Title>

        <Grid
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
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
        </Grid>
      </Container>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </Section>
  );
};

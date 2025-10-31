import { useRef } from "react";
import styled from "styled-components";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const Section = styled.section`
  position: relative;
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.muted};
  opacity: 0.3;
  overflow: hidden;
  width: 100%;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.xl};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing['2xl']};
  }
`;

const Container = styled(motion.div)`
  max-width: ${({ theme }) => theme.breakpoints.desktopLarge}px;
  margin: 0 auto;
  width: 100%;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    margin-bottom: ${({ theme }) => theme.spacing['4xl']};
  }
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.foreground};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.mutedForeground};
  max-width: 90%;
  margin: 0 auto;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    max-width: 40rem;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const TestimonialCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.card};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.elegant};
  transition: ${({ theme }) => theme.transitions.smooth};
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-0.5rem);
    box-shadow: ${({ theme }) => theme.shadows.lift};
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
    border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  }
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const StarIcon = styled(Star)`
  width: 1rem;
  height: 1rem;
  fill: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accent};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const Content = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.mutedForeground};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  font-style: italic;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-grow: 1;

  &::before {
    content: '"';
  }

  &::after {
    content: '"';
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled(motion.img)`
  width: 3rem;
  height: 3rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  object-fit: cover;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    width: 3.5rem;
    height: 3.5rem;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const AuthorName = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.foreground};
  letter-spacing: 0.025em;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const AuthorRole = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.mutedForeground};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

/* ============================================
   DATA
   ============================================ */

const testimonials = [
  {
    name: "Sophie Laurent",
    role: "Beauty Editor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    content: "Curlea transformed my curls from frizzy to fabulous. The hydration is unmatched, and the scent is absolutely divine.",
    rating: 5,
  },
  {
    name: "Maria Chen",
    role: "Professional Stylist",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    content: "As a stylist, I recommend Curlea to all my clients. The quality speaks for itself, and the results are consistently stunning.",
    rating: 5,
  },
  {
    name: "Emma Williams",
    role: "Content Creator",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    content: "Finally, a luxury haircare brand that delivers on its promises. My hair has never looked or felt better.",
    rating: 5,
  },
];

/* ============================================
   TESTIMONIALS COMPONENT
   ============================================ */

export const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <Section ref={sectionRef}>
      <Container style={{ opacity }}>
        <Header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Title>Loved by Thousands</Title>
          <Subtitle>
            Discover why our community continues to choose Curlea for their haircare journey
          </Subtitle>
        </Header>

        <Grid>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <StarsContainer>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </StarsContainer>
              
              <Content>{testimonial.content}</Content>
              
              <AuthorContainer>
                <AuthorInfo>
                  <AuthorName>{testimonial.name}</AuthorName>
                  <AuthorRole>{testimonial.role}</AuthorRole>
                </AuthorInfo>
              </AuthorContainer>
            </TestimonialCard>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

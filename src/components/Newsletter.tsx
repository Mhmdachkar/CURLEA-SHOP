import { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const Section = styled.section`
  position: relative;
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.foreground};
  color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
  width: 100%;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.xl};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing['5xl']} ${({ theme }) => theme.spacing['2xl']};
  }
`;

const AnimatedBackground1 = styled(motion.div)`
  position: absolute;
  top: 0;
  right: 0;
  width: 20rem;
  height: 20rem;
  background: ${({ theme }) => theme.colors.accent};
  opacity: 0.1;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  filter: blur(60px);

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    width: 24rem;
    height: 24rem;
    filter: blur(80px);
  }
`;

const AnimatedBackground2 = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 20rem;
  height: 20rem;
  background: ${({ theme }) => theme.colors.secondary};
  opacity: 0.1;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  filter: blur(60px);

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    width: 24rem;
    height: 24rem;
    filter: blur(80px);
  }
`;

const Container = styled.div`
  max-width: 56rem;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: ${({ theme }) => theme.zIndex.base + 10};
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  color: ${({ theme }) => theme.colors.background};
  opacity: 0.8;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    margin-bottom: ${({ theme }) => theme.spacing['2xl']};
    max-width: 40rem;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 100%;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};

  @media ${({ theme }) => theme.mediaQueries.mobileLarge} {
    flex-direction: row;
    max-width: 40rem;
  }
`;

const Input = styled(motion.input)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.background};
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: ${({ theme }) => theme.transitions.fast};
  min-height: ${({ theme }) => theme.touchTargets.comfortable};

  &::placeholder {
    color: ${({ theme }) => theme.colors.background};
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent}40;
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const SubmitButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.accent};
  color: #ffffff;
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: ${({ theme }) => theme.touchTargets.comfortable};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
    opacity: 0.9;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const ArrowIcon = styled(motion.span)`
  display: inline-flex;
  align-items: center;
`;

const PrivacyText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.background};
  opacity: 0.6;
  letter-spacing: 0.05em;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

/* ============================================
   NEWSLETTER COMPONENT
   ============================================ */

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing! Welcome to the Curlea family.");
      setEmail("");
    }
  };

  return (
    <Section>
      {/* Animated Background Elements */}
      <AnimatedBackground1
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <AnimatedBackground2
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Title>Join the Curlea Community</Title>
          <Subtitle>
            Be the first to discover new launches, exclusive offers, and expert haircare tips delivered to your inbox
          </Subtitle>

          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            <SubmitButton
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              transition={{ duration: 0.2 }}
            >
              Subscribe
              <ArrowIcon
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight />
              </ArrowIcon>
            </SubmitButton>
          </Form>

          <PrivacyText>
            We respect your privacy. Unsubscribe at any time.
          </PrivacyText>
        </motion.div>
      </Container>
    </Section>
  );
};

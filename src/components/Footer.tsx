import styled from "styled-components";
import { motion } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryForeground};
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  width: 100%;
  overflow: hidden;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.xl};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing['2xl']};
  }
`;

const FooterInner = styled.div`
  max-width: ${({ theme }) => theme.breakpoints.desktopLarge}px;
  margin: 0 auto;
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing['2xl']};
    margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  }
`;

const Column = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const BrandTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.serif};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }
`;

const BrandDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  color: ${({ theme }) => theme.colors.primaryForeground};
  opacity: 0.8;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const ColumnTitle = styled.h4`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LinkItem = styled.li`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.primaryForeground};
  opacity: 0.8;
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.fast};
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} 0;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    opacity: 1;
  }
`;

const SocialContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const SocialLink = styled(motion.a)`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.primaryForeground};
  opacity: 0.1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => theme.transitions.fast};
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
    opacity: 1;
    color: #ffffff;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    width: 3rem;
    height: 3rem;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const Divider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.primaryForeground};
  opacity: 0.2;
  padding-top: ${({ theme }) => theme.spacing.lg};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding-top: ${({ theme }) => theme.spacing.xl};
  }
`;

const Copyright = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.primaryForeground};
  opacity: 0.6;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

/* ============================================
   FOOTER COMPONENT
   ============================================ */

export const Footer = () => {
  return (
    <FooterContainer>
      <FooterInner>
        <Grid>
          {/* Column 1: Brand */}
          <Column
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <BrandTitle>Curlea</BrandTitle>
            <BrandDescription>
              Empowering natural beauty through luxurious, science-backed haircare
              for every texture and type.
            </BrandDescription>
          </Column>

          {/* Column 2: Links */}
          <Column
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ColumnTitle>Quick Links</ColumnTitle>
            <LinkList>
              {["Shop", "FAQ", "Shipping & Returns", "Contact Us"].map((link) => (
                <LinkItem key={link}>
                  <Link href="#">{link}</Link>
                </LinkItem>
              ))}
            </LinkList>
          </Column>

          {/* Column 3: Social */}
          <Column
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ColumnTitle>Connect With Us</ColumnTitle>
            <SocialContainer>
              <SocialLink
                href="https://www.instagram.com/curlea.beauty?igsh=Z2hoMmhtZmV4b3Y5"
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Instagram />
              </SocialLink>
              <SocialLink
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Facebook />
              </SocialLink>
            </SocialContainer>
          </Column>
        </Grid>

        {/* Bottom Bar */}
        <Divider>
          <Copyright>
            © 2025 Curlea. All Rights Reserved.
          </Copyright>
        </Divider>
      </FooterInner>
    </FooterContainer>
  );
};

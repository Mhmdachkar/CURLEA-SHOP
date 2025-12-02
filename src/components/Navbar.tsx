import { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const NavContainer = styled(motion.nav) <{ $isScrolled: boolean; $isProductDetailPage?: boolean }>`
  position: fixed;
  top: 70px; /* Mobile: Height of promotional banner when text stacks (py-3.5 * 2 + text height) */
  left: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky}; /* Below drawer (1500) but above content */
  width: 100%;
  transition: ${({ theme }) => theme.transitions.smooth};
  background-color: ${({ $isScrolled, theme }) =>
    $isScrolled ? `${theme.colors.background}f2` : 'transparent'};
  backdrop-filter: ${({ $isScrolled }) => ($isScrolled ? 'blur(12px)' : 'none')};
  box-shadow: ${({ $isScrolled, theme }) =>
    $isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'};
  border-bottom: ${({ $isScrolled }) =>
    $isScrolled ? '1px solid rgba(212, 175, 55, 0.3)' : 'none'};
  
  /* Responsive positioning - adjust for desktop where banner is shorter */
  @media ${({ theme }) => theme.mediaQueries.tablet} {
    top: 52px; /* Desktop: Banner is single line, shorter height */
  }
  
  /* Gold gradient line at the bottom */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    opacity: ${({ $isScrolled }) => ($isScrolled ? 1 : 0)};
    transition: opacity 0.3s ease;
  }
  
  /* Force black text when on product detail page */
  ${({ $isProductDetailPage }) => $isProductDetailPage && `
    * {
      color: #000000 !important;
    }
  `}
`;

const NavInner = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.lg};
    gap: ${({ theme }) => theme.spacing.lg};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    max-width: ${({ theme }) => theme.breakpoints.desktopLarge}px;
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing['2xl']};
  }
`;

const Logo = styled(motion.a) <{ $isScrolled: boolean; $isProductDetailPage?: boolean }>`
  font-family: "Montserrat", "Optima", ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: 300;
  text-transform: uppercase;
  color: ${({ $isScrolled, $isProductDetailPage, theme }) =>
    ($isScrolled || $isProductDetailPage) ? theme.colors.foreground : '#ffffff'};
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ theme }) => theme.touchTargets.min};
  min-height: ${({ theme }) => theme.touchTargets.min};
  z-index: ${({ theme }) => theme.zIndex.sticky + 1};
  transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  
  span {
    position: relative;
    display: inline-block;
    transition: all 0.3s ease;
    mix-blend-mode: screen;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(
        circle at center,
        rgba(255, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 0) 70%
      );
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: -1;
      pointer-events: none;
    }
    
    &:hover::before {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0.5;
    }
  }

  /* Ensure black text when background is white */
  @media (prefers-color-scheme: light) {
    color: ${({ $isScrolled, theme }) =>
    $isScrolled ? theme.colors.foreground : '#ffffff'};
  }

  &:hover {
    letter-spacing: 0.35em;
    transform: scale(1.02);
    text-shadow: ${({ $isScrolled }) =>
    $isScrolled ? '0 2px 4px rgba(0, 0, 0, 0.15)' : '0 4px 16px rgba(0, 0, 0, 0.5)'};
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    letter-spacing: 0.3em;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    letter-spacing: 0.35em;
  }
`;

const DesktopNav = styled.div<{ $isScrolled: boolean; $isProductDetailPage?: boolean }>`
  display: none;
  
  @media ${({ theme }) => theme.mediaQueries.tablet} {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.lg};
    position: relative;
    color: ${({ $isScrolled, $isProductDetailPage, theme }) =>
    ($isScrolled || $isProductDetailPage) ? theme.colors.foreground : '#ffffff'};
    transition: color 0.3s ease;
  }

  /* Ensure black text when background is white */
  @media (prefers-color-scheme: light) {
    color: ${({ $isScrolled, theme }) =>
    $isScrolled ? theme.colors.foreground : '#ffffff'};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const NavLink = styled(motion.button) <{ $isScrolled: boolean }>`
  background: none;
  border: none;
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: inherit;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  position: relative;
  transition: ${({ theme }) => theme.transitions.fast}, color 0.3s ease, text-shadow 0.3s ease;
  text-shadow: ${({ $isScrolled }) =>
    $isScrolled ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.2)'};
  white-space: nowrap;
  overflow: hidden;

  /* Beautiful white line hover effect */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ffffff, transparent);
    transform: translateX(-50%);
    transition: ${({ theme }) => theme.transitions.fast};
    opacity: 0;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }

  /* Subtle glow effect on hover */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: ${({ theme }) => theme.transitions.fast};
    opacity: 0;
    border-radius: 50%;
  }

  &:hover {
    color: ${({ $isScrolled, theme }) =>
    $isScrolled ? theme.colors.accent : '#ffffff'};
    opacity: 1;
    text-shadow: ${({ $isScrolled }) =>
    $isScrolled ? 'none' : '0 0 12px rgba(255, 255, 255, 0.4)'};

    &::after {
      width: 100%;
      opacity: 1;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
    }

    &::before {
      width: 120%;
      height: 120%;
      opacity: 1;
    }
  }

  /* Ensure black text when background is white */
  @media (prefers-color-scheme: light) {
    color: ${({ $isScrolled, theme }) =>
    $isScrolled ? theme.colors.foreground : '#ffffff'};
    
    &:hover {
      color: ${({ $isScrolled, theme }) =>
    $isScrolled ? theme.colors.accent : '#ffffff'};
    }
  }

  /* Active state for current page */
  &[data-active="true"] {
    color: ${({ $isScrolled, theme }) =>
    $isScrolled ? theme.colors.accent : '#ffffff'};
    
    &::after {
      width: 100%;
      opacity: 1;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
    }
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const IconsContainer = styled.div<{ $isScrolled: boolean; $isProductDetailPage?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ $isScrolled, $isProductDetailPage, theme }) =>
    ($isScrolled || $isProductDetailPage) ? theme.colors.foreground : '#ffffff'};
  z-index: ${({ theme }) => theme.zIndex.sticky + 10};
  position: relative;
  transition: color 0.3s ease;

  /* Ensure black text when background is white */
  @media (prefers-color-scheme: light) {
    color: ${({ $isScrolled, theme }) =>
    $isScrolled ? theme.colors.foreground : '#ffffff'};
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    gap: ${({ theme }) => theme.spacing.md};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const IconButton = styled(motion.button) <{ $isProductDetailPage?: boolean }>`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ theme }) => theme.touchTargets.min};
  min-height: ${({ theme }) => theme.touchTargets.min};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: ${({ theme }) => theme.transitions.fast};
  position: relative;
  z-index: 10;
  pointer-events: auto;

  /* Force white color for cart icon on product detail pages */
  ${({ $isProductDetailPage }) => $isProductDetailPage && `
    color: #ffffff !important;
    svg {
      color: #ffffff !important;
    }
  `}

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 1rem;
    height: 1rem;

    @media ${({ theme }) => theme.mediaQueries.tablet} {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
`;

const CartBadge = styled(motion.span) <{ $isProductDetailPage?: boolean }>`
 position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.background};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: none;

  /* Force white text on product detail pages */
  ${({ $isProductDetailPage }) => $isProductDetailPage && `
    color: #ffffff !important;
  `}
`;

const HamburgerButton = styled(IconButton)`
  display: flex;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    display: none;
  }
`;

const MobileMenuBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.mobileMenu - 1};
  backdrop-filter: blur(4px);
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: ${({ theme }) => theme.zIndex.mobileMenu};
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  padding-top: 6rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  /* Ensure mobile menu is above everything */
  isolation: isolate;
`;

const MobileMenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const MobileMenuLink = styled(motion.button)`
  background: none;
  border: none;
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.foreground};
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md} 0;
  cursor: pointer;
  min-height: ${({ theme }) => theme.touchTargets.comfortable};
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: ${({ theme }) => theme.transitions.fast};
  position: relative;
  overflow: hidden;

  /* Mobile hover effect with left border */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.accent}, transparent);
    transition: ${({ theme }) => theme.transitions.fast};
    opacity: 0;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    padding-left: ${({ theme }) => theme.spacing.md};

    &::before {
      width: 4px;
      opacity: 1;
    }
  }
`;

/* ============================================
   NAVIGATION DATA
   ============================================ */

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Heatless Hair Curling Rod", href: "/category/wavy" },
  { label: "Curly Hair Collection", href: "/category/curly" },
];

/* ============================================
   MAGNETIC BUTTON COMPONENT
   ============================================ */

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  $isProductDetailPage?: boolean;
}

const MagneticButton = ({ children, onClick, $isProductDetailPage }: MagneticButtonProps) => {
  const { isMobile, isTablet } = useBreakpoint();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Disable magnetic effect on mobile/tablet for better performance
  const isMagneticEnabled = !isMobile && !isTablet;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isMagneticEnabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    if (!isMagneticEnabled) return;
    x.set(0);
    y.set(0);
  };

  return (
    <IconButton
      $isProductDetailPage={$isProductDetailPage}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={isMagneticEnabled ? { x, y } : {}}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {children}
    </IconButton>
  );
};

/* ============================================
   NAVBAR COMPONENT
   ============================================ */

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [navbarOpacity, setNavbarOpacity] = useState(1);

  // Check if we're on a product detail page
  const isProductDetailPage = location.pathname.startsWith('/product/');

  // Scroll direction and opacity detection
  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Set scrolled state
          setIsScrolled(currentScrollY > 50);

          // Detect scroll direction and set opacity
          if (currentScrollY < 50) {
            // At top of page - always show
            setNavbarOpacity(1);
            setScrollDirection('down');
          } else if (currentScrollY > lastScrollY) {
            // Scrolling DOWN - show navbar (opacity = 1)
            setScrollDirection('down');
            setNavbarOpacity(1);
          } else if (currentScrollY < lastScrollY) {
            // Scrolling UP - hide navbar (opacity = 0)
            setScrollDirection('up');
            setNavbarOpacity(0);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith("/")) {
      navigate(href);
    } else if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <NavContainer
        $isScrolled={isScrolled}
        $isProductDetailPage={isProductDetailPage}
        initial={{ y: -100 }}
        animate={{
          y: 0,
          opacity: navbarOpacity,
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
          opacity: { duration: 0.3, ease: "easeInOut" }
        }}
      >
        <NavInner>
          {/* Logo */}
          <Logo
            $isScrolled={isScrolled}
            $isProductDetailPage={isProductDetailPage}
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            className="flex items-center justify-center gap-[0.25em]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            whileHover={{
              scale: 1.05,
              transition: {
                duration: 0.4,
                ease: [0.215, 0.61, 0.355, 1]
              }
            }}
          >
            {"CURLEA".split('').map((letter, index) => (
              <motion.span
                key={`${location.pathname}-${index}`}
                style={{ display: 'inline-block' }}
                initial={{
                  opacity: 0,
                  scale: 2,
                  filter: "blur(20px)",
                  y: Math.random() * 40 - 20
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  y: 0
                }}
                transition={{
                  duration: 1.2,
                  delay: index * 0.15,
                  ease: [0.25, 0.1, 0.25, 1],
                  opacity: {
                    duration: 1.2,
                    ease: "easeOut"
                  },
                  scale: {
                    duration: 1.4,
                    ease: "easeOut"
                  },
                  filter: {
                    duration: 1,
                    ease: "easeOut"
                  }
                }}
                whileHover={{
                  y: -5,
                  textShadow: "0 4px 16px rgba(255, 255, 255, 0.4)",
                  transition: { duration: 0.2 }
                }}
              >
                {letter}
              </motion.span>
            ))}

            {/* Black Friday Badge - Only visible when scrolled */}
            <AnimatePresence>
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    marginLeft: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B5952F 100%)',
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    pointerEvents: 'none' // Don't interfere with logo click
                  }}
                >
                  <span style={{ fontSize: '12px' }}>?</span> BLACK FRIDAY
                </motion.div>
              )}
            </AnimatePresence>
          </Logo>

          {/* Desktop Navigation */}
          <DesktopNav $isScrolled={isScrolled} $isProductDetailPage={isProductDetailPage}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <NavLink
                  key={link.label}
                  $isScrolled={isScrolled}
                  onClick={() => handleNavClick(link.href)}
                  data-active={isActive}
                  whileHover={{
                    y: -2,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </DesktopNav>

          {/* Right Icons */}
          <IconsContainer $isScrolled={isScrolled} $isProductDetailPage={isProductDetailPage}>
            <MagneticButton onClick={openCart} $isProductDetailPage={isProductDetailPage}>
              <>
                <ShoppingBag />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <CartBadge
                      $isProductDetailPage={isProductDetailPage}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </CartBadge>
                  )}
                </AnimatePresence>
              </>
            </MagneticButton>
            <HamburgerButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </HamburgerButton>
          </IconsContainer>
        </NavInner>
      </NavContainer>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <MobileMenuBackdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <MobileMenu
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Header with Close Button */}
              <div className="flex items-center justify-between mb-8">
                <motion.h2
                  className="text-2xl font-bold text-foreground"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Menu
                </motion.h2>
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <MobileMenuList>
                {navLinks.map((link, index) => (
                  <MobileMenuLink
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.label}
                  </MobileMenuLink>
                ))}
              </MobileMenuList>
            </MobileMenu>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

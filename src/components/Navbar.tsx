import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { label: "Shop", href: "/collection" },
  { label: "Our Story", href: "#our-story" },
  { label: "Collections", href: "#collections" },
  { label: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const { itemCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container-fluid py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          className={`fluid-text-2xl sm:fluid-text-3xl font-bold tracking-tight touch-target ${
            isScrolled ? "text-foreground" : "text-white drop-shadow-lg"
          }`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          Curlea
        </motion.a>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            className={`p-2 rounded-lg transition-colors touch-target ${
              isScrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.div>
          </motion.button>
        </div>

        {/* Center Navigation */}
        <div
          className={`hidden md:flex items-center gap-4 lg:gap-8 relative ${
            isScrolled ? "text-foreground" : "text-white drop-shadow"
          }`}
        >
          {navLinks.map((link, index) => (
            <motion.div
              key={link.label}
              className={`relative text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                isScrolled ? "hover:text-accent" : "hover:text-white"
              } ${hoveredIndex === index ? "opacity-100" : "opacity-90 hover:opacity-100"}`}
              onClick={() => {
                if (link.href.startsWith("/")) {
                  navigate(link.href);
                } else {
                  window.location.hash = link.href;
                }
              }}
              onHoverStart={() => {
                setHoveredLink(link.label);
                setHoveredIndex(index);
              }}
              onHoverEnd={() => {
                setHoveredLink(null);
                setHoveredIndex(null);
              }}
              whileHover={{ y: -2 }}
            >
              {link.label}
            </motion.div>
          ))}
          
          {/* Animated Underline */}
          {hoveredIndex !== null && (
            <motion.div
              layoutId="nav-underline"
              className={`absolute bottom-0 h-0.5 ${
                isScrolled ? "bg-accent" : "bg-white"
              }`}
              initial={false}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
              }}
              style={{
                left: `${hoveredIndex * 25}%`,
                width: "15%",
              }}
            />
          )}
        </div>

        {/* Right Icons */}
        <div className={`flex items-center gap-2 sm:gap-3 lg:gap-6 ${isScrolled ? "text-foreground" : "text-white drop-shadow"}`}>
          <MagneticButton>
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </MagneticButton>
          <MagneticButton>
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </MagneticButton>
          <MagneticButton onClick={openCart}>
            <div className="relative">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </MagneticButton>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/20"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="block fluid-text-lg font-medium text-foreground hover:text-accent transition-colors py-3 touch-target"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Magnetic Button Component
const MagneticButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="cursor-pointer relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x, y }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {children}
    </motion.div>
  );
};

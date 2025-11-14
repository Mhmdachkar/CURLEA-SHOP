import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PromotionalPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if popup has been shown in this session
    const hasSeenPromo = sessionStorage.getItem('curlea-promo-seen');
    
    if (!hasSeenPromo) {
      // Show popup after 1.5 second delay to ensure page is loaded
      const timer = setTimeout(() => {
        console.log('[PromotionalPopup] Showing popup');
        setIsOpen(true);
        // Trigger visibility animation after a tiny delay
        setTimeout(() => setIsVisible(true), 50);
        sessionStorage.setItem('curlea-promo-seen', 'true');
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      console.log('[PromotionalPopup] Already shown in this session');
    }
  }, [mounted]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Responsive styles
  const containerTop = isMobile ? '80px' : '100px';
  const containerPadding = isMobile ? '12px' : '16px';
  const cardPadding = isMobile ? '20px' : '32px';
  const cardPaddingTop = isMobile ? '18px' : '28px';
  const iconSize = isMobile ? '40px' : '48px';
  const iconFontSize = isMobile ? '20px' : '24px';
  const titleFontSize = isMobile ? '20px' : '24px';
  const messageFontSize = isMobile ? '14px' : '15px';
  const messageHighlightSize = isMobile ? '15px' : '16px';
  const noteFontSize = isMobile ? '11px' : '12px';
  const closeButtonSize = isMobile ? '36px' : 'auto';
  const closeButtonPadding = isMobile ? '8px' : '8px';
  const closeIconSize = isMobile ? 18 : 16;
  const maxWidth = isMobile ? 'calc(100% - 24px)' : '420px';
  const borderRadius = isMobile ? '12px' : '16px';

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        pointerEvents: 'none'
      }}
    >
      {/* Backdrop with blur effect */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)',
          backdropFilter: isVisible && !isMobile ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: isVisible && !isMobile ? 'blur(4px)' : 'none',
          pointerEvents: 'auto',
          transition: 'all 0.4s ease-out',
          cursor: 'pointer'
        }}
      />

      {/* Popup positioned at top of home page */}
      <div
        style={{
          position: 'absolute',
          top: containerTop,
          left: '50%',
          transform: `translateX(-50%) translateY(${isVisible ? '0' : '-20px'})`,
          width: '100%',
          maxWidth: maxWidth,
          padding: `0 ${containerPadding}`,
          pointerEvents: 'auto',
          zIndex: 100000,
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform, opacity'
        }}
      >
        {/* Popup Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            borderRadius: borderRadius,
            boxShadow: isVisible 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(164, 25, 61, 0.1), 0 0 40px rgba(164, 25, 61, 0.15)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(164, 25, 61, 0.15)',
            pointerEvents: 'auto',
            overflow: 'hidden',
            transition: 'box-shadow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            backdropFilter: !isMobile ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: !isMobile ? 'blur(10px)' : 'none'
          }}
        >
          {/* Animated gradient accent bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #A4193D 0%, #D4AF37 50%, #A4193D 100%)',
              borderRadius: `${borderRadius} ${borderRadius} 0 0`,
              backgroundSize: '200% 100%',
              animation: isVisible ? 'shimmer 3s ease-in-out infinite' : 'none'
            }}
          />
          
          <style>{`
            @keyframes shimmer {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Close button - larger on mobile for touch */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: isMobile ? '12px' : '16px',
              right: isMobile ? '12px' : '16px',
              padding: closeButtonPadding,
              minWidth: closeButtonSize,
              minHeight: closeButtonSize,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Close"
          >
            <X size={closeIconSize} color="#6b7280" />
          </button>

          {/* Content */}
          <div style={{ padding: cardPadding, paddingTop: cardPaddingTop }}>
            <div style={{ textAlign: 'center' }}>
              {/* Elegant decorative element */}
              <div
                style={{
                  width: iconSize,
                  height: iconSize,
                  margin: `0 auto ${isMobile ? '12px' : '16px'}`,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A4193D 0%, #D4AF37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(164, 25, 61, 0.3)',
                  animation: isVisible ? 'fadeInUp 0.6s ease-out 0.2s both' : 'none',
                  transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                  transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <span style={{ fontSize: iconFontSize }}>✨</span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: titleFontSize,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #A4193D 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: isMobile ? '10px' : '12px',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.3',
                  animation: isVisible ? 'fadeInUp 0.6s ease-out 0.3s both' : 'none',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.6s ease-out 0.3s'
                }}
              >
                Special Offer
              </h3>

              {/* Message */}
              <p
                style={{
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: messageFontSize,
                  color: '#374151',
                  lineHeight: '1.7',
                  marginBottom: isMobile ? '16px' : '20px',
                  fontWeight: 400,
                  padding: isMobile ? '0 4px' : '0',
                  animation: isVisible ? 'fadeInUp 0.6s ease-out 0.4s both' : 'none',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.6s ease-out 0.4s'
                }}
              >
                Buy 2 items, get{' '}
                <span 
                  style={{ 
                    fontWeight: 700, 
                    color: '#A4193D',
                    fontSize: messageHighlightSize,
                    letterSpacing: '0.02em'
                  }}
                >
                  50% off
                </span>{' '}
                the 3rd item
              </p>

              {/* Elegant divider */}
              <div
                style={{
                  width: isMobile ? '50px' : '60px',
                  height: '2px',
                  margin: `0 auto ${isMobile ? '12px' : '16px'}`,
                  background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                  animation: isVisible ? 'fadeInUp 0.6s ease-out 0.5s both' : 'none',
                  opacity: isVisible ? 1 : 0
                }}
              />

              {/* Note */}
              <p
                style={{
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: noteFontSize,
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                  letterSpacing: '0.01em',
                  animation: isVisible ? 'fadeInUp 0.6s ease-out 0.6s both' : 'none',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.6s ease-out 0.6s'
                }}
              >
                Automatically applied at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

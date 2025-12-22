import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Snowflake, TreePine, Star } from 'lucide-react';
import styled from 'styled-components';

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: ${({ theme }) => theme.zIndex.modalBackdrop};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  @media (min-width: 640px) {
    padding: 1rem;
  }

  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;

const ModalContainer = styled(motion.div)`
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 50%, #ffffff 100%);
  border-radius: 1rem;
  box-shadow: 
    0 20px 40px -10px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(220, 38, 38, 0.15),
    0 0 50px rgba(34, 197, 94, 0.1);
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: ${({ theme }) => theme.zIndex.modal};
  border: 3px solid transparent;
  background-clip: padding-box;
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-overflow-scrolling: touch;
  margin: auto;

  @media (min-width: 640px) {
    border-radius: 1.25rem;
    max-height: 85vh;
  }

  @media (max-height: 600px) {
    max-height: 95vh;
    border-radius: 0.875rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, 
      #dc2626 0%, 
      #fbbf24 25%,
      #22c55e 50%,
      #fbbf24 75%,
      #dc2626 100%
    );
    border-radius: 1.25rem 1.25rem 0 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 1.125rem;
    height: 1.125rem;
    color: #000;
  }

  @media (min-width: 640px) {
    top: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
`;

const ContentWrapper = styled.div`
  padding: 1.5rem 1.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.875rem;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  position: relative;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #dc2626, #fbbf24, #22c55e);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #b91c1c, #d97706, #16a34a);
  }

  @media (min-width: 480px) {
    padding: 2rem 1.5rem 3rem;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    padding: 2.5rem 2rem 3.5rem;
    gap: 1.25rem;
  }
  
  @media (max-height: 600px) {
    padding: 1.25rem 1rem 2rem;
    gap: 0.75rem;
  }

  @media (max-width: 374px) {
    padding: 1.25rem 1rem 2rem;
    gap: 0.75rem;
  }
`;

const IconWrapper = styled(motion.div)`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626 0%, #fbbf24 50%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.35);
  position: relative;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #fbbf24, #22c55e);
    opacity: 0.25;
    filter: blur(6px);
    z-index: -1;
  }

  svg {
    width: 1.75rem;
    height: 1.75rem;
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  @media (min-width: 480px) {
    width: 4rem;
    height: 4rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const Title = styled.h2`
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  font-weight: 600;
  color: #000;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #dc2626 0%, #fbbf24 50%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: clamp(0.75rem, 1.5vw, 1.125rem);
  font-weight: 600;
  color: #dc2626;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  flex-wrap: wrap;

  @media (min-width: 480px) {
    gap: 0.5rem;
  }
`;

const OfferText = styled.p`
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: clamp(0.8125rem, 1.5vw, 1rem);
  font-weight: 500;
  color: #1f2937;
  line-height: 1.6;
  margin: 0;
  max-width: 100%;
  width: 100%;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (min-width: 480px) {
    max-width: 480px;
  }
`;

const OfferDetails = styled.div`
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.06), rgba(251, 191, 36, 0.06), rgba(34, 197, 94, 0.06));
  border: 2px solid rgba(220, 38, 38, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  width: 100%;
  margin-top: 0.25rem;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  @media (min-width: 480px) {
    border-radius: 0.875rem;
    padding: 1.25rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
    50% { transform: translate(-50%, -50%) rotate(180deg); }
  }
`;

const OfferList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  text-align: left;
  width: 100%;

  @media (min-width: 480px) {
    gap: 0.75rem;
  }
`;

const OfferListItem = styled.li`
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: clamp(0.8125rem, 1.5vw, 0.9375rem);
  font-weight: 500;
  color: #1f2937;
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  line-height: 1.5;
  position: relative;
  z-index: 1;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  &::before {
    content: '🎁';
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const CTAButton = styled(motion.button)`
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: clamp(0.875rem, 1.5vw, 1.0625rem);
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #dc2626 0%, #fbbf24 50%, #22c55e 100%);
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.35);
  position: relative;
  overflow: hidden;
  margin-top: 0.25rem;
  letter-spacing: -0.01em;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  will-change: transform, box-shadow;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
  max-width: 100%;

  @media (min-width: 480px) {
    padding: 0.875rem 2rem;
    width: auto;
    max-width: none;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #22c55e 0%, #fbbf24 50%, #dc2626 100%);
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px) translateZ(0);
    box-shadow: 0 12px 35px rgba(220, 38, 38, 0.45);

    &::before {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0) translateZ(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  span {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    will-change: transform;
  }
`;

const DecorativeIcon = styled(motion.div)`
  position: absolute;
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media (min-width: 480px) {
    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  @media (max-width: 374px) {
    opacity: 0.3;
    
    svg {
      width: 1rem;
      height: 1rem;
    }
  }
`;

const SnowflakeIcon = styled(DecorativeIcon)`
  color: #3b82f6;
`;

const TreeIcon = styled(DecorativeIcon)`
  color: #22c55e;
`;

const StarIcon = styled(DecorativeIcon)`
  color: #fbbf24;
`;

// Full sets preview section
const FullSetsGrid = styled.div`
  width: 100%;
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.625rem;
  box-sizing: border-box;

  @media (min-width: 480px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
  }

  @media (max-width: 374px) {
    gap: 0.5rem;
  }
`;

const FullSetItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
`;

const FullSetImage = styled.img`
  width: 100%;
  max-width: 80px;
  aspect-ratio: 1 / 1;
  border-radius: 0.625rem;
  object-fit: cover;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.15);
  background: #f9fafb;
  display: block;

  @media (min-width: 480px) {
    border-radius: 0.75rem;
  }

  @media (max-width: 374px) {
    max-width: 70px;
    border-radius: 0.5rem;
  }
`;

const FullSetLabel = styled.span`
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: clamp(0.6875rem, 1.2vw, 0.75rem);
  font-weight: 500;
  color: #111827;
  letter-spacing: 0;
  line-height: 1.3;
  word-break: break-word;
  hyphens: auto;
`;

import { secureSessionStorage } from '@/utils/securityEnhanced';

const STORAGE_KEY = 'curlea-christmas-offer-seen';

export const ChristmasOfferModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Use secure sessionStorage instead of localStorage - shows again when user returns
    // sessionStorage clears when browser tab/window closes
    const hasSeenOffer = secureSessionStorage.getItem(STORAGE_KEY);
    
    if (!hasSeenOffer) {
      // Show immediately when user hits the website
      setIsOpen(true);
    }

    // Listen for custom event to show modal (triggered by floating gift icon)
    const handleShowOffer = () => {
      setIsOpen(true);
    };

    window.addEventListener('show-christmas-offer', handleShowOffer);

    return () => {
      window.removeEventListener('show-christmas-offer', handleShowOffer);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Store in secure sessionStorage (clears when browser closes)
    secureSessionStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleShopNow = () => {
    // Prevent multiple clicks
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Smooth exit animation first
    setIsOpen(false);
    sessionStorage.setItem(STORAGE_KEY, 'true');
    
    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
      // Small delay to allow exit animation to start
      requestAnimationFrame(() => {
        // Navigate smoothly
        window.location.href = '/shop';
      });
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              mass: 0.8
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Christmas icons */}
            <SnowflakeIcon
              style={{ top: '0.75rem', left: '0.75rem' }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Snowflake />
            </SnowflakeIcon>
            <TreeIcon
              style={{ top: '0.75rem', right: '0.75rem' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3,
              }}
            >
              <TreePine />
            </TreeIcon>
            <StarIcon
              style={{ bottom: '0.75rem', left: '0.75rem' }}
              animate={{
                rotate: [0, 180, 360],
                scale: [1, 1.25, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.6,
              }}
            >
              <Star />
            </StarIcon>
            <SnowflakeIcon
              style={{ bottom: '0.75rem', right: '0.75rem' }}
              animate={{
                rotate: [360, 0],
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.9,
              }}
            >
              <Snowflake />
            </SnowflakeIcon>

            <CloseButton onClick={handleClose} aria-label="Close modal">
              <X />
            </CloseButton>

            <ContentWrapper>
              <IconWrapper
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Gift />
              </IconWrapper>

              <div style={{ width: '100%' }}>
                <Subtitle>
                  <Snowflake style={{ width: '0.875rem', height: '0.875rem' }} />
                  CHRISTMAS OFFER
                  <Snowflake style={{ width: '0.875rem', height: '0.875rem' }} />
                </Subtitle>
                <Title>Buy 2 Full Sets, Get 3rd FREE</Title>
              </div>

              <OfferText>
                Celebrate the season with our exclusive Christmas promotion! 
                Purchase any 2 full sets and receive your 3rd full set absolutely free.
              </OfferText>

              <OfferDetails>
                <OfferList>
                  <OfferListItem>
                    Choose any combination of our premium full sets
                  </OfferListItem>
                  <OfferListItem>
                    Available on DreamCurl™ Original, Midi, Jumbo, and Mini Sets
                  </OfferListItem>
                  <OfferListItem>
                    Select any color and size - your choice, your style
                  </OfferListItem>
                  <OfferListItem>
                    Discount applied automatically at checkout
                  </OfferListItem>
                </OfferList>
              </OfferDetails>

              {/* Full sets visual preview */}
              <FullSetsGrid>
                <FullSetItem>
                  <FullSetImage
                    src={new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href}
                    alt="DreamCurl Original Full Set"
                  />
                  <FullSetLabel>Original Full Set</FullSetLabel>
                </FullSetItem>
                <FullSetItem>
                  <FullSetImage
                    src={new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href}
                    alt="DreamCurl Midi Full Set"
                  />
                  <FullSetLabel>Midi Full Set</FullSetLabel>
                </FullSetItem>
                <FullSetItem>
                  <FullSetImage
                    src={new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href}
                    alt="DreamCurl Jumbo Full Set"
                  />
                  <FullSetLabel>Jumbo Full Set</FullSetLabel>
                </FullSetItem>
                <FullSetItem>
                  <FullSetImage
                    src={new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href}
                    alt="Zero Heat Mini Set"
                  />
                  <FullSetLabel>Zero Heat Mini Set</FullSetLabel>
                </FullSetItem>
              </FullSetsGrid>

              <CTAButton
                onClick={handleShopNow}
                disabled={isNavigating}
                whileHover={!isNavigating ? { scale: 1.05 } : {}}
                whileTap={!isNavigating ? { scale: 0.95 } : {}}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  mass: 0.5
                }}
              >
                <motion.span
                  animate={isNavigating ? { opacity: 0.7 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Gift style={{ width: '1.125rem', height: '1.125rem' }} />
                  {isNavigating ? 'Loading...' : 'Shop Full Sets Now'}
                </motion.span>
              </CTAButton>
            </ContentWrapper>
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};


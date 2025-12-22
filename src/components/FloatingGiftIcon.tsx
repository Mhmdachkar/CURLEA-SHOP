import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { secureSessionStorage } from '@/utils/securityEnhanced';
import styled from 'styled-components';

const FloatingGift = styled(motion.div)`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  pointer-events: auto;
  cursor: pointer;
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1) translateZ(0);
  }
  
  &:active {
    transform: scale(0.95) translateZ(0);
  }
`;

const GiftIcon = styled(motion.div)`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626 0%, #fbbf24 50%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 20px rgba(220, 38, 38, 0.3),
    0 0 0 3px rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 
      0 12px 30px rgba(220, 38, 38, 0.5),
      0 0 0 4px rgba(255, 255, 255, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #fbbf24, #22c55e);
    opacity: 0.3;
    filter: blur(8px);
    z-index: -1;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
`;

// Edge positions - gift appears from screen edges
const edgePositions = [
  // Left edge positions
  { top: '15%', left: '0.5rem' },
  { top: '35%', left: '0.5rem' },
  { top: '55%', left: '0.5rem' },
  { top: '75%', left: '0.5rem' },
  // Right edge positions
  { top: '15%', right: '0.5rem' },
  { top: '35%', right: '0.5rem' },
  { top: '55%', right: '0.5rem' },
  { top: '75%', right: '0.5rem' },
  // Top edge positions
  { top: '0.5rem', left: '15%' },
  { top: '0.5rem', left: '35%' },
  { top: '0.5rem', left: '55%' },
  { top: '0.5rem', left: '75%' },
  { top: '0.5rem', right: '15%' },
  { top: '0.5rem', right: '35%' },
  { top: '0.5rem', right: '55%' },
  { top: '0.5rem', right: '75%' },
  // Bottom edge positions
  { bottom: '0.5rem', left: '15%' },
  { bottom: '0.5rem', left: '35%' },
  { bottom: '0.5rem', left: '55%' },
  { bottom: '0.5rem', left: '75%' },
  { bottom: '0.5rem', right: '15%' },
  { bottom: '0.5rem', right: '35%' },
  { bottom: '0.5rem', right: '55%' },
  { bottom: '0.5rem', right: '75%' },
];

const STORAGE_KEY = 'curlea-christmas-offer-seen';

export const FloatingGiftIcon = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(edgePositions[0]);

  // Hide on checkout and success pages
  const shouldHide = location.pathname === '/checkout' || location.pathname === '/success';

  const handleClick = () => {
    // Clear secure sessionStorage to show the modal again
    secureSessionStorage.removeItem(STORAGE_KEY);
    
    // Trigger a custom event to show the modal
    window.dispatchEvent(new CustomEvent('show-christmas-offer'));
    
    // Add a small visual feedback
    setIsVisible(false);
    setTimeout(() => {
      setCurrentPosition(edgePositions[Math.floor(Math.random() * edgePositions.length)]);
      setIsVisible(true);
    }, 1000);
  };

  useEffect(() => {
    if (shouldHide) {
      setIsVisible(false);
      return;
    }

    // Show immediately on mount
    setIsVisible(true);
    setCurrentPosition(edgePositions[Math.floor(Math.random() * edgePositions.length)]);

    const interval = setInterval(() => {
      // Hide first
      setIsVisible(false);
      
      // After fade out, change position and show again
      setTimeout(() => {
        setCurrentPosition(edgePositions[Math.floor(Math.random() * edgePositions.length)]);
        setIsVisible(true);
      }, 500); // Wait for fade out to complete
    }, 12000); // Every 12 seconds

    return () => clearInterval(interval);
  }, [shouldHide]);

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <FloatingGift
          style={currentPosition}
          onClick={handleClick}
          initial={{ 
            opacity: 0, 
            scale: 0,
            rotate: -180,
            x: currentPosition.left !== undefined ? -30 : currentPosition.right !== undefined ? 30 : 0,
            y: currentPosition.top !== undefined ? -30 : currentPosition.bottom !== undefined ? 30 : 0
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotate: 0,
            x: 0,
            y: [0, -8, 0]
          }}
          exit={{ 
            opacity: 0, 
            scale: 0,
            rotate: 180
          }}
          transition={{
            opacity: { duration: 0.5, ease: 'easeOut' },
            scale: { 
              type: 'spring', 
              stiffness: 300, 
              damping: 20,
              duration: 0.6
            },
            rotate: { duration: 0.6, ease: 'easeOut' },
            x: { duration: 0.6, ease: 'easeOut' },
            y: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        >
          <GiftIcon
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
          >
            <Gift />
          </GiftIcon>
        </FloatingGift>
      )}
    </AnimatePresence>
  );
};


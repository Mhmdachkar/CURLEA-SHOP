import React, { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart, CartItem, FULL_SET_PRODUCT_IDS } from '@/contexts/CartContext';

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modalBackdrop};
`;

const Drawer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: 28rem;
  background-color: ${({ theme }) => theme.colors.card};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: ${({ theme }) => theme.zIndex.drawer};
  display: flex;
  flex-direction: column;
  /* Ensure drawer takes full height and footer stays at bottom */
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.foreground};
`;

const CloseButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.mutedForeground};
  transition: ${({ theme }) => theme.transitions.fast};
  min-width: ${({ theme }) => theme.touchTargets.min};
  min-height: ${({ theme }) => theme.touchTargets.min};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.muted};
    color: ${({ theme }) => theme.colors.foreground};
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: ${({ theme }) => theme.spacing.lg};
  -webkit-overflow-scrolling: touch;
  position: relative;
  min-height: 0;
  /* Ensure only this section scrolls, not the entire drawer */
  overscroll-behavior: contain;
  max-height: calc(100vh - 200px);
  /* Enable touchpad/wheel scrolling */
  scroll-behavior: smooth;
  
  /* Force scrollable */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: ${({ theme }) => theme.colors.mutedForeground};
`;

const EmptyIcon = styled(ShoppingBag)`
  width: 4rem;
  height: 4rem;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.mutedForeground};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.mutedForeground};
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CartItemCard = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.background};
`;

const ProductImage = styled.div`
  width: 4.5rem;
  height: 4.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  position: relative;
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #A4193D 0%, #D4AF37 100%);
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(164, 25, 61, 0.3);
  z-index: 10;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProductDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.foreground};
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const ProductVariant = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.mutedForeground};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ProductPrice = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.foreground};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const QuantityControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const QuantityButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.foreground};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primaryForeground};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const QuantityDisplay = styled.span`
  width: 2rem;
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.foreground};
`;

const RemoveButton = styled.button`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: ${({ theme }) => theme.transitions.fast};
  min-height: 32px;

  &:hover {
    color: #ffffff;
    background-color: #dc2626;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Footer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.card};
  flex-shrink: 0;
  /* Ensure footer stays at bottom and doesn't scroll */
  position: relative;
  z-index: 1;
`;

const TotalRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 2px solid transparent;
  background: 
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.1)) border-box;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(212, 175, 55, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(212, 175, 55, 0.5) 50%, 
      transparent 100%
    );
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at top right,
      rgba(212, 175, 55, 0.03) 0%,
      transparent 60%
    );
    pointer-events: none;
  }
`;

const TotalLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.mutedForeground};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const TotalAmount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: #000000;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CheckoutButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  color: ${({ theme }) => theme.colors.primaryForeground};
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: ${({ theme }) => theme.touchTargets.comfortable};
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: rgba(212, 175, 55, 0.5);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const ClearButton = styled.button`
  width: 100%;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: transparent;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 40px;

  &:hover {
    color: #dc2626;
    background-color: rgba(220, 38, 38, 0.05);
    border-color: #dc2626;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/* ============================================
   CART DRAWER COMPONENT
   ============================================ */

const DiscountRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, rgba(164, 25, 61, 0.05), rgba(212, 175, 55, 0.05));
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DiscountLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: #A4193D;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const DiscountAmount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: #A4193D;
`;

export const CartDrawer = () => {
  const { state, updateQuantity, removeFromCart, clearCart, closeCart, promoDiscount } = useCart();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate total items count - memoized for performance
  const totalItemsCount = useMemo(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  // Calculate eligible FULL SET items count for the Christmas offer
  const eligibleFullSetCount = useMemo(() => {
    return state.items
      .filter((item) => FULL_SET_PRODUCT_IDS.has(item.id))
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  // Lock body scroll when cart is open and preserve scroll position
  useEffect(() => {
    if (state.isOpen) {
      // Save current scroll position BEFORE any changes
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // Store scroll position in a data attribute and sessionStorage for reliability
      document.body.setAttribute('data-scroll-y', scrollY.toString());
      sessionStorage.setItem('cart-scroll-y', scrollY.toString());

      // Lock body scroll using multiple techniques for maximum compatibility
      // Use position: fixed to prevent scroll without changing scroll position
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.paddingRight = '0px'; // Prevent layout shift

      // Also lock html element for iOS
      document.documentElement.style.overflow = 'hidden';

      return () => {
        // Restore scroll position BEFORE removing styles
        const savedScrollY = parseInt(sessionStorage.getItem('cart-scroll-y') || scrollY.toString(), 10);
        
        // Restore body styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.paddingRight = '';

        // Restore HTML element
        document.documentElement.style.overflow = '';

        // Restore scroll position immediately
        window.scrollTo(0, savedScrollY);

        // Clean up
        document.body.removeAttribute('data-scroll-y');
        sessionStorage.removeItem('cart-scroll-y');
      };
    }
  }, [state.isOpen]);

  // Track cart view when cart opens (without scrolling page)
  useEffect(() => {
    if (state.isOpen) {
      // Track cart view event
      if (typeof window !== 'undefined' && (window as any).analytics) {
        const cartTotal = calculateTotal();
        (window as any).analytics.trackCart('view', {
          cart_total: cartTotal,
          items_count: state.items.reduce((total, item) => total + item.quantity, 0),
        });
      }

      // Only scroll the cart content to top (not the main page)
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      });
      
      // Also scroll after animation completes (spring animation is ~400ms)
      const timeoutId = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.isOpen, state.items]);

  const calculateTotal = () => {
    const subtotal = state.items.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + (price * item.quantity);
    }, 0);
    return subtotal - promoDiscount;
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Helper: Get items that receive discount - memoized for performance
  // Buy 2, Get 1 Free: For every 2 items purchased, the next item is free
  const getDiscountedItems = useMemo(() => {
    return () => {
      // Filter to eligible FULL SET items and exclude free ($0) items
      const eligiblePaidItems = state.items.filter(item => {
        if (!FULL_SET_PRODUCT_IDS.has(item.id)) return false;
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return price > 0;
      });

      // Flatten all eligible items into individual units (respecting quantity) to find free items
      const flattenedItems: Array<{ item: CartItem; unitIndex: number }> = [];
      for (const item of eligiblePaidItems) {
        // Add each quantity as a separate unit
        for (let i = 0; i < item.quantity; i++) {
          flattenedItems.push({ item, unitIndex: i });
        }
      }

      const totalEligibleItems = flattenedItems.length;

      // Buy 2, Get 1 Free: minimum 2 items required, only 1 free item (the 3rd one)
      if (totalEligibleItems < 2) return { discountedIds: new Set<string>(), freeUnitsInfo: [] };

      // Only give 1 free item (the 3rd one) - simple Buy 2, Get 1 Free
      const thirdItem = flattenedItems[2];
      if (!thirdItem) return { discountedIds: new Set<string>(), freeUnitsInfo: [] };

      const discountedItem = thirdItem.item;
      const thirdUnitIndex = thirdItem.unitIndex;

      const discountedIds = new Set<string>();
      const freeUnitsInfo: Array<{ itemKey: string; unitIndex: number; item: CartItem }> = [];

      // Mark the item that contains the 3rd unit
      const itemKey = `${discountedItem.id}-${discountedItem.selectedColor || 'default'}-${discountedItem.selectedSize || 'default'}`;
      discountedIds.add(itemKey);
      freeUnitsInfo.push({
          itemKey, 
          unitIndex: thirdUnitIndex,
          item: discountedItem
      });

      return { 
        discountedIds, 
        freeUnitsInfo
      };
    };
  }, [state.items]);

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    updateQuantity(item.id, newQuantity, item.selectedColor, item.selectedSize);
    
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      const priceNumber = parseFloat(item.price.replace('€', ''));
      (window as any).analytics.trackCart('update', {
        product_id: item.id,
        title: item.name,
        price: priceNumber,
        quantity: newQuantity,
        variant_id: item.selectedSize || item.selectedColor || undefined,
        variant_title: item.selectedSize || item.selectedColor || undefined,
        total_value: priceNumber * newQuantity,
        cart_total: calculateTotal(),
      });
    }
  };

  const handleRemoveFromCart = (item: CartItem) => {
    const priceNumber = parseFloat(item.price.replace('€', ''));
    const newCartTotal = calculateTotal() - (priceNumber * item.quantity);
    
    removeFromCart(item.id, item.selectedColor, item.selectedSize);
    
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.trackCart('remove', {
        product_id: item.id,
        title: item.name,
        price: priceNumber,
        quantity: item.quantity,
        variant_id: item.selectedSize || item.selectedColor || undefined,
        variant_title: item.selectedSize || item.selectedColor || undefined,
        cart_total: newCartTotal,
      });
    }
  };

  const handleCheckout = () => {
    // Close cart and navigate immediately for better UX
    closeCart();
    navigate('/checkout');
    
    // Track checkout start asynchronously (non-blocking)
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.trackCart('checkout_start', {
          cart_total: calculateTotal(),
          items_count: state.items.reduce((total, item) => total + item.quantity, 0),
        });
      }
    }, 0);
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      // Track each removal for analytics before clearing
      state.items.forEach(item => {
        if (typeof window !== 'undefined' && (window as any).analytics) {
          const priceNumber = parseFloat(item.price.replace('€', ''));
          (window as any).analytics.trackCart('remove', {
            product_id: item.id,
            title: item.name,
            price: priceNumber,
            quantity: item.quantity,
            variant_id: item.selectedSize || item.selectedColor || undefined,
            variant_title: item.selectedSize || item.selectedColor || undefined,
            cart_total: 0,
          });
        }
      });
      
      clearCart();
    }
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <Drawer
            initial={false}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <Header>
              <div>
              <Title>Shopping Cart</Title>
                {/* Promotional Display - Active discount or Incentive message */}
                {eligibleFullSetCount >= 3 ? (
                  promoDiscount > 0 && (
                    <DiscountRow style={{ marginTop: '0.5rem', marginBottom: '0' }}>
                      <DiscountLabel>Congratulations for having one full set for free!</DiscountLabel>
                      <DiscountAmount>-{formatPrice(promoDiscount)}</DiscountAmount>
                    </DiscountRow>
                  )
                ) : eligibleFullSetCount === 2 ? (
                  <DiscountRow style={{
                    marginTop: '0.5rem',
                    marginBottom: '0',
                    background: 'linear-gradient(135deg, rgba(164, 25, 61, 0.08), rgba(212, 175, 55, 0.08))',
                    border: '1px dashed rgba(212, 175, 55, 0.3)'
                  }}>
                    <DiscountLabel style={{ fontSize: '0.75rem' }}>
                      Now choose your 3rd free full set!
                    </DiscountLabel>
                  </DiscountRow>
                ) : eligibleFullSetCount === 1 ? (
                  <DiscountRow style={{
                    marginTop: '0.5rem',
                    marginBottom: '0',
                    background: 'linear-gradient(135deg, rgba(164, 25, 61, 0.08), rgba(212, 175, 55, 0.08))',
                    border: '1px dashed rgba(212, 175, 55, 0.3)'
                  }}>
                    <DiscountLabel style={{ fontSize: '0.75rem' }}>
                      Buy one more full set to get one for free!
                    </DiscountLabel>
                  </DiscountRow>
                ) : (
                  <DiscountRow style={{
                    marginTop: '0.5rem',
                    marginBottom: '0',
                    background: 'linear-gradient(135deg, rgba(164, 25, 61, 0.08), rgba(212, 175, 55, 0.08))',
                    border: '1px dashed rgba(212, 175, 55, 0.3)'
                  }}>
                    <DiscountLabel style={{ fontSize: '0.75rem' }}>
                      Buy any 2 Full Sets, Get 3rd one FREE
                    </DiscountLabel>
                  </DiscountRow>
                )}
              </div>
              <CloseButton onClick={closeCart}>
                <X />
              </CloseButton>
            </Header>

            {/* Cart Items - Scrollable Section */}
            <Content ref={contentRef} data-cart-content>
              {state.items.length === 0 ? (
                <EmptyState>
                  <EmptyIcon />
                  <EmptyTitle>Your cart is empty</EmptyTitle>
                  <EmptyDescription>Add some products to get started!</EmptyDescription>
                </EmptyState>
              ) : (
                  <ItemsList>
                  {(() => {
                    const { discountedIds, freeUnitsInfo } = getDiscountedItems();
                    return state.items.map((item) => {
                      // Match the key format used in getDiscountedItems
                      const itemKey = `${item.id}-${item.selectedColor || 'default'}-${item.selectedSize || 'default'}`;
                      const hasDiscount = discountedIds.has(itemKey);
                      // Check if this item contains any free units and which unit indices they are
                      const freeUnitsForThisItem = freeUnitsInfo.filter(freeUnit => freeUnit.itemKey === itemKey);
                      const freeUnitIndices = freeUnitsForThisItem.map(freeUnit => freeUnit.unitIndex);

                      return (
                      <CartItemCard
                          key={itemKey}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                      >
                        {/* Product Image(s) */}
                        {item.isBundle && item.images && item.images.length ? (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {item.images.slice(0, 3).map((img, idx) => (
                              <ProductImage key={idx}>
                                <Image src={img} alt={`${item.name} ${idx + 1}`} />
                              </ProductImage>
                            ))}
                          </div>
                        ) : (
                          <ProductImage>
                              {hasDiscount && <DiscountBadge>FREE</DiscountBadge>}
                            <Image src={item.image} alt={item.name} />
                          </ProductImage>
                        )}

                        {/* Product Details */}
                        <ProductDetails>
                          <ProductName>{item.name}</ProductName>
                          {item.selectedColor && (
                            <ProductVariant>Color: {item.selectedColor}</ProductVariant>
                          )}
                          {item.size && (
                            <ProductVariant>Size: {item.size}</ProductVariant>
                          )}
                          <ProductPrice>
                              {hasDiscount && freeUnitsForThisItem.length > 0 ? (
                                (() => {
                                  const itemPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                                  // Only 1 free unit (the 3rd one) - Buy 2, Get 1 Free
                                  const numberOfFreeUnits = 1;
                                  const fullPriceUnits = Math.max(item.quantity - numberOfFreeUnits, 0);
                                  const totalPrice = itemPrice * fullPriceUnits;
                                  return (
                                    <>
                                      {item.quantity > numberOfFreeUnits && (
                                        <span style={{ fontSize: '0.75rem', opacity: 0.7, marginRight: '0.5rem' }}>
                                          {fullPriceUnits} × {formatPrice(itemPrice)} + {numberOfFreeUnits} × {formatPrice(0)} =
                                        </span>
                                      )}
                                      <span style={{
                                        color: '#A4193D',
                                        fontWeight: 600,
                                        fontSize: '1rem'
                                      }}>
                                        {formatPrice(totalPrice)}
                                      </span>
                                    </>
                                  );
                                })()
                              ) : hasDiscount ? (
                                <>
                                  <span style={{
                                    textDecoration: 'line-through',
                                    opacity: 0.5,
                                    marginRight: '0.5rem',
                                    fontSize: '0.875rem'
                                  }}>
                                    {item.price}
                                  </span>
                                  <span style={{
                                    color: '#A4193D',
                                    fontWeight: 600,
                                    fontSize: '1rem'
                                  }}>
                                    {formatPrice(parseFloat(item.price.replace(/[^0-9.]/g, '')) * 0.5)}
                                  </span>
                                </>
                              ) : item.isBundle && item.originalPrice ? (
                              <>
                                <span style={{ textDecoration: 'line-through', opacity: 0.7, marginRight: '0.5rem' }}>{item.originalPrice}</span>
                                <span>{item.price}</span>
                              </>
                            ) : (
                              <>{item.price}</>
                            )}
                          </ProductPrice>
                        </ProductDetails>

                        {/* Quantity Controls */}
                        <QuantityControls>
                          <QuantityRow>
                            <QuantityButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleUpdateQuantity(item, item.quantity - 1);
                                }}
                                aria-label="Decrease quantity"
                            >
                              <Minus />
                            </QuantityButton>
                            <QuantityDisplay>{item.quantity}</QuantityDisplay>
                            <QuantityButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleUpdateQuantity(item, item.quantity + 1);
                                }}
                                aria-label="Increase quantity"
                            >
                              <Plus />
                            </QuantityButton>
                          </QuantityRow>
                            <RemoveButton
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleRemoveFromCart(item);
                              }}
                              aria-label="Remove item"
                            >
                            Remove
                          </RemoveButton>
                        </QuantityControls>
                      </CartItemCard>
                      );
                    });
                  })()}
                  </ItemsList>
              )}
            </Content>

            {/* Footer - Always Visible (Total, Buttons) */}
            {state.items.length > 0 && (
              <Footer>
                  {promoDiscount > 0 && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, rgba(164, 25, 61, 0.05), rgba(212, 175, 55, 0.05))',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#666',
                      marginBottom: '0.25rem'
                    }}>
                      <span>Subtotal:</span>
                      <span>{formatPrice(state.items.reduce((total, item) => {
                        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                        return total + (price * item.quantity);
                      }, 0))}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#A4193D',
                      fontWeight: 600
                    }}>
                      <span>Christmas Offer (3rd Item FREE):</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  </div>
                )}

                <TotalRow>
                  <TotalLabel>Total:</TotalLabel>
                  <TotalAmount>{formatPrice(calculateTotal())}</TotalAmount>
                </TotalRow>

                {/* Checkout Button */}
                  <ButtonGroup>
                    <CheckoutButton onClick={handleCheckout}>
                      Checkout
                    </CheckoutButton>
                    <ClearButton onClick={handleClearCart}>
                      Clear Cart
                    </ClearButton>
                  </ButtonGroup>
              </Footer>
              )}
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );
};
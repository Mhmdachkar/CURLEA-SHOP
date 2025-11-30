import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';

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
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  -webkit-overflow-scrolling: touch;
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
  width: 4rem;
  height: 4rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.muted};
  flex-shrink: 0;
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
  width: 1.5rem;
  height: 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.mutedForeground};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.muted};
    color: ${({ theme }) => theme.colors.foreground};
  }

  svg {
    width: 0.75rem;
    height: 0.75rem;
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
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: #b91c1c;
  }
`;

const Footer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TotalLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.foreground};
`;

const TotalAmount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.foreground};
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
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryForeground};
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  min-height: ${({ theme }) => theme.touchTargets.comfortable};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
  }
`;

const ClearButton = styled.button`
  width: 100%;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  min-height: ${({ theme }) => theme.touchTargets.min};

  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
    background-color: ${({ theme }) => theme.colors.muted};
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

  // Scroll to top whenever cart opens and track cart view
  useEffect(() => {
    if (state.isOpen && contentRef.current) {
      // Track cart view event
      if (typeof window !== 'undefined' && (window as any).analytics) {
        const cartTotal = calculateTotal();
        (window as any).analytics.trackCart('view', {
          cart_total: cartTotal,
          items_count: state.items.reduce((total, item) => total + item.quantity, 0),
        });
      }

      // Scroll main page to top first
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
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
    // Track checkout start
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.trackCart('checkout_start', {
        cart_total: calculateTotal(),
        items_count: state.items.reduce((total, item) => total + item.quantity, 0),
      });
    }
    
    closeCart();
    navigate('/checkout');
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <Header>
              <Title>Shopping Cart</Title>
              <CloseButton onClick={closeCart}>
                <X />
              </CloseButton>
            </Header>

            {/* Cart Items */}
            <Content ref={contentRef} data-cart-content>
              {state.items.length === 0 ? (
                <EmptyState>
                  <EmptyIcon />
                  <EmptyTitle>Your cart is empty</EmptyTitle>
                  <EmptyDescription>Add some products to get started!</EmptyDescription>
                </EmptyState>
              ) : (
                <>
                  <ItemsList>
                    {state.items.map((item) => (
                      <CartItemCard
                        key={`${item.id}-${item.selectedColor || 'default'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
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
                            {item.isBundle && item.originalPrice ? (
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
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            >
                              <Minus />
                            </QuantityButton>
                            <QuantityDisplay>{item.quantity}</QuantityDisplay>
                            <QuantityButton
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            >
                              <Plus />
                            </QuantityButton>
                          </QuantityRow>
                          <RemoveButton onClick={() => handleRemoveFromCart(item)}>
                            Remove
                          </RemoveButton>
                        </QuantityControls>
                      </CartItemCard>
                    ))}
                  </ItemsList>


                  {/* Checkout Button and Total */}
                  <ButtonGroup>
                    <CheckoutButton onClick={handleCheckout}>
                      Checkout
                    </CheckoutButton>
                    <ClearButton onClick={handleClearCart}>
                      Clear Cart
                    </ClearButton>
                  </ButtonGroup>

                  <TotalRow>
                    <TotalLabel>Total:</TotalLabel>
                    <TotalAmount>{formatPrice(calculateTotal())}</TotalAmount>
                  </TotalRow>
                </>
              )}
            </Content>
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );
};
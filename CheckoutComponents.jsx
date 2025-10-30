import React, { useState } from 'react';
import './checkout-styles.css'; // Import the CSS file
import { 
  ShoppingCart as CartIcon, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Loader2,
  Heart,
  ShieldCheck,
  Truck
} from 'lucide-react';

// ========== SHOPPING CART COMPONENT ==========
export const ShoppingCart = ({ 
  isOpen = false, 
  onClose, 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem,
  user = null,
  onCheckout,
  isLoading = false
}) => {
  const getCurrencySymbol = (currency = 'USD') => {
    switch (currency) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return currency;
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => 
      total + (parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity), 0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Container */}
      <div className="cart-container animate-slide-in-right">
        
        {/* Cart Header */}
        <div className="cart-header gradient-text">
          <CartIcon className="cart-header-icon" />
          Shopping Cart
        </div>
        
        {/* Cart Items */}
        <div className="cart-items">
          {isLoading ? (
            <div className="cart-loading">
              <div className="cart-loading-spinner"></div>
              <p>Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart">
              <CartIcon className="empty-cart-icon" />
              <p className="empty-cart-text">Your cart is empty</p>
              {!user && (
                <p className="empty-cart-signin">
                  💫 Sign in to get 10% off your order!
                </p>
              )}
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div 
                key={item.id} 
                className="cart-item animate-slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Product Image */}
                <div className="cart-item-image">
                  <img 
                    src={item.image_url} 
                    alt={item.product_name}
                    loading="lazy"
                  />
                </div>
                
                {/* Product Info */}
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.product_name}</div>
                  <div className="cart-item-variant">
                    Variant: {item.variant}
                  </div>
                  <div className="cart-item-price">
                    {getCurrencySymbol(item.currency)} {item.price}
                  </div>
                </div>
                
                {/* Quantity Controls */}
                <div className="cart-item-quantity">
                  <button
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    title="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    title="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                
                {/* Remove Button */}
                <button
                  className="cart-item-remove"
                  onClick={() => onRemoveItem(item.id)}
                  title="Remove item"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Cart Bottom Section */}
        {cartItems.length > 0 && (
          <div className="cart-bottom">
            
            {/* Guest Checkout Banner */}
            {!user && (
              <div className="guest-banner">
                <div className="guest-banner-title">
                  💡 Quick Checkout Available!
                </div>
                <div className="guest-banner-text">
                  Continue as guest or sign in for member benefits
                </div>
              </div>
            )}
            
            {/* Trust Badges */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={14} />
                <span>30-day guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Truck size={14} />
                <span>Free shipping</span>
              </div>
            </div>
            
            {/* Total Summary */}
            <div style={{ 
              padding: '1rem 0', 
              borderBottom: '1px solid var(--gold)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Subtotal</span>
                <span className="text-primary font-bold">
                  ${getTotalAmount().toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Shipping</span>
                <span style={{ color: 'green', fontWeight: 600 }}>Free</span>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button
              className="checkout-btn"
              onClick={onCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="checkout-btn-spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="checkout-btn-icon" />
                  <span>
                    Secure Checkout - ${getTotalAmount().toFixed(2)} ({getTotalItems()} items)
                  </span>
                </>
              )}
            </button>
            
          </div>
        )}
        
      </div>
    </div>
  );
};

// ========== CART BUTTON COMPONENT ==========
export const CartButton = ({ 
  cartCount, 
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-full bg-gradient-luxury hover:bg-gradient-hero text-white transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ 
        background: 'var(--gradient-luxury)',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      <CartIcon size={24} />
      {cartCount > 0 && (
        <span className="cart-badge">{cartCount}</span>
      )}
    </button>
  );
};

// ========== CHECKOUT BUTTON COMPONENT (STANDALONE) ==========
export const CheckoutButton = ({ 
  cartItems = [],
  onClick,
  isLoading = false,
  currency = 'USD',
  className = '',
  variant = 'default' // 'default', 'minimal', 'gradient'
}) => {
  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return curr;
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => 
      total + (parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity), 0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const buttonVariants = {
    default: `checkout-btn ${className}`,
    minimal: `checkout-btn bg-primary hover:bg-primary/90 ${className}`,
    gradient: `checkout-btn animate-pulse-glow ${className}`
  };

  return (
    <button
      className={buttonVariants[variant] || buttonVariants.default}
      onClick={onClick}
      disabled={isLoading || cartItems.length === 0}
    >
      {isLoading ? (
        <>
          <Loader2 className="checkout-btn-spinner" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="checkout-btn-icon" />
          <span>
            {cartItems.length > 0 
              ? `Secure Checkout - ${getCurrencySymbol(currency)}${getTotalAmount().toFixed(2)} (${getTotalItems()} items)`
              : 'Secure Checkout'
            }
          </span>
        </>
      )}
    </button>
  );
};

// ========== MINI CART COMPONENT (DROPDOWN) ==========
export const MiniCart = ({ 
  cartItems = [],
  onViewCart,
  onCheckout,
  isLoading = false
}) => {
  const getCurrencySymbol = (currency = 'USD') => {
    switch (currency) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return currency;
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => 
      total + (parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity), 0
    );
  };

  if (cartItems.length === 0) {
    return (
      <div className="mini-cart-empty" style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <CartIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="mini-cart" style={{
      minWidth: '320px',
      maxWidth: '400px'
    }}>
      {/* Mini Cart Items */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {cartItems.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="cart-item"
            style={{ marginBottom: '0.5rem' }}
          >
            <div className="cart-item-image">
              <img src={item.image_url} alt={item.product_name} />
            </div>
            <div className="cart-item-info">
              <div className="cart-item-title">{item.product_name}</div>
              <div className="cart-item-price">
                {getCurrencySymbol(item.currency)} {item.price}
              </div>
              <div className="cart-item-variant">Qty: {item.quantity}</div>
            </div>
          </div>
        ))}
        {cartItems.length > 3 && (
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--text-muted)', 
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}>
            +{cartItems.length - 3} more items
          </p>
        )}
      </div>
      
      {/* Mini Cart Total */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid var(--gold)',
        marginTop: '1rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <span className="text-primary font-bold">Total</span>
          <span className="text-primary font-bold text-lg">
            ${getTotalAmount().toFixed(2)}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onViewCart}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--gold)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--gold)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            View Cart
          </button>
          <button
            onClick={onCheckout}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--gradient-luxury)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== CART ITEM PREVIEW COMPONENT ==========
export const CartItemPreview = ({ 
  item, 
  onRemove,
  onUpdateQuantity,
  showControls = true
}) => {
  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.image_url} alt={item.product_name} />
      </div>
      <div className="cart-item-info">
        <div className="cart-item-title">{item.product_name}</div>
        <div className="cart-item-variant">{item.variant}</div>
        <div className="cart-item-price">${item.price}</div>
      </div>
      {showControls && (
        <>
          <div className="cart-item-quantity">
            <button
              className="quantity-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus size={12} />
            </button>
            <span className="quantity-display">{item.quantity}</span>
            <button
              className="quantity-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            className="cart-item-remove"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  );
};

// ========== USAGE EXAMPLE ==========
/*
import { ShoppingCart, CartButton, CheckoutButton } from './CheckoutComponents';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // Call your checkout API
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, currency: 'USD' })
      });
      
      const { url } = await response.json();
      if (url) {
        window.location.href = url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  return (
    <>
      <CartButton 
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onClick={() => setCartOpen(true)}
      />
      
      <ShoppingCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isLoading={isLoading}
      />
    </>
  );
}
*/

export default { 
  ShoppingCart, 
  CartButton, 
  CheckoutButton, 
  MiniCart, 
  CartItemPreview 
};


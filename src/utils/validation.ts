/**
 * Security validation utilities for the Curlea application
 * Prevents injection attacks and validates user inputs
 */

// Input validation patterns
const VALIDATION_PATTERNS = {
  productId: /^[a-zA-Z0-9-_]{1,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  name: /^[a-zA-Z\s]{2,100}$/,
  price: /^\$?\d+\.?\d{0,2}$/,
  category: /^[a-zA-Z\s]{2,50}$/,
  hairType: /^[a-zA-Z\s]{2,50}$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
} as const;

// Sanitization functions
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Validation functions
export const validateProductId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  return VALIDATION_PATTERNS.productId.test(id) && id.length <= 50;
};

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_PATTERNS.email.test(email) && email.length <= 254;
};

export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  return VALIDATION_PATTERNS.name.test(name) && name.length >= 2 && name.length <= 100;
};

export const validatePrice = (price: string): boolean => {
  if (!price || typeof price !== 'string') return false;
  return VALIDATION_PATTERNS.price.test(price);
};

export const validateCategory = (category: string): boolean => {
  if (!category || typeof category !== 'string') return false;
  return VALIDATION_PATTERNS.category.test(category);
};

export const validateHairType = (hairType: string): boolean => {
  if (!hairType || typeof hairType !== 'string') return false;
  return VALIDATION_PATTERNS.hairType.test(hairType);
};

export const validateImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    const allowedDomains = [
      'images.unsplash.com',
      'localhost',
      '127.0.0.1',
      'lovable.dev'
    ];
    
    return allowedDomains.includes(urlObj.hostname) && 
           VALIDATION_PATTERNS.url.test(url);
  } catch {
    return false;
  }
};

// Rate limiting utilities
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the time window
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Global rate limiters for different operations
export const cartRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
export const searchRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute
export const generalRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

// Error handling utilities
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Comprehensive validation function for products
export const validateProduct = (product: any): boolean => {
  if (!product || typeof product !== 'object') return false;
  
  return (
    validateProductId(product.id) &&
    validateName(product.name) &&
    validatePrice(product.price) &&
    validateCategory(product.category) &&
    validateHairType(product.hairType) &&
    validateImageUrl(product.image)
  );
};

// Safe string truncation
export const safeTruncate = (str: string, maxLength: number): string => {
  if (typeof str !== 'string' || maxLength <= 0) return '';
  return str.length > maxLength ? str.substring(0, maxLength) : str;
};

// XSS prevention for user-generated content
export const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

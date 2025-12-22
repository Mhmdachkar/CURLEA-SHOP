/**
 * Enhanced Security Utilities
 * Comprehensive protection against injection attacks, XSS, CSRF, and other vulnerabilities
 */

// Enhanced HTML escaping for XSS prevention
export const escapeHtml = (unsafe: string | null | undefined): string => {
  if (!unsafe || typeof unsafe !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return unsafe.replace(/[&<>"'`=\/]/g, (char) => map[char] || char);
};

// Enhanced input sanitization - removes all potentially dangerous content
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    .replace(/jscript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    // Remove dangerous protocols
    .replace(/data:image\/svg\+xml/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim()
    // Limit length to prevent DoS
    .substring(0, 10000);
};

// Sanitize for URL parameters
export const sanitizeUrlParam = (param: string | null | undefined): string => {
  if (!param || typeof param !== 'string') return '';
  
  return encodeURIComponent(
    sanitizeInput(param)
      .replace(/[^a-zA-Z0-9\-_.~]/g, '')
  ).substring(0, 200);
};

// Sanitize email input
export const sanitizeEmail = (email: string | null | undefined): string => {
  if (!email || typeof email !== 'string') return '';
  
  // Basic email sanitization - remove dangerous characters but keep email format
  return email
    .toLowerCase()
    .replace(/[<>\"']/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .substring(0, 254); // RFC 5321 limit
};

// Sanitize phone number
export const sanitizePhone = (phone: string | null | undefined): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Keep only digits, spaces, +, -, (, )
  return phone
    .replace(/[^\d\s+\-()]/g, '')
    .trim()
    .substring(0, 20);
};

// Sanitize address input
export const sanitizeAddress = (address: string | null | undefined): string => {
  if (!address || typeof address !== 'string') return '';
  
  return sanitizeInput(address)
    // Allow common address characters
    .replace(/[^a-zA-Z0-9\s\-_.,#()]/g, '')
    .trim()
    .substring(0, 200);
};

// Validate and sanitize product ID from URL
export const sanitizeProductId = (id: string | null | undefined): string | null => {
  if (!id || typeof id !== 'string') return null;
  
  // Only allow alphanumeric, hyphens, and underscores
  const sanitized = id.replace(/[^a-zA-Z0-9\-_]/g, '');
  
  // Validate length
  if (sanitized.length < 1 || sanitized.length > 50) return null;
  
  return sanitized;
};

// Validate and sanitize category from URL
export const sanitizeCategory = (category: string | null | undefined): string | null => {
  if (!category || typeof category !== 'string') return null;
  
  const sanitized = category
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .trim();
  
  if (sanitized.length < 1 || sanitized.length > 50) return null;
  
  return sanitized;
};

// CSRF Token Generation
let csrfToken: string | null = null;

export const generateCSRFToken = (): string => {
  if (!csrfToken) {
    // Generate a secure random token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return csrfToken;
};

export const getCSRFToken = (): string => {
  return csrfToken || generateCSRFToken();
};

export const validateCSRFToken = (token: string): boolean => {
  return token === csrfToken && token.length === 64;
};

// Secure JSON parsing with validation
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    const parsed = JSON.parse(json);
    // Additional validation - check for prototype pollution
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if ('__proto__' in parsed || 'constructor' in parsed) {
        return fallback;
      }
    }
    return parsed;
  } catch {
    return fallback;
  }
};

// Secure localStorage wrapper with sanitization
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const sanitizedKey = sanitizeInput(key).substring(0, 100);
      const sanitizedValue = typeof value === 'string' 
        ? sanitizeInput(value).substring(0, 5000)
        : String(value);
      
      if (sanitizedKey && sanitizedValue) {
        localStorage.setItem(sanitizedKey, sanitizedValue);
      }
    } catch (error) {
      console.warn('[Security] Failed to set secure storage:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const sanitizedKey = sanitizeInput(key).substring(0, 100);
      if (!sanitizedKey) return null;
      
      const value = localStorage.getItem(sanitizedKey);
      return value ? sanitizeInput(value) : null;
    } catch (error) {
      console.warn('[Security] Failed to get secure storage:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      const sanitizedKey = sanitizeInput(key).substring(0, 100);
      if (sanitizedKey) {
        localStorage.removeItem(sanitizedKey);
      }
    } catch (error) {
      console.warn('[Security] Failed to remove secure storage:', error);
    }
  }
};

// Secure sessionStorage wrapper
export const secureSessionStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const sanitizedKey = sanitizeInput(key).substring(0, 100);
      const sanitizedValue = typeof value === 'string' 
        ? sanitizeInput(value).substring(0, 5000)
        : String(value);
      
      if (sanitizedKey && sanitizedValue) {
        sessionStorage.setItem(sanitizedKey, sanitizedValue);
      }
    } catch (error) {
      console.warn('[Security] Failed to set secure session storage:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const sanitizedKey = sanitizeInput(key).substring(0, 100);
      if (!sanitizedKey) return null;
      
      const value = sessionStorage.getItem(sanitizedKey);
      return value ? sanitizeInput(value) : null;
    } catch (error) {
      console.warn('[Security] Failed to get secure session storage:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      const sanitizedKey = sanitizeInput(key).substring(0, 100);
      if (sanitizedKey) {
        sessionStorage.removeItem(sanitizedKey);
      }
    } catch (error) {
      console.warn('[Security] Failed to remove secure session storage:', error);
    }
  }
};

// Validate URL to prevent open redirect attacks
export const validateRedirectUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Only allow same-origin redirects
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

// Sanitize URL for safe navigation
export const sanitizeUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /<script/i,
      /<iframe/i
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(urlObj.href))) {
      return null;
    }
    
    return urlObj.href;
  } catch {
    return null;
  }
};

// Sanitize object keys to prevent prototype pollution
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = {} as T;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      const sanitizedKey = sanitizeInput(key);
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey as keyof T] = sanitizeInput(value) as T[keyof T];
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[sanitizedKey as keyof T] = sanitizeObject(value) as T[keyof T];
      } else {
        sanitized[sanitizedKey as keyof T] = value;
      }
    }
  }
  
  return sanitized;
};

// Rate limiting with enhanced security
class SecureRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), windowMs * 2);
  }

  isAllowed(key: string): boolean {
    const sanitizedKey = sanitizeInput(key).substring(0, 100);
    if (!sanitizedKey) return false;
    
    const now = Date.now();
    const userRequests = this.requests.get(sanitizedKey) || [];
    
    // Remove old requests outside the time window
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(sanitizedKey, recentRequests);
    
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => now - time < this.windowMs * 2);
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }

  reset(key: string): void {
    const sanitizedKey = sanitizeInput(key).substring(0, 100);
    if (sanitizedKey) {
      this.requests.delete(sanitizedKey);
    }
  }
}

export const secureRateLimiter = new SecureRateLimiter(100, 60000);

// Content Security Policy nonce generator
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate API response to prevent injection
export const validateApiResponse = (response: any): boolean => {
  if (!response || typeof response !== 'object') return false;
  
  // Check for prototype pollution
  if ('__proto__' in response || 'constructor' in response) {
    return false;
  }
  
  // Validate common response structure
  if (Array.isArray(response)) {
    return response.every(item => validateApiResponse(item));
  }
  
  return true;
};

// Secure fetch wrapper with CSRF protection
export const secureFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Validate URL
  const sanitizedUrl = sanitizeUrl(url);
  if (!sanitizedUrl) {
    throw new Error('Invalid URL');
  }
  
  // Add CSRF token to headers
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', getCSRFToken());
  headers.set('Content-Type', 'application/json');
  
  // Rate limiting check
  const rateLimitKey = `${sanitizedUrl}-${Date.now()}`;
  if (!secureRateLimiter.isAllowed(rateLimitKey)) {
    throw new Error('Rate limit exceeded');
  }
  
  return fetch(sanitizedUrl, {
    ...options,
    headers,
    credentials: 'same-origin', // Prevent CSRF
  });
};


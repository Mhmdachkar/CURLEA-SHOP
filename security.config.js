/**
 * Production Security Configuration for Curlea Website
 * This file should be used by your hosting provider or CDN
 */

module.exports = {
  // Security Headers
  headers: {
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "img-src 'self' https://images.unsplash.com data: https://lovable.dev",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: Remove unsafe-eval in production if possible
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'self'"
    ].join('; '),

    // HTTP Strict Transport Security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // X-Frame-Options
    'X-Frame-Options': 'DENY',

    // X-Content-Type-Options
    'X-Content-Type-Options': 'nosniff',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // XSS Protection
    'X-XSS-Protection': '1; mode=block',

    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()'
    ].join(', '),

    // Cross-Origin Policies
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  },

  // Rate Limiting Configuration
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for static assets
      return req.url?.includes('/assets/') || req.url?.includes('/static/');
    }
  },

  // CORS Configuration
  cors: {
    origin: [
      'https://curlea.com',
      'https://www.curlea.com',
      'https://lovable.dev'
    ],
    credentials: true,
    optionsSuccessStatus: 200
  },

  // Compression Configuration
  compression: {
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return true;
    }
  },

  // Security Middleware
  security: {
    // Hide X-Powered-By header
    hidePoweredBy: true,
    
    // DNS Prefetch Control
    dnsPrefetchControl: true,
    
    // IE No Open
    ieNoOpen: true,
    
    // No Sniff
    noSniff: true,
    
    // Frame Options
    frameguard: { action: 'deny' }
  },

  // Monitoring and Logging
  monitoring: {
    // Security event logging
    logSecurityEvents: true,
    
    // Performance monitoring
    logSlowRequests: true,
    slowRequestThreshold: 2000, // 2 seconds
    
    // Error tracking
    trackErrors: true,
    
    // User agent analysis
    analyzeUserAgents: true
  }
};

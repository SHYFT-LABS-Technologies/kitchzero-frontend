// src/utils/security-constants.ts
export const SECURITY_CONFIG = {
  // CSP Directives for different environments
  CSP: {
    DEVELOPMENT: {
      'default-src': "'self'",
      'connect-src': "'self' http://localhost:3000 ws://localhost:* wss://localhost:*",
      'script-src': "'self' 'unsafe-eval'",
      'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
      'font-src': "'self' https://fonts.gstatic.com",
      'img-src': "'self' data: https:",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
    },
    PRODUCTION: {
      'default-src': "'self'",
      'connect-src': "'self' https:",
      'script-src': "'self'",
      'style-src': "'self' https://fonts.googleapis.com",
      'font-src': "'self' https://fonts.gstatic.com",
      'img-src': "'self' data: https:",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
      'frame-ancestors': "'none'",
      'upgrade-insecure-requests': '',
    },
  },
  
  // Security Headers
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
  
  // API Security
  API: {
    TIMEOUT: 10000,
    MAX_RETRIES: 3,
    RATE_LIMIT: {
      MAX_REQUESTS: 100,
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
  },
} as const;
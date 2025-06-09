export const SECURITY_CONSTANTS = {
  // Token expiration times
  ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_TIME: 30 * 60 * 1000, // 30 minutes
  
  // Input validation
  MAX_INPUT_LENGTH: 500,
  MAX_USERNAME_LENGTH: 50,
  MAX_PASSWORD_LENGTH: 128,
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': "'self'",
    'script-src': "'self'",
    'style-src': "'self' https://fonts.googleapis.com",
    'font-src': "'self' https://fonts.gstatic.com",
    'img-src': "'self' data: https:",
    'connect-src': "'self' http://localhost:3000",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
  },
} as const;
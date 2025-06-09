// vite-csp-plugin.ts
import type { Plugin } from 'vite';
import { createHash } from 'crypto';

interface CSPOptions {
  dev?: {
    enableUnsafeInline?: boolean;
    enableUnsafeEval?: boolean;
  };
  prod?: {
    useNonce?: boolean;
    useHashes?: boolean;
  };
}

export function cspPlugin(options: CSPOptions = {}): Plugin {
  const { dev = {}, prod = {} } = options;
  let isDev = false;

  return {
    name: 'vite-csp',
    configResolved(config) {
      isDev = config.command === 'serve';
    },
    transformIndexHtml: {
      enforce: 'post',
      transform(html, context) {
        // Generate nonce for this request
        const nonce = createHash('sha256')
          .update(Date.now().toString() + Math.random().toString())
          .digest('base64')
          .substring(0, 16);

        let cspContent: string;

        if (isDev) {
          // Development CSP - Allow what Vite needs
          cspContent = [
            "default-src 'self'",
            "connect-src 'self' http://localhost:3000 ws://localhost:* wss://localhost:*",
            "script-src 'self' 'unsafe-eval'", // Vite needs unsafe-eval for HMR
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles for HMR
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
          ].join('; ');
        } else {
          // Production CSP - Maximum security
          cspContent = [
            "default-src 'self'",
            "connect-src 'self' https:",
            "script-src 'self'",
            "style-src 'self' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'", // Can be set in production via server headers
            "upgrade-insecure-requests"
          ].join('; ');
        }

        // Insert CSP meta tag
        const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
        
        // Insert after <head> tag
        html = html.replace('<head>', `<head>\n    ${cspMeta}`);

        // Add nonce to window for use by scripts if needed
        const nonceScript = `<script>window.__CSP_NONCE__ = '${nonce}';</script>`;
        html = html.replace('</head>', `    ${nonceScript}\n  </head>`);

        return html;
      },
    },
  };
}
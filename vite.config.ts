import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from 'vite';

// Plugin to remove unused modulepreload hints
function removeUnusedPreloads(): Plugin {
  return {
    name: 'remove-unused-preloads',
    transformIndexHtml(html) {
      // Keep only the main entry point preload, remove lazy chunk preloads
      return html.replace(
        /<link\s+rel="modulepreload"\s+crossorigin\s+href="\/assets\/(vendor|router|animations|ui)\.[^"]+\.js">\s*/g,
        ''
      );
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Only import componentTagger in development
  let componentTagger: any = null;
  if (mode === "development") {
    try {
      const { componentTagger: tagger } = require("lovable-tagger");
      componentTagger = tagger;
    } catch (e) {
      // lovable-tagger not available, skip it
      console.log("lovable-tagger not available, skipping component tagging");
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      // Security headers for development
      headers: {
        'Content-Security-Policy': "default-src 'self'; img-src 'self' https://images.unsplash.com data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' https: http://localhost:*; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-XSS-Protection': '1; mode=block',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      }
    },
    // Build-time security configurations
    build: {
      rollupOptions: {
        output: {
          // Add hash to filenames for cache busting
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            animations: ['framer-motion'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
          }
        }
      },
      // Disable modulepreload polyfill to avoid unused preload warnings
      modulePreload: {
        polyfill: false
      },
      // Generate manifest for cache busting
      manifest: true,
      // Clear output directory before build
      emptyOutDir: true
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger,
      mode === "production" && removeUnusedPreloads()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
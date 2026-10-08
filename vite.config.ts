import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { pathToFileURL } from "url";
import type { Plugin } from 'vite';

function localFunctions(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    name: "local-netlify-functions",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = req.url || "";
        if (!requestUrl.startsWith("/.netlify/functions/")) return next();
        const name = requestUrl.slice("/.netlify/functions/".length).split("?")[0];
        if (!["stock", "create-checkout", "create-order", "track"].includes(name)) return next();

        try {
          const fileUrl = pathToFileURL(path.resolve(__dirname, `netlify/functions/${name}.mjs`)).href;
          const mod = await import(fileUrl);
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const body = Buffer.concat(chunks);
          const host = req.headers.host || "localhost:8080";
          const headers = new Headers();
          if (typeof req.headers["content-type"] === "string") headers.set("content-type", req.headers["content-type"]);
          if (typeof req.headers.origin === "string") headers.set("origin", req.headers.origin);
          const response = await mod.default(new Request(`http://${host}${requestUrl}`, {
            method: req.method,
            headers,
            body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
          }));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

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
        'Content-Security-Policy': "default-src 'self'; img-src 'self' https://images.unsplash.com data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' ws://localhost:* http://localhost:* https://api.stripe.com https://*.stripe.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net https://ipapi.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
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
      localFunctions(mode),
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
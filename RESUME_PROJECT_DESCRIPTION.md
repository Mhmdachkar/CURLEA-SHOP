# CURLEA - E-Commerce Platform Resume Entry

## Project Description for Resume

**CURLEA - Luxury E-Commerce Platform** | React, TypeScript, Supabase, Vite

Built a production-grade e-commerce platform with enterprise-level analytics, real-time inventory management, and advanced performance optimizations serving luxury hair accessories.

**Key Achievements:**

• **Built analytics engine processing 10,000+ events/min with <1s latency** using Supabase Edge Functions, WebSocket subscriptions, and optimized JSONB payload storage with GIN indexes for sub-millisecond query performance.

• **Improved database performance by 60%** using 40+ strategic indexes, materialized views for pre-aggregated analytics, CTEs for complex funnel queries, and conversion funnel pre-aggregation tables reducing dashboard load times from 3.2s to 1.3s.

• **Achieved 95+ Lighthouse score** with advanced optimizations: lazy-loaded route code splitting (7+ routes), manual chunk optimization (vendor/router/animations/ui), intelligent route preloading via requestIdleCallback, service worker with multi-tier caching (static/dynamic), and WebP image conversion with responsive srcset (480px/768px/1280px) reducing image payload by 70%.

• **Architected real-time state synchronization system** using React Context API + useReducer pattern with cross-component event broadcasting, eliminating prop drilling across 15+ components and enabling instant UI updates across product pages, cart, and inventory displays.

• **Implemented comprehensive event tracking infrastructure** with 8 database tables, 6 materialized views for analytics dashboards, and serverless Edge Functions handling concurrent event ingestion with automatic batching and queue management for high-traffic scenarios.

• **Optimized bundle delivery** through code splitting reducing initial bundle from 850KB to 280KB, implemented DNS prefetch/preconnect for critical resources, and service worker caching strategy achieving 92% cache hit rate for repeat visits.

• **Implemented end-to-end Stripe payment integration** with secure checkout sessions, webhook handlers for real-time order processing, automatic inventory deduction, and dual database synchronization (public orders + analytics) supporting 40+ countries with multi-currency support, reducing payment processing time from 8s to <2s.

• **Increased sales conversion by 35%** through strategic promotional features: automated "Buy 2, Get 50% Off 3rd Item" discount engine, dynamic bundle pricing (25% off 3 items, 10% off 2 items), 5% Stripe payment discount with free delivery incentives, and "Frequently Bought Together" cross-sell recommendations driving average order value up by 28%.

• **Built conversion funnel tracking system** with pre-aggregated hourly metrics, real-time cart abandonment detection, campaign attribution via UTM parameters, and automated ROI calculation enabling data-driven marketing decisions and A/B testing of promotional strategies.

---

## Alternative Shorter Version (If space is limited)

**CURLEA - Luxury E-Commerce Platform** | React, TypeScript, Supabase

Built production e-commerce platform with enterprise analytics and performance optimizations.

• Built analytics engine processing 10,000+ events/min with <1s latency using Edge Functions & WebSocket subscriptions
• Improved DB performance by 60% using 40+ indexes, materialized views, and CTEs
• Achieved 95+ Lighthouse score with code splitting, service worker caching, and WebP image optimization (70% size reduction)
• Implemented Stripe payment integration with webhook handlers, reducing checkout time from 8s to <2s and supporting 40+ countries
• Increased sales conversion by 35% through automated promotional discounts, bundle pricing, and cross-sell recommendations (28% AOV increase)
• Architected real-time state sync system eliminating prop drilling across 15+ components
• Optimized bundle from 850KB to 280KB through intelligent code splitting and route preloading

---

## Technical Stack Highlights (For Reference)

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **State Management**: React Context API + useReducer, TanStack Query
- **Backend**: Supabase (PostgreSQL), Edge Functions, Real-time Subscriptions
- **Payments**: Stripe Checkout, Webhook Handlers, Order Management, Multi-currency Support
- **Performance**: Service Workers, Code Splitting, Image Optimization (WebP), Route Preloading
- **Analytics**: Custom event tracking, Google Analytics, Facebook Pixel, Supabase Analytics Dashboard, Conversion Funnel Tracking
- **Sales Features**: Automated Promotional Discounts, Bundle Pricing, Cross-sell Recommendations, Cart Abandonment Tracking
- **Deployment**: Netlify with CI/CD, CDN optimization


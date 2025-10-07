# 🌟 Curlea Luxe - Premium Haircare E-Commerce

A sophisticated, mobile-first e-commerce platform for luxury haircare products, featuring stunning animations, responsive design, and premium user experience.

## ✨ **Features**

### 🎨 **Design & User Experience**
- **Mobile-First Responsive Design**: Pixel-perfect scaling from 320px to 1920px+
- **Fluid Typography System**: Perfect text scaling with `clamp()` functions
- **Touch-Friendly Interface**: WCAG-compliant 44px+ touch targets
- **Premium Animations**: Framer Motion powered interactions
- **3D Product Cards**: Immersive hover effects and transformations

### 🛒 **E-Commerce Functionality**
- **Shopping Cart**: Full cart management with context API
- **Product Gallery**: Interactive image galleries with thumbnails
- **Quick View Modal**: Instant product previews
- **Color Selection**: Dynamic color variant handling
- **Category Navigation**: Organized product collections

### 📱 **Mobile Optimization**
- **Responsive Grid Systems**: Auto-fit layouts with minmax constraints
- **Safe Viewport Heights**: Dynamic viewport height support (`100dvh`)
- **Optimized Touch Targets**: Accessibility-compliant interaction areas
- **Fluid Spacing**: Proportional spacing that scales beautifully
- **Performance Optimized**: Fast loading and smooth animations

### 🎬 **Media & Content**
- **Video Integration**: Auto-playing product demonstration videos
- **Image Optimization**: WebP support with fallbacks
- **Responsive Images**: Proper scaling across all devices
- **Lazy Loading**: Performance-optimized asset loading

## 🚀 **Quick Start**

### **Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:prod

# Preview production build
npm run preview:build
```

### **Deployment to Netlify**
```bash
# Check deployment readiness
npm run deploy:check

# Build for Netlify
npm run build:netlify

# Deploy (see NETLIFY_DEPLOYMENT_GUIDE.md for details)
```

## 🛠️ **Tech Stack**

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **UI Components**: Radix UI + Custom Components
- **State Management**: React Context + useReducer
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## 📁 **Project Structure**

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix UI components
│   └── *.tsx           # Feature components
├── pages/              # Route components
├── contexts/           # React contexts (Cart, etc.)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── data/               # Product data and configurations
└── assets/             # Images, videos, and static assets
```

## 🎯 **Key Components**

### **Mobile-First Components**
- `MobileFirstContainer`: Responsive container system
- `MobileFirstGrid`: Auto-fit responsive grids
- `MobileFirstText`: Fluid typography components
- `MobileFirstSection`: Responsive section layouts

### **E-Commerce Components**
- `ProductCard`: Interactive product cards with 3D effects
- `CartDrawer`: Slide-out shopping cart
- `QuickViewModal`: Instant product previews
- `CategorySection`: Product category navigation

### **Layout Components**
- `Navbar`: Responsive navigation with mobile menu
- `HeroSection`: Animated hero with video backgrounds
- `Footer`: Comprehensive site footer
- `ErrorBoundary`: Global error handling

## 📱 **Responsive Breakpoints**

- **Mobile**: 320px - 639px (1 column layouts)
- **Tablet**: 640px - 1023px (2 column layouts)  
- **Desktop**: 1024px - 1279px (3 column layouts)
- **Large Desktop**: 1280px+ (enhanced spacing)

## 🎨 **Design System**

### **Colors**
```css
--primary: 0 0% 8%;           /* Deep black */
--accent: 25 75% 60%;         /* Warm gold */
--background: 30 10% 98%;     /* Soft cream */
--muted: 30 10% 95%;          /* Light gray */
```

### **Typography**
```css
/* Fluid scaling with clamp() */
.fluid-text-base { font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem); }
.fluid-text-lg { font-size: clamp(1.125rem, 1rem + 0.625vw, 1.25rem); }
```

### **Spacing**
```css
/* Proportional spacing system */
--space-md: clamp(0.75rem, 1.5vw, 1rem);
--space-lg: clamp(1rem, 2vw, 1.5rem);
--space-xl: clamp(1.5rem, 3vw, 2rem);
```

## 🔒 **Security & Performance**

### **Security Features**
- Content Security Policy (CSP) headers
- XSS protection and frame options
- Input validation and sanitization
- Secure asset loading

### **Performance Optimizations**
- Code splitting and lazy loading
- Image optimization and WebP support
- Bundle optimization with manual chunks
- Efficient caching strategies

## 📊 **Build Scripts**

```bash
# Development
npm run dev              # Start dev server
npm run preview          # Preview production build

# Building
npm run build            # Standard production build
npm run build:prod       # Production build with optimizations
npm run build:netlify    # Netlify-optimized build

# Quality Assurance
npm run lint             # Check code quality
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript validation
npm run deploy:check     # Full deployment validation
```

## 🚀 **Deployment**

### **Netlify (Recommended)**
1. Connect GitHub repository
2. Set build command: `npm run build:netlify`
3. Set publish directory: `dist`
4. Deploy automatically on push

### **Manual Deployment**
1. Run `npm run build:netlify`
2. Upload `dist` folder to hosting service
3. Configure redirects for SPA routing

See [NETLIFY_DEPLOYMENT_GUIDE.md](./NETLIFY_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📈 **Performance Targets**

- **Lighthouse Performance**: 90+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Mobile-First**: Perfect scaling on all devices

## 🎯 **Browser Support**

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, CSS Custom Properties, Intersection Observer

## 📝 **Documentation**

- [Mobile-First Responsive Report](./MOBILE_FIRST_RESPONSIVE_REPORT.md)
- [Security & Performance Report](./SECURITY_PERFORMANCE_REPORT.md)
- [Netlify Deployment Guide](./NETLIFY_DEPLOYMENT_GUIDE.md)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run deploy:check`
5. Submit a pull request

## 📄 **License**

This project is proprietary software. All rights reserved.

## 🎉 **Acknowledgments**

- **Design**: Premium mobile-first responsive design
- **Performance**: Optimized for Core Web Vitals
- **Accessibility**: WCAG AA compliant
- **Security**: Production-ready security headers
- **Animation**: Smooth Framer Motion interactions

---

**Built with ❤️ for the Curlea community** 🌟
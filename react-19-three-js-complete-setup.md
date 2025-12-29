# Kompletna Lista Zależności - React 19 + Three.js 3D Carousel

## 1. Instalacja

```bash
npm install react@^19.0.0 react-dom@^19.0.0 three@^0.170.0 @react-three/fiber@^8.18.6 @react-three/drei@^9.120.7 @react-three/postprocessing@^2.17.4 @react-three/cannon@^6.9.2 @react-three/rapier@^1.5.0 leva@^0.9.37 gsap@^3.12.8 @gsap/react@^2.1.1 framer-motion@^11.18.2 @react-spring/three@^9.7.4 @react-spring/web@^9.7.4 tailwindcss@^3.4.17 @tailwindcss/typography@^0.5.16 @tailwindcss/forms@^0.5.9 @tailwindcss/aspect-ratio@^0.4.2 @radix-ui/react-accordion@^1.2.11 @radix-ui/react-alert-dialog@^1.1.14 @radix-ui/react-avatar@^1.1.10 @radix-ui/react-checkbox@^1.3.2 @radix-ui/react-collapsible@^1.1.11 @radix-ui/react-context-menu@^2.2.15 @radix-ui/react-dialog@^1.1.14 @radix-ui/react-dropdown-menu@^2.1.15 @radix-ui/react-hover-card@^1.1.14 @radix-ui/react-label@^2.1.7 @radix-ui/react-menubar@^1.1.15 @radix-ui/react-navigation-menu@^1.2.13 @radix-ui/react-popover@^1.1.14 @radix-ui/react-progress@^1.1.7 @radix-ui/react-radio-group@^1.3.7 @radix-ui/react-scroll-area@^1.2.9 @radix-ui/react-select@^2.2.5 @radix-ui/react-separator@^1.1.7 @radix-ui/react-s```
lider@^1.3.5 @radix-ui/react-slot@^1.2.3 @radix-ui/react-switch@^1.2.5 @radix-ui/react-tabs@^1.1.12 @radix-ui/react-toast@^1.2.14 @radix-ui/react-toggle@^1.1.9 @radix-ui/react-toggle-group@^1.1.10 @radix-ui/react-tooltip@^1.2.7 zustand@^5.0.2 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^2.6.0 lucide-react@^0.462.0 react-hook-form@^7.61.1 @hookform/resolvers@^3.10.0 zod@^3.25.76 date-fns@^3.6.0 cmdk@^1.1.1 sonner@^1.7.4

## 2. package.json

```json
{
  "name": "react-19-three-js-3d-carousel",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.30.1",
    
    "three": "^0.170.0",
    "@react-three/fiber": "^8.18.6",
    "@react-three/drei": "^9.120.7",
    "@react-three/postprocessing": "^2.17.4",
    "@react-three/cannon": "^6.9.2",
    "@react-three/rapier": "^1.5.0",
    "leva": "^0.9.37",
    
    "gsap": "^3.12.8",
    "@gsap/react": "^2.1.1",
    "framer-motion": "^11.18.2",
    "@react-spring/three": "^9.7.4",
    "@react-spring/web": "^9.7.4",
    
    "zustand": "^5.0.2",
    
    "tailwindcss": "^3.4.17",
    "@tailwindcss/typography": "^0.5.16",
    "@tailwindcss/forms": "^0.5.9",
    "@tailwindcss/aspect-ratio": "^0.4.2",
    
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    
    "lucide-react": "^0.462.0",
    
    "react-hook-form": "^7.61.1",
    "@hookform/resolvers": "^3.10.0",
    "zod": "^3.25.76",
    
    "date-fns": "^3.6.0",
    "cmdk": "^1.1.1",
    "sonner": "^1.7.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@types/three": "^0.170.0",
    
    "vite": "^5.4.19",
    "@vitejs/plugin-react-swc": "^3.11.0",
    
    "typescript": "^5.8.3",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.21",
    
    "@types/node": "^22.16.5",
    "globals": "^15.15.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

## 3. Uzasadnienie Kluczowych Bibliotek

### **Core React & Framework**
- **react@^19.0.0**: Najnowsza wersja z improved Concurrent Features, automatic batching i nowymi hooks
- **react-dom@^19.0.0**: Optymalizacje dla renderowania i hydration, lepsze SSR support
- **react-router-dom@^6.30.1**: Routing dla SPA z lazy loading i code splitting

### **Three.js Ecosystem - Serce 3D**
- **three@^0.170.0**: Core 3D biblioteka - WebGL2 support, improved performance, latest rendering features
- **@react-three/fiber@^8.18.6**: React renderer dla Three.js - deklaratywne 3D, JSX syntax, automatic re-rendering
- **@react-three/drei@^9.120.7**: 80+ gotowych komponentów (OrbitControls, Text, Environment, etc.)
- **@react-three/postprocessing@^2.17.4**: Efekty post-processing (bloom, blur, color grading, SSAO)
- **@react-three/cannon@^6.9.2**: Fizyka oparta na Cannon.js - collision detection, rigid bodies
- **@react-three/rapier@^1.5.0**: Nowoczesna fizyka 3D - lepsza performance niż Cannon.js

### **Shader Development & Debug**
- **leva@^0.9.37**: GUI do debugowania shaderów - live parameter tuning bez rebuild
- **@types/three@^0.170.0**: Pełne TypeScript definitions dla Three.js

### **Advanced Animations**
- **gsap@^3.12.8**: Timeline-based animations - precyzyjna kontrola, complex sequences, performance
- **@gsap/react@^2.1.1**: React integration hooks dla GSAP - useGSAP, useTimeline
- **framer-motion@^11.18.2**: React-native animations - gesture support, layout animations, physics
- **@react-spring/three@^9.7.4**: Spring-based 3D animations - natural motion, interruption handling
- **@react-spring/web@^9.7.4**: Spring animations dla DOM elements - consistent API

### **Styling & Design System**
- **tailwindcss@^3.4.17**: Utility-first CSS - atomic classes, JIT compiler, custom design tokens
- **@tailwindcss/typography**: Typography plugin - prose styles, reading optimization
- **@tailwindcss/forms**: Form styling utilities - consistent form appearance
- **@tailwindcss/aspect-ratio**: Aspect ratio utilities - responsive media objects

### **UI Components - Accessibility First**
- **@radix-ui/* (17 komponentów)**: Unstyled, accessible primitives - focus management, keyboard navigation
- **lucide-react@^0.462.0**: Consistent icon library - SVG icons, tree shaking, customization
- **class-variance-authority@^0.7.1**: Type-safe component variants - conditional styling, theme support
- **clsx@^2.1.1**: Conditional className utility - dynamic styling based on props
- **tailwind-merge@^2.6.0**: Smart className merging - removes duplicates, resolves conflicts

### **State Management**
- **zustand@^5.0.2**: Lightweight state management - TypeScript support, middleware ecosystem, minimal boilerplate

### **Forms & Validation**
- **react-hook-form@^7.61.1**: Performant forms - minimal re-renders, schema validation, field arrays
- **@hookform/resolvers@^3.10.0**: Schema validation integration - Zod, Yup, Joi support
- **zod@^3.25.76**: TypeScript-first schema validation - compile-time type safety

### **Development Tools**
- **vite@^5.4.19**: Fast build tool - HMR, tree shaking, optimized builds
- **@vitejs/plugin-react-swc**: SWC integration - 20x faster than Babel, TypeScript support
- **typescript@^5.8.3**: Type safety - strict mode, advanced TypeScript features
- **eslint@^9.32.0**: Code quality - React hooks rules, TypeScript integration

### **Utilities**
- **date-fns@^3.6.0**: Modern date library - modular, tree-shakeable, locale support
- **cmdk@^1.1.1**: Command palette component - fuzzy search, keyboard navigation
- **sonner@^1.7.4**: Toast notifications - accessible, customizable, promise support

## 4. Performance Optimizations

### **Bundle Splitting**
```javascript
// vite.config.ts - manual chunks dla optimal loading
rollupOptions: {
  output: {
    manualChunks: {
      'three': ['three'],
      'react-three': ['@react-three/fiber', '@react-three/drei'],
      'animations': ['gsap', '@gsap/react', 'framer-motion'],
      'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
      'forms': ['react-hook-form', '@hookform/resolvers']
    }
  }
}
```

### **Memory Management**
- **Automatic cleanup** - Three.js object disposal w React Three Fiber
- **Lazy loading** - dynamic imports dla heavy 3D components
- **Texture optimization** - compressed textures, proper formats (WebP, AVIF)

### **Rendering Optimization**
- **Frustum culling** - automatic culling off-screen objects
- **Level of Detail (LOD)** - reduced geometry dla distant objects  
- **Instanced rendering** - multiple copies same geometry
- **Selective updates** - only animate when necessary

## 5. 3D Carousel Implementation

### **Kluczowe Features**
- **Smooth 60fps animations** - GSAP timelines + React Spring interpolation
- **Depth-based scaling** - objects scale/rotate based on z-position
- **Interactive hotspots** - click/hover zones z feedback
- **Physics integration** - realistic object interactions
- **Shader effects** - custom materials z time-based animations
- **Performance monitoring** - FPS counter, memory usage tracking

### **Shader Pipeline**
- **Vertex shaders** - geometry deformation, morphing effects
- **Fragment shaders** - lighting, colors, transparency
- **Post-processing** - bloom, blur, color grading
- **Live tuning** - Leva GUI dla parameter adjustment

Ta konfiguracja zapewnia kompletny stack dla zaawansowanej 3D carousel z efektami shaderowymi, optymalizowany pod kątem wydajności i developer experience.

# Kompletna Lista Zależności - React 19 + Three.js Karuzela 3D

## Instalacja

```bash
npm install react@^19.0.0 react-dom@^19.0.0 three@^0.170.0 @react-three/fiber@^8.18.6 @react-three/drei@^9.120.7 @react-three/postprocessing@^2.17.4 leva@^0.9.37 gsap@^3.12.8 @gsap/react@^2.1.1 framer-motion@^11.18.2 @react-spring/three@^9.7.4 tailwindcss@^3.4.17 @tailwindcss/typography@^0.5.16 @radix-ui/react-accordion@^1.2.11 @radix-ui/react-dialog@^1.1.14 @radix-ui/react-tooltip@^1.2.7 lucide-react@^0.462.0 zustand@^5.0.2 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^2.6.0 @hookform/resolvers@^3.10.0 react-hook-form@^7.61.1 zod@^3.25.76 date-fns@^3.6.0
```

## package.json

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
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
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
    "globals": "^15.15.0"
  }
}
```

## Uzasadnienie Kluczowych Bibliotek

### 🔧 **Core React Stack**
- **React 19**: Najnowsza wersja z improved performance i nowymi features
- **React DOM 19**: Optymalizacje dla renderowania i hydration

### 🎨 **Three.js Ecosystem**
- **three@^0.170.0**: Core biblioteka 3D - najnowsza wersja z WebGL2 improvements
- **@react-three/fiber@^8.18.6**: React renderer dla Three.js - pozwala na deklaratywne tworzenie 3D
- **@react-three/drei@^9.120.7**: Helper components (OrbitControls, Environment, Text, etc.)
- **@react-three/postprocessing@^2.17.4**: Efekty post-processing (bloom, blur, color grading)
- **@react-three/cannon@^6.9.2**: Fizyka oparta na Cannon.js dla interakcji
- **@react-three/rapier@^1.5.0**: Nowoczesna fizyka 3D (opcjonalna alternatywa)

### 🛠️ **Shader Tools & Debug**
- **leva@^0.9.37**: GUI do debugowania parametrów shaderów w czasie rzeczywistym
- Pozwala na live-tuning uniforms, colors, textures bez rebuild

### 🎭 **Advanced Animations**
- **gsap@^3.12.8**: Timeline-based animations dla kompleksowych sekwencji
- **@gsap/react@^2.1.1**: React integration dla GSAP hooks
- **framer-motion@^11.18.2**: React-native animations z gesture support
- **@react-spring/three@^9.7.4**: Spring-based animations specjalnie dla 3D objects
- **@react-spring/web@^9.7.4**: Spring animations dla DOM elements

### 🎨 **Styling & UI**
- **tailwindcss@^3.4.17**: Utility-first CSS framework
- **@tailwindcss/typography**: Typography plugin dla rich content
- **@tailwindcss/forms**: Form styling utilities
- **@tailwindcss/aspect-ratio**: Aspect ratio utilities

### 🧩 **UI Components**
- **@radix-ui/***: Accessible, unstyled UI primitives
- **lucide-react**: Consistent icon library
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional className utility
- **tailwind-merge**: Smart className merging

### 📝 **Forms & Validation**
- **react-hook-form@^7.61.1**: Performant forms z minimal re-renders
- **@hookform/resolvers@^3.10.0**: Zod integration dla react-hook-form
- **zod@^3.25.76**: TypeScript-first schema validation

### 🔄 **State Management**
- **zustand@^5.0.2**: Lightweight state management z TypeScript support

### 📅 **Utilities**
- **date-fns@^3.6.0**: Modern date utility library
- **cmdk@^1.1.1**: Command palette component
- **sonner@^1.7.4**: Toast notifications

### 🏗️ **Development Tools**
- **vite@^5.4.19**: Fast build tool z hot module replacement
- **@vitejs/plugin-react-swc**: SWC integration dla React
- **typescript@^5.8.3**: Type safety
- **@types/three@^0.170.0**: TypeScript definitions for Three.js

## Konfiguracja Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'gsap': ['gsap', '@gsap/react'],
          'framer': ['framer-motion']
        }
      }
    }
  }
})
```

## Kluczowe Funkcjonalności

1. **3D Carousel**: Smooth transitions między elementami z depth effects
2. **Shader Effects**: Custom vertex/fragment shaders dla unique visual effects
3. **Physics Integration**: Realistic object interactions i collisions
4. **Performance**: Lazy loading, memoization, i optimized rendering
5. **Responsive Design**: Adaptive layouts dla różnych screen sizes
6. **Accessibility**: Keyboard navigation i screen reader support

## Performance Optimizations

- **Lazy loading** dla 3D assets
- **LOD (Level of Detail)** dla distant objects
- **Frustum culling** dla off-screen objects
- **Texture compression** i proper formats
- **WebGL context management** z proper cleanup

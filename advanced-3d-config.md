# Dodatkowa Konfiguracja - React 19 + Three.js

## tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'rotate-3d': 'rotate-3d 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'rotate-3d': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      perspective: {
        '2000': '2000px',
        '3000': '3000px',
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
}

export default config
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable", "ES2020.Promise"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    },

    /* Three.js specific */
    "types": ["vite/client", "@types/three"]
  },
  "include": ["src", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Three.js Shader Examples

### Custom Shader Material

```typescript
// src/shaders/customShader.ts
export const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uAmplitude;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    
    vec3 newPosition = position;
    
    // Wave displacement
    float wave = sin(position.x * 3.0 + uTime * 2.0) * uAmplitude;
    newPosition.z += wave;
    
    // Scale effect based on progress
    newPosition *= mix(0.5, 1.0, uProgress);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const fragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    // Fresnel effect
    float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
    fresnel = pow(fresnel, 2.0);
    
    // Animated glow
    float glow = sin(uTime * 2.0) * 0.5 + 0.5;
    
    vec3 finalColor = mix(uColor, uGlowColor, fresnel * glow);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
```

### Particle System Component

```typescript
// src/components/ParticleSystem.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  count: number;
  radius?: number;
  speed?: number;
}

export const ParticleSystem = ({ 
  count = 1000, 
  radius = 10, 
  speed = 0.01 
}: ParticleSystemProps) => {
  const mesh = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random position in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius * Math.cbrt(Math.random());
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      
      // Random color
      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();
      
      // Random size
      sizes[i] = Math.random() * 2 + 1;
    }
    
    return { positions, colors, sizes };
  }, [count, radius]);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += speed;
      mesh.current.rotation.x += speed * 0.5;
    }
  });
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={particles.colors}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={particles.sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
```

## Performance Monitoring

### FPS Monitor Component

```typescript
// src/components/FPSMonitor.tsx
import { useEffect, useState } from 'react';

export const FPSMonitor = () => {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }, []);
  
  return (
    <div className="fixed top-4 right-4 z-50 px-3 py-1 bg-black/80 text-white rounded-lg text-sm">
      FPS: {fps}
    </div>
  );
};
```

## State Management Example

```typescript
// src/store/use3DStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface 3DState {
  // Scene state
  isLoaded: boolean;
  currentModel: string | null;
  selectedObject: string | null;
  
  // Animation state
  isAnimating: boolean;
  animationProgress: number;
  
  // Performance
  renderDistance: number;
  particleCount: number;
  
  // Actions
  setLoaded: (loaded: boolean) => void;
  setCurrentModel: (model: string | null) => void;
  setSelectedObject: (object: string | null) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  setAnimationProgress: (progress: number) => void;
  setRenderDistance: (distance: number) => void;
  setParticleCount: (count: number) => void;
}

export const use3DStore = create<3DState>()(
  subscribeWithSelector((set) => ({
    isLoaded: false,
    currentModel: null,
    selectedObject: null,
    isAnimating: false,
    animationProgress: 0,
    renderDistance: 50,
    particleCount: 1000,
    
    setLoaded: (loaded) => set({ isLoaded: loaded }),
    setCurrentModel: (model) => set({ currentModel: model }),
    setSelectedObject: (object) => set({ selectedObject: object }),
    startAnimation: () => set({ isAnimating: true }),
    stopAnimation: () => set({ isAnimating: false }),
    setAnimationProgress: (progress) => set({ animationProgress: progress }),
    setRenderDistance: (distance) => set({ renderDistance: distance }),
    setParticleCount: (count) => set({ particleCount: count }),
  }))
);
```

## Error Boundary for 3D

```typescript
// src/components/ErrorBoundary3D.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary3D extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Błąd ładowania 3D
            </h3>
            <p className="text-gray-600 mb-4">
              Spróbuj odświeżyć stronę
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Odśwież
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

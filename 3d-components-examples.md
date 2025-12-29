# Przykłady Implementacji Komponentów 3D

## Podstawowy Setup Three.js Scene

```typescript
// src/components/ThreeScene.tsx
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Loader } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { ErrorBoundary3D } from './ErrorBoundary3D';

interface ThreeSceneProps {
  children: React.ReactNode;
  camera?: [number, number, number];
  enablePhysics?: boolean;
}

export const ThreeScene = ({ 
  children, 
  camera = [0, 0, 10],
  enablePhysics = false 
}: ThreeSceneProps) => {
  return (
    <ErrorBoundary3D>
      <div className="w-full h-full">
        <Canvas
          camera={{ position: camera, fov: 75 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          dpr={[1, 2]}
          shadows
        >
          <Suspense fallback={null}>
            {enablePhysics ? (
              <Physics gravity={[0, 0, 0]}>
                {children}
              </Physics>
            ) : children}
          </Suspense>
          <Loader />
        </Canvas>
      </div>
    </ErrorBoundary3D>
  );
};
```

## 3D Carousel Component

```typescript
// src/components/carousel/Carousel3D.tsx
import { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Environment } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface CarouselItem {
  id: string;
  title: string;
  image: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

interface Carousel3DProps {
  items: CarouselItem[];
  activeIndex: number;
  onItemClick: (index: number) => void;
  radius?: number;
  itemCount?: number;
}

export const Carousel3D = ({ 
  items, 
  activeIndex, 
  onItemClick,
  radius = 8,
  itemCount = 8
}: Carousel3DProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Precompute positions in circle
  const positions = useMemo(() => {
    return items.map((_, index) => {
      const angle = (index / itemCount) * Math.PI * 2;
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ] as [number, number, number];
    });
  }, [items.length, radius, itemCount]);

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth rotation to active item
      const targetRotation = -((activeIndex / itemCount) * Math.PI * 2);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <Environment preset="studio" />
      
      {items.map((item, index) => {
        const position = positions[index];
        const isActive = index === activeIndex;
        const isHovered = index === hoveredIndex;
        const distance = Math.abs(index - activeIndex);
        const normalizedDistance = Math.min(distance, itemCount - distance);
        
        return (
          <CarouselItem
            key={item.id}
            item={item}
            position={position}
            isActive={isActive}
            isHovered={isHovered}
            normalizedDistance={normalizedDistance}
            onClick={() => onItemClick(index)}
            onHover={() => setHoveredIndex(index)}
            onUnhover={() => setHoveredIndex(null)}
          />
        );
      })}
    </group>
  );
};

const CarouselItem = ({
  item,
  position,
  isActive,
  isHovered,
  normalizedDistance,
  onClick,
  onHover,
  onUnhover
}: {
  item: CarouselItem;
  position: [number, number, number];
  isActive: boolean;
  isHovered: boolean;
  normalizedDistance: number;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const { scale, rotation } = useSpring({
    scale: isActive ? 1.2 : isHovered ? 1.1 : Math.max(0.6, 1 - normalizedDistance * 0.2),
    rotation: isActive ? [0, 0, 0] : [0, Math.PI * 0.1, 0],
    config: { tension: 300, friction: 30 }
  });

  return (
    <animated.group position={position} scale={scale} rotation={rotation}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onHover}
        onPointerOut={onUnhover}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial 
          map={useLoader(THREE.TextureLoader, item.image)}
          transparent
          opacity={Math.max(0.3, 1 - normalizedDistance * 0.3)}
        />
      </mesh>
      
      <Text
        position={[0, -2.2, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        visible={normalizedDistance < 2}
      >
        {item.title}
      </Text>
    </animated.group>
  );
};
```

## Particle Background z Shaderami

```typescript
// src/components/particles/ParticleField.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const particleVertexShader = `
  uniform float uTime;
  uniform float uSize;
  uniform float uSpeed;
  
  attribute float aSize;
  attribute float aRandom;
  
  varying float vRandom;
  
  void main() {
    vRandom = aRandom;
    
    vec3 pos = position;
    
    // Add some movement
    pos.x += sin(uTime * uSpeed + aRandom) * 2.0;
    pos.y += cos(uTime * uSpeed * 0.7 + aRandom) * 1.5;
    pos.z += sin(uTime * uSpeed * 0.3 + aRandom) * 1.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uTime;
  
  varying float vRandom;
  
  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
    
    // Color variation
    vec3 color = mix(uColor1, uColor2, vRandom + sin(uTime + vRandom) * 0.5);
    
    gl_FragColor = vec4(color, alpha * 0.6);
  }
`;

export const ParticleField = ({ 
  count = 2000, 
  radius = 20,
  color1 = "#ff6b6b",
  color2 = "#4ecdc4"
}: {
  count?: number;
  radius?: number;
  color1?: string;
  color2?: string;
}) => {
  const meshRef = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random position in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius * Math.cbrt(Math.random());
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      
      sizes[i] = Math.random() * 2 + 1;
      randoms[i] = Math.random();
    }
    
    return { positions, sizes, randoms };
  }, [count, radius]);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: 1 },
    uSpeed: { value: 0.5 },
    uColor1: { value: new THREE.Color(color1) },
    uColor2: { value: new THREE.Color(color2) }
  }), [color1, color2]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
      
      // Update shader uniform
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={particles.sizes}
          count={count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          array={particles.randoms}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
```

## Interactive 3D Gallery Grid

```typescript
// src/components/gallery/InteractiveGallery.tsx
import { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  description: string;
  position: [number, number, number];
}

interface InteractiveGalleryProps {
  items: GalleryItem[];
  onItemSelect: (item: GalleryItem) => void;
}

export const InteractiveGallery = ({ items, onItemSelect }: InteractiveGalleryProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  
  useFrame(() => {
    if (groupRef.current) {
      // Subtle camera follow
      camera.lookAt(groupRef.current.position);
    }
  });
  
  return (
    <group ref={groupRef}>
      {items.map((item, index) => (
        <GalleryItemCard
          key={item.id}
          item={item}
          index={index}
          isHovered={hoveredItem === item.id}
          onHover={() => setHoveredItem(item.id)}
          onUnhover={() => setHoveredItem(null)}
          onClick={() => onItemSelect(item)}
        />
      ))}
    </group>
  );
};

const GalleryItemCard = ({
  item,
  index,
  isHovered,
  onHover,
  onUnhover,
  onClick
}: {
  item: GalleryItem;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  
  const { scale, position } = useSpring({
    scale: isHovered ? 1.2 : 1,
    position: hovered ? [0, 0.5, 0] : [0, 0, 0],
    config: { tension: 300, friction: 30 }
  });
  
  // Calculate grid position
  const cols = Math.ceil(Math.sqrt(items.length));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = (col - cols / 2) * 4;
  const z = (row - Math.ceil(items.length / cols) / 2) * 4;
  
  return (
    <animated.group 
      position={[x, 0, z]} 
      scale={scale}
      position-y={position.y}
    >
      <animated.mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          onHover();
        }}
        onPointerOut={() => {
          setHovered(false);
          onUnhover();
        }}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial 
          map={useLoader(THREE.TextureLoader, item.image)}
          transparent
          roughness={0.1}
          metalness={0.1}
        />
      </animated.mesh>
      
      {/* Title overlay */}
      <Text
        position={[0, -2.5, 0.1]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        visible={isHovered}
      >
        {item.title}
      </Text>
      
      {/* Info popup */}
      {isHovered && (
        <Html position={[0, 0, 0.1]} center>
          <div className="bg-black/80 text-white p-4 rounded-lg max-w-xs">
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-gray-300">{item.description}</p>
            <button 
              onClick={onClick}
              className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Zobacz więcej
            </button>
          </div>
        </Html>
      )}
    </animated.group>
  );
};
```

## Shader-Based Morphing Effect

```typescript
// src/components/shaders/MorphingSphere.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const morphVertexShader = `
  uniform float uTime;
  uniform float uMorph;
  uniform float uAmplitude;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // 3D noise function
  vec3 random3(vec3 c) {
    return fract(sin(vec3(
      dot(c, vec3(1.0, 57.0, 113.0)),
      dot(c, vec3(57.0, 113.0, 1.0)),
      dot(c, vec3(113.0, 1.0, 57.0))
    )) * 43758.5453);
  }
  
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(
        mix(dot(random3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
            dot(random3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
        mix(dot(random3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
            dot(random3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
      mix(
        mix(dot(random3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
            dot(random3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
        mix(dot(random3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0,

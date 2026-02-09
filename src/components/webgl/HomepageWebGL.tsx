/**
 * HOMEPAGE WEBGL - OPTIMIZED
 * Lekki efekt wizualny z Three.js dla lepszej wydajności
 */

import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

function VelocityOverlay() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Uproszczony materiał shader
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uVelocity;
        
        void main() {
          float v = clamp(abs(uVelocity), 0.0, 5.0);
          float noise = sin(vUv.x * 10.0 + uTime) * cos(vUv.y * 10.0 + uTime) * 0.1;
          vec3 color = vec3(noise * 0.1);
          float alpha = v * 0.05;
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    const velocityStr = getComputedStyle(document.documentElement)
      .getPropertyValue('--scroll-velocity') || '0';
    const velocity = parseFloat(velocityStr);
    
    // Płynne przejście prędkości
    mat.uniforms.uVelocity.value += (velocity - mat.uniforms.uVelocity.value) * 0.1;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}

export function HomepageWebGL() {
  const isMobile = window.innerWidth < 768;
  
  // Sprawdzenie WebGL
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl || isMobile) {
    return null;
  }

  return (
    <Canvas
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      className="pointer-events-none fixed inset-0 z-[2]"
      style={{ mixBlendMode: 'screen' }}
    >
      <VelocityOverlay />
    </Canvas>
  );
}

export default HomepageWebGL;
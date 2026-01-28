import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MotionValue } from "framer-motion";

// Deterministyczny generator liczb losowych (Mulberry32) – brak Math.random w renderze
const createRng = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const PARTICLE_COUNT = 10000;

const CosmicBackground = () => {
  const pointsRef = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const rng = createRng(1337);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const colorGold = new THREE.Color("#FFD700");
    const colorWhite = new THREE.Color("#FFFFFF");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Logic from xxx.ts createCosmicBackground
      // radius = 80 + Math.random() * 50;
      const radius = 60 + rng() * 80;
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color: White and Gold
      const isGold = rng() > 0.8; // 20% Gold, 80% White for background stars
      const color = isGold ? colorGold : colorWhite;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Tiny particles - jeszcze mniejsze
      sizes[i] = rng() * 0.05 + 0.005;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particles.sizes, 1]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012} // Jeszcze mniejsze gwiazdy tła
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const PortalRing = ({ scrollProgress }: { scrollProgress: MotionValue<number> }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const PARTICLE_COUNT = 20000; // Increased for visibility
  const TUNNEL_LENGTH = 100;
  const TUNNEL_RADIUS = 12; // Slightly tighter tunnel

  const particles = useMemo(() => {
    const rng = createRng(2025);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const initialZ = new Float32Array(PARTICLE_COUNT);

    const colorGold = new THREE.Color("#FFD700");
    const colorWhite = new THREE.Color("#FFFFFF");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Cylinder / Tunnel distribution
      const theta = rng() * Math.PI * 2;
      // Random radius with some variation to give depth to the tunnel walls
      const r = TUNNEL_RADIUS + (rng() - 0.5) * 4; 
      
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      // Spread particles along the tunnel length (Z axis)
      const z = (rng() - 1) * TUNNEL_LENGTH; // -100 to 0

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      initialZ[i] = z;

      // Ring: 80% Gold, 20% White
      const isGold = rng() > 0.3; // More gold for visibility
      const color = isGold ? colorGold : colorWhite;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = rng() * 0.03 + 0.005; // Jeszcze mniejsze cząsteczki tunelu
    }

    return { positions, colors, sizes, initialZ };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Rotate the entire tunnel slowly
      pointsRef.current.rotation.z -= 0.001;

      // Sync with scroll:
      // - karty w TimeTunnel lecą "do przodu"
      // - ściany tunelu przesuwamy w przeciwną stronę, żeby wzmocnić efekt
      const scroll = scrollProgress.get(); // 0 to 1
      const travelDistance = 400; // Total travel distance (szybsze tło przy dłuższym locie)
      const offset = scroll * travelDistance; // odwrócenie kierunku ruchu cząsteczek

      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const maxZ = 5; // Camera Z
      const L = TUNNEL_LENGTH;
      const minZ = maxZ - L;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const baseZ = particles.initialZ[i];
        let z = baseZ + offset;
        
        // Wrap logic
        while (z > maxZ) z -= L;
        while (z < minZ) z += L;

        positions[i * 3 + 2] = z;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particles.sizes, 1]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.016} // Smukłe drobne cząsteczki w tunelu
        vertexColors
        transparent
        opacity={1.0} // Fully opaque for better visibility
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const TunnelCamera = ({ scrollProgress }: { scrollProgress: MotionValue<number> }) => {
  useFrame(({ camera }) => {
    const t = scrollProgress.get(); // 0-1

    // Delay wejścia do tunelu, żeby był dalej
    const startDelay = 0.12;
    const normalized = Math.max((t - startDelay) / (1 - startDelay), 0);

    const startZ = 200;    // dalej od tunelu
    const endZ = -2000;    // znacznie głębiej w tunelu (dłuższy lot)
    const zPos = THREE.MathUtils.lerp(startZ, endZ, normalized);
    camera.position.set(0, 0, zPos);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

interface CosmicPortalProps {
  scrollProgress: MotionValue<number>;
}

const CosmicPortal = ({ scrollProgress }: CosmicPortalProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-5 bg-black">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: false, 
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0a0015"]} />
        <fogExp2 attach="fog" args={["#0a0015", 0.02]} />
       
        <TunnelCamera scrollProgress={scrollProgress} />

        <ambientLight intensity={0.2} color="#330066" />
        <directionalLight position={[10, 10, 5]} intensity={0.6} color="#ffffff" />
        <pointLight position={[0, 0, 0]} intensity={0.8} distance={20} color="#FFD700" />
        
        {/* We keep CosmicBackground for deep space feeling */}
        <CosmicBackground />
        
        {/* The main warp tunnel */}
        <PortalRing scrollProgress={scrollProgress} />
        
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            height={300} 
            intensity={1.2} 
            radius={0.7} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default CosmicPortal;

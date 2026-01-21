/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration,
  Vignette,
  Noise
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

interface TunnelRingProps {
  radius: number;
  depth: number;
  scrollProgress: number;
  index: number;
}

function TunnelRing({ radius, depth, scrollProgress, index }: TunnelRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color("#d4af37") },
        uOpacity: { value: 0.6 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float uTime;
        uniform float uProgress;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          float wave = sin(uTime * 0.5 + position.x * 2.0) * 0.1;
          pos.z += wave * (1.0 - uProgress);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float uTime;
        uniform float uProgress;
        uniform vec3 uColor;
        uniform float uOpacity;
        
        void main() {
          float glow = sin(uTime * 2.0 + vUv.x * 10.0) * 0.5 + 0.5;
          float alpha = uOpacity * (0.3 + glow * 0.4);
          
          vec3 finalColor = uColor * (1.0 + glow * 0.5);
          
          gl_FragColor = vec4(finalColor, alpha * (1.0 - abs(uProgress - 0.5) * 1.5));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uProgress.value = scrollProgress;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1 + index * 0.2;
      const targetZ = -depth + scrollProgress * depth * 2;
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetZ,
        0.05
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -depth]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

interface ParticleFieldProps {
  count: number;
  scrollProgress: number;
}

function ParticleField({ count, scrollProgress }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    const goldColor = new THREE.Color("#d4af37");
    const whiteColor = new THREE.Color("#ffffff");
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 8;
      
      pos[i3] = Math.cos(theta) * radius;
      pos[i3 + 1] = Math.sin(theta) * radius;
      pos[i3 + 2] = (Math.random() - 0.5) * 40;
      
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 2] = -0.05 - Math.random() * 0.1;
      
      const mixRatio = Math.random();
      const color = goldColor.clone().lerp(whiteColor, mixRatio * 0.3);
      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;
    }
    
    return [pos, vel, col];
  }, [count]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute vec3 aVelocity;
        attribute vec3 aColor;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        uniform float uTime;
        uniform float uProgress;
        uniform float uPixelRatio;
        
        void main() {
          vColor = aColor;
          
          vec3 pos = position;
          pos += aVelocity * uTime * 10.0;
          
          pos.z = mod(pos.z + uProgress * 40.0, 40.0) - 20.0;
          
          float distanceFromCenter = length(pos.xy);
          float tunnelEffect = smoothstep(10.0, 2.0, distanceFromCenter);
          
          vAlpha = tunnelEffect * (0.5 + sin(uTime + pos.z * 0.5) * 0.3);
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (3.0 + tunnelEffect * 4.0) * uPixelRatio * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
          if (distanceFromCenter > 0.5) discard;
          
          float glow = 1.0 - distanceFromCenter * 2.0;
          glow = pow(glow, 2.0);
          
          gl_FragColor = vec4(vColor * (1.0 + glow * 0.5), vAlpha * glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uProgress.value = scrollProgress;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aVelocity"
          count={count}
          array={velocities}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  );
}

interface GoldenOrbsProps {
  scrollProgress: number;
}

function GoldenOrbs({ scrollProgress }: GoldenOrbsProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const orbs = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        Math.sin(i * Math.PI * 0.25) * 6,
        Math.cos(i * Math.PI * 0.25) * 6,
        -5 - i * 3,
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.4,
    }));
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.position.z = orbs[i].position[2] + scrollProgress * 30;
        mesh.position.z = ((mesh.position.z + 30) % 30) - 15;
        
        const material = mesh.material as THREE.MeshStandardMaterial;
        const pulse = Math.sin(state.clock.elapsedTime * 2 + i) * 0.5 + 0.5;
        material.emissiveIntensity = 0.5 + pulse * 1.5;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position} scale={orb.scale}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#d4af37"
            emissive="#d4af37"
            emissiveIntensity={1}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

interface TunnelSceneProps {
  scrollProgress: number;
}

function TunnelScene({ scrollProgress }: TunnelSceneProps) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, -10);
  }, [camera]);

  useFrame((state) => {
    const wobbleX = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    const wobbleY = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    camera.position.x = wobbleX;
    camera.position.y = wobbleY;
    
    const targetZ = 5 - scrollProgress * 3;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
  });

  const rings = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      radius: 3 + i * 0.5,
      depth: 5 + i * 2,
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#d4af37" />
      <pointLight position={[0, 0, -10]} intensity={1} color="#ffffff" />
      
      {rings.map((ring, i) => (
        <TunnelRing
          key={i}
          radius={ring.radius}
          depth={ring.depth}
          scrollProgress={scrollProgress}
          index={i}
        />
      ))}
      
      <ParticleField count={2000} scrollProgress={scrollProgress} />
      <GoldenOrbs scrollProgress={scrollProgress} />
      
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.002, 0.002)}
        />
        <Vignette
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise
          opacity={0.05}
          blendFunction={BlendFunction.OVERLAY}
        />
      </EffectComposer>
    </>
  );
}

interface WebGLTunnelProps {
  scrollProgress: number;
  className?: string;
}

export default function WebGLTunnel({ scrollProgress, className = "" }: WebGLTunnelProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 100 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <TunnelScene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}

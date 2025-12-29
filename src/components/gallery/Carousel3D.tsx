/**
 * Karuzela 3D z Three.js
 * - Dynamiczne ładowanie championów z hooka useChampions
 * - Fizyka momentum scrolling
 * - Kolorystyka zgodna z paletą projektu (gold/primary/navy)
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, useCursor, Stats, RoundedBox } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useChampions, type Champion } from '@/hooks/useChampions';
import { useMomentumScroll } from '@/hooks/useMomentumScroll';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// Komponent do ładowania tekstury z fallbackiem - używa CanvasTexture (mniej obciążające dla GPU)
const ChampionImage = React.memo(({ imageUrl, width, height }: { imageUrl: string; width: number; height: number }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      console.warn('[ChampionImage] No imageUrl provided');
      return;
    }

    let mounted = true;
    const loader = new THREE.TextureLoader();
    
    // Nie ustawiaj CORS dla lokalnych zasobów - problem z spacjami w URL
    if (!imageUrl.startsWith('/')) {
      loader.setCrossOrigin('anonymous');
    }

    console.log('[ChampionImage] Loading texture:', imageUrl);

    loader.load(
      imageUrl,
      (tex) => {
        if (!mounted) {
          console.log(`[TextureLoader] Unmounted before texture loaded for: ${imageUrl}`);
          tex.dispose();
          return;
        }
        console.log(`[TextureLoader] SUCCESS for: ${imageUrl}`, tex);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.error(`[TextureLoader] ERROR for: ${imageUrl}`, err);
      }
    );
    
    return () => {
      mounted = false;
    };
  }, [imageUrl]);

  // Render ONLY texture when loaded, nothing while loading
  if (!texture) {
    console.warn('[ChampionImage] WAITING FOR TEXTURE:', imageUrl);
    return null; // Return null instead of fallback mesh
  }

  console.log('[ChampionImage] RENDERING TEXTURE:', imageUrl);
  return (
    <mesh position={[0, 0.5, 0.02]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
});;

// Pojedyncza karta 3D w karuzeli
interface Card3DProps {
  champion: Champion;
  index: number;
  totalCards: number;
  scrollPosition: number;
  isActive: boolean;
  onClick: (index: number) => void;
}

const Card3D = React.memo(({ champion, index, totalCards, scrollPosition, isActive, onClick }: Card3DProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  
  const cardBg = '#0d1117';
  const cardWidth = 5.5;
  const gap = 0.8;
  const totalWidth = (cardWidth + gap) * totalCards;
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const baseX = index * (cardWidth + gap) - scrollPosition * 0.01;
    let wrappedX = baseX % totalWidth;
    if (wrappedX < -totalWidth / 2) wrappedX += totalWidth;
    if (wrappedX > totalWidth / 2) wrappedX -= totalWidth;
    
    const distanceFromCenter = Math.abs(wrappedX);
    const normalizedDistance = Math.min(distanceFromCenter / (cardWidth * 2), 1);
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, wrappedX, 0.1);
    const targetZ = -normalizedDistance * 2;
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ + (hovered ? 0.5 : 0), 0.1);
    
    const targetRotY = -wrappedX * 0.08;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.1);
    
    const scale = 1 - normalizedDistance * 0.3 + (hovered ? 0.05 : 0);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scale, 0.1));
    
    if (isActive) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });
  
  return (
    <group
      ref={meshRef}
      onClick={() => onClick(index)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Światło dla zewnętrznej ramki */}
      <directionalLight position={[2, 2, 3]} intensity={20} color="#ffffff" />
      
      {/* Tło karty z zaokrąglonymi narożnikami */}
      <RoundedBox position={[0, 0, -0.01]} args={[cardWidth, 5.6, 0.01]} radius={0.12}>
        <meshBasicMaterial color="#1a1a2e" />
      </RoundedBox>
      
      {/* Zdjęcie championa */}
      <mesh 
        position={[0, 0.5, 0.02]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedChampionId(champion.id);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[cardWidth - 0.1, 4.5]} />
        <meshBasicMaterial map={new THREE.TextureLoader().load(champion.image)} />
      </mesh>
      
      {/* Złota krawędź - lewa */}
      <mesh position={[-(cardWidth/2) - 0.025, 0, 0.02]}>
        <planeGeometry args={[0.015, 5.6]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      <mesh position={[cardWidth/2 + 0.025, 0, 0.02]}>
        <planeGeometry args={[0.015, 5.6]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      
      {/* Złota krawędź - górna */}
      <mesh position={[0, 5.6/2 + 0.025, 0.02]}>
        <planeGeometry args={[cardWidth + 0.05, 0.015]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      
      {/* Złota krawędź - dolna */}
      <mesh position={[0, -(5.6/2) - 0.025, 0.02]}>
        <planeGeometry args={[cardWidth + 0.05, 0.015]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>

      {/* Druga ramka wewnętrzna */}
      {/* Złota krawędź wewnętrzna - lewa */}
      <mesh position={[-(cardWidth/2) + 0.025, 0, 0.02]}>
        <planeGeometry args={[0.015, 5.6 - 0.05]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      <mesh position={[cardWidth/2 - 0.025, 0, 0.02]}>
        <planeGeometry args={[0.015, 5.6 - 0.05]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      
      {/* Złota krawędź wewnętrzna - górna */}
      <mesh position={[0, 5.6/2 - 0.025, 0.02]}>
        <planeGeometry args={[cardWidth - 0.05, 0.015]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      
      {/* Złota krawędź wewnętrzna - dolna */}
      <mesh position={[0, -(5.6/2) + 0.025, 0.02]}>
        <planeGeometry args={[cardWidth - 0.05, 0.015]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      

      {/* Turkusowy pasek pod zdjęciem */}
      <mesh position={[0, -2.35, 0.01]}>
        <planeGeometry args={[cardWidth - 0.03, 0.9]} />
        <meshBasicMaterial color="#1dd4d4" transparent opacity={0.2} alphaTest={0.1} />
      </mesh>
      
      {/* Złota obramowka kółka */}
      <mesh position={[0, -2.3, 0.01]}>
        <circleGeometry args={[0.26, 32]} />
        <meshBasicMaterial color="#1dd4d4" />
      </mesh>
      
      {/* Kółko dla ikony */}
      <mesh 
        position={[0, -2.3, 0.015]}
        onClick={(e) => {
          e.stopPropagation();
          window.open(`/champions/${champion.id}/pedigree`, '_blank');
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      >
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Link do rodowoodu - ikona kartki */}
      <Text position={[0, -2.3, 0.02]} fontSize={0.16} color="#1dd4d4" anchorX="center" anchorY="middle">
        📄
      </Text>
    </group>
  );
});

// Główny komponent karuzeli
export const Carousel3D = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { champions, loading, error } = useChampions();
  
  const { position, handlers, addImpulse } = useMomentumScroll({
    friction: 0.95,
    sensitivity: 0.5,
  });
  
  const cardWidth = 5.5;
  const gap = 0.8;
  const cardSpacing = cardWidth + gap;

  const handlePrev = useCallback(() => {
    const newIndex = (activeIndex - 1 + champions.length) % champions.length;
    const targetPosition = -newIndex * cardSpacing * 100;
    const impulse = targetPosition - position;
    setActiveIndex(newIndex);
    addImpulse(impulse * 0.1);
  }, [activeIndex, champions.length, position, addImpulse]);
  
  const handleNext = useCallback(() => {
    const newIndex = (activeIndex + 1) % champions.length;
    const targetPosition = -newIndex * cardSpacing * 100;
    const impulse = targetPosition - position;
    setActiveIndex(newIndex);
    addImpulse(impulse * 0.1);
  }, [activeIndex, champions.length, position, addImpulse]);
  const handleCardClick = useCallback((index: number) => setActiveIndex(index), []);
  
  if (loading) {
    return (
      <section className="relative py-24 overflow-hidden section-surface" style={{ background: 'transparent' }}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <span className="ml-3 text-muted-foreground">Ładowanie championów...</span>
        </div>
      </section>
    );
  }

  if (error || champions.length === 0) {
    return null;
  }
  
  return (
    <section className="relative py-24 overflow-hidden section-surface" style={{ background: 'transparent' }}>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-20" />
      
      <div className="text-center mb-16 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1 border border-primary/30 rounded-full text-xs tracking-[0.2em] text-primary/70 uppercase mb-4"
        >
          Karuzela 3D
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold font-display gold-text mb-4"
        >
          Champions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-xl mx-auto"
        >
          Przeglądaj naszą kolekcję w interaktywnej karuzeli 3D z fizyką momentum
        </motion.p>
      </div>
      
      <div ref={containerRef} className="relative h-[600px] cursor-grab active:cursor-grabbing" {...handlers}>
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 50 }} 
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
          onError={(error) => {
            console.error('Canvas error:', error);
          }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#1f6feb" />
          {champions.map((champion, index) => (
            <Card3D
              key={champion.id}
              champion={champion}
              index={index}
              totalCards={champions.length}
              scrollPosition={position}
              isActive={index === activeIndex}
              onClick={handleCardClick}
            />
          ))}
        </Canvas>
        
        {/* Modal powiększonego zdjęcia */}
        {selectedChampionId && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setSelectedChampionId(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={champions.find(c => c.id === selectedChampionId)?.image}
                alt="Champion"
                className="w-full h-full object-contain rounded-3xl gold-border"
              />
              <button
                className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors"
                onClick={() => setSelectedChampionId(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={handlePrev}
          aria-label="Poprzedni"
          className="absolute left-4 md:left-20 top-1/2 -translate-y-1/2 z-50 p-4 bg-card/80 backdrop-blur-sm rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Następny"
          className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 z-50 p-4 bg-card/80 backdrop-blur-sm rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default Carousel3D;

/**
 * Karuzela 3D z Three.js
 * - Dynamiczne ładowanie championów z hooka useChampions
 * - Fizyka momentum scrolling
 * - Kolorystyka zgodna z paletą projektu (gold/primary/navy)
 */
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, useCursor, Stats, RoundedBox } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useChampions, type Champion } from '@/hooks/useChampions';
import { useMomentumScroll } from '@/hooks/useMomentumScroll';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { PedigreeModal } from './PedigreeModal';

const SITE_BACKGROUND_COLOR = '#090e1a';
const SITE_BACKGROUND_ACCENT = '#0e1525';
const SITE_BACKGROUND_SOFT = '#060910';
const SITE_GOLD_ACCENT = '#f0d060';

// Komponent do ładowania tekstury z fallbackiem - używa CanvasTexture (mniej obciążające dla GPU)
const ChampionImage = React.memo(({ imageUrl, width, height, onImageClick }: { imageUrl: string; width: number; height: number; onImageClick?: () => void }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    let mounted = true;
    const loader = new THREE.TextureLoader();
    
    // Nie ustawiaj CORS dla lokalnych zasobów - problem z spacjami w URL
    if (!imageUrl.startsWith('/')) {
      loader.setCrossOrigin('anonymous');
    }

    loader.load(
      imageUrl,
      (tex) => {
        if (!mounted) {
          tex.dispose();
          return;
        }
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
    return null; // Return null instead of fallback mesh
  }

  return (
    <mesh position={[0, 0.55, 0.02]} onClick={onImageClick}>
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
  onImageClick: (championId: string) => void;
  onPedigreeClick: (pedigreeUrl: string) => void;
}

const Card3D = React.memo(({ champion, index, totalCards, scrollPosition, isActive, onClick, onImageClick, onPedigreeClick }: Card3DProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const barGradientTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(9, 14, 26, 0)');
    gradient.addColorStop(0.35, 'rgba(9, 14, 26, 0.35)');
    gradient.addColorStop(0.7, 'rgba(6, 9, 16, 0.7)');
    gradient.addColorStop(1, 'rgba(6, 9, 16, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      barGradientTexture?.dispose();
    };
  }, [barGradientTexture]);
  
  const cardBg = '#000000';
  const cardWidth = 6.9;
  const gap = 0.8;
  const totalWidth = (cardWidth + gap) * totalCards;
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Normal carousel mode
    const baseX = index * (cardWidth + gap) - scrollPosition * 0.01;
    let wrappedX = baseX % totalWidth;
    if (wrappedX < -totalWidth / 2) wrappedX += totalWidth;
    if (wrappedX > totalWidth / 2) wrappedX -= totalWidth;
    
    const distanceFromCenter = Math.abs(wrappedX);
    const normalizedDistance = Math.min(distanceFromCenter / (cardWidth * 2), 1);
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, wrappedX, 0.1);
    const targetZ = -normalizedDistance * 10;
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ + (hovered ? 0.5 : 0), 0.1);
    
    const targetRotY = -wrappedX * 0.08;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.1);
    
    const scale = 1 - normalizedDistance * 0.3 + (hovered ? 0.06 : 0);
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
      <RoundedBox position={[0, 0, -0.01]} args={[cardWidth, 6.0, 0.01]} radius={0.12}>
        <meshBasicMaterial color="#000000" />
      </RoundedBox>
      
        {/* Zdjęcie championa */}
        <ChampionImage 
          imageUrl={champion.image} 
          width={cardWidth - 0.1} 
          height={4.7}
          onImageClick={() => onImageClick(champion.id)}
        />
      
      {/* Złota krawędź - lewa */}
      <mesh position={[-(cardWidth/2) - 0.025, 0, 0.02]}>
        <planeGeometry args={[0.015, 6.0]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      <mesh position={[cardWidth/2 + 0.025, 0, 0.02]}>
        <planeGeometry args={[0.015, 6.0]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      
      {/* Złota krawędź - górna */}
      <mesh position={[0, 6.0/2 + 0.025, 0.02]}>
        <planeGeometry args={[cardWidth + 0.05, 0.015]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      
      {/* Złota krawędź - dolna */}
      <mesh position={[0, -(6.0/2) - 0.025, 0.02]}>
        <planeGeometry args={[cardWidth + 0.05, 0.015]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>

      {/* Narożniki zewnętrznej ramki - półokrągłe */}
      <mesh position={[-(cardWidth/2) - 0.018, 6.0/2 + 0.018, 0.02]}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      <mesh position={[cardWidth/2 + 0.018, 6.0/2 + 0.018, 0.02]}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      <mesh position={[-(cardWidth/2) - 0.018, -(6.0/2) - 0.018, 0.02]}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>
      <mesh position={[cardWidth/2 + 0.018, -(6.0/2) - 0.018, 0.02]}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial color="#f0d060" />
      </mesh>

      {/* Druga ramka wewnętrzna */}
      {/* Złota krawędź wewnętrzna - lewa */}
      <mesh position={[-(cardWidth/2) + 0.025, 0, 0.02]}>
        <planeGeometry args={[0.015, 6.0 - 0.05]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      <mesh position={[cardWidth/2 - 0.025, 0, 0.02]}>
        <planeGeometry args={[0.015, 6.0 - 0.05]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      
      {/* Złota krawędź wewnętrzna - górna */}
      <mesh position={[0, 6.0/2 - 0.025, 0.02]}>
        <planeGeometry args={[cardWidth - 0.05, 0.015]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      
      {/* Złota krawędź wewnętrzna - dolna */}
      <mesh position={[0, -(6.0/2) + 0.025, 0.02]}>
        <planeGeometry args={[cardWidth - 0.05, 0.015]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>

      {/* Narożniki wewnętrznej ramki - półokrągłe */}
      <mesh position={[-(cardWidth/2) + 0.018, 6.0/2 - 0.018, 0.02]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      <mesh position={[cardWidth/2 - 0.018, 6.0/2 - 0.018, 0.02]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      <mesh position={[-(cardWidth/2) + 0.018, -(6.0/2) + 0.018, 0.02]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      <mesh position={[cardWidth/2 - 0.018, -(6.0/2) + 0.018, 0.02]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#d4af37" />
      </mesh>
      

      {/* Pasek pod zdjęciem dopasowany do tła strony */}
      <mesh position={[0, -2.5, 0.01]}>
        <planeGeometry args={[cardWidth - 0.03, 0.9]} />
        <meshBasicMaterial
          color="#ffffff"
          map={barGradientTexture ?? undefined}
          transparent
          opacity={0.95}
          alphaTest={0.02}
        />
      </mesh>
      
      {/* Obramowanie przycisku */}
      <mesh position={[0, -2.45, 0.01]}>
        <circleGeometry args={[0.26, 32]} />
        <meshBasicMaterial color={SITE_GOLD_ACCENT} transparent opacity={0.8} />
      </mesh>
      
      {/* Kółko dla ikony */}
      <mesh 
        position={[0, -2.45, 0.015]}
        onClick={(e) => {
          e.stopPropagation();
          if (champion.pedigree) {
            onPedigreeClick(champion.pedigree);
          }
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial color={SITE_BACKGROUND_COLOR} transparent opacity={0.95} />
      </mesh>
      
      {/* Link do rodowoodu - ikona kartki */}
      <Text 
        position={[0, -2.45, 0.02]} 
        fontSize={0.16} 
        color={SITE_GOLD_ACCENT} 
        anchorX="center" 
        anchorY="middle"
        onClick={(e) => {
          e.stopPropagation();
          if (champion.pedigree) {
            onPedigreeClick(champion.pedigree);
          }
        }}
      >
        📄
      </Text>
    </group>
  );
});

// Główny komponent karuzeli
export const Carousel3D = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(null);
  const [selectedPedigree, setSelectedPedigree] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { champions, loading, error } = useChampions();
  
  // Ukryj body scrollbar gdy modal jest otwarty
  useEffect(() => {
    if (selectedChampionId || selectedPedigree) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedChampionId, selectedPedigree]);
  
  const { position, handlers, addImpulse, setPosition } = useMomentumScroll({
    friction: 0.90,
    sensitivity: 0.5,
  });
  
  const cardWidth = 6.9;
  const gap = 0.8;
  const cardSpacing = cardWidth + gap;

  const handlePrev = useCallback(() => {
    const newIndex = (activeIndex - 1 + champions.length) % champions.length;
    setActiveIndex(newIndex);
    setPosition(-newIndex * cardSpacing * 100);
  }, [activeIndex, cardSpacing, champions.length, setPosition]);
  
  const handleNext = useCallback(() => {
    const newIndex = (activeIndex + 1) % champions.length;
    setActiveIndex(newIndex);
    setPosition(-newIndex * cardSpacing * 100);
  }, [activeIndex, cardSpacing, champions.length, setPosition]);
  const handleCardClick = useCallback((index: number) => setActiveIndex(index), []);
  
  if (loading) {
    return (
      <section className="relative py-24 overflow-hidden section-surface">
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
    <section className="relative py-24 overflow-hidden section-surface">
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
          Czempioni
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
          onCreated={({ gl }) => {
            // Obsługa utraty kontekstu WebGL
            const canvas = gl.domElement;
            const handleContextLoss = (event: Event) => {
              event.preventDefault();
              console.warn('WebGL context lost, attempting to restore...');
              // Tutaj można dodać logikę odtworzenia sceny
            };
            const handleContextRestore = () => {
              console.log('WebGL context restored');
              // Tutaj można odświeżyć scenę
            };
            canvas.addEventListener('webglcontextlost', handleContextLoss);
            canvas.addEventListener('webglcontextrestored', handleContextRestore);
            
            return () => {
              canvas.removeEventListener('webglcontextlost', handleContextLoss);
              canvas.removeEventListener('webglcontextrestored', handleContextRestore);
            };
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
              onImageClick={(id) => setSelectedChampionId(id)}
              onPedigreeClick={(url) => setSelectedPedigree(url)}
            />
          ))}
        </Canvas>
        
        {/* Modal powiększonego zdjęcia - renderowany w portalu */}
        {selectedChampionId && createPortal((() => {
          const currentIndex = champions.findIndex(c => c.id === selectedChampionId);
          const handleModalPrev = (e: React.MouseEvent) => {
            e.stopPropagation();
            const prevIndex = (currentIndex - 1 + champions.length) % champions.length;
            setSelectedChampionId(champions[prevIndex].id);
          };
          const handleModalNext = (e: React.MouseEvent) => {
            e.stopPropagation();
            const nextIndex = (currentIndex + 1) % champions.length;
            setSelectedChampionId(champions[nextIndex].id);
          };
          
          return (
            <div
              className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999]"
              onClick={() => setSelectedChampionId(null)}
            >
              <div className="relative w-full h-full flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
                {/* Przycisk zamknięcia */}
                <button
                  className="absolute top-4 right-4 z-[10000] p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChampionId(null);
                  }}
                  aria-label="Zamknij"
                >
                  <X className="w-8 h-8" />
                </button>

                <img
                  src={champions[currentIndex]?.image}
                  alt="Champion"
                  className="max-w-[90vw] max-h-[90vh] object-contain pointer-events-none select-none"
                />
                
                {/* Strzałka w lewo - poprzednie zdjęcie */}
                <button
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer z-[10000]"
                  onClick={handleModalPrev}
                  aria-label="Poprzednie zdjęcie"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                
                {/* Strzałka w prawo - następne zdjęcie */}
                <button
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer z-[10000]"
                  onClick={handleModalNext}
                  aria-label="Następne zdjęcie"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            </div>
          );
        })(), document.body)}
        
        <PedigreeModal
          isOpen={!!selectedPedigree}
          onClose={() => setSelectedPedigree(null)}
          pedigreeUrl={selectedPedigree}
        />

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

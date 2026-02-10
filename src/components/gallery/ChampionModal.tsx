import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Sparkles } from 'lucide-react';
import { Champion } from '@/hooks/useChampions';
import { trackMetric } from '@/services/metricsService';

interface ChampionModalProps {
    champion: Champion | null;
    onClose: () => void;
    onViewPedigree: (url: string) => void;
    onPrevChampion: () => void;
    onNextChampion: () => void;
    hasPrevChampion: boolean;
    hasNextChampion: boolean;
    championIndex: number;
    totalChampions: number;
}

export const ChampionModal = ({
    champion,
    onClose,
    onViewPedigree,
    onPrevChampion,
    onNextChampion,
    hasPrevChampion,
    hasNextChampion,
    championIndex,
    totalChampions,
}: ChampionModalProps) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const hasMultiplePhotos = !!(champion && champion.images.length > 1);

    const currentImageSrc = champion?.images?.[currentPhotoIndex] ?? '';

    useEffect(() => {
        if (champion) {
            trackMetric('GALLERY_IMAGE', `${champion.id}`).catch(() => { });
        }
    }, [champion]);

    useEffect(() => {
        if (champion && champion.images?.length) {
            trackMetric('GALLERY_IMAGE', `${champion.id}:${champion.images[currentPhotoIndex] || currentPhotoIndex}`).catch(() => { });
        }
    }, [champion, currentPhotoIndex]);

    useEffect(() => {
        if (!champion) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (hasPrevChampion) onPrevChampion();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (hasNextChampion) onNextChampion();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (onClose) onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [champion, onClose, hasPrevChampion, hasNextChampion, onPrevChampion, onNextChampion]);

    if (!champion) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

            {/* Modal Container */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full h-full max-w-none max-h-none isolate pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Main Content Area - Isolated Stacking Context with standard Overflow */}
                <div className="relative w-full h-full overflow-hidden bg-card border-0 shadow-2xl z-0">
                    <div className="grid grid-cols-10 h-full">
                        {/* Image context - 8/10 columns */}
                        <div className="col-span-10 lg:col-span-8 relative h-full min-h-[400px] lg:min-h-full bg-muted/20 flex items-start justify-center pt-16">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            {imageError ? (
                                <div className="text-center text-muted-foreground">
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center">
                                        <div className="text-center">
                                            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary/40" />
                                            <p className="text-lg font-medium">Zdjęcie niedostępne</p>
                                            <p className="text-sm mt-2 opacity-75">{champion.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-start justify-center relative z-10">
                                    <motion.img
                                        layoutId={currentPhotoIndex === 0 ? `champion-image-${champion.id}` : undefined}
                                        key={champion.images[currentPhotoIndex]}
                                        src={currentImageSrc}
                                        alt={champion.name}
                                        className={`w-full h-screen object-contain object-top ${(imageLoading && currentPhotoIndex !== 0) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                                        style={{ width: '100%', height: '100vh', objectPosition: 'top center' }}
                                        onLoad={() => setImageLoading(false)}
                                        onError={() => {
                                            setImageError(true);
                                            setImageLoading(false);
                                        }}
                                    />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-card/50 via-transparent to-transparent lg:bg-gradient-to-r pointer-events-none z-20" />

                        </div>

                        {/* Content - 2/10 columns */}
                        <div className="col-span-10 lg:col-span-2 pt-16 px-6 lg:px-8 overflow-y-auto h-full relative z-[1]">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 px-3 py-2 bg-gold/10 rounded-lg border border-gold/20">
                                    <span className="text-sm font-medium text-gold">Numer gołębia:</span>
                                    <span className="text-sm font-bold text-foreground">{champion.ringNumber || 'Brak numeru'}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Osiągnięcia</h3>
                                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                                    {champion.achievements.map((achievement, i) => (
                                        <div
                                            key={`achievement-${i}`}
                                            className="px-3 py-2 text-sm rounded-lg bg-gold/10 text-gold border border-gold/20"
                                        >
                                            {achievement}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {champion.pedigree && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => onViewPedigree(champion.pedigree!)}
                                        className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Zobacz rodowód
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </motion.div>

            {/* Close button - Fixed relative to the viewport/outer container to ensure visibility */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-6 right-6 z-[100] p-3 rounded-full bg-card/90 hover:bg-card border border-border shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                aria-label="Zamknij"
            >
                <X className="w-6 h-6 text-foreground" />
            </button>

            {/* Photo navigation arrows - Fixed relative to the viewport/outer container */}
            {hasMultiplePhotos && (
                <>
                    {/* Left Arrow */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhotoIndex((prev) => (prev - 1 + champion.images.length) % champion.images.length);
                            setImageLoading(true);
                            setImageError(false);
                        }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 transition-all hover:scale-110 cursor-pointer"
                        aria-label="Poprzednie zdjęcie"
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    
                    {/* Right Arrow */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhotoIndex((prev) => (prev + 1) % champion.images.length);
                            setImageLoading(true);
                            setImageError(false);
                        }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 transition-all hover:scale-110 cursor-pointer"
                        aria-label="Następne zdjęcie"
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m9 18 6-6-6-6" /></svg>
                    </button>

                    {/* Photo indicators */}
                    <div className="absolute bottom-6 left-[40%] text-center -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 pointer-events-auto">
                            {champion.images.map((_, index) => (
                                <button
                                    key={`photo-${index}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentPhotoIndex(index);
                                        setImageLoading(true);
                                        setImageError(false);
                                    }}
                                    className={`w-4 h-4 rounded-full transition-all duration-200 mx-1 cursor-pointer ${index === currentPhotoIndex
                                        ? 'bg-gold scale-125 shadow-lg'
                                        : 'bg-white/70 hover:bg-white/90 hover:scale-110'
                                        }`}
                                    aria-label={`Przejdź do zdjęcia ${index + 1}`}
                                />
                            ))}
                        </div>
                        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/80">
                            {currentPhotoIndex + 1} / {champion.images.length}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

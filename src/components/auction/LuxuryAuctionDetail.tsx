import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Clock, Gavel, Trophy, MapPin, User, Phone, Mail, Heart, 
  Share2, Eye, ChevronLeft, ChevronRight, AlertCircle, Check, 
  ArrowLeft, Info, AlertTriangle, FileText, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MagneticButton } from '@/components/effects/MagneticButton';
import { LuxuryAuctionTimer } from '@/components/auction/LuxuryAuctionTimer';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import type { AuctionDTO as Auction } from '../../../shared/auctionSerializer';

interface LuxuryAuctionDetailProps {
  auction: Auction;
  isWatched: boolean;
  isEnded: boolean;
  minimumBid: number;
  bidAmount: string;
  bidLoading: boolean;
  bidError: string | null;
  bidSuccess: boolean;
  onBidAmountChange: (value: string) => void;
  onPlaceBid: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  onToggleWatch: () => Promise<void>;
}

export const LuxuryAuctionDetail: React.FC<LuxuryAuctionDetailProps> = ({
  auction,
  isWatched,
  isEnded,
  minimumBid,
  bidAmount,
  bidLoading,
  bidError,
  bidSuccess,
  onBidAmountChange,
  onPlaceBid,
  onBuyNow,
  onToggleWatch
}) => {
  const { user, session, profile } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isCommissionLoading, setIsCommissionLoading] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Wartości motion dla efektu zoomu
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const transformX = useTransform(mouseX, [-0.5, 0.5], [-50, 50]);
  const transformY = useTransform(mouseY, [-0.5, 0.5], [-50, 50]);
  
  // Sprężynowe animacje dla płynniejszych przejść
  const imageSpring = useSpring(0, { stiffness: 300, damping: 30 });
  
  // Obsługa zmiany zdjęcia
  const nextImage = () => {
    if (auction?.images) {
      imageSpring.set(100);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % auction.images.length);
        imageSpring.set(0);
      }, 200);
    }
  };

  const prevImage = () => {
    if (auction?.images) {
      imageSpring.set(-100);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev - 1 + auction.images.length) % auction.images.length);
        imageSpring.set(0);
      }, 200);
    }
  };
  
  // Obsługa ruchu myszy dla efektu zoomu
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !isImageZoomed) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };
  
  // Definicje wariantów animacji
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 pt-8 pb-16"
    >
      {/* Przycisk powrotu */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link to="/auctions">
          <Button variant="ghost" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Powrót do aukcji
          </Button>
        </Link>
      </motion.div>
      
      {/* Główny grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Lewa kolumna - zdjęcia */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            {/* Główne zdjęcie */}
            <div 
              ref={imageContainerRef}
              className="relative h-[500px] overflow-hidden cursor-zoom-in"
              onClick={() => setIsImageZoomed(!isImageZoomed)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                mouseX.set(0);
                mouseY.set(0);
                setIsImageZoomed(false);
              }}
            >
              <motion.img
                key={currentImageIndex}
                src={auction?.images[currentImageIndex]}
                alt={auction?.title}
                className="w-full h-full object-contain"
                style={{
                  scale: isImageZoomed ? 1.5 : 1,
                  x: isImageZoomed ? transformX : 0,
                  y: isImageZoomed ? transformY : 0,
                  opacity: imageSpring.get() !== 0 ? 0.5 : 1,
                  translateX: imageSpring
                }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Overlay z informacją o powiększeniu */}
              <AnimatePresence>
                {!isImageZoomed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-xl text-white text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Kliknij, aby powiększyć
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Przyciski nawigacji */}
            {auction.images.length > 1 && (
              <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                <motion.button
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={prevImage}
                  className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-xl border border-white/25 flex items-center justify-center text-white pointer-events-auto"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={nextImage}
                  className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-xl border border-white/25 flex items-center justify-center text-white pointer-events-auto"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
            
            {/* Miniatury */}
            <div className="flex gap-2 p-4 overflow-x-auto">
              {auction?.images.map((img, index) => (
                <motion.div
                  key={index}
                  className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 ${
                    index === currentImageIndex ? 'border-gold' : 'border-transparent'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img 
                    src={img} 
                    alt={`Miniatura ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Informacje o gołębiu */}
          <motion.div 
            variants={itemVariants}
            className="mt-6 p-6 rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <h3 className="font-display text-xl font-semibold mb-4">Informacje o gołębiu</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Numer obrączki</p>
                <p className="font-medium">{auction?.pigeon?.ringNumber || 'Brak'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Płeć</p>
                <p className="font-medium">{auction?.sex === 'male' ? 'Samiec' : 'Samica'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kolor oczu</p>
                <p className="font-medium">{auction?.pigeon?.eyeColor || 'Brak informacji'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kolor gołębia</p>
                <p className="font-medium">{auction?.pigeon?.pigeonColor || 'Brak informacji'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budowa</p>
                <p className="font-medium">{auction?.pigeon?.construction || 'Brak informacji'}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Prawa kolumna - informacje o aukcji */}
        <div>
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="font-display text-3xl font-bold">{auction?.title}</h1>
              
              <div className="flex gap-2">
                <motion.button
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={onToggleWatch}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isWatched 
                      ? 'bg-gold/20 text-gold' 
                      : 'bg-white/10 text-muted-foreground hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWatched ? 'fill-gold' : ''}`} />
                </motion.button>
                
                <motion.button
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white"
                  data-share-open
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
            
            {/* Lokalizacja */}
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <MapPin className="w-4 h-4" />
              <span>{auction?.location}</span>
            </div>
            
            {/* Opis */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Opis</h3>
              <motion.div 
                className={`text-muted-foreground relative ${isDescriptionExpanded ? '' : 'max-h-24 overflow-hidden'}`}
              >
                <p>{auction?.description}</p>
                {!isDescriptionExpanded && auction?.description.length > 150 && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent" />
                )}
              </motion.div>
              {auction?.description.length > 150 && (
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-gold hover:text-gold/80 text-sm mt-2"
                >
                  {isDescriptionExpanded ? 'Pokaż mniej' : 'Czytaj więcej'}
                </button>
              )}
            </div>
            
            {/* Informacje o sprzedającym */}
            {!isEnded || user?.id !== (auction as any).winnerId ? (
              <div className="border-t border-white/15 pt-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">Sprzedawca</h3>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gold" />
                  <div>
                    <p className="font-semibold text-foreground">{auction.seller?.firstName || 'Brak nazwy'}</p>
                    <p className="text-sm text-muted-foreground">Sprzedawca</p>
                  </div>
                </div>
              </div>
              ) : isEnded && user?.id === (auction as any).winnerId && (
              <div className="border-t border-white/15 pt-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">Dane sprzedającego</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gold" />
                      <div>
                        <p className="font-semibold text-foreground">{auction.seller?.firstName} {auction.seller?.lastName}</p>
                        <p className="text-sm text-muted-foreground">Sprzedawca</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gold" />
                      <span className="text-muted-foreground">{auction.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gold" />
                      <span className="text-muted-foreground">{auction.seller?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gold" />
                      <span className="text-muted-foreground">{auction.seller?.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-gold" />
                      <div>
                        <p className="font-semibold text-foreground">{auction.seller?.rating}</p>
                        <p className="text-sm text-muted-foreground">Ocena</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Gavel className="w-5 h-5 text-gold" />
                      <div>
                        <p className="font-semibold text-foreground">{auction.seller?.salesCount}</p>
                        <p className="text-sm text-muted-foreground">Liczba sprzedaży</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) || (
              <div className="border-t border-white/15 pt-8 text-center">
                <p className="text-muted-foreground">Dane sprzedającego zostaną odblokowane po opłaceniu prowizji.</p>
              </div>
              )}
            
            {/* Panel licytacji */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Aktualna oferta</p>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {auction?.currentPrice.toLocaleString('pl-PL')} zł
                  </p>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                  <LuxuryAuctionTimer 
                    endTime={auction.endTime}
                  />
                </div>
              </div>
              
              {!isEnded ? (
                <>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => onBidAmountChange(e.target.value)}
                        placeholder={`Min. ${minimumBid.toLocaleString('pl-PL')} zł`}
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/25 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <MagneticButton strength={0.3}>
                      <motion.div
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button 
                          onClick={onPlaceBid}
                          disabled={bidLoading || parseFloat(bidAmount) < minimumBid}
                          className="px-6 py-3 h-full bg-gradient-to-r from-gold to-gold-light text-navy font-semibold hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                        >
                          <Gavel className="w-4 h-4 mr-2" />
                          {bidLoading ? 'Licytuję...' : 'Licytuj'}
                        </Button>
                      </motion.div>
                    </MagneticButton>
                  </div>
                  
                  {/* Informacja o minimalnej ofercie */}
                  <p className="text-sm text-muted-foreground mb-4">
                    Minimalna oferta: {minimumBid.toLocaleString('pl-PL')} zł
                  </p>
                  
                  {/* Kup teraz */}
                  {auction?.buyNowPrice && (
                    <div className="mb-4">
                      <MagneticButton strength={0.3}>
                        <motion.div
                          variants={buttonVariants}
                          initial="rest"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button 
                            onClick={onBuyNow}
                            className="w-full bg-gradient-to-r from-gold/80 to-gold-light/80 text-navy font-semibold"
                          >
                            Kup teraz za {auction.buyNowPrice.toLocaleString('pl-PL')} zł
                          </Button>
                        </motion.div>
                      </MagneticButton>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-xl bg-black/50 text-center">
                  <p className="text-lg font-medium">Aukcja zakończona</p>
                  {isEnded && user?.id === (auction as any).winnerId && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Jako zwycięzca zapłać prowizję, aby odblokować dane sprzedającego.</p>
                      <Button
                        onClick={async () => {
                          if (!session) return;
                          setIsCommissionLoading(true);
                          try {
                            const clientUrl = window.location.origin;
                            const successUrl = `${clientUrl}/auctions/success`;
                            const cancelUrl = `${clientUrl}/auctions/cancel`;
                            const res = await paymentService.createCommissionCheckout(
                              auction.id,
                              session.access_token,
                              successUrl,
                              cancelUrl
                            );
                            if (res.url) {
                              window.location.href = res.url;
                            }
                          } catch (err) {
                            console.warn('Commission checkout init failed', err);
                          } finally {
                            setIsCommissionLoading(false);
                          }
                        }}
                        disabled={isCommissionLoading}
                        className="w-full bg-gradient-to-r from-gold/80 to-gold-light/80 text-navy font-semibold"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {isCommissionLoading ? 'Ładowanie...' : 'Opłać prowizję'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Komunikaty błędów/sukcesu */}
              <AnimatePresence>
                {bidError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-500 text-sm mt-4"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{bidError}</span>
                  </motion.div>
                )}
                
                {bidSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-500 text-sm mt-4"
                  >
                    <Check className="w-4 h-4" />
                    <span>Oferta została złożona pomyślnie!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Historia licytacji */}
            <motion.div 
              variants={itemVariants}
              className="mt-6 p-6 rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <h3 className="font-display text-xl font-semibold mb-4">Historia licytacji</h3>
              {auction?.bids && auction.bids.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {auction.bids.map((bid) => (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{`${bid.bidder.firstName} ${bid.bidder.lastName.charAt(0)}.`}</span>
                      </div>
                      <span className="font-medium">{bid.amount.toLocaleString('pl-PL')} zł</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Brak licytacji. Bądź pierwszy!
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-300"
        data-share-modal
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 transform scale-95 transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Udostępnij aukcję</h3>
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-share-close
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Udostępnij tę aukcję gołębia:
              </p>
              
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  <span>Facebook</span>
                </button>
                
                <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left">
                  <div className="w-5 h-5 bg-sky-500 rounded"></div>
                  <span>Twitter</span>
                </button>
                
                <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left">
                  <div className="w-5 h-5 bg-green-500 rounded"></div>
                  <span>WhatsApp</span>
                </button>
                
                <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  <span>Kopiuj link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LuxuryAuctionDetail;

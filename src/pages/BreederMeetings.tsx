import React, { useEffect, useState, useMemo, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FullscreenImageModal } from '@/components/ui/FullscreenImageModal';
import { SmartImage } from '@/components/ui/SmartImage';
import AddBreederMeetingForm from '@/components/breeder-meetings/AddBreederMeetingForm';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Camera, Users, MapPin, Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { meetingsService } from '@/services/meetingsService';
import { useOptimizedToast } from '@/hooks/use-optimized-toast';
import UnifiedModal from '@/components/ui/UnifiedModal';
import AccountModal from '@/components/AccountModal';
import { useNavigate } from 'react-router-dom';

interface BreederMeeting {
  id: string;
  name: string;
  location?: string;
  date?: string;
  description?: string;
  images: string[];
}

interface MeetingCardProps {
  meeting: BreederMeeting;
  index: number;
  onImageClick: (meetingId: string, imageIndex: number) => void;
}

function MeetingCard({ meeting, index, onImageClick }: MeetingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.9]);

  return (
    <motion.article
      ref={cardRef}
      style={{ y, opacity, scale }}
      className="relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
        
        <motion.div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-32 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.25) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
        />
        
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <motion.h3 
              className="text-2xl md:text-3xl font-bold"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-light drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                {meeting.name}
              </span>
            </motion.h3>
            
            <div className="flex items-center gap-3 flex-wrap">
              {meeting.location && (
                <motion.span 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/10 text-white/80 border border-white/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <MapPin className="w-3 h-3 text-gold" />
                  {meeting.location}
                </motion.span>
              )}
              {meeting.date && (
                <motion.span 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/10 text-white/80 border border-white/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Calendar className="w-3 h-3 text-gold" />
                  {meeting.date}
                </motion.span>
              )}
              <motion.span 
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gold/20 text-gold-light border border-gold/30"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Camera className="w-3 h-3" />
                {meeting.images?.length || 0} zdjęć
              </motion.span>
            </div>
          </div>

          {meeting.description && (
            <motion.p 
              className="text-white/70 mb-6 text-sm md:text-base"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              {meeting.description}
            </motion.p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.isArray(meeting.images) && meeting.images.map((image, imageIndex) => (
              <motion.div
                key={imageIndex}
                className="relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer group border border-white/10 bg-black/40"
                onClick={() => onImageClick(meeting.id, imageIndex)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: imageIndex * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, zIndex: 10 }}
              >
                <SmartImage 
                  src={image} 
                  alt={`${meeting.name} - zdjęcie ${imageIndex + 1}`} 
                  width={300} 
                  height={225} 
                  fitMode="cover" 
                  aspectRatio="4/3" 
                  className="w-full h-full transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-10 h-10 bg-gold/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-gold/50 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                    <Camera className="w-4 h-4 text-gold-light" />
                  </div>
                </motion.div>
                <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-bold rounded bg-black/50 backdrop-blur-sm text-gold-light border border-gold/30">
                  {imageIndex + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
        />
      </div>
    </motion.article>
  );
}

export default function BreederMeetings() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { info: showInfo } = useOptimizedToast();
  const [breederMeetings, setBreederMeetings] = useState<BreederMeeting[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ meetingId: string; imageIndex: number } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState({ title: '', message: '' });
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  const triggerButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const modalRef = React.useRef<HTMLDivElement | null>(null);

  const roleActions = useMemo(() => ({
    'USER_REGISTERED': () => {
      setVerificationMessage({
        title: 'Wymagana weryfikacja emaila',
        message: 'Aby dodać spotkanie, musisz najpierw zweryfikować swój adres email.\n\nSprawdź swoją skrzynkę odbiorczą i kliknij link weryfikacyjny.'
      });
      setShowVerificationModal(true);
    },
    'USER_EMAIL_VERIFIED': () => {
      setVerificationMessage({
        title: 'Wymagana pełna weryfikacja',
        message: 'Aby dodać spotkanie, musisz uzupełnić swój profil i zweryfikować numer telefonu.\n\nKliknij "Uzupełnij profil" aby kontynuować.'
      });
      setShowVerificationModal(true);
    },
    'USER_FULL_VERIFIED': () => { 
      setIsFormOpen(true); 
    },
    'ADMIN': () => { 
      setIsFormOpen(true); 
    },
  }), []);

  const stats = useMemo(() => {
    const totalImages = breederMeetings.reduce((acc, m) => acc + (m.images?.length || 0), 0);
    return {
      meetings: breederMeetings.length,
      images: totalImages,
    };
  }, [breederMeetings]);

  useEffect(() => {
    const fetchBreederMeetings = async () => {
      try {
        const data = await meetingsService.getMeetings();
        setBreederMeetings(Array.isArray(data) ? data : []);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Błąd podczas ładowania spotkań z hodowcami:', error);
        setBreederMeetings([]);
        setImagesLoaded(true);
      }
    };
    fetchBreederMeetings();
  }, []);

  const handleAddMeeting = () => {
    if (!user) {
      navigate('/auth?mode=login&callbackUrl=/meetings');
      return;
    }

    if (!profile) {
      showInfo({ message: 'Ładowanie profilu...' });
      return;
    }

    const action = roleActions[profile.role as keyof typeof roleActions];
    if (action) {
      action();
    } else {
      showInfo({ message: 'Brak uprawnień do dodawania spotkań.' });
    }
  };

  const handleImageClick = (meetingId: string, imageIndex: number) => setSelectedImage({ meetingId, imageIndex });
  const handleCloseModal = () => setSelectedImage(null);

  if (!imagesLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-gold/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-2 rounded-full border-2 border-t-gold border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-gold" />
          </div>
          <p className="text-white/60 text-lg">Ładowanie galerii...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gold-dark/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-[80px]" />
      </div>

      <Header />

      <motion.section 
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center z-10 pt-20"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gold/10"
              style={{
                width: `${100 + i * 100}px`,
                height: `${100 + i * 100}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 border border-gold/40 mb-8"
              animate={{ 
                boxShadow: ['0 0 30px rgba(250,204,21,0.2)', '0 0 60px rgba(250,204,21,0.4)', '0 0 30px rgba(250,204,21,0.2)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Users className="w-10 h-10 text-gold" />
            </motion.div>

            <motion.h1 
              className="font-display text-3xl md:text-4xl lg:text-5xl font-black mb-6"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #d4af37 50%, #fff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 60px rgba(212,175,55,0.5)',
              }}
            >
              SPOTKANIA Z HODOWCAMI
            </motion.h1>

            <motion.p 
              className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Galeria zdjęć z naszych spotkań z hodowcami gołębi pocztowych z całej Polski
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-center gap-6 md:gap-12 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { label: "Spotkań", value: stats.meetings, icon: Users },
                { label: "Zdjęć", value: stats.images, icon: Camera },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-2 bg-gradient-to-br from-gold-light to-gold shadow-lg">
                    <stat.icon className="w-7 h-7 text-black/80" />
                  </div>
                  <div className="font-display text-3xl md:text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                ref={triggerButtonRef}
                onClick={handleAddMeeting}
                className="bg-gradient-to-r from-gold to-gold text-black font-bold px-8 py-3 rounded-full hover:from-gold-light hover:to-gold shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all duration-300"
              >
                <Camera className="w-5 h-5 mr-2" />
                Dodaj spotkanie
              </Button>
            </motion.div>

            <motion.div 
              className="mt-16 flex flex-col items-center gap-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-white/40 text-sm uppercase tracking-widest">Przewijaj</span>
              <ChevronDown className="w-6 h-6 text-gold/60" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <main className="relative z-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="space-y-16 md:space-y-24">
            {breederMeetings.map((meeting, index) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                index={index}
                onImageClick={handleImageClick}
              />
            ))}
          </div>

          {breederMeetings.length === 0 && (
            <motion.div 
              className="max-w-2xl mx-auto text-center py-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-zinc-800/90 via-zinc-900/90 to-zinc-800/90 backdrop-blur-xl p-12">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
                <Users className="w-16 h-16 text-gold/50 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Brak spotkań</h2>
                <p className="text-white/60 mb-8">
                  Jeszcze nie ma zdjęć ze spotkań z hodowcami. Bądź pierwszy i dodaj swoje!
                </p>
                <Button
                  onClick={handleAddMeeting}
                  className="bg-gradient-to-r from-gold to-gold text-black font-bold"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Dodaj pierwsze spotkanie
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {selectedImage && (() => {
        const meeting = breederMeetings.find(m => m.id === selectedImage.meetingId);
        if (!meeting || !Array.isArray(meeting.images)) return null;
        const currentImage = meeting.images[selectedImage.imageIndex];
        if (!currentImage) return null;
        return <FullscreenImageModal isOpen={selectedImage !== null} onClose={handleCloseModal} images={meeting.images} currentIndex={selectedImage.imageIndex} title={meeting.name} />;
      })()}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-meeting-title"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              className="absolute inset-0 bg-transparent"
              aria-label="Zamknij"
              onClick={() => setIsFormOpen(false)}
            />

            <motion.div
              ref={modalRef}
              className="relative z-10 w-full max-w-4xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <AddBreederMeetingForm 
                onCancel={() => setIsFormOpen(false)}
                onSuccess={() => {
                  setIsFormOpen(false);
                  const fetchBreederMeetings = async () => {
                    try {
                      const data = await meetingsService.getMeetings();
                      setBreederMeetings(Array.isArray(data) ? data : []);
                    } catch (error) {
                      console.error('Błąd podczas ładowania spotkań z hodowcami:', error);
                      setBreederMeetings([]);
                    }
                  };
                  fetchBreederMeetings();
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AccountModal 
        open={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
      />

      <UnifiedModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type="warning"
        title={verificationMessage.title}
        message={verificationMessage.message}
        confirmButton={{
          text: profile?.role === 'USER_REGISTERED' ? 'Zweryfikuj email' : 'Uzupełnij profil',
          onClick: () => {
            setShowVerificationModal(false);
            if (profile?.role === 'USER_REGISTERED') {
              navigate('/verify-email');
            } else {
              setIsAccountOpen(true);
            }
          }
        }}
        cancelButton={{
          text: 'Anuluj',
          onClick: () => setShowVerificationModal(false)
        }}
      />

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

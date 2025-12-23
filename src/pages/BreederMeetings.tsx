import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FullscreenImageModal } from '@/components/ui/FullscreenImageModal';
import { SmartImage } from '@/components/ui/SmartImage';
import AddBreederMeetingForm from '@/components/breeder-meetings/AddBreederMeetingForm';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { meetingsService } from '@/services/meetingsService';

interface BreederMeeting {
  id: string;
  name: string;
  location?: string;
  date?: string;
  description?: string;
  images: string[];
}

const getContainerAnim = (index: number) => {
  switch (index) {
    case 0: return 'slideUpReturn';
    case 1: return 'swashIn';
    case 2: return 'swashIn';
    case 3: return 'slideDownReturn';
    case 4: return 'slideDownReturn';
    default: return 'slideDownReturn';
  }
};

export default function BreederMeetings() {
  const { user } = useAuth();
  const [breederMeetings, setBreederMeetings] = useState<BreederMeeting[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ meetingId: string; imageIndex: number } | null>(null);

  useEffect(() => {
    const fetchBreederMeetings = async () => {
      try {
        const data = await meetingsService.getMeetings();
        setBreederMeetings(data as BreederMeeting[]);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Błąd podczas ładowania spotkań z hodowcami:', error);
        setImagesLoaded(true);
      }
    };
    fetchBreederMeetings();
  }, []);

  const handleImageClick = (meetingId: string, imageIndex: number) => setSelectedImage({ meetingId, imageIndex });
  const handleCloseModal = () => setSelectedImage(null);

  if (!imagesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4" />
          <div className="text-lg">Ładowanie zdjęć...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-navy">
            <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/40 to-transparent" />
            <div className="relative z-10 container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Spotkania z Hodowcami</h1>
                <p className="max-w-3xl mx-auto text-white/80 text-lg">Galeria zdjęć z naszych spotkań z hodowcami gołębi pocztowych</p>
            </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pb-20">
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gradient">Dodaj Zdjęcia ze Spotkania</h2>
            <p className="text-muted-foreground text-lg">Podziel się zdjęciami z naszych spotkań z hodowcami</p>
          </div>

          <AddBreederMeetingForm />
        </section>

        <section>
          <div className="space-y-12">
            {breederMeetings && Array.isArray(breederMeetings) && breederMeetings.map((meeting, index) => (
              <div key={meeting.id}>
                <article 
                  className={`p-6 magictime ${getContainerAnim(index)} animate-meeting-card stagger-${index % 11}`}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-gradient text-center">{meeting.name}</h3>
                    {meeting.location && <p className="text-base md:text-lg font-semibold uppercase tracking-[0.3em] text-muted-foreground text-center mt-2">{meeting.location}</p>}
                  </div>

                  <div className="grid gap-5 rounded-2xl border border-muted-foreground/10 bg-muted-foreground/5 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {meeting.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="relative h-48 overflow-hidden rounded-xl cursor-pointer group border border-muted-foreground/5 bg-black/20" onClick={() => handleImageClick(meeting.id, imageIndex)}>
                          <SmartImage src={image} alt={`${meeting.name} - zdjęcie ${imageIndex + 1}`} width={300} height={192} fitMode="cover" aspectRatio="16/9" className="w-full h-full transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-8 h-8 bg-amber-500/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-amber-400/50"><span className="text-amber-200 text-xs font-bold">{imageIndex + 1}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {breederMeetings.length === 0 && (
            <div className="p-12 text-center card-glass">
              <h2 className="text-2xl font-bold mb-4">Brak spotkań</h2>
              <p className="mb-6 text-muted-foreground">Jeszcze nie ma zdjęć ze spotkań z hodowcami.</p>
            </div>
          )}
        </section>
      </div>

      {selectedImage && (() => {
        const meeting = breederMeetings.find(m => m.id === selectedImage.meetingId);
        if (!meeting) return null;
        const currentImage = meeting.images[selectedImage.imageIndex];
        if (!currentImage) return null;
        return <FullscreenImageModal isOpen={selectedImage !== null} onClose={handleCloseModal} images={meeting.images} currentIndex={selectedImage.imageIndex} title={meeting.name} />;
      })()}
      </main>
      <Footer />
    </div>
  );
}

import React, { useState } from 'react';
import { SmartImage } from '@/components/ui/SmartImage';
import { FullscreenImageModal } from '@/components/ui/FullscreenImageModal';
import { motion } from 'framer-motion';

const GALLERY: { breeder: string; images: string[] }[] = [
  {
    breeder: 'Geert Munnik',
    images: [
      '/meetings-with-breeders/Geert Munnik/DSC_0031.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_0038.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_0044.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_0399.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_03991.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_0409.jpg',
    ],
  },
  {
    breeder: 'Jan Oost',
    images: [
      '/meetings-with-breeders/Jan Oost/DSC_0002.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0004.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0006.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0011.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0017.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0018.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0422.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0423.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0426.jpg',
    ],
  },
  {
    breeder: 'Marginus Oostenbrink',
    images: [
      '/meetings-with-breeders/Marginus Oostenbrink/DSC_0431.jpg',
      '/meetings-with-breeders/Marginus Oostenbrink/DSC_0433.jpg',
      '/meetings-with-breeders/Marginus Oostenbrink/DSC_0435.jpg',
    ],
  },
  {
    breeder: 'Theo Lehnen',
    images: [
      '/meetings-with-breeders/Theo Lehnen/Theo.jpg',
      '/meetings-with-breeders/Theo Lehnen/Theo-1.jpg',
      '/meetings-with-breeders/Theo Lehnen/Theo-2.jpg',
      '/meetings-with-breeders/Theo Lehnen/Theo-3.jpg',
    ],
  },
  {
    breeder: 'Toni van Ravenstein',
    images: [
      '/meetings-with-breeders/Toni van Ravenstein/DSCF2556.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/DSCF2559.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/DSCF2578.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/DSC_0001.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/DSC_0003.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/TONI-1.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/TONI-2.jpg',
    ],
  },
];

const MeetingsStaticGallery: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalTitle, setModalTitle] = useState('');

  const openGallery = (images: string[], index: number, title: string) => {
    setModalImages(images);
    setModalIndex(index);
    setModalTitle(title);
    setModalOpen(true);
  };

  return (
    <section className="my-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-foreground">
          Zdjęcia ze <span className="text-gradient-gold">spotkań</span> z hodowcami
        </h2>
        <div className="space-y-10">
          {GALLERY.map((group) => (
            <div key={group.breeder}>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{group.breeder}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.images.map((src, idx) => (
                  <motion.button
                    key={src}
                    onClick={() => openGallery(group.images, idx, group.breeder)}
                    className="rounded-xl overflow-hidden bg-card/55 backdrop-blur-md border border-border/70 group relative focus:outline-none gallery-card"
                    aria-label={`${group.breeder} zdjęcie ${idx + 1}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.05 }}
                  >
                    <SmartImage src={src} alt={`${group.breeder} ${idx + 1}`} width={600} height={400} fitMode="cover" className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    {/* caption removed per request */}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FullscreenImageModal isOpen={modalOpen} onClose={() => setModalOpen(false)} images={modalImages} currentIndex={modalIndex} title={modalTitle} />
    </section>
  );
};

export default MeetingsStaticGallery;

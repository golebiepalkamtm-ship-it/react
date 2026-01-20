import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Achievements = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-24 px-4 container mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-full bg-primary/10 text-primary"
          >
            <Trophy size={64} />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold tracking-tight"
          >
            Nasze Osiągnięcia
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground max-w-md text-lg"
          >
            Historia sukcesów i wyróżnień hodowli PalkaMTM.
            Strona w przygotowaniu.
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;

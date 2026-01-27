import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const VerifyEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Header />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-lg text-center mt-20"
      >
        <h1 className="text-2xl font-bold mb-4 text-foreground">Weryfikacja Email</h1>
        <p className="text-muted-foreground mb-6">
          Proszę sprawdzić swoją skrzynkę pocztową w celu weryfikacji adresu email.
        </p>
        <Button onClick={() => navigate('/auth')}>
          Powrót do logowania
        </Button>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
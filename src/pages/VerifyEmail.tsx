import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Check if verified
  const isVerified = user && (user.email_confirmed_at || user.confirmed_at || profile?.role !== 'USER_REGISTERED');

  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVerified, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-0" />
      
      <Header />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "outCirc" }}
        className="relative z-10 max-w-md w-full bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center mt-20"
      >
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${isVerified ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-gold'}`}>
            {isVerified ? (
              <CheckCircle className="w-12 h-12" />
            ) : (
              <Mail className="w-12 h-12" />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-white tracking-tight">
          {isVerified ? 'Email Zweryfikowany!' : 'Sprawdź Skrzynkę'}
        </h1>
        
        <p className="text-white/70 mb-8 leading-relaxed">
          {isVerified 
            ? 'Twój adres email został pomyślnie zweryfikowany. Za chwilę zostaniesz przekierowany na stronę główną.' 
            : 'Wysłaliśmy link weryfikacyjny na Twój adres email. Kliknij go, aby aktywować pełny dostęp do konta.'}
        </p>

        <div className="space-y-3">
          {isVerified ? (
            <Button 
              variant="heroGold" 
              className="w-full h-12 text-base"
              onClick={() => navigate('/')}
            >
              Przejdź do serwisu
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-12 text-base border-white/10 hover:bg-white/5"
              onClick={() => navigate('/auth')}
            >
              Powrót do logowania
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Mail, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();

  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const verifiedParam = searchParams.get('verified');

  // Check if verified based on user state OR url param
  const isVerified = (user && (user.email_confirmed_at || user.confirmed_at || profile?.role !== 'USER_REGISTERED')) || verifiedParam === 'true';

  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVerified, navigate]);

  const renderContent = () => {
    if (error) {
      return (
        <>
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-500/10 text-red-500">
              <XCircle className="w-12 h-12" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-white tracking-tight">
            Weryfikacja nieudana
          </h1>
          
          <p className="text-white/70 mb-8 leading-relaxed">
            {errorDescription || 'Wystąpił błąd podczas weryfikacji adresu email. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.'}
          </p>

          <Button 
            variant="outline" 
            className="w-full h-12 text-base border-white/10 hover:bg-white/5"
            onClick={() => navigate('/auth')}
          >
            Powrót do logowania
          </Button>
        </>
      );
    }

    if (isVerified) {
      return (
        <>
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-500/10 text-green-500">
              <CheckCircle className="w-12 h-12" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-white tracking-tight">
            Email Zweryfikowany!
          </h1>
          
          <p className="text-white/70 mb-8 leading-relaxed">
            Twój adres email został pomyślnie zweryfikowany. Za chwilę zostaniesz przekierowany na stronę główną.
          </p>

          <Button 
            variant="heroGold" 
            className="w-full h-12 text-base"
            onClick={() => navigate('/')}
          >
            Przejdź do serwisu
          </Button>
        </>
      );
    }

    return (
      <>
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gold/10 text-gold">
            <Mail className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-white tracking-tight">
          Sprawdź Skrzynkę
        </h1>
        
        <p className="text-white/70 mb-8 leading-relaxed">
          Wysłaliśmy link weryfikacyjny na Twój adres email. Kliknij go, aby aktywować pełny dostęp do konta.
        </p>

        <Button 
          variant="outline" 
          className="w-full h-12 text-base border-white/10 hover:bg-white/5"
          onClick={() => navigate('/auth')}
        >
          Powrót do logowania
        </Button>
      </>
    );
  };

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
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;

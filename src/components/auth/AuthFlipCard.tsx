// src/components/auth/AuthFlipCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome, Facebook } from 'lucide-react';

const AuthFlipCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signUp, signIn, signInWithGoogle, signInWithFacebook } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isFlipped) {
        // Sign Up
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccessMessage('Konto zostało utworzone. Sprawdź swoją skrzynkę mailową, aby potwierdzić adres email.');
        // Note: Email confirmation will be handled by Supabase
      } else {
        // Sign In
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await signInWithFacebook();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#00172D] to-[#002244] p-4">
      <motion.div
        className="relative w-full max-w-md h-[28rem] cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Card - Login */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Witaj ponownie</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                required
              />
              <input
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                required
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#D4AF37] text-[#00172D] font-semibold rounded-lg hover:bg-[#B8942A] transition-colors disabled:opacity-50"
              >
                {loading ? 'Logowanie...' : 'Zaloguj się'}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">Lub zaloguj się przez</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleFacebookSignIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
              </div>
            </div>

            <p className="text-white/60 text-center mt-4">
              Nie masz konta?{' '}
              <button
                onClick={() => setIsFlipped(true)}
                className="text-[#D4AF37] hover:underline"
              >
                Zarejestruj się
              </button>
            </p>
          </div>
        </motion.div>

        {/* Back Card - Register */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 flex flex-col justify-center">
            {successMessage ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Sukces!</h2>
                <p className="text-white/80 mb-6">{successMessage}</p>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setSuccessMessage('');
                  }}
                  className="w-full py-3 bg-[#D4AF37] text-[#00172D] font-semibold rounded-lg hover:bg-[#B8942A] transition-colors"
                >
                  Wróć do logowania
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white text-center mb-6">Dołącz do nas</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    required
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#D4AF37] text-[#00172D] font-semibold rounded-lg hover:bg-[#B8942A] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Rejestracja...' : 'Zarejestruj się'}
                  </button>
                </form>

                {/* Social Login */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-white/60">Lub zarejestruj się przez</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                      <Chrome className="w-4 h-4" />
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={handleFacebookSignIn}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </button>
                  </div>
                </div>

                <p className="text-white/60 text-center mt-4">
                  Masz już konto?{' '}
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="text-[#D4AF37] hover:underline"
                  >
                    Zaloguj się
                  </button>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthFlipCard;
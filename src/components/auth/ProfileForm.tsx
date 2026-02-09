// src/components/auth/ProfileForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useProfile } from '@/hooks/useProfile';
import PhoneVerification from './PhoneVerification';
import { useLocale } from '@/contexts/LocaleContext';

interface ProfileFormProps {
  onCompleted: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onCompleted }) => {
  const { t } = useLocale();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [username, setUsername] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [error, setError] = useState('');
  const { updateUserProfile, loading } = useProfile();

  const profileSchema = z.object({
    username: z.string().min(3, 'Nick jest wymagany (min. 3 znaki)'),
    firstName: z.string().min(2, 'Imię jest wymagane'),
    lastName: z.string().min(2, 'Nazwisko jest wymagane'),
    city: z.string().min(2, 'Miasto jest wymagane'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      profileSchema.parse({ username, firstName, lastName, city });
      await updateUserProfile({
        username,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        city,
      });
      setShowPhoneVerification(true);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? t('profile.name_error'));
      } else {
        setError(err.message);
      }
    }
  };

  if (showPhoneVerification) {
    return <PhoneVerification onVerified={onCompleted} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8"
    >
      <h2 className="text-2xl font-bold text-white text-center mb-6">{t('profile.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nick"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          required
        />
        <input
          type="text"
          placeholder="Imię"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          required
        />
        <input
          type="text"
          placeholder="Nazwisko"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          required
        />
        <input
          type="text"
          placeholder="Miasto"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#D4AF37] text-[#00172D] font-semibold rounded-lg hover:bg-[#B8942A] transition-colors disabled:opacity-50"
        >
          {loading ? t('profile.saving') : t('profile.save')}
        </button>
      </form>
    </motion.div>
  );
};

export default ProfileForm;

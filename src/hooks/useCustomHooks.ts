import { useState, useEffect, useCallback } from 'react';
import { meetingsService, type Meeting } from '@/services/meetingsService';
import { referencesService, type Reference } from '@/services/referencesService';

// Mock hook dla kursu EUR
export const useRatePLNperEUR = () => {
  return 4.3; // Stały kurs dla uproszczenia
};

// Mock hook dla weryfikacji profilu
export const useProfileVerification = () => {
  return {
    canBid: true,
    missingFields: [] as string[]
  };
};

// Hook dla scroll reveal animations
export const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(true); // Zawsze widoczny dla uproszczenia
  
  return {
    ref: null,
    isVisible
  };
};

// Hook dla spotkań z hodowcami
export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meetingsService.getMeetings();
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd pobierania spotkań');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, error, refetch: fetchMeetings };
};
export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meetingsService.getMeetings();
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd pobierania spotkań');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, error, refetch: fetchMeetings };
};

// Hook dla referencji
export const useReferences = () => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await referencesService.getReferences();
      setReferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd pobierania referencji');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  return { references, loading, error, refetch: fetchReferences };
};

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auctionService } from '@/services/auctionService';
import { CreateAuctionRequest } from '@/types/auction';
import { useFileUpload } from '@/hooks/useFileUpload';

interface UseAuctionFormOptions {
    category: 'pigeons' | 'supplements' | 'accessories';
    onSuccess?: () => void;
}

export const useAuctionForm = ({ category, onSuccess }: UseAuctionFormOptions) => {
    const { user, profile, session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState<Partial<CreateAuctionRequest>>({
        title: '',
        description: '',
        startingPrice: category === 'pigeons' ? 1000 : category === 'supplements' ? 10 : 50,
        buyNowPrice: undefined,
        category: category === 'pigeons' ? 'RACING' : category.toUpperCase() as any,
        sex: 'male',
        location: 'Lubań, Polska',
        images: [],
        videos: [],
        pigeon: category === 'pigeons' ? {
            ringNumber: '',
            colorTraits: [],
            eyeTraits: [],
            bodyStructureTraits: [],
            musculatureTraits: [],
            wingTraits: [],
            breedingValueTraits: [],
            distanceTraits: [],
            dnaCertificate: false,
        } : {
            vitality: 'N/A',
            endurance: 'N/A',
            gender: 'male',
        } as any,
    });

    const [isBidding, setIsBidding] = useState(true);
    const [isBuyNow, setIsBuyNow] = useState(false);

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);

    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'info' | 'warning';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    const { uploadFiles, isUploading } = useFileUpload({
        token: session?.access_token,
        onProgress: (msg) => setFeedback(prev => ({ ...prev, message: msg, isOpen: true }))
    });

    const validate = (): boolean => {
        if (!user || !profile) {
            setError('Musisz być zalogowany.');
            return false;
        }

        if (profile.role === 'USER_REGISTERED' || profile.role === 'USER_EMAIL_VERIFIED') {
            setError('Twoje konto wymaga pełnej weryfikacji danych.');
            return false;
        }

        if (!isBidding && !isBuyNow) {
            setError('Wybierz co najmniej jedną opcję sprzedaży.');
            return false;
        }

        if (category === 'pigeons' && !formData.pigeon?.ringNumber) {
            setError('Podaj numer obrączki gołębia.');
            return false;
        }

        if (!formData.title?.trim()) {
            setError('Podaj tytuł aukcji.');
            return false;
        }

        return true;
    };

    const submit = async () => {
        if (!validate()) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Upload Images
            const imageUrls = await uploadFiles(imageFiles, 'zdjęcia');

            // 2. Upload Videos
            const videoUrls = await uploadFiles(videoFiles, 'filmy');

            // 3. Prepare Final Request
            const endTime = new Date();
            endTime.setDate(endTime.getDate() + 7);

            const request: CreateAuctionRequest = {
                title: formData.title!,
                description: formData.description || '',
                startingPrice: isBidding ? Number(formData.startingPrice) : undefined,
                buyNowPrice: isBuyNow ? Number(formData.buyNowPrice) : undefined,
                category: formData.category as any,
                sex: formData.sex as any,
                location: formData.location!,
                images: imageUrls,
                videos: videoUrls,
                endTime: endTime.toISOString(),
                pigeon: category === 'pigeons' ? {
                    ...formData.pigeon,
                    ringNumber: formData.pigeon?.ringNumber?.trim()
                } : (formData.pigeon as any),
            };

            await auctionService.createAuction(request, session?.access_token ?? '');

            setFeedback({
                isOpen: true,
                type: 'success',
                title: 'Sukces!',
                message: 'Aukcja została utworzona pomyślnie.'
            });

            onSuccess?.();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Wystąpił błąd podczas tworzenia aukcji.';
            setError(msg);
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Błąd',
                message: msg
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        isBidding,
        setIsBidding,
        isBuyNow,
        setIsBuyNow,
        imageFiles,
        setImageFiles,
        videoFiles,
        setVideoFiles,
        currentStep,
        setCurrentStep,
        loading: loading || isUploading,
        error,
        setError,
        feedback,
        setFeedback,
        submit
    };
};

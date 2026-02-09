import { useState, useCallback } from 'react';
import { uploadService } from '@/services/uploadService';

interface UseFileUploadOptions {
    onProgress?: (message: string) => void;
    token?: string | null;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const uploadFiles = useCallback(async (files: File[], prefix: string = 'media') => {
        if (!files.length) return [];

        setIsUploading(true);
        setUploadError(null);
        const urls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                options.onProgress?.(`Przesyłam ${prefix} (${i + 1}/${files.length})...`);
                const res = await uploadService.uploadImage(files[i], options.token);
                urls.push(res.url);
            }
            return urls;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Błąd przesyłania plików';
            setUploadError(msg);
            throw err;
        } finally {
            setIsUploading(false);
        }
    }, [options]);

    return { uploadFiles, isUploading, uploadError };
};

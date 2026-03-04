import { useState, useCallback } from "react";
import { uploadService } from "@/services/uploadService";

interface UseFileUploadOptions {
  onProgress?: (message: string) => void;
  token?: string | null;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /** Upload image files (JPEG, PNG, WebP, etc.) via /upload/image */
  const uploadFiles = useCallback(
    async (files: File[], prefix: string = "media") => {
      if (!files.length) return [];

      setIsUploading(true);
      setUploadError(null);
      const urls: string[] = [];
      let i = 0;

      try {
        for (const file of files) {
          i++;
          options.onProgress?.(`Przesyłam ${prefix} (${i}/${files.length})...`);
          const res = await uploadService.uploadImage(
            file,
            options.token ?? null,
          );
          urls.push(res.url);
        }
        return urls;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Błąd przesyłania plików";
        setUploadError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [options],
  );

  /** Upload document files (PDF, etc.) via /upload/document */
  const uploadDocumentFiles = useCallback(
    async (files: File[], prefix: string = "dokumenty") => {
      if (!files.length) return [];

      setIsUploading(true);
      setUploadError(null);
      const urls: string[] = [];
      let i = 0;

      try {
        for (const file of files) {
          i++;
          options.onProgress?.(`Przesyłam ${prefix} (${i}/${files.length})...`);
          // Route: images (scanned pedigrees) → /upload/image; PDFs → /upload/document
          const res = file.type.startsWith("image/")
            ? await uploadService.uploadImage(file, options.token ?? null)
            : await uploadService.uploadDocument(file, options.token ?? null);
          urls.push(res.url);
        }
        return urls;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Błąd przesyłania dokumentów";
        setUploadError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [options],
  );

  /** Upload video files via /upload/video */
  const uploadVideoFiles = useCallback(
    async (files: File[], prefix: string = "filmy") => {
      if (!files.length) return [];

      setIsUploading(true);
      setUploadError(null);
      const urls: string[] = [];
      let i = 0;

      try {
        for (const file of files) {
          i++;
          options.onProgress?.(`Przesyłam ${prefix} (${i}/${files.length})...`);
          const res = await uploadService.uploadVideo(
            file,
            options.token ?? null,
          );
          urls.push(res.url);
        }
        return urls;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Błąd przesyłania filmów";
        setUploadError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [options],
  );

  return {
    uploadFiles,
    uploadDocumentFiles,
    uploadVideoFiles,
    isUploading,
    uploadError,
  };
};

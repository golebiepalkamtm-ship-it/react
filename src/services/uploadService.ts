import apiClient from "./api";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

const resolveToken = async (token: string | null): Promise<string> => {
  if (token) return token;
  if (!supabase) throw new Error("Authentication required");
  const { data } = await supabase.auth.getSession();
  const sessionToken = data.session?.access_token;
  if (!sessionToken) throw new Error("Authentication required");
  return sessionToken;
};

export const uploadService = {
  async uploadImage(
    file: File,
    token: string | null,
  ): Promise<{ url: string; path: string }> {
    let processedFile = file;

    // Kompresja i konwersja do WebP po stronie klienta (frontend)
    try {
      if (
        file.type.startsWith("image/") &&
        !file.type.includes("svg") &&
        !file.type.includes("gif")
      ) {
        const options = {
          maxSizeMB: 0.8, // Max wielkość (ok. 800 KB)
          maxWidthOrHeight: 1600, // Max rozdzielczość
          useWebWorker: true,
          fileType: "image/webp", // Wymuszamy format WEBP
          initialQuality: 0.85,
        };

        const compressedBlob = await imageCompression(file, options);
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
        processedFile = new File([compressedBlob], newFileName, {
          type: "image/webp",
        });
      }
    } catch (error) {
      console.error("Błąd kompresji obrazu, upload oryginalnego pliku:", error);
    }

    const formData = new FormData();
    formData.append("file", processedFile);
    const authToken = await resolveToken(token);
    return apiClient.postFormData<{ url: string; path: string }>(
      "/upload/image",
      formData,
      authToken,
    );
  },

  async uploadDocument(
    file: File,
    token: string | null,
  ): Promise<{ url: string; path: string }> {
    let processedFile = file;

    // Kompresja skanów dokumentów (zdjęć)
    try {
      if (
        file.type.startsWith("image/") &&
        !file.type.includes("svg") &&
        !file.type.includes("gif")
      ) {
        const options = {
          maxSizeMB: 1, // Max 1 MB dla skanów
          maxWidthOrHeight: 2000, // Większa rozdzielczość by rozczytać tekst
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.85,
        };

        const compressedBlob = await imageCompression(file, options);
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
        processedFile = new File([compressedBlob], newFileName, {
          type: "image/webp",
        });
      }
    } catch (error) {
      console.error("Błąd kompresji skanu dokumentu, upload oryginalnego pliku:", error);
    }

    const formData = new FormData();
    formData.append("file", processedFile);
    const authToken = await resolveToken(token);
    return apiClient.postFormData<{ url: string; path: string }>(
      "/upload/document",
      formData,
      authToken,
    );
  },

  async uploadVideo(
    file: File,
    token: string | null,
  ): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const authToken = await resolveToken(token);
    return apiClient.postFormData<{ url: string; path: string }>(
      "/upload/video",
      formData,
      authToken,
    );
  },
};

export default uploadService;

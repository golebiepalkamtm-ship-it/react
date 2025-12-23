import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { authService } from './authService';

class UploadService {
  async uploadPigeonImages(files: File[], pigeonId: string): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const path = `pigeons/${pigeonId}/image_${index}_${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return getDownloadURL(snapshot.ref);
    });
    
    return Promise.all(uploadPromises);
  }

  async uploadPedigreeDocuments(files: File[], pigeonId: string): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const path = `pigeons/${pigeonId}/pedigree_${index}_${Date.now()}.pdf`;
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return getDownloadURL(snapshot.ref);
    });
    
    return Promise.all(uploadPromises);
  }

  async uploadProfileAvatar(file: File): Promise<string> {
    const userId = authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const path = `users/${userId}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }

  async deleteFile(url: string): Promise<void> {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  }

  validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  validateDocumentFile(file: File): boolean {
    const allowedTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }
}

export const uploadService = new UploadService();
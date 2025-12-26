export class UploadServiceRemovedError extends Error {
  constructor() {
    super('Firebase storage uploadService was removed. Configure Supabase Storage if you need uploads.');
  }
}

class UploadService {
  async uploadPigeonImages(files: File[], pigeonId: string): Promise<string[]> {
    throw new UploadServiceRemovedError();
  }

  async uploadPedigreeDocuments(files: File[], pigeonId: string): Promise<string[]> {
    throw new UploadServiceRemovedError();
  }

  async uploadProfileAvatar(file: File): Promise<string> {
    throw new UploadServiceRemovedError();
  }

  async deleteFile(url: string): Promise<void> {
    throw new UploadServiceRemovedError();
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
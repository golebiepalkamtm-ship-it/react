/**
 * Upload Routes
 * 
 * Endpointy do przesyłania plików (obrazy, dokumenty, video).
 * Pliki trafiają do Supabase Storage (S3-compatible) przez AWS SDK.
 * 
 * Frontend wywołuje:
 * - POST /api/upload/image   → uploadService.uploadImage()
 * - POST /api/upload/document → uploadService.uploadDocument()
 * - POST /api/upload/video    → uploadService.uploadVideo()
 */

import express, { type Router, type Response } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../lib/s3.js';
import { validatedEnv } from '../lib/env.js';
import crypto from 'crypto';
import multer from 'multer';

const router: Router = express.Router();

// Multer config — przechowaj w pamięci (pliki lecą dalej do S3)
const storage = multer.memoryStorage();

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Dozwolone formaty: JPEG, PNG, WebP, GIF'));
  }
};

const documentFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Dozwolone formaty: PDF, JPEG, PNG, WebP'));
  }
};

const videoFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Dozwolone formaty: MP4, WebM, MOV'));
  }
};

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

/**
 * Generuje unikalną ścieżkę pliku w bucket'cie
 */
const generateFilePath = (userId: string, folder: string, originalname: string): string => {
  const ext = originalname.split('.').pop() || 'bin';
  const hash = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${folder}/${userId}/${timestamp}-${hash}.${ext}`;
};

/**
 * Wysyła plik do Supabase Storage (S3)
 */
const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const bucket = validatedEnv.SUPABASE_BUCKET || 'uploads';

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  // Publiczny URL z Supabase Storage
  const publicUrl = `${validatedEnv.SUPABASE_URL}/storage/v1/object/public/${bucket}/${key}`;
  return publicUrl;
};

/**
 * POST /api/upload/image
 */
router.post(
  '/image',
  authMiddleware,
  uploadImage.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Brak autoryzacji.' });

      const file = req.file;
      if (!file) return res.status(400).json({ error: 'Nie przesłano pliku.' });

      const filePath = generateFilePath(userId, 'images', file.originalname);
      const url = await uploadToS3(file.buffer, filePath, file.mimetype);

      res.json({ url, path: filePath });
    } catch (error: any) {
      console.error('Image upload error:', error);
      if (error.message?.includes('Dozwolone formaty')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Wystąpił błąd podczas przesyłania obrazu.' });
    }
  }
);

/**
 * POST /api/upload/document
 */
router.post(
  '/document',
  authMiddleware,
  uploadDocument.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Brak autoryzacji.' });

      const file = req.file;
      if (!file) return res.status(400).json({ error: 'Nie przesłano pliku.' });

      const filePath = generateFilePath(userId, 'documents', file.originalname);
      const url = await uploadToS3(file.buffer, filePath, file.mimetype);

      res.json({ url, path: filePath });
    } catch (error: any) {
      console.error('Document upload error:', error);
      if (error.message?.includes('Dozwolone formaty')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Wystąpił błąd podczas przesyłania dokumentu.' });
    }
  }
);

/**
 * POST /api/upload/video
 */
router.post(
  '/video',
  authMiddleware,
  uploadVideo.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Brak autoryzacji.' });

      const file = req.file;
      if (!file) return res.status(400).json({ error: 'Nie przesłano pliku.' });

      const filePath = generateFilePath(userId, 'videos', file.originalname);
      const url = await uploadToS3(file.buffer, filePath, file.mimetype);

      res.json({ url, path: filePath });
    } catch (error: any) {
      console.error('Video upload error:', error);
      if (error.message?.includes('Dozwolone formaty')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Wystąpił błąd podczas przesyłania wideo.' });
    }
  }
);

export default router;

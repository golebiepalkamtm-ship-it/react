import express, { type Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { supabase } from '../lib/db.js';
import { createClient } from '@supabase/supabase-js';
import { unifiedAuthMiddleware } from '../middleware/unifiedAuth.js';
import type { AuthenticatedRequest } from '../middleware/unifiedAuth.js';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { validatedEnv } from '../lib/env.js';
import logger from '../lib/logger.js';

const router: Router = express.Router();

// Schematy walidacji
const bucketNameEnum = z.enum(['auction-media', 'user-documents', 'temp-uploads']);

const uploadMetadataSchema = z.object({
  auctionId: z.string().uuid('Invalid auction ID format').optional(),
  bucketName: bucketNameEnum.default('auction-media'),
  category: z.enum(['image', 'document', 'video']).default('image')
});

// Build allowed MIME types from environment
const ALLOWED_MIME_TYPES: Record<string, { ext: string[]; maxSize: number }> = {};
const allowedMimeTypes = validatedEnv.ALLOWED_MIME_TYPES.split(',');

allowedMimeTypes.forEach(mime => {
  const trimmedMime = mime.trim();
  switch (trimmedMime) {
    case 'image/jpeg':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.jpg', '.jpeg'], maxSize: 5 * 1024 * 1024 };
      break;
    case 'image/png':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.png'], maxSize: 5 * 1024 * 1024 };
      break;
    case 'image/gif':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.gif'], maxSize: 5 * 1024 * 1024 };
      break;
    case 'image/webp':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.webp'], maxSize: 5 * 1024 * 1024 };
      break;
    case 'image/bmp':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.bmp'], maxSize: 10 * 1024 * 1024 };
      break;
    case 'image/tiff':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.tif', '.tiff'], maxSize: 10 * 1024 * 1024 };
      break;
    case 'image/vnd.adobe.photoshop':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.psd'], maxSize: 10 * 1024 * 1024 };
      break;
    case 'video/mp4':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.mp4'], maxSize: 50 * 1024 * 1024 };
      break;
    case 'video/webm':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.webm'], maxSize: 50 * 1024 * 1024 };
      break;
    case 'application/pdf':
      ALLOWED_MIME_TYPES[trimmedMime] = { ext: ['.pdf'], maxSize: 10 * 1024 * 1024 };
      break;
  }
});

const MIME_MAGIC_NUMBERS: { [key: string]: Buffer } = {
  'image/jpeg': Buffer.from([0xFF, 0xD8, 0xFF]),
  'image/png': Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  'image/webp': Buffer.from([0x52, 0x49, 0x46, 0x46]),
  'application/pdf': Buffer.from([0x25, 0x50, 0x44, 0x46]),
  'video/mp4': Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]), // ftyp
  'video/webm': Buffer.from([0x1A, 0x45, 0xDF, 0xA3]) // EBML
};

const DANGEROUS_EXTENSIONS = [
  '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.svg', '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.bat', '.cmd', '.exe', '.msi', '.deb', '.rpm', '.dmg', '.app'
];

function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\.\./g, '')
    .substring(0, 255);
}

function validateFileType(buffer: Buffer, mimetype: string): boolean {
  const magic = MIME_MAGIC_NUMBERS[mimetype as keyof typeof MIME_MAGIC_NUMBERS];
  if (!magic) return false;
  return buffer.subarray(0, magic.length).equals(magic);
}

function containsMaliciousContent(buffer: Buffer, mimetype: string): boolean {
  const content = buffer.toString('utf8', 0, Math.min(16384, buffer.length)); // 16 KB
  
  if (mimetype === 'image/svg+xml' || content.includes('<svg')) {
    return content.includes('<script') || content.includes('javascript:') || content.includes('onload=');
  }
  
  if (mimetype.startsWith('text/') || content.includes('<!DOCTYPE')) {
    return content.includes('<script') || content.includes('javascript:') || content.includes('onerror=') || content.includes('onload=');
  }
  
  return false;
}

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: validatedEnv.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
    
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return cb(new Error('Dangerous file type not allowed'));
    }
    
    if (!ALLOWED_MIME_TYPES[file.mimetype as keyof typeof ALLOWED_MIME_TYPES]) {
      return cb(new Error('MIME type not allowed'));
    }
    
    cb(null, true);
  }
});

const createUserSupabaseClient = (token: string) => {
  return createClient(validatedEnv.SUPABASE_URL, validatedEnv.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
};

const shouldRetryWithUserToken = (error: any) => {
  const status = String(error?.status || error?.statusCode || '');
  const message = String(error?.message || '').toLowerCase();
  return status === '403' || message.includes('signature verification failed');
};

router.post('/image', unifiedAuthMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    
    // Walidacja metadata
    try {
      uploadMetadataSchema.parse(req.body);
    } catch (validationError: any) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.errors 
      });
    }
    
    const file = req.file;
    const { auctionId, bucketName } = req.body;
    if (!file) return res.status(400).json({ error: 'No file provided' });
    
    const allowedConfig = ALLOWED_MIME_TYPES[file.mimetype as keyof typeof ALLOWED_MIME_TYPES];
    if (!allowedConfig) {
      return res.status(400).json({ error: 'MIME type not allowed' });
    }
    
    if (file.size > allowedConfig.maxSize) {
      return res.status(400).json({ error: `File size exceeds limit of ${allowedConfig.maxSize / 1024 / 1024}MB` });
    }
    
    if (!validateFileType(file.buffer, file.mimetype)) {
      return res.status(400).json({ error: 'File type validation failed' });
    }
    
    if (containsMaliciousContent(file.buffer, file.mimetype)) {
      return res.status(400).json({ error: 'File contains malicious content' });
    }
    
    const originalExt = '.' + file.originalname.split('.').pop()?.toLowerCase();
    if (!allowedConfig.ext.includes(originalExt as any)) {
      return res.status(400).json({ error: 'File extension not allowed for this MIME type' });
    }
    
    const sanitizedOriginalName = sanitizeFilename(file.originalname);
    const fileUuid = uuidv4();
    const ext = allowedConfig.ext[0];
    const filename = `${auctionId || 'misc'}/${fileUuid}${ext}`;
    
    const bucket = bucketName || validatedEnv.SUPABASE_BUCKET;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        logger.error('Supabase storage upload error', { 
          error: error.message,
          bucket: bucket,
          filename: filename
        });
        return res.status(500).json({ error: 'Failed to upload to storage', details: error.message });
      }
    } catch (error) {
      logger.error('Supabase storage upload error', { 
        error: error instanceof Error ? error.message : error,
        bucket: bucket,
        filename: filename
      });
      return res.status(500).json({ error: 'Failed to upload to storage', details: error instanceof Error ? error.message : 'Unknown storage error' });
    }
    
    const bucketPublic = String(validatedEnv.SUPABASE_BUCKET_PUBLIC ?? 'true').toLowerCase() === 'true';
    
    if (bucketPublic) {
      const url = `${validatedEnv.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
      return res.json({ 
        url, 
        path: filename,
        originalName: sanitizedOriginalName,
        size: file.size,
        mimetype: file.mimetype
      });
    } else {
      // Signed URL logic for private buckets would go here
      // For now, assuming public is the primary use case
      return res.status(501).json({ error: 'Private buckets not implemented yet' });
    }
  } catch (err) {
    logger.error('Image upload error', { error: err instanceof Error ? err.message : err });
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/video', unifiedAuthMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    
    try {
      uploadMetadataSchema.parse(req.body);
    } catch (validationError: any) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.errors 
      });
    }
    
    const file = req.file;
    const { auctionId, bucketName } = req.body;
    if (!file) return res.status(400).json({ error: 'No file provided' });
    
    const allowedConfig = ALLOWED_MIME_TYPES[file.mimetype as keyof typeof ALLOWED_MIME_TYPES];
    if (!allowedConfig) {
      return res.status(400).json({ error: 'MIME type not allowed' });
    }
    
    if (file.size > allowedConfig.maxSize) {
      return res.status(400).json({ error: `File size exceeds limit of ${allowedConfig.maxSize / 1024 / 1024}MB` });
    }
    
    if (!validateFileType(file.buffer, file.mimetype)) {
      return res.status(400).json({ error: 'File type validation failed' });
    }
    
    if (containsMaliciousContent(file.buffer, file.mimetype)) {
      return res.status(400).json({ error: 'File contains malicious content' });
    }
    
    const originalExt = '.' + file.originalname.split('.').pop()?.toLowerCase();
    if (!allowedConfig.ext.includes(originalExt as any)) {
      return res.status(400).json({ error: 'File extension not allowed for this MIME type' });
    }
    
    const sanitizedOriginalName = sanitizeFilename(file.originalname);
    const fileUuid = uuidv4();
    const ext = allowedConfig.ext[0];
    const filename = `${auctionId || 'misc'}/videos/${fileUuid}${ext}`;
    
    const bucket = bucketName || validatedEnv.SUPABASE_BUCKET;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        logger.error('Supabase storage upload error', { 
          error: error.message,
          bucket: bucket,
          filename: filename
        });
        return res.status(500).json({ error: 'Failed to upload to storage', details: error.message });
      }
    } catch (error) {
      logger.error('Supabase storage upload error', { 
        error: error instanceof Error ? error.message : error,
        bucket: bucket,
        filename: filename
      });
      return res.status(500).json({ error: 'Failed to upload to storage', details: error instanceof Error ? error.message : 'Unknown storage error' });
    }
    
    const bucketPublic = String(validatedEnv.SUPABASE_BUCKET_PUBLIC ?? 'true').toLowerCase() === 'true';
    
    if (bucketPublic) {
      const url = `${validatedEnv.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
      return res.json({ 
        url, 
        path: filename,
        originalName: sanitizedOriginalName,
        size: file.size,
        mimetype: file.mimetype
      });
    } else {
      // Signed URL logic for private buckets would go here
      // For now, assuming public is the primary use case
      return res.status(501).json({ error: 'Private buckets not implemented yet' });
    }
  } catch (err) {
    logger.error('Video upload error', { error: err instanceof Error ? err.message : err });
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/document', unifiedAuthMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Document upload request:', {
      user: req.user?.userId,
      file: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype,
      auctionId: req.body?.auctionId
    });

    if (!req.user?.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!supabase) {
      logger.error('Supabase not configured');
      return res.status(500).json({ error: 'Supabase not configured' });
    }
    
    // Walidacja metadata
    try {
      uploadMetadataSchema.parse(req.body);
    } catch (validationError: any) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.errors 
      });
    }
    
    const file = req.file;
    const { auctionId, bucketName } = req.body;
    if (!file) return res.status(400).json({ error: 'No file provided' });
    
    const allowedConfig = ALLOWED_MIME_TYPES[file.mimetype as keyof typeof ALLOWED_MIME_TYPES];
    if (!allowedConfig) {
      return res.status(400).json({ error: 'MIME type not allowed' });
    }
    
    if (file.size > allowedConfig.maxSize) {
      return res.status(400).json({ error: `File size exceeds limit of ${allowedConfig.maxSize / 1024 / 1024}MB` });
    }
    
    if (!validateFileType(file.buffer, file.mimetype)) {
      return res.status(400).json({ error: 'File type validation failed' });
    }
    
    if (containsMaliciousContent(file.buffer, file.mimetype)) {
      return res.status(400).json({ error: 'File contains malicious content' });
    }
    
    const originalExt = '.' + file.originalname.split('.').pop()?.toLowerCase();
    if (!allowedConfig.ext.includes(originalExt as any)) {
      return res.status(400).json({ error: 'File extension not allowed for this MIME type' });
    }
    
    const sanitizedOriginalName = sanitizeFilename(file.originalname);
    const fileUuid = uuidv4();
    const ext = allowedConfig.ext[0];
    const filename = `${auctionId || 'misc'}/docs/${fileUuid}${ext}`;
    
    const bucket = bucketName || validatedEnv.SUPABASE_BUCKET;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        logger.error('Supabase storage upload error', { 
          error: error.message,
          bucket: bucket,
          filename: filename
        });
        return res.status(500).json({ error: 'Failed to upload to storage', details: error.message });
      }
    } catch (error) {
      logger.error('Supabase storage upload error', { 
        error: error instanceof Error ? error.message : error,
        bucket: bucket,
        filename: filename
      });
      return res.status(500).json({ error: 'Failed to upload to storage', details: error instanceof Error ? error.message : 'Unknown storage error' });
    }
    
    const bucketPublic = String(validatedEnv.SUPABASE_BUCKET_PUBLIC ?? 'true').toLowerCase() === 'true';
    
    if (bucketPublic) {
      const url = `${validatedEnv.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
      return res.json({ 
        url, 
        path: filename,
        originalName: sanitizedOriginalName,
        size: file.size,
        mimetype: file.mimetype
      });
    } else {
      // Signed URL logic for private buckets would go here
      // For now, assuming public is the primary use case
      return res.status(501).json({ error: 'Private buckets not implemented yet' });
    }
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;

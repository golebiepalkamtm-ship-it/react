import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (
  error: Error & { code?: string },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Multer / upload specific errors -> normalize to 400
  if ((error as any).code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size exceeds limit' });
  }

  // Multer/file-filter produced friendly messages
  if (error.message && /Dangerous file type not allowed|MIME type not allowed|File type validation failed|File contains malicious content/i.test(error.message)) {
    return res.status(400).json({ error: error.message });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    error: error.message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};
import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../lib/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Pobierz lub wygeneruj Request ID
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('X-Request-Id', requestId);

  // Przechwytywanie rozmiaru odpowiedzi
  let responseBytes = 0;
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk: any, ...args: any[]) {
    if (chunk) {
      responseBytes += chunk.length || 0;
    }
    return (originalWrite as any).apply(res, [chunk, ...args]);
  };

  res.end = function (chunk: any, ...args: any[]) {
    if (chunk) {
      responseBytes += chunk.length || 0;
    }
    
    const responseTimeMS = Date.now() - start;
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Format logu zgodny z życzeniem użytkownika
    const logLine = `clientIP="${clientIP}" requestID="${requestId}" responseTimeMS=${responseTimeMS} responseBytes=${responseBytes} userAgent="${userAgent}"`;
    
    // Loguj tylko jeśli to nie jest zwykły health check
    logger.info(logLine);

    return (originalEnd as any).apply(res, [chunk, ...args]);
  };

  next();
};

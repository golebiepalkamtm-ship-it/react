import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodString, ZodNumber } from 'zod';

// Enhanced validation with security features
export const validate = (schema: z.ZodSchema, options?: { 
  sanitize?: boolean;
  stripUnknown?: boolean;
  strict?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let data = req.body;
      
      // Sanitize input if requested
      if (options?.sanitize) {
        data = sanitizeInput(data);
      }
      
      // Parse with options
      const result = schema.safeParse(data);
      
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: result.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      
      // Update request body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema, options?: { sanitize?: boolean }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let data = req.query;
      
      // Sanitize query parameters
      if (options?.sanitize) {
        data = sanitizeInput(data);
      }
      
      const result = schema.safeParse(data);
      
      if (!result.success) {
        return res.status(400).json({
          error: 'Query validation failed',
          details: result.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Query validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        return res.status(400).json({
          error: 'Params validation failed',
          details: result.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      
      req.params = result.data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Params validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      next(error);
    }
  };
};

export const validateCombined = (
  bodySchema?: z.ZodSchema,
  querySchema?: z.ZodSchema,
  paramsSchema?: z.ZodSchema,
  options?: { sanitize?: boolean; stripUnknown?: boolean }
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: any[] = [];
      
      // Validate body
      if (bodySchema) {
        let bodyData = req.body;
        if (options?.sanitize) {
          bodyData = sanitizeInput(bodyData);
        }
        
        const bodyResult = bodySchema.safeParse(bodyData);
        
        if (!bodyResult.success) {
          errors.push(...bodyResult.error.errors.map(e => ({
            path: `body.${e.path.join('.')}`,
            message: e.message,
            code: e.code
          })));
        } else {
          req.body = bodyResult.data;
        }
      }
      
      // Validate query
      if (querySchema) {
        let queryData = req.query;
        if (options?.sanitize) {
          queryData = sanitizeInput(queryData);
        }
        
        const queryResult = querySchema.safeParse(queryData);
        
        if (!queryResult.success) {
          errors.push(...queryResult.error.errors.map(e => ({
            path: `query.${e.path.join('.')}`,
            message: e.message,
            code: e.code
          })));
        } else {
          req.query = queryResult.data;
        }
      }
      
      // Validate params
      if (paramsSchema) {
        const paramsResult = paramsSchema.safeParse(req.params);
        
        if (!paramsResult.success) {
          errors.push(...paramsResult.error.errors.map(e => ({
            path: `params.${e.path.join('.')}`,
            message: e.message,
            code: e.code
          })));
        } else {
          req.params = paramsResult.data;
        }
      }
      
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      next(error);
    }
  };
};

// Input sanitization function
function sanitizeInput(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return sanitizeString(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const sanitizedKey = sanitizeString(key);
    sanitized[sanitizedKey] = sanitizeInput(value);
  }
  
  return sanitized;
}

function sanitizeString(value: any): any {
  if (typeof value !== 'string') return value;
  
  return value
    // Remove potentially dangerous characters
    .replace(/[<>]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

// Common validation schemas with security enhancements
export const commonSchemas = {
  // UUID validation with strict format
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Safe string validation
  safeString: (min = 1, max = 1000) => z.string()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must be at most ${max} characters`)
    .regex(/^[a-zA-Z0-9\s\-_.@]+$/, 'Contains invalid characters'),
  
  // Email validation with strict format
  email: z.string().email('Invalid email format'),
  
  // Phone number validation
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format'),
  
  // URL validation with allowed protocols
  url: z.string().url('Invalid URL format').refine(
    (url) => {
      const allowedProtocols = ['http:', 'https:'];
      try {
        const parsed = new URL(url);
        return allowedProtocols.includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    'Only HTTP and HTTPS URLs are allowed'
  ),
  
  // Pagination validation
  pagination: z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  }),
  
  // Date range validation
  dateRange: z.object({
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format')
  }).refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    'Start date must be before end date'
  ),
  
  // Search query validation
  searchQuery: z.object({
    q: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_.]+$/),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional()
  }).refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    'Minimum price must be less than maximum price'
  )
};

// Security validation middleware
export const validateSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url',
    'x-real-ip'
  ];
  
  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      console.warn(`Suspicious header detected: ${header} from IP ${req.ip}`);
    }
  }
  
  next();
};

// Rate limiting validation middleware
export const validateRequestSize = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request entity too large',
        maxSize: `${maxSize / 1024 / 1024}MB`
      });
    }
    
    next();
  };
};


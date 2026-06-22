import { Request, Response, NextFunction } from 'express';

// M2 Custom XSS Protection
export function xssProtection(req: Request, res: Response, next: NextFunction) {
  let depth = 0;
  const MAX_DEPTH = 10;
  
  const sanitize = (obj: any): any => {
    depth++;
    if (depth > MAX_DEPTH) return obj; // Prevent max call stack DOS
    
    let result = obj;
    if (typeof obj === 'string') {
      result = obj.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else if (Array.isArray(obj)) {
      result = obj.map(item => sanitize(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const sanitizedObj: any = {};
      for (const key in obj) {
        sanitizedObj[key] = sanitize(obj[key]);
      }
      result = sanitizedObj;
    }
    
    depth--;
    return result;
  };

  if (req.body && !req.originalUrl.includes('/webhooks/')) {
    req.body = sanitize(req.body);
  }
  next();
}

// M2 Custom CSRF Protection
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (req.originalUrl.includes('/webhooks/')) {
    return next();
  }

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const host = req.headers.host;

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return res.status(403).json({ error: 'Blocked by CSRF protection: Origin mismatch.' });
        }
      } catch (e) {}
    } else if (referer && host) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host) {
          return res.status(403).json({ error: 'Blocked by CSRF protection: Referer mismatch.' });
        }
      } catch(e) {}
    }
  }
  next();
}

import express from 'express';
import jwt from 'jsonwebtoken';
import { container } from '../shared/container';
import { randomBytes } from 'crypto';
import type { UserProfile } from '../../src/types';

// Use env var or generate a secure random one for this node session
export const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('[AUTH] Warning: JWT_SECRET environment variable is missing. A random session secret was generated. Tokens will invalidate on server restart.');
}

function sanitizeUser(user: any): any {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}
export { sanitizeUser };

async function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  let token = req.cookies.token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Não autorizado. Faça login.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await container.profileRepository.getProfileById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }
}
export { authenticate };

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as UserProfile;
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}
export { requireAdmin };


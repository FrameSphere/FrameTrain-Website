import jwt from 'jsonwebtoken';

// KEIN Fallback-Secret – siehe lib/auth.ts für Begründung.
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET ist nicht gesetzt. Bitte in den Umgebungsvariablen konfigurieren.');
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign a JWT token
 */
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    console.error('JWT decoding failed:', error);
    return null;
  }
}

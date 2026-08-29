import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/secrets.js';

export const ADMIN_SESSION_COOKIE = 'canteen_admin_session';

export function setAdminSessionCookie(req: Request, res: Response, token: string, maxAgeSeconds: number): void {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const attrs = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`
  ];

  if (isHttps) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function clearAdminSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
}

export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export function extractAdminToken(req: Request): string | null {
  const cookies = parseCookies(req);
  if (cookies[ADMIN_SESSION_COOKIE]) return cookies[ADMIN_SESSION_COOKIE];

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

export interface DecodedAdmin {
  username: string;
}

export function tryDecodeAdmin(req: Request): DecodedAdmin | null {
  const token = extractAdminToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedAdmin;
  } catch {
    return null;
  }
}

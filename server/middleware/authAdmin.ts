import { Request, Response, NextFunction } from 'express';
import { tryDecodeAdmin } from '../utils/cookies.js';

export interface AdminAuthRequest extends Request {
  adminUser?: {
    username: string;
  };
}

export function authAdminMiddleware(req: AdminAuthRequest, res: Response, next: NextFunction) {
  const decoded = tryDecodeAdmin(req);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication token required'
    });
  }
  req.adminUser = { username: decoded.username };
  next();
}

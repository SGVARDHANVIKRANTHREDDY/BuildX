import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'canteen_super_secret_jwt_key_2026';

export interface AdminAuthRequest extends Request {
  adminUser?: {
    username: string;
  };
}

export function authAdminMiddleware(req: AdminAuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication token required'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.adminUser = { username: decoded.username };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Token is invalid or has expired'
    });
  }
}

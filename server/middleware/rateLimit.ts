import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const allLimiterMaps: Map<string, RateLimitRecord>[] = [];

setInterval(() => {
  const now = Date.now();
  for (const map of allLimiterMaps) {
    for (const [ip, record] of map.entries()) {
      if (now > record.resetAt) map.delete(ip);
    }
  }
}, 10 * 60 * 1000).unref();

export function createRateLimiter(windowMs: number, maxRequests: number, message: string) {
  const ipMap = new Map<string, RateLimitRecord>();
  allLimiterMaps.push(ipMap);

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = ipMap.get(clientIp);
    if (!record || now > record.resetAt) {
      ipMap.set(clientIp, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: message
      });
    }

    record.count += 1;
    next();
  };
}

import { Request, Response, NextFunction } from 'express';

export function validateCartItems(req: Request, res: Response, next: NextFunction) {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order: cart must contain at least one item'
    });
  }

  for (const item of items) {
    if (!item.item_id || typeof item.item_id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid order: every item must have a valid item_id'
      });
    }
    if (!Number.isInteger(item.qty) || item.qty <= 0 || item.qty > 50) {
      return res.status(400).json({
        success: false,
        error: `Invalid quantity for item ${item.item_id}: must be an integer between 1 and 50`
      });
    }
  }

  next();
}

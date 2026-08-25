import { OrderDetails } from '../types';

export function buildOrderDetailsFromVerify(verifyData: any, paymentId: string): OrderDetails {
  return {
    token_id: verifyData.token_id,
    date: new Date().toISOString().split('T')[0],
    items: verifyData.items,
    total_amount: verifyData.total_amount,
    payment_id: paymentId,
    payment_status: 'PAID',
    order_status: 'PLACED',
    timestamp: verifyData.timestamp,
    estimatedMinutesRemaining: verifyData.estimatedWaitMinutes
  };
}

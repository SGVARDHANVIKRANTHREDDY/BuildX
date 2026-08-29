export interface MenuItem {
  item_id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  restock_note?: string;
}

export interface OrderItem {
  item_id: string;
  name?: string;
  price?: number;
  qty: number;
}

export type PaymentStatus = 'PAID' | 'FAILED' | 'PENDING';
export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'SERVED';

export interface OrderRecord {
  token_id: string;
  date: string;
  items: string;
  total_amount: number;
  payment_id: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  timestamp: string;
}

export interface CounterRecord {
  date: string;
  last_serial: number;
}

export interface AdminRecord {
  username: string;
  password_hash: string;
}

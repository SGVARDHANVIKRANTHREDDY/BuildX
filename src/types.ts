export interface MenuItem {
  item_id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  restock_note?: string;
}

export interface CartItem {
  item: MenuItem;
  qty: number;
}

export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'SERVED';
export type PaymentStatus = 'PAID' | 'FAILED' | 'PENDING';

export interface OrderItemPayload {
  item_id: string;
  name?: string;
  price?: number;
  qty: number;
}

export interface OrderDetails {
  token_id: string;
  date: string;
  items: OrderItemPayload[];
  total_amount: number;
  payment_id: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  timestamp: string;
  ordersAhead?: number;
  estimatedMinutesRemaining?: number;
}

export interface QueueInfo {
  queueDepth: number;
  estimatedWaitMinutes: number;
  activeOrdersCount: number;
}

export interface AdminStats {
  totalOrders: number;
  activeCount: number;
  readyCount: number;
  servedCount: number;
  totalRevenue: number;
  avgWaitMinutes: string;
}

export interface AdminOrder {
  token_id: string;
  date: string;
  items: OrderItemPayload[];
  total_amount: number;
  payment_id: string;
  payment_status: string;
  order_status: OrderStatus;
  timestamp: string;
}

export interface DisplayFeedData {
  timestamp: string;
  date: string;
  stats: {
    totalActive: number;
    readyCount: number;
    preparingCount: number;
  };
  tokens: {
    ready: string[];
    preparing: string[];
    recentlyServed: string[];
  };
}

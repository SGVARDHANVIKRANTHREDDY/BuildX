import { useState, useEffect } from 'react';
import { MenuItem, CartItem, QueueInfo } from '../types';

export function useMenuAndCart(onCartCountChange?: (count: number) => void) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [queueInfo, setQueueInfo] = useState<QueueInfo>({ queueDepth: 0, estimatedWaitMinutes: 5, activeOrdersCount: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) {
        setMenuItems(data.items);
        if (data.queueInfo) {
          setQueueInfo(data.queueInfo);
        }
        setCart(prevCart =>
          prevCart.map(cartItem => {
            const freshItem = data.items.find((i: MenuItem) => i.item_id === cartItem.item.item_id);
            return freshItem ? { ...cartItem, item: freshItem } : cartItem;
          })
        );
      }
    } catch (err) {
      console.error('Failed to load menu', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    const interval = setInterval(fetchMenu, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onCartCountChange) {
      const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
      onCartCountChange(totalQty);
    }
  }, [cart, onCartCountChange]);

  // Normalize category casing (e.g. "Fast Food" and "FASTFOOD" refer to the same
  // category but come from inconsistently-entered menu data) so they merge into
  // a single filter chip instead of showing up as duplicates.
  const normalizeCategory = (c: string) => c.trim().replace(/\s+/g, ' ');
  const canonicalCategoryFor = new Map<string, string>();
  for (const item of menuItems) {
    const normalized = normalizeCategory(item.category);
    const key = normalized.toLowerCase();
    if (!canonicalCategoryFor.has(key)) {
      canonicalCategoryFor.set(key, normalized);
    }
  }
  const categories = ['All', ...Array.from(canonicalCategoryFor.values())];
  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter(i => normalizeCategory(i.category).toLowerCase() === selectedCategory.toLowerCase());

  const addToCart = (item: MenuItem) => {
    if (!item.available) return;
    setCart(prev => {
      const existing = prev.find(c => c.item.item_id === item.item_id);
      if (existing) {
        return prev.map(c => (c.item.item_id === item.item_id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.item_id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map(c => (c.item.item_id === itemId ? { ...c, qty: c.qty - 1 } : c));
      }
      return prev.filter(c => c.item.item_id !== itemId);
    });
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.item.price * item.qty, 0);
  const totalCartQuantity = cart.reduce((sum, item) => sum + item.qty, 0);

  return {
    menuItems,
    queueInfo,
    selectedCategory,
    setSelectedCategory,
    cart,
    setCart,
    isLoading,
    categories,
    filteredItems,
    addToCart,
    removeFromCart,
    totalCartAmount,
    totalCartQuantity
  };
}

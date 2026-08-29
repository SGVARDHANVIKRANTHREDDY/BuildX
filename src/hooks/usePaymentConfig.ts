import { useState, useEffect } from 'react';

export interface PaymentConfig {
  liveMode: boolean;
  key_id: string;
}

export function usePaymentConfig() {
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  useEffect(() => {
    fetch('/api/payment/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPaymentConfig({ liveMode: data.liveMode, key_id: data.key_id });
      })
      .catch(() => {
        setPaymentConfig({ liveMode: false, key_id: '' });
      });
  }, []);

  return paymentConfig;
}

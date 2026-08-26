import { useState } from 'react';

export function useConcurrencySimulation() {
  const [concurrencyCount, setConcurrencyCount] = useState<number>(10);
  const [selectedItemId, setSelectedItemId] = useState<string>('ITM001');
  const [testMode, setTestMode] = useState<'standard' | 'last_unit'>('last_unit');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const runSimulation = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const adminToken = localStorage.getItem('canteen_admin_jwt');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await fetch('/api/concurrency/simulate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          count: concurrencyCount,
          item_id: selectedItemId,
          mode: testMode
        })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      console.error('Concurrency simulation failed', err);
      setTestResult({
        success: false,
        error: err.message || 'Simulation network error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return {
    concurrencyCount,
    setConcurrencyCount,
    selectedItemId,
    setSelectedItemId,
    testMode,
    setTestMode,
    isRunning,
    testResult,
    runSimulation
  };
}

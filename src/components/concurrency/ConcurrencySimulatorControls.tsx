import React from 'react';
import { Play, RefreshCw } from 'lucide-react';

interface ConcurrencySimulatorControlsProps {
  testMode: 'standard' | 'last_unit';
  setTestMode: (mode: 'standard' | 'last_unit') => void;
  concurrencyCount: number;
  setConcurrencyCount: (n: number) => void;
  selectedItemId: string;
  setSelectedItemId: (id: string) => void;
  isRunning: boolean;
  onRun: () => void;
}

export const ConcurrencySimulatorControls: React.FC<ConcurrencySimulatorControlsProps> = ({
  testMode,
  setTestMode,
  concurrencyCount,
  setConcurrencyCount,
  selectedItemId,
  setSelectedItemId,
  isRunning,
  onRun
}) => {
  return (
    <div className="bg-ink-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
        <div>
          <label className="text-[10px] uppercase font-bold text-ink-400 block mb-1">
            Test Mode
          </label>
          <select
            value={testMode}
            onChange={e => setTestMode(e.target.value as 'standard' | 'last_unit')}
            className="bg-ink-900 border border-ink-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="last_unit">Last-Unit Race (1 Wins, N-1 Rejected)</option>
            <option value="standard">Standard Rush (All Get Unique Tokens)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-ink-400 block mb-1">
            Concurrent Orders
          </label>
          <select
            value={concurrencyCount}
            onChange={e => setConcurrencyCount(Number(e.target.value))}
            className="bg-ink-900 border border-ink-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value={5}>5 Simultaneous Orders</option>
            <option value={10}>10 Simultaneous Orders</option>
            <option value={20}>20 Simultaneous Orders</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-ink-400 block mb-1">
            Target Dish
          </label>
          <select
            value={selectedItemId}
            onChange={e => setSelectedItemId(e.target.value)}
            className="bg-ink-900 border border-ink-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ITM001">ITM001: Veg Puff (₹25)</option>
            <option value="ITM002">ITM002: Samosa (₹30)</option>
            <option value="ITM003">ITM003: Masala Dosa (₹60)</option>
            <option value="ITM007">ITM007: Cold Coffee (₹45)</option>
          </select>
        </div>
      </div>

      <button
        id="run-concurrency-test-btn"
        disabled={isRunning}
        onClick={onRun}
        className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-ink-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
      >
        {isRunning ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Firing Concurrent Requests...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Launch Live Concurrency Test</span>
          </>
        )}
      </button>
    </div>
  );
};

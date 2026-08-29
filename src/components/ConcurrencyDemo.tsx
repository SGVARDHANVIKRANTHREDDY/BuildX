import React from 'react';
import { Zap, Lock } from 'lucide-react';
import { useConcurrencySimulation } from '../hooks/useConcurrencySimulation';
import { ConcurrencyExplainer } from './concurrency/ConcurrencyExplainer';
import { ConcurrencySimulatorControls } from './concurrency/ConcurrencySimulatorControls';
import { ConcurrencyResultSummary } from './concurrency/ConcurrencyResultSummary';
import { ConcurrencyResultDetails } from './concurrency/ConcurrencyResultDetails';

export const ConcurrencyDemo: React.FC = () => {
  const {
    concurrencyCount,
    setConcurrencyCount,
    selectedItemId,
    setSelectedItemId,
    testMode,
    setTestMode,
    isRunning,
    testResult,
    runSimulation
  } = useConcurrencySimulation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-ink-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-ink-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-prep-50 text-prep-700 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink-900">Concurrency & Write-Lock Showcase</h2>
              <p className="text-xs text-ink-500 font-medium">
                Live simulation tool to demonstrate zero duplicate tokens and atomic inventory safety under peak rush
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-50 border border-ink-200 rounded-xl text-xs font-semibold text-ink-700">
            <Lock className="w-3.5 h-3.5 text-ok-700" />
            <span>async-mutex serialized</span>
          </div>
        </div>

        <ConcurrencyExplainer />

        <ConcurrencySimulatorControls
          testMode={testMode}
          setTestMode={setTestMode}
          concurrencyCount={concurrencyCount}
          setConcurrencyCount={setConcurrencyCount}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          isRunning={isRunning}
          onRun={runSimulation}
        />
      </div>

      {testResult && (
        <div className="bg-white border border-ink-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <ConcurrencyResultSummary testResult={testResult} />
          <ConcurrencyResultDetails testResult={testResult} />
        </div>
      )}
    </div>
  );
};

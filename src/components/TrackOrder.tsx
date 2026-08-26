import React from 'react';
import { useTrackOrder } from '../hooks/useTrackOrder';
import { ReadyToast } from './track/ReadyToast';
import { TrackLookupForm } from './track/TrackLookupForm';
import { OrderStatusBanner } from './track/OrderStatusBanner';
import { OrderProgressStepper } from './track/OrderProgressStepper';
import { QueuePositionCard } from './track/QueuePositionCard';
import { OrderSummaryList } from './track/OrderSummaryList';
import { OrderStatus } from '../types';

interface TrackOrderProps {
  initialTokenId?: string;
  onNavigateToMenu: () => void;
}

function getStatusStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'PLACED': return 1;
    case 'PREPARING': return 2;
    case 'READY': return 3;
    case 'SERVED': return 4;
    default: return 1;
  }
}

export const TrackOrder: React.FC<TrackOrderProps> = ({
  initialTokenId = '',
  onNavigateToMenu
}) => {
  const {
    tokenIdInput,
    setTokenIdInput,
    currentOrder,
    isLoading,
    error,
    showReadyToast,
    setShowReadyToast,
    handleSubmit
  } = useTrackOrder(initialTokenId);

  const currentStep = currentOrder ? getStatusStepIndex(currentOrder.order_status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReadyToast show={showReadyToast} order={currentOrder} onDismiss={() => setShowReadyToast(false)} />

      <TrackLookupForm
        tokenIdInput={tokenIdInput}
        setTokenIdInput={setTokenIdInput}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />

      {currentOrder && (
        <div className="bg-white border border-ink-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <OrderStatusBanner order={currentOrder} />
          <OrderProgressStepper currentStep={currentStep} />
          <QueuePositionCard order={currentOrder} />
          <OrderSummaryList order={currentOrder} />

          <div className="pt-2 text-center">
            <button
              onClick={onNavigateToMenu}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              ← Return to Menu to Order More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

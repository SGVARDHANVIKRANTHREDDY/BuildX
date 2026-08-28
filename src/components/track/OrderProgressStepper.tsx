import React from 'react';

interface OrderProgressStepperProps {
  currentStep: number;
}

const STEPS = [
  { num: 1, label: 'Placed', sub: 'Order Received', activeBg: 'bg-brand-600' },
  { num: 2, label: 'Preparing', sub: 'In Kitchen', activeBg: 'bg-prep-500' },
  { num: 3, label: 'Ready', sub: 'Collect at Counter', activeBg: 'bg-ok-700' },
  { num: 4, label: 'Served', sub: 'Completed', activeBg: 'bg-ink-900' },
];

export const OrderProgressStepper: React.FC<OrderProgressStepperProps> = ({ currentStep }) => {
  return (
    <div className="py-4">
      <div className="grid grid-cols-4 gap-2 relative">
        {STEPS.map(step => (
          <div key={step.num} className="text-center">
            <div
              className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= step.num ? `${step.activeBg} text-white shadow-xs` : 'bg-ink-100 text-ink-400'
              }`}
            >
              {step.num}
            </div>
            <p className="text-[11px] font-bold text-ink-900 mt-2">{step.label}</p>
            <p className="text-[10px] text-ink-400">{step.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

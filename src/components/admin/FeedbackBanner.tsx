import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FeedbackBannerProps {
  feedback: { type: 'error' | 'success'; message: string } | null;
  onDismiss: () => void;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ feedback, onDismiss }) => {
  if (!feedback) return null;

  return (
    <div
      className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold shadow-xs transition-all ${
        feedback.type === 'error'
          ? 'bg-err-50 border-err-200 text-err-800'
          : 'bg-ok-50 border-ok-200 text-ok-700'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {feedback.type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-err-600 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-ok-700 shrink-0" />
        )}
        <span>{feedback.message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="text-[11px] font-bold underline hover:opacity-80 ml-4 cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  );
};

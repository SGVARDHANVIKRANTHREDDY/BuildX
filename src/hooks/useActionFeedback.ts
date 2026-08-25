import { useState } from 'react';

export type ActionFeedback = { type: 'error' | 'success'; message: string };

export function useActionFeedback() {
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);

  const showFeedback = (type: 'error' | 'success', message: string, duration = 4000) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback(prev => (prev?.message === message ? null : prev));
    }, duration);
  };

  return { actionFeedback, setActionFeedback, showFeedback };
}

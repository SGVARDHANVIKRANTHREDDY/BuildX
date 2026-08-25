let scriptPromise: Promise<void> | null = null;

export function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).Razorpay) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load the Razorpay checkout script. Check your internet connection and try again.'));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

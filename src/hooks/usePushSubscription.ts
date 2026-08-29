export type PushRole = 'student' | 'admin';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function registerServiceWorkerAndSubscribe(
  identifier: string,
  role: PushRole
): Promise<'subscribed' | 'unsupported' | 'denied' | 'error'> {
  if (!isPushSupported()) return 'unsupported';

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') return 'denied';

    const keyRes = await fetch('/api/notifications/vapid-public-key');
    const keyData = await keyRes.json();
    if (!keyData.success || !keyData.key) return 'error';

    const serverKeyBytes = urlBase64ToUint8Array(keyData.key);

    let subscription = await reg.pushManager.getSubscription();

    if (subscription) {
      const existingKeyBytes = subscription.options?.applicationServerKey
        ? new Uint8Array(subscription.options.applicationServerKey as ArrayBuffer)
        : null;
      const existingKeyB64 = existingKeyBytes ? uint8ArrayToBase64Url(existingKeyBytes) : null;
      if (existingKeyB64 !== keyData.key) {
        await subscription.unsubscribe();
        subscription = null;
      }
    }

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: serverKeyBytes,
      });
    }

    const endpoint = role === 'student' ? '/api/notifications/subscribe/order' : '/api/notifications/subscribe/admin';
    const body = role === 'student' ? { token_id: identifier, subscription } : { subscription };

    const subRes = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!subRes.ok) return 'error';
    return 'subscribed';
  } catch (err) {
    console.error('Push subscription failed', err);
    return 'error';
  }
}

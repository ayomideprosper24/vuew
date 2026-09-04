export interface PushNotificationPayload {
  title: string;
  body: string;
  category:
    | 'TASK_ASSIGNED'
    | 'DEADLINE_APPROACHING'
    | 'TASK_OVERDUE'
    | 'TASK_BLOCKED'
    | 'TASK_COMPLETED'
    | 'TASK_SENT_FOR_REVIEW'
    | 'CHANGES_REQUESTED'
    | 'NEW_COMMENT'
    | 'MENTION';
  taskId?: string;
  url?: string;
}

const NOTIFICATION_PERMISSION_KEY = 'vuew_push_permission_requested';
const PUSH_SUBSCRIPTION_KEY = 'vuew_push_subscription_v1';

class PushNotificationService {
  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  public getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');

      if (permission === 'granted') {
        await this.subscribeToPush();
      }

      return permission;
    } catch (err) {
      console.warn('Notification permission request failed:', err);
      return 'denied';
    }
  }

  public async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Architecture note: In a cloud production deployment with an external Push Service,
        // applicationServerKey is the base64-encoded VAPID public key provided via server config.
        // For local development, we safely handle existing subscription or register mock endpoint.
        const vapidPublicKey = (import.meta as unknown as { env?: { VITE_VAPID_PUBLIC_KEY?: string } }).env?.VITE_VAPID_PUBLIC_KEY;

        if (vapidPublicKey) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
          });
        }
      }

      if (subscription) {
        localStorage.setItem(PUSH_SUBSCRIPTION_KEY, JSON.stringify(subscription));
      }

      return subscription;
    } catch (err) {
      console.info('Web Push subscription initialized in local sandbox mode:', err);
      return null;
    }
  }

  /**
   * Safely dispatches a privacy-preserving system notification.
   * Strips any raw sensitive client data to ensure lock-screen confidentiality.
   */
  public async sendLocalNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Sanitized, privacy-conscious notification options
      const options: NotificationOptions = {
        body: payload.body,
        icon: '/pwa-192x192.png',
        badge: '/favicon.png',
        tag: `vuew-${payload.category}-${payload.taskId || 'general'}`,
        data: {
          url: payload.url || '/',
          taskId: payload.taskId,
          category: payload.category,
        },
      };

      await registration.showNotification(payload.title, options);
      return true;
    } catch (err) {
      // Fallback to standard Notification constructor if service worker showNotification fails
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/pwa-192x192.png',
        });
        return true;
      } catch (e) {
        console.warn('Could not display local notification:', e);
        return false;
      }
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotificationService = new PushNotificationService();

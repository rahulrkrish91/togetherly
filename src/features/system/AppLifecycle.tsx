import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { registerPushToken, setupNotificationListeners } from '../../services/notifications/pushNotifications';
import { flushOfflineQueue } from '../../services/offline/syncEngine';
import { trackEvent } from '../../services/telemetry/telemetry';

/**
 * Global side-effects for notifications and offline sync.
 */
export default function AppLifecycle() {
  const { authUser } = useAuth();

  useEffect(() => {
    if (!authUser) return;
    registerPushToken(authUser.uid).catch(() => undefined);

    const unsub = setupNotificationListeners((data) => {
      trackEvent('push_notification_opened', data);
    });

    return unsub;
  }, [authUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      flushOfflineQueue(async () => {
        // executor wiring point: route queued mutations to service methods
      }).catch(() => undefined);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

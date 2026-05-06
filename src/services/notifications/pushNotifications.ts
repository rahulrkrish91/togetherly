import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { trackError, trackEvent } from '../telemetry/telemetry';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushToken(userId: string) {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      trackEvent('push_permission_denied', { userId });
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await setDoc(
      doc(db, 'deviceTokens', `${userId}_${token.slice(0, 20)}`),
      {
        userId,
        token,
        provider: 'expo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    trackEvent('push_token_registered', { userId });
    return token;
  } catch (error) {
    trackError('push_registration_failed', error, { userId });
    return null;
  }
}

export function setupNotificationListeners(onNotificationTap: (data: Record<string, unknown>) => void) {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = (response.notification.request.content.data || {}) as Record<string, unknown>;
    onNotificationTap(data);
  });

  return () => sub.remove();
}

export type NotificationKind = 'chat_message' | 'event_update';

export interface NotificationPayload {
  kind: NotificationKind;
  familyId: string;
  title: string;
  body: string;
  route?: string;
}

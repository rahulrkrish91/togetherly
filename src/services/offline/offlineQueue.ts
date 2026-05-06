import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackError, trackEvent } from '../telemetry/telemetry';

export interface OfflineMutation {
  id: string;
  kind: 'chat_send' | 'event_upsert' | 'location_publish' | 'profile_update';
  payload: Record<string, unknown>;
  createdAt: number;
}

const KEY = 'offlineMutations';

export async function enqueueMutation(mutation: OfflineMutation) {
  try {
    const current = await getQueue();
    await AsyncStorage.setItem(KEY, JSON.stringify([...current, mutation]));
    trackEvent('offline_mutation_enqueued', { kind: mutation.kind });
  } catch (error) {
    trackError('offline_enqueue_failed', error, { kind: mutation.kind });
  }
}

export async function getQueue(): Promise<OfflineMutation[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as OfflineMutation[];
  } catch {
    return [];
  }
}

export async function clearQueue() {
  await AsyncStorage.removeItem(KEY);
}

export async function removeMutation(id: string) {
  const current = await getQueue();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(current.filter((item) => item.id !== id))
  );
}

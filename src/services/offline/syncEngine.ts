import { OfflineMutation, getQueue, removeMutation } from './offlineQueue';
import { trackError, trackEvent } from '../telemetry/telemetry';

export type SyncExecutor = (mutation: OfflineMutation) => Promise<void>;

/**
 * Replays queued mutations in order, removing successful items.
 * Failed items remain queued for retry.
 */
export async function flushOfflineQueue(executor: SyncExecutor) {
  const queue = await getQueue();
  for (const mutation of queue) {
    try {
      await executor(mutation);
      await removeMutation(mutation.id);
      trackEvent('offline_mutation_flushed', { kind: mutation.kind });
    } catch (error) {
      trackError('offline_mutation_flush_failed', error, { kind: mutation.kind });
      break;
    }
  }
}

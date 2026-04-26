import {
  DocumentData,
  DocumentReference,
  WriteBatch,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { getDocCacheFirst } from './cacheFirst';

export type PartialRecord = Record<string, unknown>;

export function changedFields<T extends PartialRecord>(
  current: T | undefined,
  next: Partial<T>
): Partial<T> {
  if (!current) return next;

  return Object.entries(next).reduce<Partial<T>>((acc, [key, value]) => {
    if (current[key as keyof T] !== value) {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {});
}

/**
 * Prevents no-op write costs by diffing against cache/server document first.
 */
export async function updateIfChanged<T extends DocumentData>(
  ref: DocumentReference<T>,
  patch: Partial<T>
) {
  const snapshot = await getDocCacheFirst(ref);
  const next = changedFields(snapshot.data(), patch as PartialRecord);
  if (Object.keys(next).length === 0) {
    return { updated: false };
  }

  await updateDoc(ref, next as Partial<T>);
  return { updated: true };
}

export function createBatch(db: Firestore): WriteBatch {
  return writeBatch(db);
}

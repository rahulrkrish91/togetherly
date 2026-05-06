import {
  DocumentData,
  DocumentReference,
  Query,
  QueryDocumentSnapshot,
  getDocFromCache,
  getDocFromServer,
  getDocsFromCache,
  getDocsFromServer,
} from 'firebase/firestore';

/**
 * Cache-first getter for a single document.
 * Falls back to server when cache misses.
 */
export async function getDocCacheFirst<T extends DocumentData>(ref: DocumentReference<T>) {
  try {
    return await getDocFromCache(ref);
  } catch {
    return getDocFromServer(ref);
  }
}

/**
 * Cache-first getter for a query.
 * Falls back to server when cache misses.
 */
export async function getQueryCacheFirst<T extends DocumentData>(ref: Query<T>) {
  try {
    return await getDocsFromCache(ref);
  } catch {
    return getDocsFromServer(ref);
  }
}

export function toDataArray<T extends DocumentData>(
  docs: QueryDocumentSnapshot<T>[]
): Array<T & { id: string }> {
  return docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Message } from '../../types/schema';

export interface ChatPageParams {
  familyId: string;
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData>;
  lastSyncAt?: Date;
}

/**
 * Firestore-cost-aware pagination:
 * - always limits page size
 * - optionally delta-syncs with lastSyncAt
 */
export async function getChatPage({
  familyId,
  pageSize = 25,
  cursor,
  lastSyncAt,
}: ChatPageParams) {
  const constraints: QueryConstraint[] = [
    where('familyId', '==', familyId),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ];

  if (lastSyncAt) {
    constraints.splice(1, 0, where('createdAt', '>', Timestamp.fromDate(lastSyncAt)));
  }

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const ref = query(collection(db, 'messages'), ...constraints);
  const snapshot = await getDocs(ref);

  return {
    items: snapshot.docs.map(
      (row): Message =>
        ({
          id: row.id,
          ...row.data(),
        }) as Message
    ),
    nextCursor: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}

export function familyMetadataRef(familyId: string) {
  return doc(db, 'familyMetadata', familyId);
}

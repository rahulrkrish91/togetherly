import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

export type EventCategory = 'birthday' | 'meeting' | 'trip' | 'custom';

export interface FamilyEvent {
  id: string;
  familyId: string;
  title: string;
  description?: string | null;
  category: EventCategory;
  startAt: Timestamp;
  endAt?: Timestamp | null;
  createdBy: string;
}

export function subscribeFamilyEvents(
  familyId: string,
  onChange: (events: FamilyEvent[]) => void,
  onError: (error: Error) => void
) {
  const q = query(
    collection(db, 'events'),
    where('familyId', '==', familyId),
    orderBy('startAt', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      onChange(snap.docs.map((row) => ({ id: row.id, ...(row.data() as Omit<FamilyEvent, 'id'>) })));
    },
    (error) => onError(error as Error)
  );
}

export async function createFamilyEvent(payload: {
  familyId: string;
  title: string;
  description?: string;
  category: EventCategory;
  startAt: Date;
  endAt?: Date | null;
  createdBy: string;
}) {
  await addDoc(collection(db, 'events'), {
    familyId: payload.familyId,
    title: payload.title,
    description: payload.description || null,
    category: payload.category,
    startAt: Timestamp.fromDate(payload.startAt),
    endAt: payload.endAt ? Timestamp.fromDate(payload.endAt) : null,
    createdBy: payload.createdBy,
    createdAt: serverTimestamp(),
  });
}

export async function updateFamilyEvent(
  eventId: string,
  patch: Partial<Pick<FamilyEvent, 'title' | 'description' | 'category'>>
) {
  await updateDoc(doc(db, 'events', eventId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function removeFamilyEvent(eventId: string) {
  await deleteDoc(doc(db, 'events', eventId));
}

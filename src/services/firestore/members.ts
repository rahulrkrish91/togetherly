import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

export type FamilyMemberRole = 'admin' | 'member';

export interface FamilyMemberRecord {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyMemberRole;
  joinedAt?: unknown;
  displayName?: string;
  avatarUrl?: string | null;
}

function memberDocId(userId: string, familyId: string) {
  return `${userId}_${familyId}`;
}

export function subscribeFamilyMembers(
  familyId: string,
  onChange: (members: FamilyMemberRecord[]) => void,
  onError: (error: Error) => void
) {
  const q = query(
    collection(db, 'familyMembers'),
    where('familyId', '==', familyId),
    orderBy('joinedAt', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs.map((row) => ({
          id: row.id,
          ...(row.data() as Omit<FamilyMemberRecord, 'id'>),
        }))
      );
    },
    (error) => onError(error as Error)
  );
}

export async function upsertFamilyMemberProfile(payload: {
  familyId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
}) {
  const ref = doc(db, 'familyMembers', memberDocId(payload.userId, payload.familyId));
  await setDoc(
    ref,
    {
      familyId: payload.familyId,
      userId: payload.userId,
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl ?? null,
      joinedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function changeMemberRole(payload: {
  familyId: string;
  userId: string;
  role: FamilyMemberRole;
}) {
  const ref = doc(db, 'familyMembers', memberDocId(payload.userId, payload.familyId));
  await updateDoc(ref, {
    role: payload.role,
    updatedAt: serverTimestamp(),
  });
}

export async function removeFamilyMember(payload: { familyId: string; userId: string }) {
  const ref = doc(db, 'familyMembers', memberDocId(payload.userId, payload.familyId));
  await deleteDoc(ref);
}

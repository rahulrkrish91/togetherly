import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  documentId,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  inviteCode: string;
  createdAt?: Timestamp;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt?: Timestamp;
}

function generateInviteCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function memberDocId(userId: string, familyId: string): string {
  return `${userId}_${familyId}`;
}

export async function createFamily(userId: string, name: string): Promise<string> {
  const familyRef = doc(collection(db, 'families'));
  const inviteCode = generateInviteCode();
  const batch = writeBatch(db);

  batch.set(familyRef, {
    name,
    createdBy: userId,
    inviteCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const memberRef = doc(db, 'familyMembers', memberDocId(userId, familyRef.id));
  batch.set(memberRef, {
    familyId: familyRef.id,
    userId,
    role: 'admin',
    joinedAt: serverTimestamp(),
  });

  await batch.commit();

  return familyRef.id;
}

export async function joinFamilyByInviteCode(userId: string, inviteCode: string): Promise<string> {
  const familyQuery = query(
    collection(db, 'families'),
    where('inviteCode', '==', inviteCode.trim().toUpperCase()),
    limit(1)
  );
  const familySnapshot = await getDocs(familyQuery);

  if (familySnapshot.empty) {
    throw new Error('Invite code not found.');
  }

  const familyDoc = familySnapshot.docs[0];
  const familyId = familyDoc.id;

  const memberRef = doc(db, 'familyMembers', memberDocId(userId, familyId));
  await setDoc(
    memberRef,
    {
      familyId,
      userId,
      role: 'member',
      joinedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return familyId;
}

export function subscribeToUserFamilies(
  userId: string,
  onChange: (families: Family[]) => void,
  onError: (error: Error) => void
) {
  const membershipQuery = query(collection(db, 'familyMembers'), where('userId', '==', userId));

  return onSnapshot(
    membershipQuery,
    async (membershipSnapshot) => {
      const familyIds = membershipSnapshot.docs.map((docItem) => docItem.data().familyId as string);
      if (familyIds.length === 0) {
        onChange([]);
        return;
      }

      const chunks: string[][] = [];
      for (let i = 0; i < familyIds.length; i += 10) {
        chunks.push(familyIds.slice(i, i + 10));
      }

      const familyDocs = await Promise.all(
        chunks.map((chunk) =>
          getDocs(query(collection(db, 'families'), where(documentId(), 'in', chunk)))
        )
      );

      const families = familyDocs.flatMap((snap) =>
        snap.docs.map((row) => ({
          id: row.id,
          ...(row.data() as Omit<Family, 'id'>),
        }))
      );

      onChange(families);
    },
    (error) => onError(error as Error)
  );
}

export function getFirestoreInstance(): Firestore {
  return db;
}

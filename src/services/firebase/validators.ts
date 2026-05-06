import { doc, getDoc } from 'firebase/firestore';
import { db } from './firestore';

export interface UserRecord {
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
}

export interface FamilyMemberRecord {
  familyId: string;
  userId: string;
  role: 'admin' | 'member';
}

export function isValidUserRecord(value: unknown): value is UserRecord {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<UserRecord>;
  return typeof data.displayName === 'string';
}

export function isValidFamilyMemberRecord(value: unknown): value is FamilyMemberRecord {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<FamilyMemberRecord>;
  return (
    typeof data.familyId === 'string' &&
    typeof data.userId === 'string' &&
    (data.role === 'admin' || data.role === 'member')
  );
}

export async function isValidUser(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() && isValidUserRecord(snap.data());
}

export async function isValidFamilyMember(userId: string, familyId: string) {
  const snap = await getDoc(doc(db, 'familyMembers', `${userId}_${familyId}`));
  return snap.exists() && isValidFamilyMemberRecord(snap.data());
}

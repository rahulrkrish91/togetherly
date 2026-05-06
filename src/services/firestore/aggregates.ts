import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export interface FamilyMetadata {
  msgCount: number;
  memberCount: number;
  eventCount: number;
  updatedAt: number;
}

/**
 * Reads one pre-computed aggregate doc instead of scanning many collection docs.
 */
export async function getFamilyMetadata(familyId: string): Promise<FamilyMetadata | null> {
  const ref = doc(db, 'familyMetadata', familyId);
  const snapshot = await getDocFromServer(ref);

  if (!snapshot.exists()) return null;
  return snapshot.data() as FamilyMetadata;
}

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

export interface FamilyLocationPoint {
  id: string;
  familyId: string;
  userId: string;
  userLabel: string;
  lat: number;
  lng: number;
  accuracy?: number | null;
  updatedAt?: unknown;
}

export function subscribeFamilyLocations(
  familyId: string,
  onChange: (points: FamilyLocationPoint[]) => void,
  onError: (error: Error) => void
) {
  const q = query(
    collection(db, 'locations'),
    where('familyId', '==', familyId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const seen = new Set<string>();
      const latestPerUser: FamilyLocationPoint[] = [];
      snap.docs.forEach((row) => {
        const data = row.data() as Omit<FamilyLocationPoint, 'id'>;
        if (seen.has(data.userId)) return;
        seen.add(data.userId);
        latestPerUser.push({ id: row.id, ...data });
      });
      onChange(latestPerUser);
    },
    (error) => onError(error as Error)
  );
}

export async function publishLocation(payload: {
  familyId: string;
  userId: string;
  userLabel: string;
  lat: number;
  lng: number;
  accuracy?: number | null;
}) {
  await addDoc(collection(db, 'locations'), {
    familyId: payload.familyId,
    userId: payload.userId,
    userLabel: payload.userLabel,
    lat: payload.lat,
    lng: payload.lng,
    accuracy: payload.accuracy ?? null,
    updatedAt: serverTimestamp(),
  });
}

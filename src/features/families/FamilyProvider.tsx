import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '../auth/AuthProvider';
import {
  Family,
  createFamily as createFamilyDoc,
  joinFamilyByInviteCode,
  subscribeToUserFamilies,
} from '../../services/firestore/families';

interface FamilyContextValue {
  families: Family[];
  activeFamilyId: string | null;
  isLoadingFamilies: boolean;
  createFamily: (name: string) => Promise<void>;
  joinFamily: (inviteCode: string) => Promise<void>;
  switchFamily: (familyId: string) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);

function activeFamilyStorageKey(userId: string) {
  return `activeFamily:${userId}`;
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { authUser, isAuthenticated } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(null);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      setFamilies([]);
      setActiveFamilyId(null);
      setIsLoadingFamilies(false);
      return;
    }

    let mounted = true;
    setIsLoadingFamilies(true);

    const unsubscribe = subscribeToUserFamilies(
      authUser.uid,
      async (nextFamilies) => {
        if (!mounted) return;
        setFamilies(nextFamilies);

        const storageKey = activeFamilyStorageKey(authUser.uid);
        const savedActiveFamily = await AsyncStorage.getItem(storageKey);
        const savedStillValid =
          savedActiveFamily && nextFamilies.some((familyItem) => familyItem.id === savedActiveFamily);

        const fallbackFamilyId = nextFamilies[0]?.id ?? null;
        const resolvedFamily = savedStillValid ? savedActiveFamily : fallbackFamilyId;

        setActiveFamilyId(resolvedFamily);

        if (resolvedFamily) {
          await AsyncStorage.setItem(storageKey, resolvedFamily);
        }

        setIsLoadingFamilies(false);
      },
      () => {
        if (!mounted) return;
        setIsLoadingFamilies(false);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [authUser, isAuthenticated]);

  const switchFamily = useCallback(
    async (familyId: string) => {
      if (!authUser) return;
      setActiveFamilyId(familyId);
      await AsyncStorage.setItem(activeFamilyStorageKey(authUser.uid), familyId);
    },
    [authUser]
  );

  const createFamily = useCallback(
    async (name: string) => {
      if (!authUser) return;
      const familyId = await createFamilyDoc(authUser.uid, name.trim());
      await switchFamily(familyId);
    },
    [authUser, switchFamily]
  );

  const joinFamily = useCallback(
    async (inviteCode: string) => {
      if (!authUser) return;
      const familyId = await joinFamilyByInviteCode(authUser.uid, inviteCode);
      await switchFamily(familyId);
    },
    [authUser, switchFamily]
  );

  const value = useMemo<FamilyContextValue>(
    () => ({
      families,
      activeFamilyId,
      isLoadingFamilies,
      createFamily,
      joinFamily,
      switchFamily,
    }),
    [families, activeFamilyId, isLoadingFamilies, createFamily, joinFamily, switchFamily]
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) {
    throw new Error('useFamily must be used within FamilyProvider');
  }

  return ctx;
}

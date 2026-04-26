import { useMemo } from 'react';

export interface AuthSessionState {
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuthSession(): AuthSessionState {
  return useMemo(
    () => ({
      isLoading: false,
      isAuthenticated: false,
    }),
    []
  );
}

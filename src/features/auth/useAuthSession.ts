import { useAuth } from './AuthProvider';

export function useAuthSession() {
  const { isLoading, isAuthenticated, authUser } = useAuth();

  return {
    isLoading,
    isAuthenticated,
    authUser,
  };
}

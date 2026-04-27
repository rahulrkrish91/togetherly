import {
  ConfirmationResult,
  GoogleAuthProvider,
  PhoneAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  ReactNode,
  RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { FirebaseApp } from 'firebase/app';
import { auth } from '../../services/firebase/auth';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  authUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleLoading: boolean;
  phoneLoading: boolean;
  recaptchaRef: RefObject<FirebaseRecaptchaVerifierModal | null>;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<string | null>;
  verifyPhoneOtp: (verificationId: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  firebaseAppForRecaptcha: FirebaseApp;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children, firebaseApp }: { children: ReactNode; firebaseApp: FirebaseApp }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setAuthUser(nextUser);
      setIsLoading(false);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!googleResponse || googleResponse.type !== 'success') return;

    const idToken = googleResponse.authentication?.idToken;
    if (!idToken) return;

    const credential = GoogleAuthProvider.credential(idToken);
    signInWithCredential(auth, credential).catch(() => {
      setGoogleLoading(false);
    });
  }, [googleResponse]);

  const signInWithGoogle = useCallback(async () => {
    if (!googleRequest) return;
    setGoogleLoading(true);

    const result = await googlePromptAsync();

    if (result.type !== 'success') {
      setGoogleLoading(false);
      return;
    }

    setGoogleLoading(false);
  }, [googlePromptAsync, googleRequest]);

  const sendPhoneOtp = useCallback(async (phoneNumber: string) => {
    if (!recaptchaRef.current) return null;

    setPhoneLoading(true);
    try {
      const confirmation: ConfirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaRef.current
      );
      return confirmation.verificationId;
    } finally {
      setPhoneLoading(false);
    }
  }, []);

  const verifyPhoneOtp = useCallback(async (verificationId: string, otp: string) => {
    setPhoneLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
    } finally {
      setPhoneLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authUser,
      isLoading,
      isAuthenticated: !!authUser,
      googleLoading,
      phoneLoading,
      recaptchaRef,
      signInWithGoogle,
      sendPhoneOtp,
      verifyPhoneOtp,
      logout,
      firebaseAppForRecaptcha: firebaseApp,
    }),
    [
      authUser,
      isLoading,
      googleLoading,
      phoneLoading,
      signInWithGoogle,
      sendPhoneOtp,
      verifyPhoneOtp,
      logout,
      firebaseApp,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

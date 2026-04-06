import React, { createContext, useContext, useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

interface AuthContextValue {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    await auth().createUserWithEmailAndPassword(email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    let result: Awaited<ReturnType<typeof GoogleSignin.signIn>>;
    try {
      result = await GoogleSignin.signIn();
    } catch (error: unknown) {
      const code = (error as { code?: string | number }).code;
      if (code === statusCodes.SIGN_IN_CANCELLED || code === statusCodes.IN_PROGRESS) return;
      throw error;
    }
    if (!result.data?.idToken) return;
    const credential = auth.GoogleAuthProvider.credential(result.data.idToken);
    await auth().signInWithCredential(credential);
  };

  const signInWithApple = async (): Promise<void> => {
    let appleResult: Awaited<ReturnType<typeof AppleAuthentication.signInAsync>>;
    try {
      appleResult = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'ERR_CANCELED') return;
      throw error;
    }
    if (!appleResult.identityToken) return;
    const credential = auth.OAuthProvider.credential('apple.com', appleResult.identityToken);
    await auth().signInWithCredential(credential);
  };

  const signOut = async (): Promise<void> => {
    await auth().signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signInWithGoogle, signInWithApple, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

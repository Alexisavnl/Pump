import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { WorkoutProvider } from '../src/context/WorkoutContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  return (
    <WorkoutProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </WorkoutProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

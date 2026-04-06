import { Stack } from 'expo-router';
import { WorkoutProvider } from '../src/context/WorkoutContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <WorkoutProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="(auth)" />}
      </Stack>
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

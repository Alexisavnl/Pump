import { Stack } from 'expo-router';
import { WorkoutProvider } from '../src/context/WorkoutContext';

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </WorkoutProvider>
  );
}

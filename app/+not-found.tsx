import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function NotFound() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return <Redirect href={user ? '/(tabs)/accueil' : '/(auth)/login'} />;
}

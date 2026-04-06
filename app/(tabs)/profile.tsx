import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';

function getInitials(email: string): string {
  return email.charAt(0).toUpperCase();
}

function formatMemberSince(timestamp: number | null): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Se déconnecter ?', 'Tu devras te reconnecter pour accéder à ton compte.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) return null;

  const creationTime = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).getTime()
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Profil</Text>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar} testID="profile-avatar">
          <Text style={styles.avatarInitial}>{getInitials(user.email ?? '?')}</Text>
        </View>
        <Text style={styles.email} testID="profile-email">
          {user.email}
        </Text>
        {creationTime && (
          <Text style={styles.memberSince} testID="profile-member-since">
            Membre depuis {formatMemberSince(creationTime)}
          </Text>
        )}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        testID="profile-signout-button"
      >
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 48,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 48,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#0070D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  email: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  memberSince: {
    fontSize: 14,
    color: '#8E8E93',
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: '#FF453A',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '600',
  },
});

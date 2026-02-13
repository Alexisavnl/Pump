import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EntrainementScreen() {
  const handleNewProgram = () => {
    router.push('/entrainement/nouveau');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.header}>Entraînement</Text>

        <TouchableOpacity
          style={styles.newProgramButton}
          onPress={handleNewProgram}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#0070D4" />
          <Text style={styles.newProgramText}>Nouveau Programme</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  newProgramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0070D4',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 8,
  },
  newProgramText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0070D4',
  },
});

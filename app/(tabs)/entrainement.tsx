import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getAllPrograms } from '../../utils/storage/programs';
import type { Program } from '../../types/program';

export default function EntrainementScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    setPrograms(getAllPrograms());
  }, []);

  const handleNewProgram = () => {
    router.push('/program/new');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.header}>Entraînement</Text>

        <TouchableOpacity
          style={styles.newProgramButton}
          onPress={handleNewProgram}
          activeOpacity={0.7}
          testID="new-program-button"
        >
          <Ionicons name="add" size={24} color="#0070D4" />
          <Text style={styles.newProgramText}>Nouveau Programme</Text>
        </TouchableOpacity>

        <View style={styles.programsSection}>
          <Text style={styles.sectionTitle}>MES PROGRAMMES</Text>
          {programs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun programme créé</Text>
            </View>
          ) : (
            <View>
              {programs.map((program) => (
                <View key={program.id} style={styles.programCard}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
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
  programsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6C6C70',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  programCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

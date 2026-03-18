import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { saveDraft, getDraft } from '../../../utils/storage/programs';
import type { Session, DayKey } from '../../../types/program';

const EMPTY_DAYS: Record<DayKey, Session[]> = {
  LUN: [],
  MAR: [],
  MER: [],
  JEU: [],
  VEN: [],
  SAM: [],
  DIM: [],
};

export default function NewSessionScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const [title, setTitle] = useState('Upper A');
  const [description, setDescription] = useState('Description');

  const handleBack = () => {
    router.back();
  };

  const handleValidate = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      title,
      description,
      exercises: [],
    };

    const draft = getDraft() ?? {};
    const days = draft.days ?? { ...EMPTY_DAYS };

    if (day && (day as DayKey) in days) {
      const dayKey = day as DayKey;
      days[dayKey] = [...days[dayKey], newSession];
    }

    saveDraft({ ...draft, days });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={28} color="#0070D4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier la séance</Text>
        <TouchableOpacity
          onPress={handleValidate}
          style={styles.validateButton}
          activeOpacity={0.7}
          testID="validate-button"
        >
          <Ionicons name="checkmark" size={28} color="#0070D4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {day ? (
          <Text style={styles.dayLabel} testID="day-label">
            {day}
          </Text>
        ) : null}

        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Titre de la séance"
          placeholderTextColor="#888"
          testID="session-title-input"
        />

        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#888"
          testID="session-description-input"
        />

        <View style={styles.exerciseList} testID="exercise-list">
          <Text style={styles.emptyText}>Aucun exercice ajouté</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addExercisesButton}
          activeOpacity={0.7}
          testID="add-exercises-button"
          onPress={() => router.push('/program/session/exercises')}
        >
          <Text style={styles.addExercisesText}>+ Ajouter des exercices</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  validateButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0070D4',
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    paddingVertical: 8,
    marginBottom: 12,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#AAAAAA',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    paddingVertical: 8,
    marginBottom: 24,
  },
  exerciseList: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  addExercisesButton: {
    borderWidth: 1,
    borderColor: '#0070D4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addExercisesText: {
    color: '#0070D4',
    fontSize: 16,
    fontWeight: '600',
  },
});

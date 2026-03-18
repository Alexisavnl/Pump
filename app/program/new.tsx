import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useCallback } from 'react';
import { saveDraft, getDraft, clearDraft } from '../../utils/storage/programs';
import type { Session, DayKey } from '../../types/program';

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'] as const;

const EMPTY_DAYS: Record<DayKey, Session[]> = {
  LUN: [],
  MAR: [],
  MER: [],
  JEU: [],
  VEN: [],
  SAM: [],
  DIM: [],
};

export default function NewProgramScreen() {
  const [title, setTitle] = useState('Push Pull Legs');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<Record<DayKey, Session[]>>({ ...EMPTY_DAYS });
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountRef = useRef(true);

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.days) setDays(draft.days);
    }
    isMountRef.current = false;
  }, []);

  // Reload sessions from draft when screen regains focus
  useFocusEffect(
    useCallback(() => {
      const draft = getDraft();
      if (draft?.days) {
        setDays(draft.days);
      }
    }, [])
  );

  // Auto-save draft every 2 seconds after last change
  useEffect(() => {
    if (isMountRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft({ title, description });
      setShowDraftSaved(true);

      if (indicatorTimerRef.current) {
        clearTimeout(indicatorTimerRef.current);
      }
      indicatorTimerRef.current = setTimeout(() => {
        setShowDraftSaved(false);
      }, 2000);
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, description]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    clearDraft();
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
        <Text style={styles.headerTitle}>Nouveau Programme</Text>
        <TouchableOpacity
          style={styles.modifierButton}
          activeOpacity={0.7}
          testID="modifier-button"
        >
          <Text style={styles.modifierText}>Modifier</Text>
        </TouchableOpacity>
      </View>

      {showDraftSaved && (
        <View style={styles.draftIndicator} testID="draft-saved-indicator">
          <Text style={styles.draftIndicatorText}>Brouillon sauvegardé</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Nom du programme"
          placeholderTextColor="#6C6C70"
          testID="program-title-input"
        />

        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Organise ta semaine d'entraînement"
          placeholderTextColor="#6C6C70"
          multiline
          testID="program-description-input"
        />

        <View style={styles.daysContainer}>
          {DAYS.map((day) => (
            <View key={day} style={styles.dayBlock} testID={`day-block-${day}`}>
              <Text style={styles.dayLabel}>{day}</Text>
              {days[day].map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.sessionCard}
                  activeOpacity={0.7}
                  testID={`session-card-${session.id}`}
                  onPress={() =>
                    router.push({
                      pathname: '/program/session/new',
                      params: { day, sessionId: session.id },
                    })
                  }
                >
                  <Text style={styles.sessionCardTitle}>{session.title}</Text>
                  <Text style={styles.sessionCardExos}>{session.exercises.length} exos</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addSessionButton}
                activeOpacity={0.7}
                testID={`add-session-${day}`}
                onPress={() => router.push({ pathname: '/program/session/new', params: { day } })}
              >
                <Ionicons name="add" size={20} color="#0070D4" />
                <Text style={styles.addSessionText}>Ajouter une séance</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.7}
          testID="save-program-button"
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Enregistrer le programme</Text>
        </TouchableOpacity>
      </ScrollView>
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
  modifierButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modifierText: {
    fontSize: 16,
    color: '#0070D4',
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    marginTop: 8,
  },
  descriptionInput: {
    fontSize: 15,
    color: '#8E8E93',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    marginBottom: 24,
    minHeight: 40,
  },
  daysContainer: {
    gap: 12,
  },
  dayBlock: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6C6C70',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sessionCardExos: {
    fontSize: 13,
    color: '#8E8E93',
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0070D4',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 4,
  },
  addSessionText: {
    fontSize: 14,
    color: '#0070D4',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#0070D4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  draftIndicator: {
    alignSelf: 'center',
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  draftIndicatorText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveDraft,
  getDraft,
  getTempExercises,
  clearTempExercises,
} from '../../../../../utils/storage/programs';
import type {
  Session,
  DayKey,
  ExerciseConfig,
  FixedSet,
  RangeSet,
} from '../../../../../types/program';
import exerciseImages from '../../../../../data/exerciseImages';

const EMPTY_DAYS: Record<DayKey, Session[]> = {
  LUN: [],
  MAR: [],
  MER: [],
  JEU: [],
  VEN: [],
  SAM: [],
  DIM: [],
};

const REST_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Désactivé', value: null },
  ...Array.from({ length: 60 }, (_, i) => {
    const seconds = (i + 1) * 5;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const label = m === 0 ? `${s}s` : s === 0 ? `${m}min` : `${m}min ${s}s`;
    return { label, value: seconds };
  }),
];

const REP_OPTIONS: { label: string; value: 'fixed' | 'range' }[] = [
  { label: 'Répétitions', value: 'fixed' },
  { label: 'Plage de répétitions', value: 'range' },
];

function formatRestTime(seconds: number | null): string {
  if (seconds === null) return 'Désactivé';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}min` : `${m}min ${s}s`;
}

export default function NewSessionScreen() {
  const { bottom } = useSafeAreaInsets();
  const { day, sessionId } = useLocalSearchParams<{ day: string; sessionId?: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<ExerciseConfig[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restModalId, setRestModalId] = useState<string | null>(null);
  const [repsModalId, setRepsModalId] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const draft = getDraft();
    if (sessionId && draft?.days && day) {
      const dayKey = day as DayKey;
      const session = draft.days[dayKey]?.find((s) => s.id === sessionId);
      if (session) {
        setTitle(session.title);
        setDescription(session.description);
        setExercises(session.exercises);
      }
    }
    hasInitialized.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFocusEffect(
    useCallback(() => {
      if (!hasInitialized.current) return;
      const temp = getTempExercises();
      if (temp && temp.length > 0) {
        setExercises((prev) => [...prev, ...temp]);
        clearTempExercises();
      }
    }, [])
  );

  const handleBack = () => {
    router.back();
  };

  const handleValidate = () => {
    const draft = getDraft() ?? {};
    const days = draft.days ?? { ...EMPTY_DAYS };

    if (day && (day as DayKey) in days) {
      const dayKey = day as DayKey;
      const existingSession = sessionId ? days[dayKey].find((s) => s.id === sessionId) : null;
      const session: Session = {
        id: existingSession?.id ?? Date.now().toString(),
        title,
        description,
        exercises,
      };
      days[dayKey] = [session];
    }

    saveDraft({ ...draft, days });
    router.back();
  };

  const toggleExpand = (exerciseId: string) => {
    setExpandedId((prev) => (prev === exerciseId ? null : exerciseId));
  };

  const updateExercise = (
    exerciseId: string,
    updates: Partial<Pick<ExerciseConfig, 'notes' | 'restTime'>>
  ) => {
    setExercises((prev) =>
      prev.map((ex): ExerciseConfig => (ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex))
    );
  };

  const updateSet = (exerciseId: string, setIdx: number, field: 'kg' | 'reps', value: string) => {
    const num = parseFloat(value) || 0;
    setExercises((prev) =>
      prev.map((ex): ExerciseConfig => {
        if (ex.exerciseId !== exerciseId) return ex;
        const newSets = ex.sets.map((s, i) => (i === setIdx ? { ...s, [field]: num } : s));
        return { ...ex, sets: newSets } as ExerciseConfig;
      })
    );
  };

  const updateSetRangeReps = (
    exerciseId: string,
    setIdx: number,
    field: 'min' | 'max',
    value: string
  ) => {
    const num = parseFloat(value) || 0;
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        if (ex.repType !== 'range') return ex;
        const newSets = ex.sets.map((s, i) => {
          if (i !== setIdx) return s;
          return { ...s, reps: { ...s.reps, [field]: num } };
        });
        return { ...ex, sets: newSets };
      })
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex): ExerciseConfig => {
        if (ex.exerciseId !== exerciseId) return ex;
        if (ex.repType === 'range') {
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: RangeSet = {
            serieNumber: ex.sets.length + 1,
            kg: lastSet?.kg ?? 0,
            reps: { min: lastSet?.reps.min ?? 0, max: lastSet?.reps.max ?? 0 },
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        } else {
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: FixedSet = {
            serieNumber: ex.sets.length + 1,
            kg: lastSet?.kg ?? 0,
            reps: lastSet?.reps ?? 0,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
      })
    );
  };

  const changeRepType = (exerciseId: string, repType: 'fixed' | 'range') => {
    setExercises((prev) =>
      prev.map((ex): ExerciseConfig => {
        if (ex.exerciseId !== exerciseId) return ex;
        if (repType === 'range') {
          if (ex.repType === 'range') return ex;
          return {
            ...ex,
            repType: 'range',
            sets: ex.sets.map((s) => ({
              serieNumber: s.serieNumber,
              kg: s.kg,
              reps: { min: s.reps, max: s.reps },
            })),
          };
        } else {
          if (ex.repType === 'fixed') return ex;
          return {
            ...ex,
            repType: 'fixed',
            sets: ex.sets.map((s) => ({ serieNumber: s.serieNumber, kg: s.kg, reps: s.reps.min })),
          };
        }
      })
    );
    setRepsModalId(null);
  };

  const restModalExercise = exercises.find((e) => e.exerciseId === restModalId) ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BlurView tint="systemMaterial" intensity={80} style={styles.backButton}>
          <Pressable onPress={handleBack} style={styles.backButtonInner} testID="back-button">
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
        </BlurView>
        <Text style={styles.headerTitle}>Modifier la séance</Text>
        <TouchableOpacity
          style={styles.validateButton}
          onPress={handleValidate}
          activeOpacity={0.85}
          testID="validate-button"
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 100 }]}
        testID="scroll-view"
      >
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
          placeholderTextColor="#6C6C70"
          testID="session-title-input"
        />

        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#6C6C70"
          testID="session-description-input"
        />

        <View testID="exercise-list">
          {exercises.length === 0 ? (
            <Text style={styles.emptyExerciseText}>Aucun exercice ajouté</Text>
          ) : (
            exercises.map((ex) => {
              const isExpanded = expandedId === ex.exerciseId;
              return (
                <View
                  key={ex.exerciseId}
                  style={styles.exerciseCard}
                  testID={`exercise-card-${ex.exerciseId}`}
                >
                  <TouchableOpacity
                    style={styles.exerciseCardHeader}
                    onPress={() => toggleExpand(ex.exerciseId)}
                    activeOpacity={0.7}
                    testID={`exercise-card-toggle-${ex.exerciseId}`}
                  >
                    <Image source={exerciseImages[ex.imageUrl]} style={styles.exerciseCardImage} />
                    <View style={styles.exerciseCardInfo}>
                      <Text style={styles.exerciseCardName}>{ex.exerciseName}</Text>
                      <Text style={styles.exerciseCardMeta}>
                        {ex.sets.length} {ex.sets.length === 1 ? 'série' : 'séries'}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                      size={16}
                      color="#6C6C70"
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View
                      style={styles.exerciseCardExpanded}
                      testID={`exercise-expanded-${ex.exerciseId}`}
                    >
                      <TextInput
                        style={styles.notesInput}
                        value={ex.notes}
                        onChangeText={(val) => updateExercise(ex.exerciseId, { notes: val })}
                        placeholder="Notes..."
                        placeholderTextColor="#6C6C70"
                        testID={`notes-input-${ex.exerciseId}`}
                      />

                      <TouchableOpacity
                        style={styles.restRow}
                        onPress={() => setRestModalId(ex.exerciseId)}
                        testID={`rest-toggle-${ex.exerciseId}`}
                      >
                        <Ionicons name="timer-outline" size={16} color="#0070D4" />
                        <Text style={styles.restText}>Repos: {formatRestTime(ex.restTime)}</Text>
                      </TouchableOpacity>

                      <View style={styles.setsTable}>
                        <View style={styles.setRow}>
                          <Text style={[styles.setCell, styles.setCellHeader, styles.setCellSerie]}>
                            Série
                          </Text>
                          <Text style={[styles.setCell, styles.setCellHeader, styles.setCellKg]}>
                            KG
                          </Text>
                          <TouchableOpacity
                            style={[styles.setCellReps, styles.repsHeaderButton]}
                            onPress={() => setRepsModalId(ex.exerciseId)}
                            testID={`reps-header-${ex.exerciseId}`}
                          >
                            <Text style={[styles.setCell, styles.setCellHeader]}>
                              {ex.repType === 'range' ? 'Plage' : 'Réps'}
                            </Text>
                            <Ionicons name="chevron-down" size={10} color="#8E8E93" />
                          </TouchableOpacity>
                        </View>

                        {ex.sets.map((set, idx) => (
                          <View
                            key={idx}
                            style={styles.setRow}
                            testID={`set-row-${ex.exerciseId}-${idx}`}
                          >
                            <Text style={[styles.setCell, styles.setCellSerie]}>
                              {set.serieNumber}
                            </Text>
                            <TextInput
                              style={[styles.setCell, styles.setCellInput, styles.setCellKg]}
                              value={String(set.kg)}
                              onChangeText={(v) => updateSet(ex.exerciseId, idx, 'kg', v)}
                              keyboardType="numeric"
                              testID={`set-kg-${ex.exerciseId}-${idx}`}
                            />
                            {ex.repType === 'range' ? (
                              <View style={[styles.setCellReps, styles.rangeRepsCell]}>
                                <TextInput
                                  style={[styles.setCell, styles.setCellInput, styles.rangeInput]}
                                  value={String((set as RangeSet).reps.min)}
                                  onChangeText={(v) =>
                                    updateSetRangeReps(ex.exerciseId, idx, 'min', v)
                                  }
                                  keyboardType="numeric"
                                  testID={`set-reps-min-${ex.exerciseId}-${idx}`}
                                />
                                <Text style={styles.rangeSeparator}>à</Text>
                                <TextInput
                                  style={[styles.setCell, styles.setCellInput, styles.rangeInput]}
                                  value={String((set as RangeSet).reps.max)}
                                  onChangeText={(v) =>
                                    updateSetRangeReps(ex.exerciseId, idx, 'max', v)
                                  }
                                  keyboardType="numeric"
                                  testID={`set-reps-max-${ex.exerciseId}-${idx}`}
                                />
                              </View>
                            ) : (
                              <TextInput
                                style={[styles.setCell, styles.setCellInput, styles.setCellReps]}
                                value={String((set as FixedSet).reps)}
                                onChangeText={(v) => updateSet(ex.exerciseId, idx, 'reps', v)}
                                keyboardType="numeric"
                                testID={`set-reps-${ex.exerciseId}-${idx}`}
                              />
                            )}
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity
                        style={styles.addSerieButton}
                        onPress={() => addSet(ex.exerciseId)}
                        testID={`add-serie-${ex.exerciseId}`}
                      >
                        <Text style={styles.addSerieText}>+ Ajouter une série</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity
          style={styles.addExercisesButton}
          activeOpacity={0.7}
          testID="add-exercises-button"
          onPress={() => router.push('/entrainement/program/session/exercises')}
        >
          <Text style={styles.addExercisesText}>+ Ajouter des exercices</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={restModalId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setRestModalId(null)}
        testID="rest-modal"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setRestModalId(null)}
          activeOpacity={1}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Minuteur de Repos</Text>
            {restModalExercise && (
              <Text style={styles.modalSubtitle}>
                Minuteur de Repos - {restModalExercise.exerciseName}
              </Text>
            )}
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {REST_OPTIONS.map((opt) => {
                const isSelected = restModalExercise?.restTime === opt.value;
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      if (restModalId) updateExercise(restModalId, { restTime: opt.value });
                    }}
                    testID={`rest-option-${opt.value}`}
                  >
                    <Text
                      style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setRestModalId(null)}
              testID="rest-modal-done"
            >
              <Text style={styles.modalDoneText}>Terminé</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={repsModalId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setRepsModalId(null)}
        testID="reps-modal"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setRepsModalId(null)}
          activeOpacity={1}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Options de répétitions</Text>
            {REP_OPTIONS.map((opt) => {
              const exercise = exercises.find((e) => e.exerciseId === repsModalId);
              const isSelected = exercise?.repType === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.repOption}
                  onPress={() => {
                    if (repsModalId) changeRepType(repsModalId, opt.value);
                  }}
                  testID={`reps-option-${opt.value}`}
                >
                  <Text style={styles.repOptionText}>{opt.label}</Text>
                  {isSelected && <Ionicons name="checkmark" size={20} color="#0070D4" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonInner: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  validateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0070D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0070D4',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingVertical: 12,
    marginBottom: 4,
  },
  descriptionInput: {
    fontSize: 14,
    color: '#8E8E93',
    paddingVertical: 8,
    marginBottom: 20,
  },
  emptyExerciseText: {
    color: '#6C6C70',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  exerciseCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  exerciseCardImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#3C3C3E',
    marginRight: 12,
  },
  exerciseCardInfo: {
    flex: 1,
  },
  exerciseCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  exerciseCardMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  exerciseCardExpanded: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  notesInput: {
    fontSize: 14,
    color: '#ffffff',
    paddingVertical: 12,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  restText: {
    fontSize: 14,
    color: '#0070D4',
    fontWeight: '500',
  },
  setsTable: {
    marginTop: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setCell: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  setCellHeader: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  setCellSerie: {
    width: 44,
  },
  setCellKg: {
    flex: 1,
    marginRight: 8,
  },
  setCellReps: {
    flex: 1,
  },
  setCellInput: {
    backgroundColor: '#3C3C3E',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  repsHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  rangeRepsCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    color: '#8E8E93',
    fontSize: 12,
  },
  addSerieButton: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#0070D4',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addSerieText: {
    fontSize: 14,
    color: '#0070D4',
    fontWeight: '600',
  },
  addExercisesButton: {
    borderWidth: 1.5,
    borderColor: '#0070D4',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  addExercisesText: {
    color: '#0070D4',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#6C6C70',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalList: {
    flexGrow: 0,
  },
  modalOption: {
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 2,
    paddingHorizontal: 12,
  },
  modalOptionSelected: {
    backgroundColor: '#3C3C3E',
  },
  modalOptionText: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 20,
  },
  modalDoneButton: {
    backgroundColor: '#0070D4',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  modalDoneText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  repOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C3E',
  },
  repOptionText: {
    fontSize: 16,
    color: '#ffffff',
  },
});

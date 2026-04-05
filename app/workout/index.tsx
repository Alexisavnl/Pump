import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useWorkout } from '../../src/context/WorkoutContext';
import exerciseImages from '../../data/exerciseImages';
import type { WorkoutSet } from '../../types/workout';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}min` : `${m}min ${s}s`;
}

function formatRestLabel(restTime: number | null): string {
  if (!restTime) return 'Désactivé';
  return formatDuration(restTime);
}

interface SetRowProps {
  set: WorkoutSet;
  idx: number;
  exerciseId: string;
  onUpdate: (field: 'kg' | 'reps', value: number) => void;
  onComplete: () => void;
}

function SetRow({ set, idx, exerciseId, onUpdate, onComplete }: SetRowProps) {
  const [kgText, setKgText] = useState(String(set.kg));
  const [repsText, setRepsText] = useState(String(set.reps));

  // Sync only when set index changes (new set added), not on every render
  const setKey = `${exerciseId}-${idx}`;
  const [lastKey, setLastKey] = useState(setKey);
  if (lastKey !== setKey) {
    setLastKey(setKey);
    setKgText(String(set.kg));
    setRepsText(String(set.reps));
  }

  return (
    <View
      style={[styles.setRow, set.completed && styles.setRowCompleted]}
      testID={`set-row-${exerciseId}-${idx}`}
    >
      <Text style={[styles.setCell, styles.cellSerie, set.completed && styles.setCellDone]}>
        {set.serieNumber}
      </Text>
      <Text style={[styles.setCell, styles.cellPrev, styles.setCellPrevValue]}>
        {set.kg > 0 ? `${set.kg}kg x ${set.reps}` : '—'}
      </Text>
      <TextInput
        style={[
          styles.setCell,
          styles.setCellInput,
          styles.cellKg,
          set.completed && styles.setCellInputDone,
        ]}
        value={kgText}
        onChangeText={(v) => {
          setKgText(v);
          const num = parseFloat(v);
          if (!isNaN(num)) onUpdate('kg', num);
        }}
        onBlur={() => {
          const num = parseFloat(kgText);
          const final = isNaN(num) ? 0 : num;
          onUpdate('kg', final);
          setKgText(String(final));
        }}
        keyboardType="numeric"
        testID={`set-kg-${exerciseId}-${idx}`}
      />
      <TextInput
        style={[
          styles.setCell,
          styles.setCellInput,
          styles.cellReps,
          set.completed && styles.setCellInputDone,
        ]}
        value={repsText}
        onChangeText={(v) => {
          setRepsText(v);
          const num = parseFloat(v);
          if (!isNaN(num)) onUpdate('reps', num);
        }}
        onBlur={() => {
          const num = parseFloat(repsText);
          const final = isNaN(num) ? 0 : num;
          onUpdate('reps', final);
          setRepsText(String(final));
        }}
        keyboardType="numeric"
        testID={`set-reps-${exerciseId}-${idx}`}
      />
      <TouchableOpacity
        style={[styles.cellCheck, styles.checkButton, set.completed && styles.checkButtonDone]}
        onPress={onComplete}
        testID={`set-check-${exerciseId}-${idx}`}
      >
        <Ionicons name="checkmark" size={16} color={set.completed ? '#ffffff' : '#6C6C70'} />
      </TouchableOpacity>
    </View>
  );
}

export default function WorkoutScreen() {
  const { bottom, top } = useSafeAreaInsets();
  const {
    state,
    hideWorkout,
    discardWorkout,
    finishWorkout,
    completeSet,
    updateSet,
    addSet,
    adjustRest,
    skipRest,
  } = useWorkout();
  const { active, restTimer, isWorkoutVisible } = state;

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active || !isWorkoutVisible) return;
    setElapsed(Math.round((Date.now() - active.startedAt) / 1000));
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - active.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [active?.startedAt, isWorkoutVisible]);

  if (!active || !isWorkoutVisible) return null;

  const elapsedSeconds = elapsed;
  const completedSets = active.exercises.flatMap((ex) => ex.sets.filter((s) => s.completed));
  const totalVolume = completedSets.reduce((sum, s) => sum + s.kg * s.reps, 0);

  const handleFinish = () => {
    Alert.alert('Terminer la séance ?', 'Les séries non validées ne seront pas comptabilisées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer',
        style: 'destructive',
        onPress: finishWorkout,
      },
    ]);
  };

  const handleDiscard = () => {
    Alert.alert('Abandonner la séance ?', 'Toute la progression sera perdue.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Abandonner', style: 'destructive', onPress: discardWorkout },
    ]);
  };

  return (
    <Modal visible={isWorkoutVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={hideWorkout} testID="hide-workout-button">
            <Ionicons name="chevron-down" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Entraînement</Text>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinish}
            testID="finish-workout-button"
          >
            <Text style={styles.finishButtonText}>Terminer</Text>
          </TouchableOpacity>
        </View>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Durée</Text>
            <Text style={styles.statValue}>{formatDuration(elapsedSeconds)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>{totalVolume} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Séries</Text>
            <Text style={styles.statValue}>{completedSets.length}</Text>
          </View>
          <TouchableOpacity onPress={handleDiscard} testID="discard-workout-button">
            <Ionicons name="trash-outline" size={20} color="#FF453A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {active.exercises.map((ex) => (
            <View
              key={ex.exerciseId}
              style={styles.exerciseCard}
              testID={`exercise-card-${ex.exerciseId}`}
            >
              {/* Exercise header */}
              <View style={styles.exerciseHeader}>
                <Image source={exerciseImages[ex.imageUrl]} style={styles.exerciseImage} />
                <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
              </View>

              {/* Rest time */}
              <View style={styles.restRow}>
                <Ionicons name="timer-outline" size={14} color="#0070D4" />
                <Text style={styles.restText}>Repos : {formatRestLabel(ex.restTime)}</Text>
              </View>

              {/* Sets table header */}
              <View style={styles.setRow}>
                <Text style={[styles.setCell, styles.setCellHeader, styles.cellSerie]}>Série</Text>
                <Text style={[styles.setCell, styles.setCellHeader, styles.cellPrev]}>
                  Précédent
                </Text>
                <Text style={[styles.setCell, styles.setCellHeader, styles.cellKg]}>KG</Text>
                <Text style={[styles.setCell, styles.setCellHeader, styles.cellReps]}>Réps</Text>
                <View style={styles.cellCheck} />
              </View>

              {/* Sets */}
              {ex.sets.map((set, idx) => (
                <SetRow
                  key={idx}
                  set={set}
                  idx={idx}
                  exerciseId={ex.exerciseId}
                  onUpdate={(field, value) => updateSet(ex.exerciseId, idx, field, value)}
                  onComplete={() => completeSet(ex.exerciseId, idx, ex.restTime)}
                />
              ))}

              {/* Add set */}
              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => addSet(ex.exerciseId)}
                testID={`add-set-${ex.exerciseId}`}
              >
                <Text style={styles.addSetText}>+ Ajouter une série</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Rest timer bar */}
        {restTimer && (
          <View style={[styles.restTimerBar, { bottom: bottom + 60 }]} testID="rest-timer-bar">
            <TouchableOpacity
              style={styles.restAdjustButton}
              onPress={() => adjustRest(-15)}
              testID="rest-minus-15"
            >
              <Text style={styles.restAdjustText}>-15</Text>
            </TouchableOpacity>
            <Text style={styles.restTimerText}>{formatTime(restTimer.remainingSeconds)}</Text>
            <TouchableOpacity
              style={styles.restAdjustButton}
              onPress={() => adjustRest(15)}
              testID="rest-plus-15"
            >
              <Text style={styles.restAdjustText}>+15</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={skipRest} testID="rest-skip">
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  finishButton: {
    backgroundColor: '#0070D4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    gap: 24,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0070D4',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  exerciseCard: {
    marginBottom: 28,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  exerciseImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0070D4',
    flex: 1,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  restText: {
    fontSize: 13,
    color: '#0070D4',
    fontWeight: '500',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: 8,
    paddingVertical: 4,
  },
  setRowCompleted: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
  },
  setCell: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  setCellHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  setCellDone: {
    color: '#30D158',
    fontWeight: '700',
  },
  setCellPrevValue: {
    color: '#6C6C70',
    fontSize: 12,
  },
  setCellInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  setCellInputDone: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    color: '#30D158',
  },
  cellSerie: {
    width: 40,
  },
  cellPrev: {
    flex: 1,
  },
  cellKg: {
    width: 56,
    marginHorizontal: 4,
  },
  cellReps: {
    width: 56,
    marginRight: 8,
  },
  cellCheck: {
    width: 32,
    alignItems: 'center',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDone: {
    backgroundColor: '#30D158',
  },
  addSetButton: {
    marginTop: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addSetText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  restTimerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  restAdjustButton: {
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  restAdjustText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  restTimerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    minWidth: 80,
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: '#0070D4',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

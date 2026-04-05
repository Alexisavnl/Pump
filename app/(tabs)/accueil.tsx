import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import {
  getActiveProgram,
  getProgram,
  markWorkoutDone,
  isWorkoutDone,
  saveDraft,
} from '../../utils/storage/programs';
import exerciseImages from '../../data/exerciseImages';
import type { Program, DayKey, ExerciseConfig } from '../../types/program';

const DAYS: DayKey[] = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

const DAY_LABELS: Record<DayKey, string> = {
  LUN: 'Lundi',
  MAR: 'Mardi',
  MER: 'Mercredi',
  JEU: 'Jeudi',
  VEN: 'Vendredi',
  SAM: 'Samedi',
  DIM: 'Dimanche',
};

type DayCircleState = 'today' | 'completed' | 'missed' | 'has-session' | 'rest';

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getTodayKey(): DayKey {
  return (['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'] as DayKey[])[new Date().getDay()];
}

function getCurrentWeekDays(): { key: DayKey; date: Date }[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return DAYS.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { key, date: d };
  });
}

function getDayCircleState(
  date: Date,
  todayDate: Date,
  hasSession: boolean,
  completed: boolean
): DayCircleState {
  const isToday = date.toDateString() === todayDate.toDateString();
  if (isToday) return 'today';
  if (hasSession) {
    if (completed) return 'completed';
    const isPast = date < todayDate;
    return isPast ? 'missed' : 'has-session';
  }
  return 'rest';
}

function formatSets(exercise: ExerciseConfig): string {
  const count = exercise.sets.length;
  const reps = exercise.sets[0]?.reps;
  const label = count === 1 ? 'série' : 'séries';
  if (typeof reps === 'number' && reps > 0) return `${count} ${label} · ${reps} reps`;
  if (typeof reps === 'object') return `${count} ${label} · ${reps.min}–${reps.max} reps`;
  return `${count} ${label}`;
}

export default function AccueilScreen() {
  const { bottom } = useSafeAreaInsets();
  const todayKey = getTodayKey();
  const [selectedDay, setSelectedDay] = useState<DayKey>(todayKey);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [todayDone, setTodayDone] = useState(false);

  const today = new Date();
  const todayDateKey = toDateKey(today);

  useFocusEffect(
    useCallback(() => {
      const id = getActiveProgram();
      setActiveProgram(id ? (getProgram(id) ?? null) : null);
      setTodayDone(isWorkoutDone(todayDateKey));
    }, [todayDateKey])
  );

  const weekDays = getCurrentWeekDays();
  const session = activeProgram?.days[selectedDay]?.[0] ?? null;
  const isToday = selectedDay === todayKey;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Planning</Text>

        <View style={styles.weekRow}>
          {weekDays.map(({ key, date }) => {
            const hasSession = (activeProgram?.days[key]?.length ?? 0) > 0;
            const completed = isWorkoutDone(toDateKey(date));
            const circleState = getDayCircleState(date, today, hasSession, completed);
            const isSelected = key === selectedDay;

            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedDay(key)}
                style={[styles.dayColumn, isSelected && styles.dayColumnSelected]}
                testID={circleState === 'today' ? 'day-pill-today' : `day-pill-${key}`}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                  {DAY_LABELS[key].slice(0, 3)}
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    circleState === 'today' && styles.dayCircleToday,
                    circleState === 'has-session' && styles.dayCircleSession,
                    circleState === 'missed' && styles.dayCircleMissed,
                    circleState === 'completed' && styles.dayCircleCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      circleState === 'today' && styles.dayNumberToday,
                      circleState === 'missed' && styles.dayNumberMissed,
                      circleState === 'has-session' && styles.dayNumberSession,
                      circleState === 'completed' && styles.dayNumberSession,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeProgram ? (
          session ? (
            <View>
              <Text style={styles.dayLabel} testID="day-label">
                {isToday ? "Aujourd'hui" : DAY_LABELS[selectedDay]}
              </Text>
              <View style={styles.sessionTitleRow}>
                <Text style={styles.sessionTitle} testID="session-title">
                  {session.title}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (activeProgram) saveDraft(activeProgram);
                    router.push(
                      `/entrainement/program/session/new?day=${selectedDay}&sessionId=${session.id}&programId=${activeProgram?.id}`
                    );
                  }}
                  testID="edit-session-button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil" size={18} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              <View testID="exercise-list">
                {session.exercises.map((ex) => (
                  <View
                    key={ex.exerciseId}
                    style={styles.exerciseRow}
                    testID={`exercise-row-${ex.exerciseId}`}
                  >
                    <Image source={exerciseImages[ex.imageUrl]} style={styles.exerciseImage} />
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                      <Text style={styles.exerciseSets}>{formatSets(ex)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState} testID="no-session-state">
              <Text style={styles.emptyTitle}>Repos</Text>
              <Text style={styles.emptySubtitle}>Aucune séance prévue ce jour</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyState} testID="no-program-state">
            <Text style={styles.emptyTitle}>Aucun programme actif</Text>
            <Text style={styles.emptySubtitle}>Crée un programme dans l'onglet Entraînement</Text>
          </View>
        )}
      </ScrollView>

      {session && isToday && (
        <View style={[styles.ctaContainer, { paddingBottom: bottom + 60 }]}>
          {todayDone ? (
            <View style={styles.ctaButtonDone} testID="workout-done-button">
              <Text style={styles.ctaText}>Séance terminée ✓</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              testID="start-workout-button"
              onPress={() => {
                markWorkoutDone(todayDateKey);
                setTodayDone(true);
              }}
            >
              <Text style={styles.ctaText}>Démarrer l'entraînement</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 20,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 12,
    gap: 4,
    minWidth: 36,
  },
  dayColumnSelected: {
    backgroundColor: '#3C3C3E',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
  },
  dayNameSelected: {
    color: '#ffffff',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  dayCircleSession: {
    backgroundColor: '#3C3C3E',
  },
  dayCircleMissed: {
    borderWidth: 1.5,
    borderColor: '#FF453A',
  },
  dayCircleCompleted: {
    backgroundColor: '#0070D4',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  dayNumberToday: {
    color: '#ffffff',
  },
  dayNumberSession: {
    color: '#ffffff',
  },
  dayNumberMissed: {
    color: '#FF453A',
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 28,
    marginBottom: 4,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sessionTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  exerciseImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    marginRight: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 3,
  },
  exerciseSets: {
    fontSize: 13,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  ctaButton: {
    backgroundColor: '#0070D4',
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonDone: {
    backgroundColor: '#2C2C2E',
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

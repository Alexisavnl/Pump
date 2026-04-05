import { createMMKV } from 'react-native-mmkv';
import type { CompletedWorkout, ExerciseHistory } from '../../types/workout';

const storage = createMMKV({ id: 'workouts-storage' });

const KEYS = {
  WORKOUT_INDEX: 'workout_index',
  WORKOUT_PREFIX: 'workout_',
  EXERCISE_HISTORY_PREFIX: 'exercise_history_',
} as const;

// Completed workouts

export function saveCompletedWorkout(workout: CompletedWorkout): void {
  storage.set(KEYS.WORKOUT_PREFIX + workout.id, JSON.stringify(workout));

  const index = getWorkoutIndex();
  if (!index.includes(workout.id)) {
    index.push(workout.id);
    storage.set(KEYS.WORKOUT_INDEX, JSON.stringify(index));
  }
}

export function getCompletedWorkout(id: string): CompletedWorkout | null {
  const raw = storage.getString(KEYS.WORKOUT_PREFIX + id);
  if (!raw) return null;
  return JSON.parse(raw) as CompletedWorkout;
}

export function getAllCompletedWorkouts(): CompletedWorkout[] {
  const index = getWorkoutIndex();
  return index
    .map((id) => getCompletedWorkout(id))
    .filter((w): w is CompletedWorkout => w !== null)
    .sort((a, b) => b.startedAt - a.startedAt);
}

// Exercise history (last performance per exercise for "Précédent" column)

export function saveExerciseHistory(history: ExerciseHistory): void {
  storage.set(KEYS.EXERCISE_HISTORY_PREFIX + history.exerciseId, JSON.stringify(history));
}

export function getExerciseHistory(exerciseId: string): ExerciseHistory | null {
  const raw = storage.getString(KEYS.EXERCISE_HISTORY_PREFIX + exerciseId);
  if (!raw) return null;
  return JSON.parse(raw) as ExerciseHistory;
}

function getWorkoutIndex(): string[] {
  const raw = storage.getString(KEYS.WORKOUT_INDEX);
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

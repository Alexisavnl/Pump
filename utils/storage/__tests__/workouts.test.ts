import {
  saveCompletedWorkout,
  getCompletedWorkout,
  getAllCompletedWorkouts,
  saveExerciseHistory,
  getExerciseHistory,
} from '../workouts';
import { clearAllMMKVInstances } from 'react-native-mmkv';
import type { CompletedWorkout, ExerciseHistory } from '../../../types/workout';

jest.mock('react-native-mmkv');

function makeWorkout(id: string, startedAt = Date.now()): CompletedWorkout {
  return {
    id,
    sessionId: 's1',
    sessionTitle: 'Push',
    programId: 'p1',
    startedAt,
    completedAt: startedAt + 3600000,
    durationSeconds: 3600,
    totalVolume: 1200,
    totalSets: 9,
    exercises: [],
  };
}

describe('Workouts storage', () => {
  beforeEach(() => {
    clearAllMMKVInstances();
  });

  describe('saveCompletedWorkout / getCompletedWorkout', () => {
    it('saves and retrieves a workout by id', () => {
      const workout = makeWorkout('w1');
      saveCompletedWorkout(workout);
      const retrieved = getCompletedWorkout('w1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.sessionTitle).toBe('Push');
    });

    it('returns null for unknown id', () => {
      expect(getCompletedWorkout('unknown')).toBeNull();
    });
  });

  describe('getAllCompletedWorkouts', () => {
    it('returns empty array when no workouts saved', () => {
      expect(getAllCompletedWorkouts()).toEqual([]);
    });

    it('returns all saved workouts sorted by most recent first', () => {
      saveCompletedWorkout(makeWorkout('w1', 1000));
      saveCompletedWorkout(makeWorkout('w2', 2000));
      const workouts = getAllCompletedWorkouts();
      expect(workouts).toHaveLength(2);
      expect(workouts[0].id).toBe('w2');
      expect(workouts[1].id).toBe('w1');
    });

    it('does not duplicate a workout saved twice', () => {
      const workout = makeWorkout('w1');
      saveCompletedWorkout(workout);
      saveCompletedWorkout(workout);
      expect(getAllCompletedWorkouts()).toHaveLength(1);
    });
  });

  describe('exercise history', () => {
    it('saves and retrieves exercise history', () => {
      const history: ExerciseHistory = {
        exerciseId: 'ex1',
        lastPerformedAt: Date.now(),
        sets: [
          { kg: 80, reps: 8 },
          { kg: 80, reps: 6 },
        ],
      };
      saveExerciseHistory(history);
      const retrieved = getExerciseHistory('ex1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.sets).toHaveLength(2);
      expect(retrieved?.sets[0].kg).toBe(80);
    });

    it('returns null when no history for exercise', () => {
      expect(getExerciseHistory('unknown')).toBeNull();
    });

    it('overwrites previous history for same exercise', () => {
      saveExerciseHistory({
        exerciseId: 'ex1',
        lastPerformedAt: 1000,
        sets: [{ kg: 60, reps: 10 }],
      });
      saveExerciseHistory({
        exerciseId: 'ex1',
        lastPerformedAt: 2000,
        sets: [{ kg: 80, reps: 8 }],
      });
      const retrieved = getExerciseHistory('ex1');
      expect(retrieved?.sets[0].kg).toBe(80);
    });
  });
});

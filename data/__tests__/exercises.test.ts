import exercisesJson from '../exercises.json';
import type { Exercise, MuscleGroup, Equipment, ExerciseType } from '../../types/exercise';

const exercises = exercisesJson as Exercise[];

const VALID_MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Quadriceps',
  'Hamstrings',
  'Calves',
  'Glutes',
  'Abductors',
  'Adductors',
  'Lats',
  'Upper Back',
  'Traps',
  'Lower Back',
  'Abs',
  'Cardio',
  'Neck',
  'Full Body',
];

const VALID_EQUIPMENT: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Band',
  'Medicine Ball',
  'Plate',
  'Smith Machine',
  'Other',
];

const VALID_EXERCISE_TYPES: ExerciseType[] = [
  'Weight & Reps',
  'Reps Only',
  'Weighted Bodyweight',
  'Assisted Bodyweight',
  'Duration',
  'Weight & Duration',
  'Distance & Duration',
  'Weight & Distance',
];

describe('exercises.json', () => {
  it('contains at least 5 exercises', () => {
    expect(exercises.length).toBeGreaterThanOrEqual(5);
  });

  it('each exercise has all required fields', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(exercise).toHaveProperty('id');
      expect(exercise).toHaveProperty('nameEn');
      expect(exercise).toHaveProperty('nameFr');
      expect(exercise).toHaveProperty('primaryMuscleGroup');
      expect(exercise).toHaveProperty('secondaryMuscleGroups');
      expect(exercise).toHaveProperty('equipment');
      expect(exercise).toHaveProperty('exerciseType');
      expect(exercise).toHaveProperty('imageUrl');
    });
  });

  it('each exercise id is a non-empty string', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(typeof exercise.id).toBe('string');
      expect(exercise.id.length).toBeGreaterThan(0);
    });
  });

  it('each exercise nameEn is a non-empty string', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(typeof exercise.nameEn).toBe('string');
      expect(exercise.nameEn.length).toBeGreaterThan(0);
    });
  });

  it('each exercise nameFr is a non-empty string', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(typeof exercise.nameFr).toBe('string');
      expect(exercise.nameFr.length).toBeGreaterThan(0);
    });
  });

  it('each exercise has a valid primaryMuscleGroup', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(VALID_MUSCLE_GROUPS).toContain(exercise.primaryMuscleGroup);
    });
  });

  it('each exercise has valid secondaryMuscleGroups', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(Array.isArray(exercise.secondaryMuscleGroups)).toBe(true);
      exercise.secondaryMuscleGroups.forEach((group) => {
        expect(VALID_MUSCLE_GROUPS).toContain(group);
      });
    });
  });

  it('each exercise has a valid equipment', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(VALID_EQUIPMENT).toContain(exercise.equipment);
    });
  });

  it('each exercise has a valid exerciseType', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(VALID_EXERCISE_TYPES).toContain(exercise.exerciseType);
    });
  });

  it('each exercise imageUrl is a non-empty string', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(typeof exercise.imageUrl).toBe('string');
      expect(exercise.imageUrl.length).toBeGreaterThan(0);
    });
  });

  it('all exercise ids are unique', () => {
    const ids = exercises.map((e: Exercise) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

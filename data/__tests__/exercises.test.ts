import exercisesJson from '../exercises.json';
import type { Exercise, MuscleGroup } from '../../types/exercise';

const exercises = exercisesJson as Exercise[];

const VALID_MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Abs',
  'Cardio',
];

describe('exercises.json', () => {
  it('contains at least 20 exercises', () => {
    expect(exercises.length).toBeGreaterThanOrEqual(20);
  });

  it('each exercise has required fields: id, name, muscleGroup, imagePath', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(exercise).toHaveProperty('id');
      expect(exercise).toHaveProperty('name');
      expect(exercise).toHaveProperty('muscleGroup');
      expect(exercise).toHaveProperty('imagePath');
    });
  });

  it('each exercise id is a non-empty string', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(typeof exercise.id).toBe('string');
      expect(exercise.id.length).toBeGreaterThan(0);
    });
  });

  it('each exercise name is a non-empty string', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(typeof exercise.name).toBe('string');
      expect(exercise.name.length).toBeGreaterThan(0);
    });
  });

  it('each exercise has a valid muscleGroup', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(VALID_MUSCLE_GROUPS).toContain(exercise.muscleGroup);
    });
  });

  it('each exercise imagePath is a non-empty string', () => {
    exercises.forEach((exercise: Exercise) => {
      expect(typeof exercise.imagePath).toBe('string');
      expect(exercise.imagePath.length).toBeGreaterThan(0);
    });
  });

  it('all exercise ids are unique', () => {
    const ids = exercises.map((e: Exercise) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('covers major muscle groups', () => {
    const muscleGroups = new Set(exercises.map((e: Exercise) => e.muscleGroup));
    expect(muscleGroups.has('Chest')).toBe(true);
    expect(muscleGroups.has('Back')).toBe(true);
    expect(muscleGroups.has('Shoulders')).toBe(true);
    expect(muscleGroups.has('Biceps')).toBe(true);
    expect(muscleGroups.has('Triceps')).toBe(true);
    expect(muscleGroups.has('Quadriceps')).toBe(true);
    expect(muscleGroups.has('Abs')).toBe(true);
  });
});

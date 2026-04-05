export type MuscleGroup =
  | 'Chest'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Quadriceps'
  | 'Hamstrings'
  | 'Calves'
  | 'Glutes'
  | 'Abductors'
  | 'Adductors'
  | 'Lats'
  | 'Upper Back'
  | 'Traps'
  | 'Lower Back'
  | 'Abs'
  | 'Cardio'
  | 'Neck'
  | 'Full Body';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Band'
  | 'Medicine Ball'
  | 'Plate'
  | 'Smith Machine'
  | 'Other';

export type ExerciseType =
  | 'Weight & Reps'
  | 'Reps Only'
  | 'Weighted Bodyweight'
  | 'Assisted Bodyweight'
  | 'Duration'
  | 'Weight & Duration'
  | 'Distance & Duration'
  | 'Weight & Distance';

export interface Exercise {
  id: string;
  nameEn: string;
  nameFr: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment;
  exerciseType: ExerciseType;
  imageUrl: string;
}

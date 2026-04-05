export interface WorkoutSet {
  serieNumber: number;
  kg: number;
  reps: number;
  completed: boolean;
  completedAt?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  imageUrl: string;
  notes: string;
  restTime: number | null;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  sessionId: string;
  sessionTitle: string;
  programId: string;
  startedAt: number;
  exercises: WorkoutExercise[];
}

export interface CompletedWorkout {
  id: string;
  sessionId: string;
  sessionTitle: string;
  programId: string;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  totalVolume: number;
  totalSets: number;
  exercises: WorkoutExercise[];
}

export interface ExerciseHistory {
  exerciseId: string;
  lastPerformedAt: number;
  sets: { kg: number; reps: number }[];
}

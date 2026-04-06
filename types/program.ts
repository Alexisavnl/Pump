interface BaseSet {
  serieNumber: number;
  kg: number;
}

export type FixedSet = BaseSet & { reps: number };
export type RangeSet = BaseSet & { reps: { min: number; max: number } };
export type Set = FixedSet | RangeSet;

interface BaseExerciseConfig {
  exerciseId: string;
  exerciseName: string;
  imageUrl: string;
  notes: string;
  restTime: number | null;
}

export type ExerciseConfig =
  | (BaseExerciseConfig & { repType: 'fixed'; sets: FixedSet[] })
  | (BaseExerciseConfig & { repType: 'range'; sets: RangeSet[] });

export interface Session {
  id: string;
  title: string;
  description: string;
  exercises: ExerciseConfig[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  days: {
    LUN: Session[];
    MAR: Session[];
    MER: Session[];
    JEU: Session[];
    VEN: Session[];
    SAM: Session[];
    DIM: Session[];
  };
}

export type DayKey = 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN' | 'SAM' | 'DIM';

export interface Set {
  serieNumber: number;
  kg: number;
  reps: number | { min: number; max: number };
}

export interface ExerciseConfig {
  exerciseId: string;
  exerciseName: string;
  imageUrl: string;
  notes: string;
  restTime: number | null;
  repType: 'fixed' | 'range';
  sets: Set[];
}

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

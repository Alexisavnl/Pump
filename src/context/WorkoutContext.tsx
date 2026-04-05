import React, { createContext, useContext, useReducer, useRef, useCallback } from 'react';
import type { ActiveWorkout, WorkoutExercise, CompletedWorkout } from '../../types/workout';
import { saveCompletedWorkout, saveExerciseHistory } from '../../utils/storage/workouts';
import { markWorkoutDone } from '../../utils/storage/programs';
import { initHealthKit, logWorkoutToHealthKit } from '../../utils/healthkit';

// State

interface RestTimer {
  exerciseId: string;
  totalSeconds: number;
  remainingSeconds: number;
  running: boolean;
}

interface WorkoutState {
  active: ActiveWorkout | null;
  restTimer: RestTimer | null;
  isWorkoutVisible: boolean;
}

const initialState: WorkoutState = {
  active: null,
  restTimer: null,
  isWorkoutVisible: false,
};

// Actions

type WorkoutAction =
  | { type: 'START'; payload: ActiveWorkout }
  | { type: 'SHOW' }
  | { type: 'HIDE' }
  | { type: 'DISCARD' }
  | { type: 'COMPLETE_SET'; exerciseId: string; setIndex: number }
  | {
      type: 'UPDATE_SET';
      exerciseId: string;
      setIndex: number;
      field: 'kg' | 'reps';
      value: number;
    }
  | { type: 'ADD_SET'; exerciseId: string }
  | { type: 'START_REST'; exerciseId: string; seconds: number }
  | { type: 'TICK_REST' }
  | { type: 'ADJUST_REST'; delta: number }
  | { type: 'SKIP_REST' };

function reducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'START':
      return { ...state, active: action.payload, isWorkoutVisible: true };

    case 'SHOW':
      return { ...state, isWorkoutVisible: true };

    case 'HIDE':
      return { ...state, isWorkoutVisible: false };

    case 'DISCARD':
      return { active: null, restTimer: null, isWorkoutVisible: false };

    case 'COMPLETE_SET': {
      if (!state.active) return state;
      const exercises = state.active.exercises.map((ex) => {
        if (ex.exerciseId !== action.exerciseId) return ex;
        const sets = ex.sets.map((s, i) =>
          i === action.setIndex ? { ...s, completed: !s.completed, completedAt: Date.now() } : s
        );
        return { ...ex, sets };
      });
      return { ...state, active: { ...state.active, exercises } };
    }

    case 'UPDATE_SET': {
      if (!state.active) return state;
      const exercises = state.active.exercises.map((ex) => {
        if (ex.exerciseId !== action.exerciseId) return ex;
        const sets = ex.sets.map((s, i) =>
          i === action.setIndex ? { ...s, [action.field]: action.value } : s
        );
        return { ...ex, sets };
      });
      return { ...state, active: { ...state.active, exercises } };
    }

    case 'ADD_SET': {
      if (!state.active) return state;
      const exercises = state.active.exercises.map((ex) => {
        if (ex.exerciseId !== action.exerciseId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        const newSet = {
          serieNumber: ex.sets.length + 1,
          kg: last?.kg ?? 0,
          reps: last?.reps ?? 0,
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      });
      return { ...state, active: { ...state.active, exercises } };
    }

    case 'START_REST':
      return {
        ...state,
        restTimer: {
          exerciseId: action.exerciseId,
          totalSeconds: action.seconds,
          remainingSeconds: action.seconds,
          running: true,
        },
      };

    case 'TICK_REST': {
      if (!state.restTimer) return state;
      const remaining = state.restTimer.remainingSeconds - 1;
      if (remaining <= 0) return { ...state, restTimer: null };
      return { ...state, restTimer: { ...state.restTimer, remainingSeconds: remaining } };
    }

    case 'ADJUST_REST': {
      if (!state.restTimer) return state;
      const remaining = Math.max(0, state.restTimer.remainingSeconds + action.delta);
      if (remaining === 0) return { ...state, restTimer: null };
      return { ...state, restTimer: { ...state.restTimer, remainingSeconds: remaining } };
    }

    case 'SKIP_REST':
      return { ...state, restTimer: null };

    default:
      return state;
  }
}

// Context

interface WorkoutContextValue {
  state: WorkoutState;
  startWorkout: (workout: ActiveWorkout) => void;
  showWorkout: () => void;
  hideWorkout: () => void;
  discardWorkout: () => void;
  finishWorkout: () => void;
  completeSet: (exerciseId: string, setIndex: number, restSeconds: number | null) => void;
  updateSet: (exerciseId: string, setIndex: number, field: 'kg' | 'reps', value: number) => void;
  addSet: (exerciseId: string) => void;
  adjustRest: (delta: number) => void;
  skipRest: () => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);

  stateRef.current = state;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_REST' });
    }, 1000);
  }, [clearTimer]);

  const startWorkout = useCallback((workout: ActiveWorkout) => {
    dispatch({ type: 'START', payload: workout });
  }, []);

  const showWorkout = useCallback(() => dispatch({ type: 'SHOW' }), []);
  const hideWorkout = useCallback(() => dispatch({ type: 'HIDE' }), []);

  const discardWorkout = useCallback(() => {
    clearTimer();
    dispatch({ type: 'DISCARD' });
  }, [clearTimer]);

  const finishWorkout = useCallback(() => {
    clearTimer();
    const current = stateRef.current.active;
    if (!current) return;
    const today = new Date().toISOString().slice(0, 10);
    const completed = saveFinishedWorkout(current, today);
    dispatch({ type: 'DISCARD' });

    // Log to Apple Health (fire and forget)
    initHealthKit()
      .then(() =>
        logWorkoutToHealthKit({
          startDate: new Date(completed.startedAt),
          endDate: new Date(completed.completedAt),
          durationSeconds: completed.durationSeconds,
          totalVolume: completed.totalVolume,
        })
      )
      .catch(() => {
        // HealthKit unavailable or permission denied — silent fail
      });
  }, [clearTimer]);

  const completeSet = useCallback(
    (exerciseId: string, setIndex: number, restSeconds: number | null) => {
      dispatch({ type: 'COMPLETE_SET', exerciseId, setIndex });
      if (restSeconds && restSeconds > 0) {
        dispatch({ type: 'START_REST', exerciseId, seconds: restSeconds });
        startTimer();
      }
    },
    [startTimer]
  );

  const updateSet = useCallback(
    (exerciseId: string, setIndex: number, field: 'kg' | 'reps', value: number) => {
      dispatch({ type: 'UPDATE_SET', exerciseId, setIndex, field, value });
    },
    []
  );

  const addSet = useCallback((exerciseId: string) => {
    dispatch({ type: 'ADD_SET', exerciseId });
  }, []);

  const adjustRest = useCallback((delta: number) => {
    dispatch({ type: 'ADJUST_REST', delta });
  }, []);

  const skipRest = useCallback(() => {
    clearTimer();
    dispatch({ type: 'SKIP_REST' });
  }, [clearTimer]);

  return (
    <WorkoutContext.Provider
      value={{
        state,
        startWorkout,
        showWorkout,
        hideWorkout,
        discardWorkout,
        finishWorkout,
        completeSet,
        updateSet,
        addSet,
        adjustRest,
        skipRest,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used inside WorkoutProvider');
  return ctx;
}

// Helper to build ActiveWorkout from a session
export function buildActiveWorkout(
  session: {
    id: string;
    title: string;
    exercises: {
      exerciseId: string;
      exerciseName: string;
      imageUrl: string;
      notes: string;
      restTime: number | null;
      sets: { serieNumber: number; kg: number; reps: number | { min: number; max: number } }[];
    }[];
  },
  programId: string,
  getHistory: (exerciseId: string) => { sets: { kg: number; reps: number }[] } | null
): ActiveWorkout {
  return {
    sessionId: session.id,
    sessionTitle: session.title,
    programId,
    startedAt: Date.now(),
    exercises: session.exercises.map((ex) => {
      const history = getHistory(ex.exerciseId);
      return {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        imageUrl: ex.imageUrl,
        notes: ex.notes,
        restTime: ex.restTime,
        sets: ex.sets.map((s, i) => {
          const histSet = history?.sets[i];
          const baseReps = typeof s.reps === 'number' ? s.reps : s.reps.min;
          return {
            serieNumber: s.serieNumber,
            kg: histSet?.kg ?? (typeof s.reps === 'number' ? 0 : 0),
            reps: histSet?.reps ?? baseReps,
            completed: false,
          };
        }),
      };
    }),
  };
}

// Helper to compute finished workout stats and save
export function saveFinishedWorkout(active: ActiveWorkout, dateKey: string): CompletedWorkout {
  const now = Date.now();
  const durationSeconds = Math.round((now - active.startedAt) / 1000);
  const completedSets = active.exercises.flatMap((ex) => ex.sets.filter((s) => s.completed));
  const totalVolume = completedSets.reduce((sum, s) => sum + s.kg * s.reps, 0);

  // Save exercise history for "Précédent" column
  for (const ex of active.exercises) {
    const done = ex.sets.filter((s) => s.completed);
    if (done.length > 0) {
      saveExerciseHistory({
        exerciseId: ex.exerciseId,
        lastPerformedAt: now,
        sets: done.map((s) => ({ kg: s.kg, reps: s.reps })),
      });
    }
  }

  // Mark today as done
  markWorkoutDone(dateKey);

  const completed: CompletedWorkout = {
    id: now.toString(),
    sessionId: active.sessionId,
    sessionTitle: active.sessionTitle,
    programId: active.programId,
    startedAt: active.startedAt,
    completedAt: now,
    durationSeconds,
    totalVolume,
    totalSets: completedSets.length,
    exercises: active.exercises,
  };

  saveCompletedWorkout(completed);
  return completed;
}

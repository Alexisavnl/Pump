import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AccueilScreen from '../accueil';
import {
  getActiveProgram,
  getProgram,
  isWorkoutDone,
  markWorkoutDone,
} from '../../../utils/storage/programs';
import type { Program } from '../../../types/program';

jest.mock('react-native-mmkv');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));
jest.mock('../../../utils/storage/programs');
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

const mockGetActiveProgram = getActiveProgram as jest.MockedFunction<typeof getActiveProgram>;
const mockGetProgram = getProgram as jest.MockedFunction<typeof getProgram>;
const mockIsWorkoutDone = isWorkoutDone as jest.MockedFunction<typeof isWorkoutDone>;
const mockMarkWorkoutDone = markWorkoutDone as jest.MockedFunction<typeof markWorkoutDone>;

function makeTodayKey(): string {
  return ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][new Date().getDay()];
}

function makeSession(id: string, title: string) {
  return {
    id,
    title,
    description: '',
    exercises: [
      {
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        imageUrl: 'bench_press',
        notes: '',
        restTime: null,
        repType: 'fixed' as const,
        sets: [{ serieNumber: 1, kg: 60, reps: 10 }],
      },
    ],
  };
}

function makeProgram(id: string, title: string, daysWithSessions: string[] = []): Program {
  const days: Program['days'] = {
    LUN: [],
    MAR: [],
    MER: [],
    JEU: [],
    VEN: [],
    SAM: [],
    DIM: [],
  };
  daysWithSessions.forEach((day) => {
    (days as Record<string, typeof days.LUN>)[day] = [makeSession(`s-${day}`, `Session ${day}`)];
  });
  return {
    id,
    title,
    description: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    days,
  };
}

describe('AccueilScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveProgram.mockReturnValue(null);
    mockGetProgram.mockReturnValue(null);
    mockIsWorkoutDone.mockReturnValue(false);
    mockMarkWorkoutDone.mockImplementation(() => {});
  });

  it('renders "Planning" title', () => {
    render(<AccueilScreen />);
    expect(screen.getByText('Planning')).toBeTruthy();
  });

  it('renders all 7 day pills', () => {
    render(<AccueilScreen />);
    const todayKey = makeTodayKey();
    const otherDays = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].filter(
      (k) => k !== todayKey
    );
    expect(screen.getByTestId('day-pill-today')).toBeTruthy();
    otherDays.forEach((key) => {
      expect(screen.getByTestId(`day-pill-${key}`)).toBeTruthy();
    });
  });

  it("today's pill has day-pill-today testID", () => {
    render(<AccueilScreen />);
    expect(screen.getByTestId('day-pill-today')).toBeTruthy();
  });

  it('shows no-program-state when no active program', () => {
    render(<AccueilScreen />);
    expect(screen.getByTestId('no-program-state')).toBeTruthy();
  });

  it('shows no-session-state when active program but no session for today', () => {
    const program = makeProgram('p1', 'PPL', []);
    mockGetActiveProgram.mockReturnValue('p1');
    mockGetProgram.mockReturnValue(program);
    render(<AccueilScreen />);
    expect(screen.getByTestId('no-session-state')).toBeTruthy();
  });

  it('shows session title and exercises when today has a session', () => {
    const todayKey = makeTodayKey();
    const program = makeProgram('p1', 'PPL', [todayKey]);
    mockGetActiveProgram.mockReturnValue('p1');
    mockGetProgram.mockReturnValue(program);
    render(<AccueilScreen />);
    expect(screen.getByTestId('session-title')).toBeTruthy();
    expect(screen.getByTestId('exercise-list')).toBeTruthy();
    expect(screen.getByTestId('exercise-row-ex1')).toBeTruthy();
  });

  it('tapping a day pill updates the session preview', () => {
    const todayKey = makeTodayKey();
    const otherDays = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].filter(
      (k) => k !== todayKey
    );
    const targetDay = otherDays[0];
    const program = makeProgram('p1', 'PPL', [targetDay]);
    mockGetActiveProgram.mockReturnValue('p1');
    mockGetProgram.mockReturnValue(program);
    render(<AccueilScreen />);

    expect(screen.getByTestId('no-session-state')).toBeTruthy();
    fireEvent.press(screen.getByTestId(`day-pill-${targetDay}`));
    expect(screen.getByTestId('session-title')).toBeTruthy();
  });

  it('shows CTA button only when today has a session', () => {
    const todayKey = makeTodayKey();
    const program = makeProgram('p1', 'PPL', [todayKey]);
    mockGetActiveProgram.mockReturnValue('p1');
    mockGetProgram.mockReturnValue(program);
    render(<AccueilScreen />);
    expect(screen.getByTestId('start-workout-button')).toBeTruthy();
  });

  it('does not show CTA button when today has no session', () => {
    const program = makeProgram('p1', 'PPL', []);
    mockGetActiveProgram.mockReturnValue('p1');
    mockGetProgram.mockReturnValue(program);
    render(<AccueilScreen />);
    expect(screen.queryByTestId('start-workout-button')).toBeNull();
  });

  it('does not show CTA button when viewing a different day with a session', () => {
    const todayKey = makeTodayKey();
    const otherDays = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].filter(
      (k) => k !== todayKey
    );
    const targetDay = otherDays[0];
    const program = makeProgram('p1', 'PPL', [targetDay]);
    mockGetActiveProgram.mockReturnValue('p1');
    mockGetProgram.mockReturnValue(program);
    render(<AccueilScreen />);

    fireEvent.press(screen.getByTestId(`day-pill-${targetDay}`));
    expect(screen.queryByTestId('start-workout-button')).toBeNull();
  });

  it('pressing CTA calls markWorkoutDone and shows done state', () => {
    const todayKey = makeTodayKey();
    const program = makeProgram('p1', 'PPL', [todayKey]);
    mockGetActiveProgram.mockReturnValue('p1');
    mockGetProgram.mockReturnValue(program);
    render(<AccueilScreen />);

    fireEvent.press(screen.getByTestId('start-workout-button'));
    expect(mockMarkWorkoutDone).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('workout-done-button')).toBeTruthy();
    expect(screen.queryByTestId('start-workout-button')).toBeNull();
  });

  it('shows done state immediately when today workout is already done', () => {
    const todayKey = makeTodayKey();
    const program = makeProgram('p1', 'PPL', [todayKey]);
    mockGetActiveProgram.mockReturnValue('p1');
    mockGetProgram.mockReturnValue(program);
    mockIsWorkoutDone.mockReturnValue(true);
    render(<AccueilScreen />);

    expect(screen.getByTestId('workout-done-button')).toBeTruthy();
    expect(screen.queryByTestId('start-workout-button')).toBeNull();
  });
});

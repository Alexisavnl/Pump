import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AddExercisesScreen from '../exercises';

jest.mock('react-native-safe-area-context');
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));
jest.mock('expo-blur', () => {
  const React = require('react');
  return {
    BlurView: ({ children, ...props }: { children?: unknown; style?: object }) =>
      React.createElement('BlurView', props, children),
  };
});
jest.mock('../../../../../../data/exerciseImages', () => ({
  default: {},
}));
jest.mock('../../../../../../utils/storage/programs', () => ({
  saveTempExercises: jest.fn(),
}));

describe('AddExercisesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header title', () => {
    render(<AddExercisesScreen />);
    expect(screen.getByText('Ajouter des exercices')).toBeTruthy();
  });

  it('renders back button', () => {
    render(<AddExercisesScreen />);
    expect(screen.getByTestId('back-button')).toBeTruthy();
  });

  it('calls router.back when back button is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { back: jest.Mock } };
    render(<AddExercisesScreen />);
    fireEvent.press(screen.getByTestId('back-button'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('renders search input with correct placeholder', () => {
    render(<AddExercisesScreen />);
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeTruthy();
    expect(searchInput.props.placeholder).toBe('Chercher un exercice...');
  });

  it('renders exercise list', () => {
    render(<AddExercisesScreen />);
    expect(screen.getByTestId('exercise-list')).toBeTruthy();
  });

  it('renders exercises from exercises.json', () => {
    render(<AddExercisesScreen />);
    expect(screen.getByText('Barbell Bench Press')).toBeTruthy();
    expect(screen.getByText('Barbell Curl')).toBeTruthy();
    expect(screen.getByText('Barbell Full Squat')).toBeTruthy();
  });

  it('shows exercise primary muscle group', () => {
    render(<AddExercisesScreen />);
    expect(screen.getAllByText('Chest').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lats').length).toBeGreaterThan(0);
  });

  it('filters exercises by English name (case insensitive)', () => {
    render(<AddExercisesScreen />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.changeText(searchInput, 'Curl');
    expect(screen.getByText('Barbell Curl')).toBeTruthy();
    expect(screen.queryByText('Barbell Bench Press')).toBeNull();
  });

  it('filters exercises by French name (case insensitive)', () => {
    render(<AddExercisesScreen />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.changeText(searchInput, 'traction');
    expect(screen.getByText('Pull Up')).toBeTruthy();
    expect(screen.queryByText('Barbell Bench Press')).toBeNull();
  });

  it('filters exercises by partial name match', () => {
    render(<AddExercisesScreen />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.changeText(searchInput, 'squat');
    expect(screen.getByText('Barbell Full Squat')).toBeTruthy();
    expect(screen.queryByText('Barbell Curl')).toBeNull();
  });

  it('shows no results when search matches nothing', () => {
    render(<AddExercisesScreen />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.changeText(searchInput, 'xyznotfound');
    expect(screen.queryByText('Barbell Bench Press')).toBeNull();
    expect(screen.queryByText('Barbell Curl')).toBeNull();
  });

  it('restores full list when search is cleared', () => {
    render(<AddExercisesScreen />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.changeText(searchInput, 'curl');
    expect(screen.queryByText('Barbell Bench Press')).toBeNull();
    fireEvent.changeText(searchInput, '');
    expect(screen.getByText('Barbell Bench Press')).toBeTruthy();
  });

  it('selects an exercise on press and shows selection border', () => {
    render(<AddExercisesScreen />);
    const item = screen.getByTestId('exercise-item-barbell-bench-press');
    fireEvent.press(item);
    expect(screen.getByTestId('selection-border-barbell-bench-press')).toBeTruthy();
  });

  it('unselects an exercise on second press and removes selection border', () => {
    render(<AddExercisesScreen />);
    const item = screen.getByTestId('exercise-item-barbell-bench-press');
    fireEvent.press(item);
    expect(screen.getByTestId('selection-border-barbell-bench-press')).toBeTruthy();
    fireEvent.press(item);
    expect(screen.queryByTestId('selection-border-barbell-bench-press')).toBeNull();
  });

  it('can select multiple exercises simultaneously', () => {
    render(<AddExercisesScreen />);
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bench-press'));
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bent-over-row'));
    expect(screen.getByTestId('selection-border-barbell-bench-press')).toBeTruthy();
    expect(screen.getByTestId('selection-border-barbell-bent-over-row')).toBeTruthy();
  });

  it('unselecting one exercise does not affect others', () => {
    render(<AddExercisesScreen />);
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bench-press'));
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bent-over-row'));
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bench-press'));
    expect(screen.queryByTestId('selection-border-barbell-bench-press')).toBeNull();
    expect(screen.getByTestId('selection-border-barbell-bent-over-row')).toBeTruthy();
  });

  it('shows "Ajouter X exercices" button when one item is selected', () => {
    render(<AddExercisesScreen />);
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bench-press'));
    expect(screen.getByTestId('add-exercises-button')).toBeTruthy();
    expect(screen.getByText('Ajouter 1 exercice')).toBeTruthy();
  });

  it('shows correct count in add button for multiple selections', () => {
    render(<AddExercisesScreen />);
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bench-press'));
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bent-over-row'));
    expect(screen.getByText('Ajouter 2 exercices')).toBeTruthy();
  });

  it('selection persists through search filter changes', () => {
    render(<AddExercisesScreen />);
    fireEvent.press(screen.getByTestId('exercise-item-barbell-bench-press'));
    const searchInput = screen.getByTestId('search-input');
    fireEvent.changeText(searchInput, 'Barbell Bench Press');
    fireEvent.changeText(searchInput, '');
    expect(screen.getByTestId('selection-border-barbell-bench-press')).toBeTruthy();
  });
});

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
jest.mock('../../../../data/exerciseImages', () => ({
  default: {},
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

  it('renders all exercises from exercises.json', () => {
    render(<AddExercisesScreen />);
    expect(screen.getByText('Barbell Bench Press')).toBeTruthy();
    expect(screen.getByText('Barbell Curl')).toBeTruthy();
    expect(screen.getByText('Barbell Full Squat')).toBeTruthy();
  });

  it('shows exercise muscle group', () => {
    render(<AddExercisesScreen />);
    expect(screen.getAllByText('Chest').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Back').length).toBeGreaterThan(0);
  });

  it('filters exercises by name (case insensitive)', () => {
    render(<AddExercisesScreen />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.changeText(searchInput, 'Curl');
    expect(screen.getByText('Barbell Curl')).toBeTruthy();
    expect(screen.getByText('Barbell Preacher Curl')).toBeTruthy();
    expect(screen.queryByText('Barbell Bench Press')).toBeNull();
  });

  it('filters exercises by partial name match', () => {
    render(<AddExercisesScreen />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.changeText(searchInput, 'squat');
    expect(screen.getByText('Barbell Full Squat')).toBeTruthy();
    expect(screen.getByText('Barbell Front Squat')).toBeTruthy();
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
});

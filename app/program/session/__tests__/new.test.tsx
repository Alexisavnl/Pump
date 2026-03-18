import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import NewSessionScreen from '../new';

jest.mock('react-native-safe-area-context');
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({ day: 'LUN' })),
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('NewSessionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the session header title', () => {
    render(<NewSessionScreen />);
    expect(screen.getByText('Modifier la séance')).toBeTruthy();
  });

  it('renders back button', () => {
    render(<NewSessionScreen />);
    expect(screen.getByTestId('back-button')).toBeTruthy();
  });

  it('calls router.back when back button is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { back: jest.Mock } };
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId('back-button'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('displays the day parameter from route', () => {
    render(<NewSessionScreen />);
    expect(screen.getByTestId('day-label')).toBeTruthy();
    expect(screen.getByText('LUN')).toBeTruthy();
  });

  it('renders correctly with different day parameter (MAR)', () => {
    const { useLocalSearchParams } = jest.requireMock('expo-router') as {
      useLocalSearchParams: jest.Mock;
    };
    useLocalSearchParams.mockReturnValue({ day: 'MAR' });
    render(<NewSessionScreen />);
    expect(screen.getByText('MAR')).toBeTruthy();
  });

  it('renders session title input with default value "Upper A"', () => {
    render(<NewSessionScreen />);
    const titleInput = screen.getByTestId('session-title-input');
    expect(titleInput).toBeTruthy();
    expect(titleInput.props.value).toBe('Upper A');
  });

  it('renders description input with default value "Description"', () => {
    render(<NewSessionScreen />);
    const descInput = screen.getByTestId('session-description-input');
    expect(descInput).toBeTruthy();
    expect(descInput.props.value).toBe('Description');
  });

  it('allows editing the session title', () => {
    render(<NewSessionScreen />);
    const titleInput = screen.getByTestId('session-title-input');
    fireEvent.changeText(titleInput, 'Lower B');
    expect(titleInput.props.value).toBe('Lower B');
  });

  it('allows editing the description', () => {
    render(<NewSessionScreen />);
    const descInput = screen.getByTestId('session-description-input');
    fireEvent.changeText(descInput, 'Push day');
    expect(descInput.props.value).toBe('Push day');
  });

  it('renders empty exercise list area', () => {
    render(<NewSessionScreen />);
    expect(screen.getByTestId('exercise-list')).toBeTruthy();
  });

  it('renders "+ Ajouter des exercices" button', () => {
    render(<NewSessionScreen />);
    expect(screen.getByTestId('add-exercises-button')).toBeTruthy();
    expect(screen.getByText('+ Ajouter des exercices')).toBeTruthy();
  });

  it('renders validate (checkmark) button in header', () => {
    render(<NewSessionScreen />);
    expect(screen.getByTestId('validate-button')).toBeTruthy();
  });

  it('calls router.back when validate button is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { back: jest.Mock } };
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId('validate-button'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

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
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import NewProgramScreen from '../new';

jest.mock('react-native-safe-area-context');
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('NewProgramScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    render(<NewProgramScreen />);
    expect(screen.getByText('Nouveau Programme')).toBeTruthy();
  });

  it('renders back button', () => {
    render(<NewProgramScreen />);
    expect(screen.getByTestId('back-button')).toBeTruthy();
  });

  it('calls router.back when back button is pressed', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { router } = jest.requireMock('expo-router') as { router: { back: jest.Mock } };
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('back-button'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

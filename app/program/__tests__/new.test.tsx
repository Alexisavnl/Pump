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
    const { router } = jest.requireMock('expo-router') as { router: { back: jest.Mock } };
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('back-button'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('renders title input with default value "Push Pull Legs"', () => {
    render(<NewProgramScreen />);
    const input = screen.getByTestId('program-title-input');
    expect(input.props.value).toBe('Push Pull Legs');
  });

  it('renders description input with correct placeholder', () => {
    render(<NewProgramScreen />);
    const input = screen.getByTestId('program-description-input');
    expect(input.props.placeholder).toBe("Organise ta semaine d'entraînement");
  });

  it('renders all 7 day blocks', () => {
    render(<NewProgramScreen />);
    const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
    for (const day of days) {
      expect(screen.getByTestId(`day-block-${day}`)).toBeTruthy();
    }
  });

  it('renders "Ajouter une séance" for each day', () => {
    render(<NewProgramScreen />);
    const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
    for (const day of days) {
      expect(screen.getByTestId(`add-session-${day}`)).toBeTruthy();
    }
  });

  it('renders "Enregistrer le programme" button', () => {
    render(<NewProgramScreen />);
    expect(screen.getByTestId('save-program-button')).toBeTruthy();
    expect(screen.getByText('Enregistrer le programme')).toBeTruthy();
  });

  it('renders "Modifier" button in header', () => {
    render(<NewProgramScreen />);
    expect(screen.getByTestId('modifier-button')).toBeTruthy();
    expect(screen.getByText('Modifier')).toBeTruthy();
  });

  it('updates title when user types', () => {
    render(<NewProgramScreen />);
    const input = screen.getByTestId('program-title-input');
    fireEvent.changeText(input, 'My New Program');
    expect(input.props.value).toBe('My New Program');
  });
});

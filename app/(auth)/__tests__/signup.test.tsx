import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from '../signup';

jest.mock('@react-native-firebase/auth');
jest.mock('@react-native-firebase/app');
jest.mock('@react-native-google-signin/google-signin');
jest.mock('expo-apple-authentication');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

const mockSignUp = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();

jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithApple: mockSignInWithApple,
  }),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all fields', () => {
    render(<SignupScreen />);
    expect(screen.getByTestId('signup-email-input')).toBeTruthy();
    expect(screen.getByTestId('signup-password-input')).toBeTruthy();
    expect(screen.getByTestId('signup-confirm-input')).toBeTruthy();
  });

  it('calls signUp with valid inputs', async () => {
    mockSignUp.mockResolvedValue(undefined);
    render(<SignupScreen />);

    fireEvent.changeText(screen.getByTestId('signup-email-input'), 'new@example.com');
    fireEvent.changeText(screen.getByTestId('signup-password-input'), 'password123');
    fireEvent.changeText(screen.getByTestId('signup-confirm-input'), 'password123');
    fireEvent.press(screen.getByTestId('signup-submit-button'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'password123');
    });
  });

  it('shows error when passwords do not match', async () => {
    render(<SignupScreen />);

    fireEvent.changeText(screen.getByTestId('signup-email-input'), 'new@example.com');
    fireEvent.changeText(screen.getByTestId('signup-password-input'), 'password123');
    fireEvent.changeText(screen.getByTestId('signup-confirm-input'), 'different456');
    fireEvent.press(screen.getByTestId('signup-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    render(<SignupScreen />);

    fireEvent.changeText(screen.getByTestId('signup-email-input'), 'new@example.com');
    fireEvent.changeText(screen.getByTestId('signup-password-input'), '123');
    fireEvent.changeText(screen.getByTestId('signup-confirm-input'), '123');
    fireEvent.press(screen.getByTestId('signup-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Le mot de passe doit faire au moins 6 caractères')).toBeTruthy();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows Firebase error on email already in use', async () => {
    mockSignUp.mockRejectedValue({ code: 'auth/email-already-in-use' });
    render(<SignupScreen />);

    fireEvent.changeText(screen.getByTestId('signup-email-input'), 'existing@example.com');
    fireEvent.changeText(screen.getByTestId('signup-password-input'), 'password123');
    fireEvent.changeText(screen.getByTestId('signup-confirm-input'), 'password123');
    fireEvent.press(screen.getByTestId('signup-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Un compte existe déjà avec cet email')).toBeTruthy();
    });
  });

  it('navigates back when login link is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { back: jest.Mock } };
    render(<SignupScreen />);
    fireEvent.press(screen.getByTestId('signup-login-link'));
    expect(router.back).toHaveBeenCalled();
  });

  it('calls signInWithGoogle when Google button is pressed', async () => {
    mockSignInWithGoogle.mockResolvedValue(undefined);
    render(<SignupScreen />);
    fireEvent.press(screen.getByTestId('signup-google-button'));
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });
});

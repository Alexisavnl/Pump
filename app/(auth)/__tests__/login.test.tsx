import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../login';

jest.mock('@react-native-firebase/auth');
jest.mock('@react-native-firebase/app');
jest.mock('@react-native-google-signin/google-signin');
jest.mock('expo-apple-authentication');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

const mockSignIn = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();

jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithApple: mockSignInWithApple,
  }),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password fields', () => {
    render(<LoginScreen />);
    expect(screen.getByTestId('login-email-input')).toBeTruthy();
    expect(screen.getByTestId('login-password-input')).toBeTruthy();
  });

  it('renders submit, google and apple buttons', () => {
    render(<LoginScreen />);
    expect(screen.getByTestId('login-submit-button')).toBeTruthy();
    expect(screen.getByTestId('login-google-button')).toBeTruthy();
    expect(screen.getByTestId('login-apple-button')).toBeTruthy();
  });

  it('calls signIn with email and password on submit', async () => {
    mockSignIn.mockResolvedValue(undefined);
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'test@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'password123');
    fireEvent.press(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows error message on invalid credentials', async () => {
    mockSignIn.mockRejectedValue({ code: 'auth/invalid-credential' });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'wrong@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'wrongpass');
    fireEvent.press(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeTruthy();
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeTruthy();
    });
  });

  it('does not call signIn if fields are empty', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('login-submit-button'));
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('navigates to signup when link is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('login-signup-link'));
    expect(router.push).toHaveBeenCalledWith('/(auth)/signup');
  });

  it('toggles password visibility', () => {
    render(<LoginScreen />);
    const input = screen.getByTestId('login-password-input');
    expect(input.props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByTestId('login-toggle-password'));
    expect(input.props.secureTextEntry).toBe(false);
  });

  it('calls signInWithGoogle when Google button is pressed', async () => {
    mockSignInWithGoogle.mockResolvedValue(undefined);
    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('login-google-button'));
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });
});

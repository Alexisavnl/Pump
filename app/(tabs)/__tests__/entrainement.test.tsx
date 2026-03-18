import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import EntrainementScreen from '../entrainement';
import { getAllPrograms } from '../../../utils/storage/programs';
import type { Program } from '../../../types/program';

jest.mock('react-native-mmkv');
jest.mock('react-native-safe-area-context');
jest.mock('../../../utils/storage/programs');
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

const makeProgram = (id: string, title: string): Program => ({
  id,
  title,
  description: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  days: { LUN: [], MAR: [], MER: [], JEU: [], VEN: [], SAM: [], DIM: [] },
});

const mockGetAllPrograms = getAllPrograms as jest.MockedFunction<typeof getAllPrograms>;

describe('EntrainementScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Nouveau Programme" button', () => {
    mockGetAllPrograms.mockReturnValue([]);
    render(<EntrainementScreen />);
    expect(screen.getByText('Nouveau Programme')).toBeTruthy();
  });

  it('renders "MES PROGRAMMES" section title', () => {
    mockGetAllPrograms.mockReturnValue([]);
    render(<EntrainementScreen />);
    expect(screen.getByText('MES PROGRAMMES')).toBeTruthy();
  });

  it('shows empty state when no programs exist', () => {
    mockGetAllPrograms.mockReturnValue([]);
    render(<EntrainementScreen />);
    expect(screen.getByText('Aucun programme créé')).toBeTruthy();
  });

  it('does not show empty state when programs exist', () => {
    mockGetAllPrograms.mockReturnValue([makeProgram('p1', 'Push Pull Legs')]);
    render(<EntrainementScreen />);
    expect(screen.queryByText('Aucun programme créé')).toBeNull();
  });

  it('lists program titles when programs exist', () => {
    mockGetAllPrograms.mockReturnValue([
      makeProgram('p1', 'Push Pull Legs'),
      makeProgram('p2', 'Full Body'),
    ]);
    render(<EntrainementScreen />);
    expect(screen.getByText('Push Pull Legs')).toBeTruthy();
    expect(screen.getByText('Full Body')).toBeTruthy();
  });

  it('calls getAllPrograms on mount', () => {
    mockGetAllPrograms.mockReturnValue([]);
    render(<EntrainementScreen />);
    expect(mockGetAllPrograms).toHaveBeenCalledTimes(1);
  });

  it('navigates to /program/new when "Nouveau Programme" is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    mockGetAllPrograms.mockReturnValue([]);
    render(<EntrainementScreen />);
    fireEvent.press(screen.getByTestId('new-program-button'));
    expect(router.push).toHaveBeenCalledWith('/program/new');
  });
});

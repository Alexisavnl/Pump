import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import EntrainementScreen from '../index';
import {
  getAllPrograms,
  getActiveProgram,
  deleteProgram,
  saveDraft,
} from '../../../../utils/storage/programs';
import type { Program } from '../../../../types/program';

jest.mock('react-native-mmkv');
jest.mock('react-native-safe-area-context');
jest.mock('../../../../utils/storage/programs', () => ({
  getAllPrograms: jest.fn(),
  getActiveProgram: jest.fn(),
  deleteProgram: jest.fn(),
  saveDraft: jest.fn(),
  clearDraft: jest.fn(),
}));
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: jest.fn() },
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

const makeProgram = (id: string, title: string, activeDays: number = 0): Program => ({
  id,
  title,
  description: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  days: {
    LUN: activeDays > 0 ? [{ id: 's1', title: 'S1', description: '', exercises: [] }] : [],
    MAR: activeDays > 1 ? [{ id: 's2', title: 'S2', description: '', exercises: [] }] : [],
    MER: activeDays > 2 ? [{ id: 's3', title: 'S3', description: '', exercises: [] }] : [],
    JEU: [],
    VEN: [],
    SAM: [],
    DIM: [],
  },
});

const mockGetAllPrograms = getAllPrograms as jest.MockedFunction<typeof getAllPrograms>;
const mockGetActiveProgram = getActiveProgram as jest.MockedFunction<typeof getActiveProgram>;
const mockDeleteProgram = deleteProgram as jest.MockedFunction<typeof deleteProgram>;
const mockSaveDraft = saveDraft as jest.MockedFunction<typeof saveDraft>;

describe('EntrainementScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllPrograms.mockReturnValue([]);
    mockGetActiveProgram.mockReturnValue(null);
  });

  it('renders "Nouveau Programme" button', () => {
    render(<EntrainementScreen />);
    expect(screen.getByText('Nouveau Programme')).toBeTruthy();
  });

  it('renders "MES PROGRAMMES" section title', () => {
    render(<EntrainementScreen />);
    expect(screen.getByText('MES PROGRAMMES')).toBeTruthy();
  });

  it('shows empty state when no programs exist', () => {
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
    render(<EntrainementScreen />);
    expect(mockGetAllPrograms).toHaveBeenCalledTimes(1);
  });

  it('navigates to /entrainement/program/new when "Nouveau Programme" is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    render(<EntrainementScreen />);
    fireEvent.press(screen.getByTestId('new-program-button'));
    expect(router.push).toHaveBeenCalledWith('/entrainement/program/new');
  });

  it('shows "ACTIF" badge for the active program', () => {
    mockGetAllPrograms.mockReturnValue([makeProgram('p1', 'PPL')]);
    mockGetActiveProgram.mockReturnValue('p1');
    render(<EntrainementScreen />);
    expect(screen.getByTestId('active-badge-p1')).toBeTruthy();
    expect(screen.getByText('ACTIF')).toBeTruthy();
  });

  it('does not show "ACTIF" badge for non-active programs', () => {
    mockGetAllPrograms.mockReturnValue([makeProgram('p1', 'PPL'), makeProgram('p2', 'Full Body')]);
    mockGetActiveProgram.mockReturnValue('p1');
    render(<EntrainementScreen />);
    expect(screen.getByTestId('active-badge-p1')).toBeTruthy();
    expect(screen.queryByTestId('active-badge-p2')).toBeNull();
  });

  it('shows correct session count for programs', () => {
    mockGetAllPrograms.mockReturnValue([makeProgram('p1', 'PPL', 3)]);
    render(<EntrainementScreen />);
    expect(screen.getByText('3 séances / semaine')).toBeTruthy();
  });

  it('shows "0 séances / semaine" when no sessions in program', () => {
    mockGetAllPrograms.mockReturnValue([makeProgram('p1', 'PPL', 0)]);
    render(<EntrainementScreen />);
    expect(screen.getByText('0 séances / semaine')).toBeTruthy();
  });

  it('shows menu button for each program', () => {
    mockGetAllPrograms.mockReturnValue([makeProgram('p1', 'PPL')]);
    render(<EntrainementScreen />);
    expect(screen.getByTestId('program-menu-p1')).toBeTruthy();
  });

  it('opens menu modal when menu button is pressed', () => {
    mockGetAllPrograms.mockReturnValue([makeProgram('p1', 'PPL')]);
    render(<EntrainementScreen />);
    fireEvent.press(screen.getByTestId('program-menu-p1'));
    expect(screen.getByTestId('menu-edit-button')).toBeTruthy();
    expect(screen.getByTestId('menu-delete-button')).toBeTruthy();
  });

  it('deletes program when delete menu item is pressed', () => {
    mockGetAllPrograms.mockReturnValue([makeProgram('p1', 'PPL')]);
    render(<EntrainementScreen />);
    fireEvent.press(screen.getByTestId('program-menu-p1'));
    fireEvent.press(screen.getByTestId('menu-delete-button'));
    expect(mockDeleteProgram).toHaveBeenCalledWith('p1');
  });

  it('saves draft and navigates to edit when edit menu item is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    const program = makeProgram('p1', 'PPL');
    mockGetAllPrograms.mockReturnValue([program]);
    render(<EntrainementScreen />);
    fireEvent.press(screen.getByTestId('program-menu-p1'));
    fireEvent.press(screen.getByTestId('menu-edit-button'));
    expect(mockSaveDraft).toHaveBeenCalledWith(program);
    expect(router.push).toHaveBeenCalledWith('/entrainement/program/new');
  });
});

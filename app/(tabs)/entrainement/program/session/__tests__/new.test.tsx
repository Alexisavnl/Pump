import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import NewSessionScreen from '../new';

jest.mock('react-native-safe-area-context');
jest.mock('expo-blur', () => {
  const React = require('react');
  return {
    BlurView: ({ children, ...props }: { children?: unknown; style?: object }) =>
      React.createElement('BlurView', props, children),
  };
});
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { back: jest.fn(), push: jest.fn() },
    useLocalSearchParams: jest.fn(() => ({ day: 'LUN' })),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));
jest.mock('../../../../../../utils/storage/programs', () => ({
  saveDraft: jest.fn(),
  getDraft: jest.fn(() => null),
  clearDraft: jest.fn(),
  getTempExercises: jest.fn(() => null),
  clearTempExercises: jest.fn(),
}));
jest.mock('../../../../../../data/exerciseImages', () => ({
  default: {},
}));

const mockExercise: import('../../../../../../types/program').ExerciseConfig = {
  exerciseId: 'barbell-bench-press',
  exerciseName: 'Barbell Bench Press',
  imageUrl: 'barbell-bench-press.png',
  notes: '',
  restTime: null,
  repType: 'fixed',
  sets: [{ serieNumber: 1, kg: 0, reps: 0 }],
};

describe('NewSessionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { getDraft, getTempExercises } = jest.requireMock(
      '../../../../../../utils/storage/programs'
    ) as { getDraft: jest.Mock; getTempExercises: jest.Mock };
    getDraft.mockReturnValue(null);
    getTempExercises.mockReturnValue(null);
    const { useLocalSearchParams } = jest.requireMock('expo-router') as {
      useLocalSearchParams: jest.Mock;
    };
    useLocalSearchParams.mockReturnValue({ day: 'LUN' });
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

  it('renders session title input with empty default value', () => {
    render(<NewSessionScreen />);
    const titleInput = screen.getByTestId('session-title-input');
    expect(titleInput).toBeTruthy();
    expect(titleInput.props.value).toBe('');
  });

  it('renders description input with empty default value', () => {
    render(<NewSessionScreen />);
    const descInput = screen.getByTestId('session-description-input');
    expect(descInput).toBeTruthy();
    expect(descInput.props.value).toBe('');
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

  it('shows empty state text when no exercises', () => {
    render(<NewSessionScreen />);
    expect(screen.getByText('Aucun exercice ajouté')).toBeTruthy();
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

  it('saves session to draft when validate button is pressed', () => {
    const { saveDraft } = jest.requireMock('../../../../../../utils/storage/programs') as {
      saveDraft: jest.Mock;
    };
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId('validate-button'));
    expect(saveDraft).toHaveBeenCalledTimes(1);
    const savedDraft = saveDraft.mock.calls[0][0] as { days: Record<string, unknown[]> };
    expect(savedDraft.days).toBeDefined();
    expect(savedDraft.days.LUN).toHaveLength(1);
  });

  it('saves session with correct title to draft', () => {
    const { saveDraft } = jest.requireMock('../../../../../../utils/storage/programs') as {
      saveDraft: jest.Mock;
    };
    render(<NewSessionScreen />);
    const titleInput = screen.getByTestId('session-title-input');
    fireEvent.changeText(titleInput, 'Push Day');
    fireEvent.press(screen.getByTestId('validate-button'));
    const savedDraft = saveDraft.mock.calls[0][0] as {
      days: { LUN: { title: string }[] };
    };
    expect(savedDraft.days.LUN[0].title).toBe('Push Day');
  });

  it('replaces existing session in draft (1 session max)', () => {
    const { getDraft, saveDraft } = jest.requireMock(
      '../../../../../../utils/storage/programs'
    ) as {
      getDraft: jest.Mock;
      saveDraft: jest.Mock;
    };
    getDraft.mockReturnValue({
      days: {
        LUN: [{ id: 'existing-1', title: 'Existing', description: '', exercises: [] }],
        MAR: [],
        MER: [],
        JEU: [],
        VEN: [],
        SAM: [],
        DIM: [],
      },
    });
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId('validate-button'));
    const savedDraft = saveDraft.mock.calls[0][0] as {
      days: { LUN: { title: string }[] };
    };
    expect(savedDraft.days.LUN).toHaveLength(1);
  });

  it('navigates to exercises screen when "+ Ajouter des exercices" is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId('add-exercises-button'));
    expect(router.push).toHaveBeenCalledWith('/entrainement/program/session/exercises');
  });

  it('loads exercises from temp storage on focus', () => {
    const { getTempExercises, clearTempExercises } = jest.requireMock(
      '../../../../../../utils/storage/programs'
    ) as { getTempExercises: jest.Mock; clearTempExercises: jest.Mock };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    expect(screen.getByTestId(`exercise-card-${mockExercise.exerciseId}`)).toBeTruthy();
    expect(clearTempExercises).toHaveBeenCalledTimes(1);
  });

  it('shows exercise name when exercises are loaded', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    expect(screen.getByText('Barbell Bench Press')).toBeTruthy();
  });

  it('hides empty state when exercises are loaded', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    expect(screen.queryByText('Aucun exercice ajouté')).toBeNull();
  });

  it('exercise card is collapsed by default', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    expect(screen.queryByTestId(`exercise-expanded-${mockExercise.exerciseId}`)).toBeNull();
  });

  it('exercise card expands when pressed', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    expect(screen.getByTestId(`exercise-expanded-${mockExercise.exerciseId}`)).toBeTruthy();
  });

  it('only one exercise card can be expanded at a time', () => {
    const secondExercise: import('../../../../../../types/program').ExerciseConfig = {
      ...mockExercise,
      exerciseId: 'barbell-curl',
      exerciseName: 'Barbell Curl',
    };
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise, secondExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    expect(screen.getByTestId(`exercise-expanded-${mockExercise.exerciseId}`)).toBeTruthy();
    expect(screen.queryByTestId(`exercise-expanded-${secondExercise.exerciseId}`)).toBeNull();
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${secondExercise.exerciseId}`));
    expect(screen.queryByTestId(`exercise-expanded-${mockExercise.exerciseId}`)).toBeNull();
    expect(screen.getByTestId(`exercise-expanded-${secondExercise.exerciseId}`)).toBeTruthy();
  });

  it('exercise card collapses when pressed again', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    expect(screen.getByTestId(`exercise-expanded-${mockExercise.exerciseId}`)).toBeTruthy();
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    expect(screen.queryByTestId(`exercise-expanded-${mockExercise.exerciseId}`)).toBeNull();
  });

  it('can add a serie to an exercise', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    fireEvent.press(screen.getByTestId(`add-serie-${mockExercise.exerciseId}`));
    // Should now have 2 set rows
    expect(screen.getByTestId(`set-row-${mockExercise.exerciseId}-1`)).toBeTruthy();
  });

  it('saves exercises to draft when validating', () => {
    const { getTempExercises, saveDraft } = jest.requireMock(
      '../../../../../../utils/storage/programs'
    ) as { getTempExercises: jest.Mock; saveDraft: jest.Mock };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId('validate-button'));
    const savedDraft = saveDraft.mock.calls[0][0] as {
      days: { LUN: { exercises: (typeof mockExercise)[] }[] };
    };
    expect(savedDraft.days.LUN[0].exercises).toHaveLength(1);
    expect(savedDraft.days.LUN[0].exercises[0].exerciseId).toBe(mockExercise.exerciseId);
  });

  it('loads existing session data when sessionId is provided', () => {
    const { getDraft } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getDraft: jest.Mock;
    };
    const { useLocalSearchParams } = jest.requireMock('expo-router') as {
      useLocalSearchParams: jest.Mock;
    };
    useLocalSearchParams.mockReturnValue({ day: 'LUN', sessionId: 'session-1' });
    getDraft.mockReturnValue({
      days: {
        LUN: [
          { id: 'session-1', title: 'Upper A', description: 'Desc', exercises: [mockExercise] },
        ],
        MAR: [],
        MER: [],
        JEU: [],
        VEN: [],
        SAM: [],
        DIM: [],
      },
    });
    render(<NewSessionScreen />);
    expect(screen.getByTestId('session-title-input').props.value).toBe('Upper A');
    expect(screen.getByTestId(`exercise-card-${mockExercise.exerciseId}`)).toBeTruthy();
  });

  it('pressing repos toggle opens rest time modal', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    fireEvent.press(screen.getByTestId(`rest-toggle-${mockExercise.exerciseId}`));
    expect(screen.getByText('Minuteur de Repos')).toBeTruthy();
  });

  it('can select a rest time from modal', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    fireEvent.press(screen.getByTestId(`rest-toggle-${mockExercise.exerciseId}`));
    fireEvent.press(screen.getByTestId('rest-option-90'));
    // 90s selected — the rest text should update to show 1min 30s
    expect(screen.getByText('Repos: 1min 30s')).toBeTruthy();
  });

  it('pressing rest modal done closes the modal', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    fireEvent.press(screen.getByTestId(`rest-toggle-${mockExercise.exerciseId}`));
    expect(screen.getByText('Minuteur de Repos')).toBeTruthy();
    fireEvent.press(screen.getByTestId('rest-modal-done'));
    expect(screen.queryByText('Minuteur de Repos')).toBeNull();
  });

  it('pressing reps header opens rep type modal', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    fireEvent.press(screen.getByTestId(`reps-header-${mockExercise.exerciseId}`));
    expect(screen.getByText('Options de répétitions')).toBeTruthy();
  });

  it('can select "Plage de répétitions" from reps modal', () => {
    const { getTempExercises } = jest.requireMock('../../../../../../utils/storage/programs') as {
      getTempExercises: jest.Mock;
    };
    getTempExercises.mockReturnValue([mockExercise]);
    render(<NewSessionScreen />);
    fireEvent.press(screen.getByTestId(`exercise-card-toggle-${mockExercise.exerciseId}`));
    fireEvent.press(screen.getByTestId(`reps-header-${mockExercise.exerciseId}`));
    fireEvent.press(screen.getByTestId('reps-option-range'));
    // Modal should close and reps header label should update
    expect(screen.queryByText('Options de répétitions')).toBeNull();
    expect(screen.getByText('Plage')).toBeTruthy();
  });
});

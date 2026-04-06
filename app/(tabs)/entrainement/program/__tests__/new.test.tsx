import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import NewProgramScreen from '../new';

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
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialCommunityIcons: () => null,
}));
jest.mock('../../../../../utils/storage/programs', () => ({
  saveDraft: jest.fn(),
  getDraft: jest.fn(() => null),
  clearDraft: jest.fn(),
  saveProgram: jest.fn(),
  setActiveProgram: jest.fn(),
}));

describe('NewProgramScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    const { getDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      getDraft: jest.Mock;
    };
    getDraft.mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it('renders title input with empty value', () => {
    render(<NewProgramScreen />);
    const input = screen.getByTestId('program-title-input');
    expect(input.props.value).toBe('');
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

  it('renders "Terminé" when Modifier is pressed', () => {
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('modifier-button'));
    expect(screen.getByText('Terminé')).toBeTruthy();
  });

  it('updates title when user types', () => {
    render(<NewProgramScreen />);
    const input = screen.getByTestId('program-title-input');
    fireEvent.changeText(input, 'My New Program');
    expect(input.props.value).toBe('My New Program');
  });

  it('loads draft on mount if exists', () => {
    const { getDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      getDraft: jest.Mock;
    };
    getDraft.mockReturnValue({ title: 'Saved Draft', description: 'Draft description' });
    render(<NewProgramScreen />);
    expect(screen.getByTestId('program-title-input').props.value).toBe('Saved Draft');
    expect(screen.getByTestId('program-description-input').props.value).toBe('Draft description');
  });

  it('auto-saves draft after 2 seconds when title changes', () => {
    const { saveDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      saveDraft: jest.Mock;
    };
    render(<NewProgramScreen />);
    const input = screen.getByTestId('program-title-input');
    fireEvent.changeText(input, 'New Title');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(saveDraft).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Title' }));
  });

  it('does not auto-save before 2 seconds', () => {
    const { saveDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      saveDraft: jest.Mock;
    };
    render(<NewProgramScreen />);
    const input = screen.getByTestId('program-title-input');
    fireEvent.changeText(input, 'New Title');

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(saveDraft).not.toHaveBeenCalled();
  });

  it('shows save confirmation modal when save button is pressed', () => {
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('save-program-button'));
    expect(screen.getByText('UTILISER CE PROGRAMME ?')).toBeTruthy();
    expect(screen.getByTestId('save-modal-later')).toBeTruthy();
    expect(screen.getByTestId('save-modal-activate')).toBeTruthy();
  });

  it('saves program and clears draft when "Plus tard" is pressed', () => {
    const { saveProgram, clearDraft } = jest.requireMock(
      '../../../../../utils/storage/programs'
    ) as { saveProgram: jest.Mock; clearDraft: jest.Mock };
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('save-program-button'));
    fireEvent.press(screen.getByTestId('save-modal-later'));
    expect(saveProgram).toHaveBeenCalledTimes(1);
    expect(clearDraft).toHaveBeenCalledTimes(1);
  });

  it('saves program, activates it and clears draft when "Oui, activer" is pressed', () => {
    const { saveProgram, clearDraft, setActiveProgram } = jest.requireMock(
      '../../../../../utils/storage/programs'
    ) as { saveProgram: jest.Mock; clearDraft: jest.Mock; setActiveProgram: jest.Mock };
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('save-program-button'));
    fireEvent.press(screen.getByTestId('save-modal-activate'));
    expect(saveProgram).toHaveBeenCalledTimes(1);
    expect(setActiveProgram).toHaveBeenCalledTimes(1);
    expect(clearDraft).toHaveBeenCalledTimes(1);
  });

  it('navigates back after confirming save', () => {
    const { router } = jest.requireMock('expo-router') as { router: { back: jest.Mock } };
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('save-program-button'));
    fireEvent.press(screen.getByTestId('save-modal-later'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('navigates to session/new with day param when "Ajouter une séance" is pressed', () => {
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('add-session-LUN'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/entrainement/program/session/new',
      params: { day: 'LUN' },
    });
  });

  it('displays session card when draft has sessions for a day', () => {
    const { getDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      getDraft: jest.Mock;
    };
    getDraft.mockReturnValue({
      days: {
        LUN: [{ id: 'session-1', title: 'Upper A', description: '', exercises: [] }],
        MAR: [],
        MER: [],
        JEU: [],
        VEN: [],
        SAM: [],
        DIM: [],
      },
    });
    render(<NewProgramScreen />);
    expect(screen.getByTestId('session-card-session-1')).toBeTruthy();
    expect(screen.getByText('Upper A')).toBeTruthy();
    expect(screen.getByText('0 exercices')).toBeTruthy();
  });

  it('navigates to session edit page when session card is pressed', () => {
    const { getDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      getDraft: jest.Mock;
    };
    getDraft.mockReturnValue({
      days: {
        LUN: [{ id: 'session-1', title: 'Upper A', description: '', exercises: [] }],
        MAR: [],
        MER: [],
        JEU: [],
        VEN: [],
        SAM: [],
        DIM: [],
      },
    });
    const { router } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('session-card-session-1'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/entrainement/program/session/new',
      params: { day: 'LUN', sessionId: 'session-1' },
    });
  });

  it('shows delete badge in edit mode', () => {
    const { getDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      getDraft: jest.Mock;
    };
    getDraft.mockReturnValue({
      days: {
        LUN: [{ id: 'session-1', title: 'Upper A', description: '', exercises: [] }],
        MAR: [],
        MER: [],
        JEU: [],
        VEN: [],
        SAM: [],
        DIM: [],
      },
    });
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('modifier-button'));
    expect(screen.getByTestId('delete-session-LUN')).toBeTruthy();
  });

  it('removes session when delete is pressed', () => {
    const { getDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      getDraft: jest.Mock;
    };
    getDraft.mockReturnValue({
      days: {
        LUN: [{ id: 'session-1', title: 'Upper A', description: '', exercises: [] }],
        MAR: [],
        MER: [],
        JEU: [],
        VEN: [],
        SAM: [],
        DIM: [],
      },
    });
    render(<NewProgramScreen />);
    fireEvent.press(screen.getByTestId('modifier-button'));
    fireEvent.press(screen.getByTestId('delete-session-LUN'));
    expect(screen.queryByTestId('session-card-session-1')).toBeNull();
  });

  it('resets auto-save timer on rapid typing (debounce)', () => {
    const { saveDraft } = jest.requireMock('../../../../../utils/storage/programs') as {
      saveDraft: jest.Mock;
    };
    render(<NewProgramScreen />);
    const input = screen.getByTestId('program-title-input');

    fireEvent.changeText(input, 'A');
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    fireEvent.changeText(input, 'AB');
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    fireEvent.changeText(input, 'ABC');

    // Only 1 second has passed since last change, should not save yet
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(saveDraft).not.toHaveBeenCalled();

    // Now 2 seconds after last change
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(saveDraft).toHaveBeenCalledTimes(1);
  });
});

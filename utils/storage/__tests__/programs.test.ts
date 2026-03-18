import {
  saveProgram,
  getProgram,
  getAllPrograms,
  deleteProgram,
  saveDraft,
  getDraft,
  clearDraft,
  setActiveProgram,
  getActiveProgram,
} from '../programs';
import { clearAllMMKVInstances } from 'react-native-mmkv';
import type { Program } from '../../../types/program';

jest.mock('react-native-mmkv');

const makeProgram = (id: string, title = 'Test Program'): Program => ({
  id,
  title,
  description: 'A test program',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  days: {
    LUN: [],
    MAR: [],
    MER: [],
    JEU: [],
    VEN: [],
    SAM: [],
    DIM: [],
  },
});

describe('Programs storage', () => {
  beforeEach(() => {
    clearAllMMKVInstances();
  });

  describe('saveProgram / getProgram', () => {
    it('saves and retrieves a program by id', () => {
      const program = makeProgram('p1', 'Push Pull Legs');
      saveProgram(program);
      const retrieved = getProgram('p1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe('Push Pull Legs');
    });

    it('returns null for unknown id', () => {
      expect(getProgram('unknown')).toBeNull();
    });
  });

  describe('getAllPrograms', () => {
    it('returns empty array when no programs saved', () => {
      expect(getAllPrograms()).toEqual([]);
    });

    it('returns all saved programs', () => {
      saveProgram(makeProgram('p1'));
      saveProgram(makeProgram('p2'));
      const programs = getAllPrograms();
      expect(programs).toHaveLength(2);
    });

    it('does not duplicate a program saved twice', () => {
      const program = makeProgram('p1');
      saveProgram(program);
      saveProgram({ ...program, title: 'Updated' });
      expect(getAllPrograms()).toHaveLength(1);
    });
  });

  describe('deleteProgram', () => {
    it('removes a program from storage', () => {
      saveProgram(makeProgram('p1'));
      deleteProgram('p1');
      expect(getProgram('p1')).toBeNull();
      expect(getAllPrograms()).toHaveLength(0);
    });

    it('clears active program when the active one is deleted', () => {
      saveProgram(makeProgram('p1'));
      setActiveProgram('p1');
      deleteProgram('p1');
      expect(getActiveProgram()).toBeNull();
    });
  });

  describe('draft functions', () => {
    it('saves and retrieves a draft', () => {
      saveDraft({ title: 'My Draft' });
      const draft = getDraft();
      expect(draft).not.toBeNull();
      expect(draft?.title).toBe('My Draft');
    });

    it('returns null when no draft exists', () => {
      expect(getDraft()).toBeNull();
    });

    it('clearDraft removes the draft', () => {
      saveDraft({ title: 'Draft' });
      clearDraft();
      expect(getDraft()).toBeNull();
    });
  });

  describe('active program', () => {
    it('sets and gets the active program id', () => {
      setActiveProgram('p42');
      expect(getActiveProgram()).toBe('p42');
    });

    it('returns null when no active program is set', () => {
      expect(getActiveProgram()).toBeNull();
    });
  });
});

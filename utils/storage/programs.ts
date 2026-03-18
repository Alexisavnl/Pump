import { createMMKV } from 'react-native-mmkv';
import type { Program } from '../../types/program';

const storage = createMMKV({ id: 'programs-storage' });

const KEYS = {
  PROGRAMS_INDEX: 'programs_index',
  PROGRAM_PREFIX: 'program_',
  DRAFT: 'program_draft',
  ACTIVE_PROGRAM: 'active_program_id',
} as const;

// ─── Programs ────────────────────────────────────────────────────────────────

export function saveProgram(program: Program): void {
  storage.set(KEYS.PROGRAM_PREFIX + program.id, JSON.stringify(program));

  const index = getProgramsIndex();
  if (!index.includes(program.id)) {
    index.push(program.id);
    storage.set(KEYS.PROGRAMS_INDEX, JSON.stringify(index));
  }
}

export function getProgram(id: string): Program | null {
  const raw = storage.getString(KEYS.PROGRAM_PREFIX + id);
  if (!raw) return null;
  return JSON.parse(raw) as Program;
}

export function getAllPrograms(): Program[] {
  const index = getProgramsIndex();
  return index.map((id) => getProgram(id)).filter((p): p is Program => p !== null);
}

export function deleteProgram(id: string): void {
  storage.remove(KEYS.PROGRAM_PREFIX + id);

  const index = getProgramsIndex().filter((pid) => pid !== id);
  storage.set(KEYS.PROGRAMS_INDEX, JSON.stringify(index));

  if (getActiveProgram() === id) {
    storage.remove(KEYS.ACTIVE_PROGRAM);
  }
}

// ─── Draft ───────────────────────────────────────────────────────────────────

export function saveDraft(program: Partial<Program>): void {
  storage.set(KEYS.DRAFT, JSON.stringify(program));
}

export function getDraft(): Partial<Program> | null {
  const raw = storage.getString(KEYS.DRAFT);
  if (!raw) return null;
  return JSON.parse(raw) as Partial<Program>;
}

export function clearDraft(): void {
  storage.remove(KEYS.DRAFT);
}

// ─── Active Program ───────────────────────────────────────────────────────────

export function setActiveProgram(id: string): void {
  storage.set(KEYS.ACTIVE_PROGRAM, id);
}

export function getActiveProgram(): string | null {
  return storage.getString(KEYS.ACTIVE_PROGRAM) ?? null;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function getProgramsIndex(): string[] {
  const raw = storage.getString(KEYS.PROGRAMS_INDEX);
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

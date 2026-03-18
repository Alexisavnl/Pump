# PRD: Training Program Builder

## Introduction

Build a comprehensive workout program creation system that allows users to design, organize, and manage weekly training programs. Users can create programs with multiple sessions per week, add exercises from a library, configure sets and reps, and organize their training schedule through an intuitive drag-and-drop interface.

This feature transforms the training tab from a simple placeholder into a fully functional program builder, enabling users to plan their entire weekly workout routine.

## Goals

- Enable users to create custom weekly training programs with title and description
- Provide a 7-day weekly view for organizing training sessions
- Allow users to add multiple exercises per session with detailed configuration
- Support both fixed reps and rep ranges for exercise sets
- Implement drag-and-drop for easy reorganization of sessions and exercises
- Store programs locally with auto-save draft functionality
- Support multiple programs with one "active" program at a time
- Enable full CRUD operations (create, read, update, delete) on all entities

## User Stories

### US-001: Create exercises data structure and JSON file
**Description:** As a developer, I need a static exercises database with images so the app can display available exercises.

**Acceptance Criteria:**
- [ ] Create `/data/exercises.json` with exercise list
- [ ] Each exercise has: id, name, muscleGroup, imagePath
- [ ] Map exercises to existing images in `/images/` directory
- [ ] Include at least 20 exercises covering major muscle groups
- [ ] Export TypeScript types for Exercise interface
- [ ] Tests pass (validate JSON structure)
- [ ] Typecheck passes

---

### US-002: Create MMKV storage utilities for programs
**Description:** As a developer, I need storage utilities to persist training programs locally.

**Acceptance Criteria:**
- [ ] Create `/utils/storage/programs.ts` with MMKV functions
- [ ] Implement: saveProgram, getProgram, getAllPrograms, deleteProgram
- [ ] Implement: saveDraft, getDraft, clearDraft
- [ ] Implement: setActiveProgram, getActiveProgram
- [ ] TypeScript interfaces for Program, Session, ExerciseConfig, Set
- [ ] Tests pass (test all storage functions)
- [ ] Typecheck passes

---

### US-003: Build training home page structure
**Description:** As a user, I want to see my training programs and create new ones.

**Acceptance Criteria:**
- [ ] Update `/app/(tabs)/entrainement.tsx` with home layout
- [ ] Display "Nouveau Programme" button at top (blue border, + icon)
- [ ] Section "MES PROGRAMMES" below button
- [ ] Empty state: "Aucun programme créé" when no programs exist
- [ ] List saved programs when they exist (just titles for now)
- [ ] Tests pass (render tests for home page)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-004: Implement "Nouveau Programme" navigation
**Description:** As a user, I want to click "Nouveau Programme" to start creating a new program.

**Acceptance Criteria:**
- [ ] Create `/app/program/new.tsx` route
- [ ] "Nouveau Programme" button navigates to new program page
- [ ] New page shows header with back button
- [ ] Navigation works smoothly with Expo Router stack
- [ ] Tests pass (navigation test)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-005: Create "New Program" page with 7 days layout
**Description:** As a user, I want to enter a program title/description and see 7 day blocks for planning.

**Acceptance Criteria:**
- [ ] Editable program title input at top (default: "Push Pull Legs")
- [ ] Editable description below title (placeholder: "Organise ta semaine d'entraînement")
- [ ] 7 day blocks: LUN, MAR, MER, JEU, VEN, SAM, DIM
- [ ] Each day shows "+ Ajouter une séance" button initially
- [ ] "Enregistrer le programme" button at bottom (blue, centered)
- [ ] "Modifier" button in top right corner
- [ ] Tests pass (component tests)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-006: Implement auto-save draft functionality
**Description:** As a user, I want my work to be auto-saved so I don't lose progress if I navigate away.

**Acceptance Criteria:**
- [ ] Auto-save program data to draft every 2 seconds when editing
- [ ] Load draft on page mount if exists
- [ ] Clear draft when program is saved successfully
- [ ] Visual indicator "Brouillon sauvegardé" (subtle, temporary)
- [ ] Tests pass (test auto-save timing and draft persistence)
- [ ] Typecheck passes

---

### US-007: Create "Add Session" functionality
**Description:** As a user, I want to add a training session to a specific day.

**Acceptance Criteria:**
- [ ] Clicking "+ Ajouter une séance" opens session creation screen
- [ ] Create `/app/program/session/new.tsx` route
- [ ] Pass day parameter (LUN, MAR, etc.) via route params
- [ ] Session page has header "Modifier la séance"
- [ ] Back button returns to program page
- [ ] Tests pass (navigation and params)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-008: Build "Edit Session" page structure
**Description:** As a user, I want to configure a session with title, description, and exercises.

**Acceptance Criteria:**
- [ ] Editable session title at top (default: "Upper A")
- [ ] Editable description below title (default: "Description")
- [ ] Empty exercise list area
- [ ] "+ Ajouter des exercices" button (blue border, bottom)
- [ ] Checkmark button (top right) to validate and return
- [ ] Tests pass (component rendering)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-009: Display session in program day block
**Description:** As a user, I want to see my created sessions displayed in the day blocks.

**Acceptance Criteria:**
- [ ] When session is created, replace "+ Ajouter une séance" with session card
- [ ] Session card shows: title (e.g., "Upper A") and "X exos"
- [ ] Clicking session card navigates to edit session page
- [ ] Multiple sessions per day stack vertically
- [ ] Tests pass (test session display)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-010: Create "Add Exercises" page with search
**Description:** As a user, I want to search and browse available exercises to add to my session.

**Acceptance Criteria:**
- [ ] Create `/app/program/session/exercises.tsx` route
- [ ] "+ Ajouter des exercices" button navigates to this page
- [ ] Header: "Ajouter des exercices" with back button
- [ ] Search bar at top: "Chercher un exercice..."
- [ ] List all exercises from exercises.json
- [ ] Each exercise shows: image, name, muscle group
- [ ] Search filters by exercise name (case insensitive)
- [ ] Tests pass (search functionality)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-011: Implement multi-select exercises
**Description:** As a user, I want to select multiple exercises at once to add them to my session.

**Acceptance Criteria:**
- [ ] Clicking an exercise toggles selection (blue left border indicator)
- [ ] Multiple exercises can be selected simultaneously
- [ ] Selection state persists while scrolling
- [ ] Unselecting an exercise removes the indicator
- [ ] Tests pass (multi-select state management)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-012: Add selected exercises to session
**Description:** As a user, I want to add selected exercises to my session with one button click.

**Acceptance Criteria:**
- [ ] "Ajouter X exercices" button at bottom (blue, fixed position)
- [ ] Button shows count of selected exercises (e.g., "Ajouter 2 exercices")
- [ ] Button disabled when no exercises selected
- [ ] Clicking button adds exercises to session and returns to session page
- [ ] Added exercises appear in session exercise list
- [ ] Tests pass (add exercises flow)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-013: Display exercises in session list
**Description:** As a user, I want to see all exercises I've added to a session.

**Acceptance Criteria:**
- [ ] Exercises displayed as cards with image and name
- [ ] Show collapsed state by default: image + name + "3 séries · 8-12 reps · 90s" summary
- [ ] Three-dot menu icon on right side of each exercise
- [ ] Exercises listed in order they were added
- [ ] Empty state if no exercises: shows "+ Ajouter des exercices" only
- [ ] Tests pass (exercise list rendering)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-014: Implement expandable exercise configuration
**Description:** As a user, I want to click on an exercise to expand it and configure sets.

**Acceptance Criteria:**
- [ ] Clicking exercise card toggles expand/collapse
- [ ] Expanded view shows: Notes input, Rest timer, Set table
- [ ] Collapsed view shows summary line
- [ ] Only one exercise expanded at a time
- [ ] Smooth expand/collapse animation
- [ ] Tests pass (expand/collapse behavior)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-015: Create set configuration table
**Description:** As a user, I want to configure sets with series number, weight, and reps.

**Acceptance Criteria:**
- [ ] Table with three columns: SÉRIE, KG, REPS
- [ ] First row auto-created: 1, 10, 8
- [ ] Each cell is editable (number input)
- [ ] SÉRIE column auto-increments (1, 2, 3...)
- [ ] KG column accepts decimals (10, 10.5, 12.5)
- [ ] REPS column shows number by default
- [ ] Tests pass (set table functionality)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-016: Implement rep range toggle
**Description:** As a user, I want to toggle between fixed reps and rep ranges for my sets.

**Acceptance Criteria:**
- [ ] Clicking REPS cell shows picker: "Répétitions" or "Plage de répétitions"
- [ ] Default: "Répétitions" (single number like "8")
- [ ] Selecting "Plage de répétitions" shows "8-12" format with two inputs
- [ ] Toggle applies to entire exercise, not per set
- [ ] Selection persists when collapsing/expanding
- [ ] Tests pass (rep range toggle)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-017: Add rest time and notes configuration
**Description:** As a user, I want to set rest time between sets and add notes for the exercise.

**Acceptance Criteria:**
- [ ] "Repos : " with timer input (default: "désactivé")
- [ ] Clicking rest time shows time picker (seconds)
- [ ] "Notes..." text input field (multiline)
- [ ] Rest time shown in blue with icon
- [ ] Both fields optional
- [ ] Tests pass (rest and notes inputs)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-018: Implement "Add Set" functionality
**Description:** As a user, I want to add additional sets to an exercise.

**Acceptance Criteria:**
- [ ] "+ Ajouter une série" button at bottom of set table
- [ ] Clicking adds new row with auto-incremented SÉRIE number
- [ ] New row copies KG and REPS from last row
- [ ] Can add unlimited sets
- [ ] Tests pass (add set functionality)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-019: Implement drag & drop for exercises
**Description:** As a user, I want to reorder exercises within a session by dragging them.

**Acceptance Criteria:**
- [ ] Long-press on exercise card enables drag mode
- [ ] Visual feedback during drag (lift effect, opacity)
- [ ] Drop zones highlighted between exercises
- [ ] Releasing drops exercise in new position
- [ ] Order persists after reordering
- [ ] Tests pass (drag & drop exercises)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-020: Implement drag & drop for sessions between days
**Description:** As a user, I want to move sessions between different days of the week.

**Acceptance Criteria:**
- [ ] Long-press on session card enables drag mode
- [ ] Can drag session from one day to another (LUN → MAR)
- [ ] Visual feedback during drag
- [ ] Drop zones highlighted on valid day targets
- [ ] Session moves to new day on drop
- [ ] Tests pass (drag & drop sessions)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-021: Add delete functionality for sets
**Description:** As a user, I want to delete individual sets from an exercise.

**Acceptance Criteria:**
- [ ] Swipe left on set row reveals delete button
- [ ] Clicking delete removes the set
- [ ] SÉRIE numbers auto-renumber after deletion
- [ ] Cannot delete if only one set remains
- [ ] Confirmation dialog: "Supprimer cette série ?"
- [ ] Tests pass (delete set)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-022: Add delete functionality for exercises
**Description:** As a user, I want to remove exercises from a session.

**Acceptance Criteria:**
- [ ] Three-dot menu on exercise card shows "Supprimer" option
- [ ] Clicking shows confirmation: "Supprimer cet exercice ?"
- [ ] Confirming removes exercise from session
- [ ] Can delete all exercises (session becomes empty)
- [ ] Tests pass (delete exercise)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-023: Add delete functionality for sessions
**Description:** As a user, I want to remove sessions from a day.

**Acceptance Criteria:**
- [ ] Long-press on session card shows context menu
- [ ] Menu includes "Supprimer la séance" option
- [ ] Confirmation dialog: "Supprimer cette séance ?"
- [ ] Confirming removes session, shows "+ Ajouter une séance" again
- [ ] Tests pass (delete session)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-024: Implement "Enregistrer le programme" with active status popup
**Description:** As a user, I want to save my program and optionally set it as active.

**Acceptance Criteria:**
- [ ] "Enregistrer le programme" button saves all data to MMKV
- [ ] Popup appears: "Rendre ce programme actif ?" with Oui/Non buttons
- [ ] "Oui" sets program as active and saves
- [ ] "Non" saves without setting as active
- [ ] Both options clear draft and navigate to home
- [ ] Success toast: "Programme enregistré"
- [ ] Tests pass (save flow with popup)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-025: Display saved programs in home list
**Description:** As a user, I want to see all my saved programs on the training home page.

**Acceptance Criteria:**
- [ ] Load all programs from MMKV on home page mount
- [ ] Display program cards in "MES PROGRAMMES" section
- [ ] Each card shows: title, number of sessions ("X séances/semaine")
- [ ] Active program has special indicator (star icon or "ACTIF" badge)
- [ ] Programs sorted by: active first, then by creation date
- [ ] Tests pass (program list display)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-026: Implement program editing
**Description:** As a user, I want to edit existing programs.

**Acceptance Criteria:**
- [ ] Clicking program card in home navigates to edit mode
- [ ] Edit mode loads program data into new program form
- [ ] All fields editable: title, description, sessions, exercises
- [ ] "Modifier" button in header shows we're editing
- [ ] Saving updates existing program instead of creating new
- [ ] Tests pass (edit existing program)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

### US-027: Add delete functionality for programs
**Description:** As a user, I want to delete programs I no longer need.

**Acceptance Criteria:**
- [ ] Long-press on program card shows context menu
- [ ] Menu includes "Supprimer le programme" option
- [ ] Confirmation dialog: "Supprimer ce programme ?"
- [ ] If deleting active program, show warning: "Ce programme est actif"
- [ ] Confirming removes program from MMKV
- [ ] List updates immediately
- [ ] Tests pass (delete program)
- [ ] Uses NativeWind for all styling (no StyleSheet, no inline styles)
- [ ] Typecheck passes

---

## Functional Requirements

### Data Structure
- FR-1: Programs stored in MMKV with unique IDs (UUID)
- FR-2: Each program has: id, title, description, sessions[], isActive, createdAt, updatedAt
- FR-3: Each session has: id, dayOfWeek, title, description, exercises[]
- FR-4: Each exercise config has: exerciseId, sets[], restTime, notes, repRangeMode
- FR-5: Each set has: seriesNumber, kg, reps (or repsMin/repsMax for range)

### Navigation
- FR-6: Stack navigation: Home → New Program → Edit Session → Add Exercises
- FR-7: Back button returns to previous screen with data preserved
- FR-8: Checkmark button in session saves and returns to program

### Storage & Persistence
- FR-9: Auto-save draft every 2 seconds while editing
- FR-10: Draft cleared on successful program save
- FR-11: Only one draft exists at a time (new draft overwrites old)
- FR-12: Programs persist across app restarts

### Exercise Library
- FR-13: Static JSON file with at least 20 exercises
- FR-14: Exercise images stored in `/images/` directory
- FR-15: Search filters exercises by name (case insensitive)
- FR-16: Each exercise tagged with muscle group

### Program Management
- FR-17: Only one program can be "active" at a time
- FR-18: Setting new program as active deactivates previous
- FR-19: Programs can be saved without being active
- FR-20: Empty programs can be saved (no validation required)

### Drag & Drop
- FR-21: Exercises can be reordered within same session
- FR-22: Sessions can be moved between different days
- FR-23: Visual feedback during drag operations
- FR-24: Order changes persist immediately

### Set Configuration
- FR-25: Default rep mode is fixed reps (single number)
- FR-26: User can toggle to rep range mode (min-max)
- FR-27: Rep mode applies to all sets in an exercise
- FR-28: First set auto-created with default values: 1, 10, 8
- FR-29: New sets copy values from previous set

### Deletion
- FR-30: All entities deletable: programs, sessions, exercises, sets
- FR-31: Confirmation required for program/session/exercise deletion
- FR-32: No confirmation for single set deletion
- FR-33: Cannot delete last remaining set in exercise

## Non-Goals (Out of Scope)

- No workout tracking/logging (execution of programs)
- No exercise demonstration videos
- No preset program templates
- No exercise creation (library is static)
- No program sharing or export
- No workout history or progress tracking
- No cloud sync or backup
- No exercise substitution suggestions
- No rest timer countdown during workout
- No social features or community programs
- No nutrition or meal planning
- No calendar integration
- No reminders or notifications

## Design Considerations

### UI Components
- Reuse existing tab bar navigation
- Dark theme with blue accent color (#007AFF)
- Card-based layout for programs, sessions, exercises
- Consistent header pattern: title + back/action buttons
- Modal-style popups centered on screen

### Images
- Exercise images expected in `/images/` directory
- Format: PNG or JPG
- Recommended size: 100x100px for thumbnails
- Naming convention: kebab-case matching exercise name

### Drag & Drop Library
- Use `react-native-draggable-flatlist` or similar
- Smooth animations and haptic feedback
- Clear visual indicators for drop zones

### Forms & Inputs
- Inline editing for title/description (no separate edit mode)
- Number inputs for KG and REPS
- Time picker for rest intervals
- Auto-focus on new inputs for better UX

## Technical Considerations

### Storage
- Use MMKV for fast local storage
- Key structure: `programs:all` (array of program IDs), `program:{id}` (individual programs)
- Draft key: `draft:program`
- Active program key: `active:program:id`

### State Management
- Local state for form inputs
- Auto-save effect with debounce (2 seconds)
- Optimistic updates for better UX

### TypeScript Types
```typescript
interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  imagePath: string;
}

interface Set {
  seriesNumber: number;
  kg: number;
  reps?: number; // fixed reps
  repsMin?: number; // range mode
  repsMax?: number; // range mode
}

interface ExerciseConfig {
  id: string;
  exerciseId: string;
  sets: Set[];
  restTime?: number; // seconds
  notes?: string;
  repRangeMode: boolean;
}

interface Session {
  id: string;
  dayOfWeek: 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN' | 'SAM' | 'DIM';
  title: string;
  description?: string;
  exercises: ExerciseConfig[];
}

interface Program {
  id: string;
  title: string;
  description?: string;
  sessions: Session[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### Performance
- Lazy load exercise images
- Virtualized lists for exercises (FlatList)
- Debounced auto-save to reduce MMKV writes
- Memoized components to prevent unnecessary re-renders

## Success Metrics

- Users can create a complete weekly program in under 5 minutes
- Zero data loss from auto-save draft feature
- Drag & drop works smoothly with < 100ms response time
- All UI interactions feel native and responsive
- Programs load instantly from MMKV (< 50ms)

## Open Questions

1. **Active Program Display**: Should the active program be visually highlighted on home page? (Recommendation: Yes, with star icon or "ACTIF" badge)

2. **Program Templates**: Should we add quick-start templates in a future version? (PPL, Upper/Lower, Full Body)

3. **Exercise Variations**: Some exercises have variations (e.g., "Incline Curl" vs "Curl"). Should these be separate entries or grouped?

4. **Session Naming**: Should we provide suggested session names (Upper A, Lower B, etc.) or leave completely custom?

5. **Muscle Group Filtering**: Should the "Add Exercises" page allow filtering by muscle group, or is search sufficient?

6. **Multiple Programs Active**: Should users be able to have multiple programs active and switch between them, or strictly one at a time?

7. **Workout Days Display**: Should the home page show which days have sessions (e.g., "5 séances/semaine" with day indicators)?

8. **Exercise Order Persistence**: Should exercise order in the library match a specific order (alphabetical, by muscle group) or random?

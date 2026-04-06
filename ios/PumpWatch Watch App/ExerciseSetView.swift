import SwiftUI

struct ExerciseSetView: View {
  @EnvironmentObject var store: WorkoutStore
  @Environment(\.dismiss) private var dismiss

  let initialExercises: [WorkoutExercise]

  @State private var currentExerciseIndex: Int
  @State private var currentSetIndex: Int
  @State private var kg: Double
  @State private var reps: Int
  @State private var kgCrown: Double
  @State private var repsCrown: Double
  @State private var selectedColumn: Column = .kg
  @State private var showRestTimer = false

  enum Column { case kg, reps }

  init(exercises: [WorkoutExercise], startExerciseIndex: Int) {
    self.initialExercises = exercises
    let safeIndex = exercises.indices.contains(startExerciseIndex) ? startExerciseIndex : 0
    guard !exercises.isEmpty else {
      _currentExerciseIndex = State(initialValue: 0)
      _currentSetIndex = State(initialValue: 0)
      _kg = State(initialValue: 0); _reps = State(initialValue: 0)
      _kgCrown = State(initialValue: 0); _repsCrown = State(initialValue: 0)
      return
    }
    let ex = exercises[safeIndex]
    let firstIncomplete = ex.sets.firstIndex(where: { !$0.completed }) ?? 0
    _currentExerciseIndex = State(initialValue: safeIndex)
    _currentSetIndex = State(initialValue: firstIncomplete)
    let set = ex.sets[firstIncomplete]
    _kg = State(initialValue: set.kg)
    _reps = State(initialValue: set.reps)
    _kgCrown = State(initialValue: set.kg)
    _repsCrown = State(initialValue: Double(set.reps))
  }

  var liveExercises: [WorkoutExercise] { store.workout?.exercises ?? initialExercises }
  var currentExercise: WorkoutExercise { liveExercises[currentExerciseIndex] }
  var currentSet: WorkoutSet { currentExercise.sets[currentSetIndex] }
  var canGoPrev: Bool { currentSetIndex > 0 || currentExerciseIndex > 0 }
  var canGoNext: Bool {
    currentSetIndex < currentExercise.sets.count - 1 || currentExerciseIndex < liveExercises.count - 1
  }

  var previousPerformanceText: String? {
    let prev = currentExercise.sets.last(where: { $0.completed && $0.serieNumber < currentSet.serieNumber })
    guard let p = prev else { return nil }
    let kgStr = p.kg.truncatingRemainder(dividingBy: 1) == 0 ? "\(Int(p.kg))" : String(format: "%.1f", p.kg)
    return "\(kgStr)kg × \(p.reps)"
  }

  var kgText: String {
    kg.truncatingRemainder(dividingBy: 1) == 0 ? "\(Int(kg))" : String(format: "%.1f", kg)
  }

  var body: some View {
    ZStack {
      VStack(spacing: 2) {
        HStack(spacing: 6) {
          Spacer()
          if store.heartRate > 0 {
            HStack(spacing: 2) {
              Image(systemName: "heart.fill").foregroundColor(.red).font(.caption2)
              Text("\(Int(store.heartRate))").font(.caption2).foregroundColor(.secondary)
            }
          }
          if store.activeCalories > 0 {
            HStack(spacing: 2) {
              Image(systemName: "flame.fill").foregroundColor(.orange).font(.caption2)
              Text("\(Int(store.activeCalories))").font(.caption2).foregroundColor(.secondary)
            }
          }
        }
        .padding(.horizontal, 4)

        Text(currentExercise.exerciseName)
          .font(.system(size: 13, weight: .semibold))
          .lineLimit(1)
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.horizontal, 4)

        Text("Série \(currentSetIndex + 1) sur \(currentExercise.sets.count)")
          .font(.caption2)
          .foregroundColor(.secondary)
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.horizontal, 4)

        HStack(spacing: 6) {
          PickerColumn(title: "KG", value: kgText, isActive: selectedColumn == .kg)
            .onTapGesture { selectedColumn = .kg; kgCrown = kg }
          PickerColumn(title: "REPS", value: "\(reps)", isActive: selectedColumn == .reps)
            .onTapGesture { selectedColumn = .reps; repsCrown = Double(reps) }
        }
        .padding(.horizontal, 4)
        .focusable()
        .digitalCrownRotation(
          selectedColumn == .kg ? $kgCrown : $repsCrown,
          from: 0,
          through: selectedColumn == .kg ? 300.0 : 50.0,
          by: selectedColumn == .kg ? 2.5 : 1.0,
          sensitivity: .medium,
          isContinuous: false
        )
        .onChange(of: kgCrown) { val in
          kg = val
          store.updateSet(exerciseId: currentExercise.exerciseId, setIndex: currentSetIndex, field: "kg", value: val)
        }
        .onChange(of: repsCrown) { val in
          reps = max(1, Int(val))
          store.updateSet(exerciseId: currentExercise.exerciseId, setIndex: currentSetIndex, field: "reps", value: Double(reps))
        }

        if let prev = previousPerformanceText {
          Text("Précédent: \(prev)")
            .font(.caption2)
            .foregroundColor(.secondary)
            .lineLimit(1)
        }

        Spacer(minLength: 4)

        HStack(spacing: 6) {
          Button { navigatePrev() } label: { Image(systemName: "chevron.left") }
            .buttonStyle(.bordered)
            .disabled(!canGoPrev)

          Button { validateSet() } label: {
            Image(systemName: currentSet.completed ? "checkmark.circle.fill" : "checkmark")
              .foregroundColor(.white)
          }
          .buttonStyle(.borderedProminent)
          .tint(currentSet.completed ? .green : .blue)

          Button { navigateNext() } label: { Image(systemName: "chevron.right") }
            .buttonStyle(.bordered)
            .disabled(!canGoNext)
        }
      }
      .padding(.top, 2)

      if showRestTimer {
        RestTimerView(isPresented: $showRestTimer)
          .environmentObject(store)
          .background(Color.black.ignoresSafeArea())
          .transition(.opacity)
      }
    }
    .navigationBarBackButtonHidden(showRestTimer)
    .animation(.easeInOut(duration: 0.2), value: showRestTimer)
    .onChange(of: showRestTimer) { showing in
      guard !showing, currentExercise.sets[currentSetIndex].completed else { return }
      navigateNext()
    }
  }

  private func validateSet() {
    store.completeSet(exerciseId: currentExercise.exerciseId, setIndex: currentSetIndex)
    let updated = liveExercises[currentExerciseIndex]
    guard updated.sets[currentSetIndex].completed else { return }
    let restTime = updated.restTime ?? 0
    let isLastSet = !updated.sets.contains(where: { !$0.completed })
    let isLastExercise = currentExerciseIndex == liveExercises.count - 1
    if restTime > 0 && !(isLastSet && isLastExercise) { showRestTimer = true; return }
    navigateNext()
  }

  private func navigatePrev() {
    if currentSetIndex > 0 {
      jumpTo(exerciseIndex: currentExerciseIndex, setIndex: currentSetIndex - 1)
    } else if currentExerciseIndex > 0 {
      let prev = liveExercises[currentExerciseIndex - 1]
      jumpTo(exerciseIndex: currentExerciseIndex - 1, setIndex: prev.sets.count - 1)
    }
  }

  private func navigateNext() {
    let ex = liveExercises[currentExerciseIndex]
    if currentSetIndex < ex.sets.count - 1 {
      jumpTo(exerciseIndex: currentExerciseIndex, setIndex: currentSetIndex + 1)
    } else if let next = findNextIncomplete() {
      jumpTo(exerciseIndex: next.0, setIndex: next.1)
    } else if currentExerciseIndex < liveExercises.count - 1 {
      jumpTo(exerciseIndex: currentExerciseIndex + 1, setIndex: 0)
    } else {
      dismiss()
    }
  }

  private func findNextIncomplete() -> (Int, Int)? {
    for exIdx in currentExerciseIndex..<liveExercises.count {
      let ex = liveExercises[exIdx]
      let start = exIdx == currentExerciseIndex ? currentSetIndex + 1 : 0
      guard start < ex.sets.count else { continue }
      if let setIdx = ex.sets[start...].firstIndex(where: { !$0.completed }) {
        return (exIdx, setIdx)
      }
    }
    return nil
  }

  private func jumpTo(exerciseIndex: Int, setIndex: Int) {
    let ex = liveExercises[exerciseIndex]
    guard setIndex < ex.sets.count else { return }
    currentExerciseIndex = exerciseIndex
    currentSetIndex = setIndex
    let set = ex.sets[setIndex]
    kg = set.kg; reps = set.reps
    kgCrown = set.kg; repsCrown = Double(set.reps)
    selectedColumn = .kg
  }
}

struct PickerColumn: View {
  let title: String
  let value: String
  let isActive: Bool

  var body: some View {
    VStack(spacing: 2) {
      Text(title)
        .font(.caption2)
        .foregroundColor(isActive ? .blue : .secondary)
      ZStack {
        RoundedRectangle(cornerRadius: 8)
          .stroke(isActive ? Color.blue : Color.gray.opacity(0.4), lineWidth: 2)
          .background(RoundedRectangle(cornerRadius: 8).fill(Color(white: 0.12)))
        Text(value)
          .font(.system(size: 20, weight: .semibold, design: .rounded))
          .foregroundColor(.white)
      }
      .frame(height: 40)
    }
    .frame(maxWidth: .infinity)
  }
}

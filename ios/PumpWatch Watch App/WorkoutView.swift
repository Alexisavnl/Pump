import SwiftUI

struct WorkoutView: View {
  @EnvironmentObject var store: WorkoutStore
  @State private var elapsedSeconds = 0
  @State private var elapsedTimer: Timer?
  @State private var showExercise = false
  @State private var selectedExerciseIndex = 0

  var exercises: [WorkoutExercise] { store.workout?.exercises ?? [] }

  @ViewBuilder
  private func exerciseIcon(for imageUrl: String) -> some View {
    if let uiImage = UIImage(named: imageUrl) {
      Image(uiImage: uiImage)
        .resizable()
        .scaledToFill()
        .frame(width: 28, height: 28)
        .clipShape(RoundedRectangle(cornerRadius: 6))
    } else {
      Image(systemName: "dumbbell.fill")
        .font(.system(size: 14))
        .foregroundColor(.blue)
        .frame(width: 28, height: 28)
        .background(Color.blue.opacity(0.15))
        .clipShape(RoundedRectangle(cornerRadius: 6))
    }
  }

  var body: some View {
    NavigationView {
      ZStack(alignment: .bottom) {
        List {
          ForEach(Array(exercises.enumerated()), id: \.element.id) { idx, exercise in
            Button {
              selectedExerciseIndex = idx
              showExercise = true
            } label: {
              HStack(spacing: 8) {
                exerciseIcon(for: exercise.imageUrl)

                VStack(alignment: .leading, spacing: 2) {
                  Text(exercise.exerciseName)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)
                    .foregroundColor(.primary)
                  Text("\(exercise.completedSetsCount)/\(exercise.sets.count) séries")
                    .font(.caption2)
                    .foregroundColor(exercise.completedSetsCount == exercise.sets.count ? .green : .secondary)
                }
              }
            }
            .buttonStyle(.plain)
          }

          Button { store.endWorkout() } label: {
            Label("Terminer", systemImage: "checkmark.circle.fill")
              .frame(maxWidth: .infinity)
              .font(.caption)
          }
          .buttonStyle(.borderedProminent)
          .tint(.blue)
          .listRowBackground(Color.clear)

          Button(role: .destructive) { store.abandonWorkout() } label: {
            Label("Abandonner", systemImage: "xmark.circle.fill")
              .frame(maxWidth: .infinity)
              .font(.caption)
          }
          .buttonStyle(.borderedProminent)
          .tint(.red)
          .listRowBackground(Color.clear)
        }
        .listStyle(.plain)
        .navigationTitle(elapsedText)
        .navigationBarTitleDisplayMode(.inline)

        if let timer = store.restTimer {
          RestTimerBanner(restTimer: timer)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
      }
      .animation(.easeInOut(duration: 0.3), value: store.restTimer != nil)
      .background(
        NavigationLink(
          destination: ExerciseSetView(exercises: exercises, startExerciseIndex: selectedExerciseIndex)
            .environmentObject(store),
          isActive: $showExercise
        ) { EmptyView() }
        .hidden()
      )
    }
    .onAppear { startElapsedTimer() }
    .onDisappear { elapsedTimer?.invalidate() }
    .onChange(of: store.workout == nil) { isNil in
      if isNil { showExercise = false }
    }
  }

  private var elapsedText: String {
    let m = elapsedSeconds / 60
    let s = elapsedSeconds % 60
    return String(format: "%02d:%02d", m, s)
  }

  private func startElapsedTimer() {
    guard let startedAt = store.workout?.startedAt else { return }
    elapsedSeconds = Int((Date().timeIntervalSince1970 * 1000 - startedAt) / 1000)
    elapsedTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
      self.elapsedSeconds = Int((Date().timeIntervalSince1970 * 1000 - (self.store.workout?.startedAt ?? 0)) / 1000)
    }
  }
}

struct RestTimerBanner: View {
  @EnvironmentObject var store: WorkoutStore
  let restTimer: RestTimerState

  var body: some View {
    VStack(spacing: 4) {
      ProgressView(value: restTimer.progress)
        .progressViewStyle(.linear)
        .tint(.blue)
        .padding(.horizontal, 8)

      HStack(spacing: 8) {
        Button("-15s") { store.adjustRest(delta: -15) }
          .font(.caption2)
          .buttonStyle(.bordered)
        Text(restTimer.formattedTime)
          .font(.system(.headline, design: .monospaced))
          .foregroundColor(.white)
        Button("+15s") { store.adjustRest(delta: 15) }
          .font(.caption2)
          .buttonStyle(.bordered)
      }

      Button("Passer") { store.skipRest() }
        .font(.caption2)
        .foregroundColor(.secondary)
    }
    .padding(.vertical, 6)
    .padding(.horizontal, 4)
    .background(.ultraThinMaterial)
    .clipShape(RoundedRectangle(cornerRadius: 12))
    .padding(.horizontal, 4)
    .padding(.bottom, 4)
  }
}

import SwiftUI

struct RestTimerView: View {
  @EnvironmentObject var store: WorkoutStore
  @Binding var isPresented: Bool

  var body: some View {
    VStack(spacing: 0) {
      HStack {
        Button("Passer") {
          store.skipRest()
          isPresented = false
        }
        .font(.system(size: 13, weight: .medium))
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(Color(white: 0.25))
        .clipShape(Capsule())
        .buttonStyle(.plain)
        Spacer()
      }
      .padding(.horizontal, 8)
      .padding(.top, 4)

      if let timer = store.restTimer {
        Text(timer.formattedTime)
          .font(.system(size: 44, weight: .bold, design: .monospaced))
          .foregroundColor(.white)
          .padding(.top, 6)

        ProgressView(value: timer.progress)
          .progressViewStyle(.linear)
          .tint(.blue)
          .padding(.horizontal, 8)
          .padding(.top, 4)

        nextSerieLabel
          .padding(.top, 8)
          .padding(.horizontal, 8)

        Spacer()

        HStack(spacing: 8) {
          TimerAdjustButton(label: "-15s") { store.adjustRest(delta: -15) }
          TimerAdjustButton(label: "+15s") { store.adjustRest(delta: 15) }
        }
        .padding(.horizontal, 8)
        .padding(.bottom, 8)
      }
    }
    .onChange(of: store.restTimer) { timer in
      if timer == nil { isPresented = false }
    }
  }

  @ViewBuilder
  private var nextSerieLabel: some View {
    if let timer = store.restTimer,
       let exercises = store.workout?.exercises,
       let exIdx = exercises.firstIndex(where: { $0.exerciseId == timer.exerciseId }) {

      let exercise = exercises[exIdx]
      let nextSetIdx = exercise.sets.firstIndex(where: { !$0.completed })

      if let setIdx = nextSetIdx {
        // Next set in same exercise
        VStack(alignment: .leading, spacing: 2) {
          Text("Série suivante")
            .font(.caption2).foregroundColor(.secondary)
          Text(exercise.exerciseName)
            .font(.system(size: 13, weight: .bold)).foregroundColor(.white).lineLimit(1)
          Text("Série \(setIdx + 1)/\(exercise.sets.count)")
            .font(.caption2).foregroundColor(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      } else if exIdx + 1 < exercises.count {
        // Last set of this exercise → show next exercise
        let nextEx = exercises[exIdx + 1]
        let nextSetInEx = (nextEx.sets.firstIndex(where: { !$0.completed }) ?? 0) + 1
        VStack(alignment: .leading, spacing: 2) {
          Text("Exercice suivant")
            .font(.caption2).foregroundColor(.secondary)
          Text(nextEx.exerciseName)
            .font(.system(size: 13, weight: .bold)).foregroundColor(.white).lineLimit(1)
          Text("Série \(nextSetInEx)/\(nextEx.sets.count)")
            .font(.caption2).foregroundColor(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
    }
  }
}

struct TimerAdjustButton: View {
  let label: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Text(label)
        .font(.system(size: 15, weight: .medium))
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color(white: 0.2))
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }
    .buttonStyle(.plain)
  }
}

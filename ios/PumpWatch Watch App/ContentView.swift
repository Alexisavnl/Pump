import SwiftUI

struct ContentView: View {
  @EnvironmentObject var store: WorkoutStore

  var body: some View {
    Group {
      if store.workout != nil {
        WorkoutView()
      } else {
        VStack(spacing: 12) {
          Image(systemName: "figure.strengthtraining.traditional")
            .font(.system(size: 32))
            .foregroundColor(.blue)
          Text("Lance une séance\nsur iPhone")
            .font(.caption)
            .multilineTextAlignment(.center)
            .foregroundColor(.secondary)
        }
      }
    }
  }
}

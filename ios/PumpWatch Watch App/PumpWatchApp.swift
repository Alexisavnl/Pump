import SwiftUI

@main
struct PumpWatchApp: App {
  @StateObject private var store = WorkoutStore()

  var body: some Scene {
    WindowGroup {
      ContentView()
        .environmentObject(store)
    }
  }
}

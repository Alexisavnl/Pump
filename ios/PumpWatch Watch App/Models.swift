import Foundation

struct WorkoutSet: Identifiable, Codable {
  var serieNumber: Int
  var kg: Double
  var reps: Int
  var completed: Bool
  var completedAt: Double?

  var id: Int { serieNumber }

  enum CodingKeys: String, CodingKey {
    case serieNumber, kg, reps, completed, completedAt
  }
}

struct WorkoutExercise: Identifiable, Codable {
  var exerciseId: String
  var exerciseName: String
  var imageUrl: String
  var notes: String
  var restTime: Double?
  var sets: [WorkoutSet]

  var id: String { exerciseId }
  var completedSetsCount: Int { sets.filter(\.completed).count }

  enum CodingKeys: String, CodingKey {
    case exerciseId, exerciseName, imageUrl, notes, restTime, sets
  }
}

struct ActiveWorkout: Codable {
  var sessionId: String
  var sessionTitle: String
  var programId: String
  var startedAt: Double
  var exercises: [WorkoutExercise]
}

struct RestTimerState: Equatable {
  let exerciseId: String
  var totalSeconds: Int
  var remainingSeconds: Int

  var progress: Double {
    guard totalSeconds > 0 else { return 1 }
    return Double(totalSeconds - remainingSeconds) / Double(totalSeconds)
  }

  var formattedTime: String {
    let m = remainingSeconds / 60
    let s = remainingSeconds % 60
    return String(format: "%d:%02d", m, s)
  }
}

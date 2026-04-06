import HealthKit
import React

@objc(WorkoutSessionModule)
class WorkoutSessionModule: NSObject {
  private let healthStore = HKHealthStore()

  @objc static func requiresMainQueueSetup() -> Bool { return false }

  @objc func start(_ resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    let typesToShare: Set = [HKObjectType.workoutType()]
    healthStore.requestAuthorization(toShare: typesToShare, read: nil) { granted, error in
      if let error = error { reject("AUTH_ERROR", error.localizedDescription, error); return }
      guard granted else { reject("AUTH_ERROR", "Permission denied", nil); return }
      let config = HKWorkoutConfiguration()
      config.activityType = .traditionalStrengthTraining
      config.locationType = .indoor
      self.healthStore.startWatchApp(with: config) { _, error in
        if let error = error { reject("LAUNCH_ERROR", error.localizedDescription, error) }
        else { resolve(true) }
      }
    }
  }

  @objc func stop() {}
}

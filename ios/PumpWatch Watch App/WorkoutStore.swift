import SwiftUI
import Combine
import WatchConnectivity
import HealthKit

class WorkoutStore: NSObject, ObservableObject {
  @Published var workout: ActiveWorkout?
  @Published var restTimer: RestTimerState?
  @Published var isPhoneReachable = false
  @Published var heartRate: Double = 0
  @Published var activeCalories: Double = 0

  private var countdownTimer: Timer?
  private let hkStore = HKHealthStore()
  private var hkSession: HKWorkoutSession?
  private var hkBuilder: HKLiveWorkoutBuilder?

  override init() {
    super.init()
    guard WCSession.isSupported() else { return }
    WCSession.default.delegate = self
    WCSession.default.activate()
    let pending = WCSession.default.receivedApplicationContext
    if !pending.isEmpty { handleMessage(pending) }
  }

  // MARK: - HealthKit

  func startHealthKitTracking() {
    let typesToShare: Set<HKSampleType> = [
      HKQuantityType(.activeEnergyBurned),
      HKObjectType.workoutType(),
    ]
    let typesToRead: Set<HKObjectType> = [
      HKQuantityType(.heartRate),
      HKQuantityType(.activeEnergyBurned),
    ]
    hkStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { granted, _ in
      guard granted else { return }
      let config = HKWorkoutConfiguration()
      config.activityType = .traditionalStrengthTraining
      config.locationType = .indoor
      guard let session = try? HKWorkoutSession(healthStore: self.hkStore, configuration: config) else { return }
      let builder = session.associatedWorkoutBuilder()
      builder.dataSource = HKLiveWorkoutDataSource(healthStore: self.hkStore, workoutConfiguration: config)
      session.delegate = self
      builder.delegate = self
      self.hkSession = session
      self.hkBuilder = builder
      let now = Date()
      session.startActivity(with: now)
      builder.beginCollection(withStart: now) { _, _ in }
    }
  }

  func stopHealthKitTracking() {
    guard let session = hkSession, let builder = hkBuilder else { return }
    hkSession = nil
    hkBuilder = nil
    session.end()
    builder.endCollection(withEnd: Date()) { _, _ in
      builder.finishWorkout { _, _ in }
    }
  }

  // MARK: - User actions (Watch → Phone)

  func completeSet(exerciseId: String, setIndex: Int) {
    guard var w = workout,
          let exIdx = w.exercises.firstIndex(where: { $0.exerciseId == exerciseId }),
          setIndex < w.exercises[exIdx].sets.count else { return }

    let nowCompleted = !w.exercises[exIdx].sets[setIndex].completed
    w.exercises[exIdx].sets[setIndex].completed = nowCompleted
    w.exercises[exIdx].sets[setIndex].completedAt = nowCompleted ? Date().timeIntervalSince1970 * 1000 : nil
    workout = w

    if nowCompleted, let restSecs = w.exercises[exIdx].restTime, restSecs > 0 {
      startCountdown(exerciseId: exerciseId, totalSeconds: Int(restSecs))
    }
    sendToPhone(["type": "COMPLETE_SET", "exerciseId": exerciseId, "setIndex": setIndex])
  }

  func updateSet(exerciseId: String, setIndex: Int, field: String, value: Double) {
    guard var w = workout,
          let exIdx = w.exercises.firstIndex(where: { $0.exerciseId == exerciseId }),
          setIndex < w.exercises[exIdx].sets.count else { return }
    if field == "kg" { w.exercises[exIdx].sets[setIndex].kg = value }
    else { w.exercises[exIdx].sets[setIndex].reps = max(1, Int(value)) }
    workout = w
    sendToPhone(["type": "UPDATE_SET", "exerciseId": exerciseId, "setIndex": setIndex, "field": field, "value": value])
  }

  func skipRest() {
    stopCountdown()
    restTimer = nil
    sendToPhone(["type": "SKIP_REST"])
  }

  func adjustRest(delta: Int) {
    guard var t = restTimer else { return }
    t.remainingSeconds = max(0, t.remainingSeconds + delta)
    if t.remainingSeconds > t.totalSeconds { t.totalSeconds = t.remainingSeconds }
    if t.remainingSeconds <= 0 { stopCountdown(); restTimer = nil }
    else { restTimer = t }
    sendToPhone(["type": "ADJUST_REST", "delta": delta])
  }

  func endWorkout() {
    stopCountdown()
    stopHealthKitTracking()
    sendToPhone(["type": "END_WORKOUT"])
    workout = nil
    restTimer = nil
  }

  func abandonWorkout() {
    stopCountdown()
    stopHealthKitTracking()
    sendToPhone(["type": "ABANDON_WORKOUT"])
    workout = nil
    restTimer = nil
  }

  // MARK: - Rest timer

  func startCountdown(exerciseId: String, totalSeconds: Int) {
    stopCountdown()
    restTimer = RestTimerState(exerciseId: exerciseId, totalSeconds: totalSeconds, remainingSeconds: totalSeconds)
    countdownTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
      self?.tickCountdown()
    }
  }

  private func tickCountdown() {
    guard var t = restTimer else { stopCountdown(); return }
    t.remainingSeconds -= 1
    if t.remainingSeconds <= 0 { stopCountdown(); restTimer = nil }
    else { restTimer = t }
  }

  private func stopCountdown() {
    countdownTimer?.invalidate()
    countdownTimer = nil
  }

  // MARK: - WatchConnectivity send

  private func sendToPhone(_ message: [String: Any]) {
    guard WCSession.default.activationState == .activated else { return }
    if WCSession.default.isReachable { WCSession.default.sendMessage(message, replyHandler: nil) }
    else { WCSession.default.transferUserInfo(message) }
  }

  // MARK: - Incoming messages

  private func handleMessage(_ message: [String: Any]) {
    guard let type = message["type"] as? String else { return }
    DispatchQueue.main.async {
      switch type {
      case "START_WORKOUT", "STATE_UPDATE":
        guard let obj = message["workout"],
              let data = try? JSONSerialization.data(withJSONObject: obj) else { return }
        let wasNil = self.workout == nil
        self.workout = try? JSONDecoder().decode(ActiveWorkout.self, from: data)
        if wasNil && self.workout != nil { self.startHealthKitTracking() }

      case "REST_STARTED":
        let exerciseId = message["exerciseId"] as? String ?? ""
        let secs = (message["totalSeconds"] as? Int) ?? (message["totalSeconds"] as? Double).map(Int.init) ?? 0
        if secs > 0 { self.startCountdown(exerciseId: exerciseId, totalSeconds: secs) }

      case "ADJUST_REST":
        let delta = (message["delta"] as? Int) ?? (message["delta"] as? Double).map(Int.init) ?? 0
        guard var t = self.restTimer else { return }
        t.remainingSeconds = max(0, t.remainingSeconds + delta)
        if t.remainingSeconds <= 0 { self.stopCountdown(); self.restTimer = nil } else { self.restTimer = t }

      case "SKIP_REST":
        self.stopCountdown(); self.restTimer = nil

      case "END_WORKOUT":
        self.stopCountdown(); self.stopHealthKitTracking()
        self.workout = nil; self.restTimer = nil

      default: break
      }
    }
  }
}

// MARK: - WCSessionDelegate

extension WorkoutStore: WCSessionDelegate {
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    DispatchQueue.main.async { self.isPhoneReachable = session.isReachable }
  }
  func sessionReachabilityDidChange(_ session: WCSession) {
    DispatchQueue.main.async { self.isPhoneReachable = session.isReachable }
  }
  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) { handleMessage(message) }
  func session(_ session: WCSession, didReceiveMessage message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void) {
    handleMessage(message); replyHandler([:])
  }
  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) { handleMessage(applicationContext) }
  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) { handleMessage(userInfo) }
}

// MARK: - HKWorkoutSessionDelegate

extension WorkoutStore: HKWorkoutSessionDelegate {
  func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {}
  func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {}
}

// MARK: - HKLiveWorkoutBuilderDelegate

extension WorkoutStore: HKLiveWorkoutBuilderDelegate {
  func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}

  func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
    for type in collectedTypes {
      guard let qty = type as? HKQuantityType,
            let stat = workoutBuilder.statistics(for: qty) else { continue }
      DispatchQueue.main.async {
        switch qty {
        case HKQuantityType(.heartRate):
          let unit = HKUnit.count().unitDivided(by: .minute())
          self.heartRate = stat.mostRecentQuantity()?.doubleValue(for: unit) ?? self.heartRate
        case HKQuantityType(.activeEnergyBurned):
          self.activeCalories = stat.sumQuantity()?.doubleValue(for: .kilocalorie()) ?? self.activeCalories
        default: break
        }
      }
    }
  }
}

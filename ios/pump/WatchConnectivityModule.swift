import WatchConnectivity
import React

@objc(WatchConnectivityModule)
class WatchConnectivityModule: RCTEventEmitter, WCSessionDelegate {

  override static func requiresMainQueueSetup() -> Bool { return true }

  override init() {
    super.init()
    guard WCSession.isSupported() else { return }
    WCSession.default.delegate = self
    WCSession.default.activate()
  }

  override func supportedEvents() -> [String]! { return ["WatchMessage"] }

  @objc func sendToWatch(_ message: [String: Any]) {
    let session = WCSession.default
    guard session.activationState == .activated else { return }
    let clean = sanitize(message) as? [String: Any] ?? [:]
    session.sendMessage(clean, replyHandler: nil) { _ in
      try? session.updateApplicationContext(clean)
    }
  }

  @objc func transferToWatch(_ message: [String: Any]) {
    guard WCSession.default.activationState == .activated else { return }
    WCSession.default.transferUserInfo(message)
  }

  private func sanitize(_ value: Any) -> Any? {
    if value is NSNull { return nil }
    if let dict = value as? [String: Any] { return dict.compactMapValues { sanitize($0) } }
    if let arr = value as? [Any] { return arr.compactMap { sanitize($0) } }
    return value
  }

  // MARK: - WCSessionDelegate

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

  #if os(iOS)
  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) { WCSession.default.activate() }
  #endif

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    sendEvent(withName: "WatchMessage", body: message)
  }

  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    sendEvent(withName: "WatchMessage", body: applicationContext)
  }
}

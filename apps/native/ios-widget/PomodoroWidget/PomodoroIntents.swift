// This file is compiled into BOTH the widget extension target AND the main
// app target (the plugin wires it up). That dual-membership is required so
// that AppIntents with `openAppWhenRun = true` can run their perform() in
// the app's process — the system needs the type definition in both binaries.

import AppIntents
import Foundation
import UserNotifications
import WidgetKit

// MARK: - Shared data model

struct WidgetPomodoroState: Codable {
  var phase: String
  var phaseStartedAt: String?
  var focusDurationMinutes: Int
  var restDurationMinutes: Int

  static let `default` = WidgetPomodoroState(
    phase: "ready",
    phaseStartedAt: nil,
    focusDurationMinutes: 30,
    restDurationMinutes: 5
  )
}

// Shared constants are namespaced to avoid polluting the global scope when
// this file is compiled into both the widget extension and the main app target.
enum WidgetShared {
  static let appGroup = "group.com.roysung.roPomodoroNative"
  static let widgetStateChangedNotification: CFString
    = "com.roysung.roPomodoroNative.widgetStateChanged" as CFString
  static let isoFormatter: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return f
  }()
}

func formatISODate(_ date: Date) -> String {
  WidgetShared.isoFormatter.string(from: date)
}

func parseISODate(_ string: String) -> Date? {
  if let d = WidgetShared.isoFormatter.date(from: string) { return d }
  return ISO8601DateFormatter().date(from: string)
}

func cancelPomodoroPendingNotifications() {
  let center = UNUserNotificationCenter.current()
  center.getPendingNotificationRequests { requests in
    let ids = requests
      .filter { req in
        let kind = req.content.userInfo["kind"] as? String
        return kind == "timeOut" || kind == "stillWaiting"
      }
      .map { $0.identifier }
    if !ids.isEmpty {
      center.removePendingNotificationRequests(withIdentifiers: ids)
    }
  }
}

func readWidgetState() -> WidgetPomodoroState {
  guard
    let defaults = UserDefaults(suiteName: WidgetShared.appGroup),
    let json = defaults.string(forKey: "widgetState"),
    let data = json.data(using: .utf8),
    let state = try? JSONDecoder().decode(WidgetPomodoroState.self, from: data)
  else {
    return .default
  }
  return state
}

func writeWidgetState(_ state: WidgetPomodoroState) {
  guard
    let defaults = UserDefaults(suiteName: WidgetShared.appGroup),
    let data = try? JSONEncoder().encode(state),
    let json = String(data: data, encoding: .utf8)
  else { return }
  defaults.set(json, forKey: "widgetState")
}

func notifyAppOfWidgetStateChange() {
  NSLog("[LiveActivity][shared] posting darwin notification")
  CFNotificationCenterPostNotification(
    CFNotificationCenterGetDarwinNotifyCenter(),
    CFNotificationName(WidgetShared.widgetStateChangedNotification),
    nil, nil, true
  )
}

// MARK: - App Intents

@available(iOS 16.0, *)
struct StartFocusIntent: AppIntent {
  static var title: LocalizedStringResource = "Start Focus"
  // Starting a Live Activity requires app foreground (iOS rule). Open the app
  // so the JS-side sync hook can request the Activity with visibility.
  static var openAppWhenRun: Bool { true }

  func perform() async throws -> some IntentResult {
    var state = readWidgetState()
    state.phase = "focus"
    state.phaseStartedAt = formatISODate(Date())
    writeWidgetState(state)
    UserDefaults(suiteName: WidgetShared.appGroup)?.set("startFocus", forKey: "pendingAction")
    cancelPomodoroPendingNotifications()
    WidgetCenter.shared.reloadAllTimelines()
    notifyAppOfWidgetStateChange()
    return .result()
  }
}

@available(iOS 16.0, *)
struct StopFocusIntent: AppIntent {
  static var title: LocalizedStringResource = "Stop Focus"

  func perform() async throws -> some IntentResult {
    var state = readWidgetState()
    state.phase = "ready"
    state.phaseStartedAt = nil
    writeWidgetState(state)
    UserDefaults(suiteName: WidgetShared.appGroup)?.set("stopFocus", forKey: "pendingAction")
    cancelPomodoroPendingNotifications()
    WidgetCenter.shared.reloadAllTimelines()
    notifyAppOfWidgetStateChange()
    return .result()
  }
}

@available(iOS 16.0, *)
struct FinishRestIntent: AppIntent {
  static var title: LocalizedStringResource = "Finish Rest"

  func perform() async throws -> some IntentResult {
    var state = readWidgetState()
    state.phase = "ready"
    state.phaseStartedAt = nil
    writeWidgetState(state)
    UserDefaults(suiteName: WidgetShared.appGroup)?.set("finishRest", forKey: "pendingAction")
    cancelPomodoroPendingNotifications()
    WidgetCenter.shared.reloadAllTimelines()
    notifyAppOfWidgetStateChange()
    return .result()
  }
}

@available(iOS 16.0, *)
struct StartRestIntent: AppIntent {
  static var title: LocalizedStringResource = "Start Rest"
  static var openAppWhenRun: Bool { true }

  func perform() async throws -> some IntentResult {
    var state = readWidgetState()
    state.phase = "rest"
    state.phaseStartedAt = formatISODate(Date())
    writeWidgetState(state)
    UserDefaults(suiteName: WidgetShared.appGroup)?.set("startRest", forKey: "pendingAction")
    cancelPomodoroPendingNotifications()
    WidgetCenter.shared.reloadAllTimelines()
    notifyAppOfWidgetStateChange()
    return .result()
  }
}

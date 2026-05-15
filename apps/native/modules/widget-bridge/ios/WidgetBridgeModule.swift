import ActivityKit
import ExpoModulesCore
import WidgetKit

private let isoFormatter: ISO8601DateFormatter = {
  let f = ISO8601DateFormatter()
  f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return f
}()

private func parseISODate(_ string: String) -> Date? {
  if let d = isoFormatter.date(from: string) { return d }
  return ISO8601DateFormatter().date(from: string)
}

private struct PomodoroStatePayload: Decodable {
  let phase: String
  let phaseStartedAt: String?
  let focusDurationMinutes: Int
  let restDurationMinutes: Int
}

private let widgetStateChangedNotification: CFString
  = "com.roysung.roPomodoroNative.widgetStateChanged" as CFString

// One-time Darwin notification observer: when a widget intent posts the
// notification, read the current widget state from the App Group and resync
// the Live Activity from the app process (where ActivityKit owns the matching
// PomodoroActivityAttributes type).
private let widgetStateObserverInstalled: Void = {
  CFNotificationCenterAddObserver(
    CFNotificationCenterGetDarwinNotifyCenter(),
    nil,
    { _, _, _, _, _ in
      if #available(iOS 16.2, *) {
        Task { await WidgetBridgeModule.syncLiveActivityFromUserDefaults() }
      }
    },
    widgetStateChangedNotification,
    nil,
    .deliverImmediately
  )
}()

public class WidgetBridgeModule: Module {
  // Intentionally self-contained: WidgetBridgeModule.swift redeclares appGroup
  // and its own ISO formatter/parser rather than depending on WidgetShared from
  // PomodoroIntents.swift, which is only added to the app target by the Expo
  // plugin after `expo prebuild`. This keeps the module compilable in isolation.
  private static let appGroup = "group.com.roysung.roPomodoroNative"
  private let appGroup = WidgetBridgeModule.appGroup

  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    OnCreate {
      _ = widgetStateObserverInstalled
    }

    AsyncFunction("syncWidgetState") { (json: String) in
      UserDefaults(suiteName: self.appGroup)?.set(json, forKey: "widgetState")
      WidgetCenter.shared.reloadAllTimelines()
    }

    AsyncFunction("getPendingAction") { () -> String? in
      return UserDefaults(suiteName: self.appGroup)?.string(forKey: "pendingAction")
    }

    AsyncFunction("clearPendingAction") { () in
      UserDefaults(suiteName: self.appGroup)?.removeObject(forKey: "pendingAction")
    }

    AsyncFunction("getWidgetState") { () -> String? in
      return UserDefaults(suiteName: self.appGroup)?.string(forKey: "widgetState")
    }

    AsyncFunction("startLiveActivity") { (json: String) -> Void in
      guard #available(iOS 16.2, *) else { return }
      try await Self.startActivity(json: json)
    }

    AsyncFunction("updateLiveActivity") { (json: String) -> Void in
      guard #available(iOS 16.2, *) else { return }
      await Self.updateActivity(json: json)
    }

    AsyncFunction("endLiveActivity") { () -> Void in
      guard #available(iOS 16.2, *) else { return }
      await Self.endAllActivities()
    }
  }

  @available(iOS 16.2, *)
  private static func decode(_ json: String) -> (PomodoroActivityAttributes, PomodoroActivityAttributes.ContentState)? {
    guard
      let data = json.data(using: .utf8),
      let payload = try? JSONDecoder().decode(PomodoroStatePayload.self, from: data),
      let startedAtString = payload.phaseStartedAt,
      let startedAt = parseISODate(startedAtString),
      payload.phase == "focus" || payload.phase == "rest"
    else { return nil }

    let durationSeconds = payload.phase == "focus"
      ? Double(payload.focusDurationMinutes * 60)
      : Double(payload.restDurationMinutes * 60)
    let endsAt = startedAt.addingTimeInterval(durationSeconds)

    let attributes = PomodoroActivityAttributes(
      focusDurationMinutes: payload.focusDurationMinutes,
      restDurationMinutes: payload.restDurationMinutes
    )
    let state = PomodoroActivityAttributes.ContentState(
      phase: payload.phase,
      startedAt: startedAt,
      endsAt: endsAt
    )
    return (attributes, state)
  }

  @available(iOS 16.2, *)
  private static func startActivity(json: String) async throws {
    let enabled = ActivityAuthorizationInfo().areActivitiesEnabled
    NSLog("[LiveActivity] startActivity enabled=\(enabled) json=\(json)")
    guard enabled else {
      NSLog("[LiveActivity] Live Activities disabled — enable in Settings → RO Pomodoro Native → Live Activities")
      return
    }
    guard let (attributes, state) = decode(json) else {
      NSLog("[LiveActivity] decode failed")
      return
    }

    await endAllActivities()

    let content = ActivityContent(state: state, staleDate: state.endsAt.addingTimeInterval(60))
    do {
      let activity = try Activity<PomodoroActivityAttributes>.request(
        attributes: attributes,
        content: content,
        pushType: nil
      )
      NSLog("[LiveActivity] started id=\(activity.id)")
    } catch {
      NSLog("[LiveActivity] request failed: \(error)")
      throw error
    }
  }

  @available(iOS 16.2, *)
  private static func updateActivity(json: String) async {
    guard let (_, state) = decode(json) else { return }
    let content = ActivityContent(state: state, staleDate: state.endsAt.addingTimeInterval(60))
    for activity in Activity<PomodoroActivityAttributes>.activities {
      await activity.update(content)
    }
  }

  @available(iOS 16.2, *)
  private static func endAllActivities() async {
    for activity in Activity<PomodoroActivityAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }

  @available(iOS 16.2, *)
  static func syncLiveActivityFromUserDefaults() async {
    guard
      let defaults = UserDefaults(suiteName: appGroup),
      let json = defaults.string(forKey: "widgetState"),
      let data = json.data(using: .utf8),
      let snapshot = try? JSONDecoder().decode(PomodoroStatePayload.self, from: data)
    else {
      NSLog("[LiveActivity][app] no widget state to sync")
      return
    }

    let activities = Activity<PomodoroActivityAttributes>.activities
    let isActive = snapshot.phase == "focus" || snapshot.phase == "rest"
    NSLog("[LiveActivity][app] sync phase=\(snapshot.phase) isActive=\(isActive) existing=\(activities.count)")

    if !isActive {
      for activity in activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
      return
    }

    guard
      let startedAtString = snapshot.phaseStartedAt,
      let startedAt = parseISODate(startedAtString)
    else { return }

    let durationSeconds = snapshot.phase == "focus"
      ? Double(snapshot.focusDurationMinutes * 60)
      : Double(snapshot.restDurationMinutes * 60)
    let endsAt = startedAt.addingTimeInterval(durationSeconds)

    let attributes = PomodoroActivityAttributes(
      focusDurationMinutes: snapshot.focusDurationMinutes,
      restDurationMinutes: snapshot.restDurationMinutes
    )
    let contentState = PomodoroActivityAttributes.ContentState(
      phase: snapshot.phase,
      startedAt: startedAt,
      endsAt: endsAt
    )
    let content = ActivityContent(state: contentState, staleDate: endsAt.addingTimeInterval(60))

    // Only an .active activity can be updated; ended/dismissed/stale ones
    // may linger briefly in `activities` and would silently swallow update().
    if let existing = activities.first(where: {
      $0.activityState == .active && $0.content.state.phase == snapshot.phase
    }) {
      NSLog("[LiveActivity][app] update id=\(existing.id)")
      await existing.update(content)
      return
    }

    for activity in activities where activity.activityState == .active {
      NSLog("[LiveActivity][app] phase-swap end id=\(activity.id)")
      await activity.end(nil, dismissalPolicy: .immediate)
    }

    guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
    do {
      let a = try Activity<PomodoroActivityAttributes>.request(
        attributes: attributes,
        content: content,
        pushType: nil
      )
      NSLog("[LiveActivity][app] start id=\(a.id)")
    } catch {
      NSLog("[LiveActivity][app] request failed: \(error)")
    }
  }
}

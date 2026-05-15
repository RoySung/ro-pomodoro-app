import ActivityKit
import Foundation

// Keep this file in sync with ios-widget/PomodoroWidget/PomodoroActivityAttributes.swift.
// ActivityKit coordinates app ↔ widget extension by matching the unqualified type
// name + Codable shape, so the two copies must remain identical.
struct PomodoroActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var phase: String
    var startedAt: Date
    var endsAt: Date
  }

  var focusDurationMinutes: Int
  var restDurationMinutes: Int
}

import AppIntents
import SwiftUI
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

private let appGroup = "group.com.roysung.roPomodoroNative"

// Match JS's toISOString() format so timestamps written by either side compare equal.
private let isoFormatter: ISO8601DateFormatter = {
  let f = ISO8601DateFormatter()
  f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return f
}()

private func formatISODate(_ date: Date) -> String {
  isoFormatter.string(from: date)
}

private func parseISODate(_ string: String) -> Date? {
  if let d = isoFormatter.date(from: string) { return d }
  return ISO8601DateFormatter().date(from: string)
}

// Cancel only the pomodoro notifications we tagged via userInfo["kind"].
// removeAllPendingNotificationRequests() would wipe unrelated notifications too.
private func cancelPomodoroPendingNotifications() {
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
    let defaults = UserDefaults(suiteName: appGroup),
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
    let defaults = UserDefaults(suiteName: appGroup),
    let data = try? JSONEncoder().encode(state),
    let json = String(data: data, encoding: .utf8)
  else { return }
  defaults.set(json, forKey: "widgetState")
}

// MARK: - App Intents

struct StartFocusIntent: AppIntent {
  static var title: LocalizedStringResource = "Start Focus"

  func perform() async throws -> some IntentResult {
    var state = readWidgetState()
    state.phase = "focus"
    state.phaseStartedAt = formatISODate(Date())
    writeWidgetState(state)
    UserDefaults(suiteName: appGroup)?.set("startFocus", forKey: "pendingAction")
    // Cancel any repeating "Still waiting" notifications from a previous overtime
    // session. The app may be suspended and unable to cancel them itself.
    cancelPomodoroPendingNotifications()
    WidgetCenter.shared.reloadAllTimelines()
    return .result()
  }
}

struct StopFocusIntent: AppIntent {
  static var title: LocalizedStringResource = "Stop Focus"

  func perform() async throws -> some IntentResult {
    var state = readWidgetState()
    state.phase = "ready"
    state.phaseStartedAt = nil
    writeWidgetState(state)
    UserDefaults(suiteName: appGroup)?.set("stopFocus", forKey: "pendingAction")
    cancelPomodoroPendingNotifications()
    WidgetCenter.shared.reloadAllTimelines()
    return .result()
  }
}

struct FinishRestIntent: AppIntent {
  static var title: LocalizedStringResource = "Finish Rest"

  func perform() async throws -> some IntentResult {
    var state = readWidgetState()
    state.phase = "ready"
    state.phaseStartedAt = nil
    writeWidgetState(state)
    UserDefaults(suiteName: appGroup)?.set("finishRest", forKey: "pendingAction")
    cancelPomodoroPendingNotifications()
    WidgetCenter.shared.reloadAllTimelines()
    return .result()
  }
}

struct StartRestIntent: AppIntent {
  static var title: LocalizedStringResource = "Start Rest"

  func perform() async throws -> some IntentResult {
    var state = readWidgetState()
    state.phase = "rest"
    state.phaseStartedAt = formatISODate(Date())
    writeWidgetState(state)
    UserDefaults(suiteName: appGroup)?.set("startRest", forKey: "pendingAction")
    cancelPomodoroPendingNotifications()
    WidgetCenter.shared.reloadAllTimelines()
    return .result()
  }
}

private func phaseEndDate(for state: WidgetPomodoroState) -> Date? {
  guard
    (state.phase == "focus" || state.phase == "rest"),
    let startedAt = state.phaseStartedAt,
    let startDate = parseISODate(startedAt)
  else { return nil }
  let dur = state.phase == "focus"
    ? Double(state.focusDurationMinutes * 60)
    : Double(state.restDurationMinutes * 60)
  return startDate.addingTimeInterval(dur)
}

private func isPhaseOverTime(_ state: WidgetPomodoroState, now: Date) -> Bool {
  guard let end = phaseEndDate(for: state) else { return false }
  return now > end
}

// MARK: - Timeline

struct PomodoroEntry: TimelineEntry {
  let date: Date
  let state: WidgetPomodoroState
  let poringFrameIndex: Int
}

private struct AnimConfig {
  let frameCount: Int
  let frameInterval: TimeInterval
}

private func animConfig(for phase: String) -> AnimConfig {
  switch phase {
  case "focus": return AnimConfig(frameCount: 10, frameInterval: 0.15)
  case "rest":  return AnimConfig(frameCount: 13, frameInterval: 0.2)
  default:      return AnimConfig(frameCount: 4,  frameInterval: 0.25)
  }
}

struct PomodoroProvider: TimelineProvider {
  func placeholder(in context: Context) -> PomodoroEntry {
    PomodoroEntry(date: Date(), state: .default, poringFrameIndex: 0)
  }

  func getSnapshot(in context: Context, completion: @escaping (PomodoroEntry) -> Void) {
    completion(PomodoroEntry(date: Date(), state: readWidgetState(), poringFrameIndex: 0))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<PomodoroEntry>) -> Void) {
    let state = readWidgetState()
    let config = animConfig(for: state.phase)

    var windowSeconds: Double
    if (state.phase == "focus" || state.phase == "rest"),
       let startedAt = state.phaseStartedAt,
       let startDate = parseISODate(startedAt) {
      let durationSeconds = state.phase == "focus"
        ? Double(state.focusDurationMinutes * 60)
        : Double(state.restDurationMinutes * 60)
      let endDate = startDate.addingTimeInterval(durationSeconds)
      let remaining = endDate.timeIntervalSinceNow
      // Cover remaining time or at least one full animation cycle (max 60s window)
      windowSeconds = min(max(remaining, Double(config.frameCount) * config.frameInterval), 60.0)
    } else {
      // Idle: one full animation cycle
      windowSeconds = Double(config.frameCount) * config.frameInterval
    }

    var entries: [PomodoroEntry] = []
    var t = Date()
    var frameIdx = 0
    let deadline = t.addingTimeInterval(windowSeconds)

    while t <= deadline {
      entries.append(PomodoroEntry(date: t, state: state, poringFrameIndex: frameIdx % config.frameCount))
      frameIdx += 1
      t = t.addingTimeInterval(config.frameInterval)
    }

    // After window: active phases refresh every minute (to stay animated), idle every 10 min
    let nextRefresh: Date
    if state.phase == "focus" || state.phase == "rest" {
      nextRefresh = t
    } else {
      nextRefresh = Date().addingTimeInterval(600)
    }
    completion(Timeline(entries: entries, policy: .after(nextRefresh)))
  }
}

// MARK: - Theme Colors

private extension Color {
  static let roNavy      = Color(red: 0.024, green: 0.063, blue: 0.114)  // #06101d
  static let roDarkBlue  = Color(red: 0.075, green: 0.145, blue: 0.267)  // #132544
  static let roMidBlue   = Color(red: 0.122, green: 0.196, blue: 0.388)  // #1f3463
  static let roBorder    = Color(red: 0.490, green: 0.550, blue: 0.710)  // #7d8cb4
  static let roTitleBar1 = Color(red: 0.074, green: 0.125, blue: 0.231)  // #132040
  static let roTitleBar2 = Color(red: 0.122, green: 0.196, blue: 0.353)  // #1f325a
  static let roSphereBlue = Color(red: 0.188, green: 0.243, blue: 0.420) // #303e6c
}

private func pressStart(_ size: CGFloat) -> Font {
  Font.custom("PressStart2P-Regular", size: size)
}

// MARK: - Poring Sprite View

private struct SpriteSpec {
  let resource: String
  let fw: Int
  let fh: Int
  let cols: Int
}

private func spriteSpec(for phase: String) -> SpriteSpec {
  switch phase {
  case "focus": return SpriteSpec(resource: "poring-walk-sprite",  fw: 41, fh: 44, cols: 10)
  case "rest":  return SpriteSpec(resource: "poring-drink-sprite", fw: 74, fh: 76, cols: 5)
  default:      return SpriteSpec(resource: "poring-idle-sprite",  fw: 41, fh: 39, cols: 4)
  }
}

// rest sprite (74x76) is roughly 1.8x larger than focus/idle (41x44).
// Reduce its scale so all phases render at a similar visual height.
private func adjustedScale(_ baseScale: Int, for phase: String) -> Int {
  phase == "rest" ? max(1, baseScale - 1) : baseScale
}

private class WidgetBundleToken: NSObject {}

private struct CroppedBackground: View {
  let skipTopFraction: CGFloat

  private var croppedImage: UIImage? {
    let bundle = Bundle(for: WidgetBundleToken.self)
    guard
      let ui = UIImage(named: "bg-0", in: bundle, compatibleWith: nil),
      let cg = ui.cgImage
    else { return nil }
    let pixelW = CGFloat(cg.width)
    let pixelH = CGFloat(cg.height)
    let cropY = pixelH * skipTopFraction
    let rect = CGRect(x: 0, y: cropY, width: pixelW, height: pixelH - cropY)
    guard let cropped = cg.cropping(to: rect) else { return nil }
    return UIImage(cgImage: cropped, scale: ui.scale, orientation: .up)
  }

  var body: some View {
    ZStack {
      Color(red: 0.05, green: 0.1, blue: 0.2)
      if let img = croppedImage {
        Image(uiImage: img).resizable().aspectRatio(contentMode: .fill)
      } else {
        Image("bg-0").resizable().aspectRatio(contentMode: .fill)
      }
    }
  }
}

struct PoringFrameView: View {
  let phase: String
  let frameIndex: Int
  let scale: Int

  var body: some View {
    let spec = spriteSpec(for: phase)
    let bundle = Bundle(for: WidgetBundleToken.self)
    if let full = UIImage(named: spec.resource, in: bundle, compatibleWith: nil),
       let cgFull = full.cgImage {
      let imgScale = full.scale
      let col = frameIndex % spec.cols
      let row = frameIndex / spec.cols
      let cropRect = CGRect(
        x: CGFloat(col * spec.fw) * imgScale,
        y: CGFloat(row * spec.fh) * imgScale,
        width: CGFloat(spec.fw) * imgScale,
        height: CGFloat(spec.fh) * imgScale
      )
      if let cropped = cgFull.cropping(to: cropRect) {
        let frameImage = UIImage(cgImage: cropped, scale: imgScale, orientation: .up)
        Image(uiImage: frameImage)
          .interpolation(.none)
          .frame(width: CGFloat(spec.fw * scale), height: CGFloat(spec.fh * scale))
      } else {
        Rectangle()
          .fill(Color.clear)
          .frame(width: CGFloat(spec.fw * scale), height: CGFloat(spec.fh * scale))
      }
    } else {
      Rectangle()
        .fill(Color.clear)
        .frame(width: CGFloat(spec.fw * scale), height: CGFloat(spec.fh * scale))
    }
  }
}

// MARK: - Retro Button

struct RetroActionButton<I: AppIntent>: View {
  let label: String
  let intent: I
  let color: Color

  var body: some View {
    Button(intent: intent) {
      Text(label)
        .font(pressStart(6))
        .foregroundStyle(Color.white)
        .lineLimit(1)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .frame(maxWidth: .infinity)
        .background(
          ZStack {
            RoundedRectangle(cornerRadius: 3).fill(color)
            // Top-left highlight bevel
            RoundedRectangle(cornerRadius: 3)
              .stroke(Color.white.opacity(0.35), lineWidth: 1.5)
              .offset(x: -0.5, y: -0.5)
          }
        )
        .overlay(
          RoundedRectangle(cornerRadius: 3)
            .stroke(color.opacity(0.7), lineWidth: 1)
        )
    }
    .buttonStyle(.plain)
  }
}

// MARK: - Timer Display

private func phaseLabel(_ phase: String) -> String {
  switch phase {
  case "focus":  return "Focus"
  case "rest":   return "Rest"
  case "finish": return "Done!"
  default:       return "Ready"
  }
}

struct TimerView: View {
  let state: WidgetPomodoroState
  let now: Date
  var fontSize: CGFloat = 18

  private var endDate: Date? {
    guard
      (state.phase == "focus" || state.phase == "rest"),
      let startedAt = state.phaseStartedAt,
      let startDate = parseISODate(startedAt)
    else { return nil }
    let dur = state.phase == "focus"
      ? Double(state.focusDurationMinutes * 60)
      : Double(state.restDurationMinutes * 60)
    return startDate.addingTimeInterval(dur)
  }

  private var isOverTime: Bool {
    guard let end = endDate else { return false }
    return now > end
  }

  var body: some View {
    content
      .frame(maxWidth: .infinity, alignment: .center)
  }

  @ViewBuilder
  private var content: some View {
    if let end = endDate, !isOverTime {
      let remaining = max(0, Int(ceil(end.timeIntervalSince(now))))
      Text(String(format: "%d:%02d", remaining / 60, remaining % 60))
        .font(pressStart(fontSize))
        .foregroundStyle(Color.white)
        .monospacedDigit()
    } else if state.phase == "focus" || state.phase == "rest" {
      Text("OVER")
        .font(pressStart(fontSize * 0.78))
        .foregroundStyle(Color.orange)
    } else {
      Text("--:--")
        .font(pressStart(fontSize))
        .foregroundStyle(Color.white.opacity(0.45))
    }
  }
}

// MARK: - Small Widget

struct SmallWidgetView: View {
  let entry: PomodoroEntry

  var body: some View {
    ZStack(alignment: .top) {
      PoringFrameView(
        phase: entry.state.phase,
        frameIndex: entry.poringFrameIndex,
        scale: adjustedScale(3, for: entry.state.phase)
      )
      .padding(.top, 6)

      VStack(spacing: 4) {
        Spacer(minLength: 0)
        TimerView(state: entry.state, now: entry.date, fontSize: 18)
        actionButton(for: entry.state, now: entry.date)
          .frame(maxWidth: .infinity)
      }
      .padding(.bottom, 4)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .containerBackground(for: .widget) {
      CroppedBackground(skipTopFraction: 0.4)
    }
  }

  @ViewBuilder
  private func actionButton(for state: WidgetPomodoroState, now: Date) -> some View {
    let overtime = isPhaseOverTime(state, now: now)
    switch state.phase {
    case "ready":
      RetroActionButton(label: "Start", intent: StartFocusIntent(),
                        color: Color(red: 0.18, green: 0.42, blue: 0.78))
    case "focus":
      if overtime {
        RetroActionButton(label: "Start Rest", intent: StartRestIntent(),
                          color: Color(red: 0.22, green: 0.55, blue: 0.32))
      } else {
        RetroActionButton(label: "Stop", intent: StopFocusIntent(),
                          color: Color(red: 0.65, green: 0.22, blue: 0.22))
      }
    case "rest":
      RetroActionButton(label: "Done", intent: FinishRestIntent(),
                        color: Color(red: 0.22, green: 0.55, blue: 0.32))
    default:
      EmptyView()
    }
  }
}

// MARK: - Medium Widget

struct MediumWidgetView: View {
  let entry: PomodoroEntry

  var body: some View {
    HStack(spacing: 0) {
      // Left: Poring character
      VStack {
        Spacer()
        PoringFrameView(
          phase: entry.state.phase,
          frameIndex: entry.poringFrameIndex,
          scale: adjustedScale(4, for: entry.state.phase)
        )
        Spacer()
      }
      .frame(width: 160)

      // Right: Info + controls
      VStack(alignment: .center, spacing: 8) {
        Text(phaseLine(entry.state.phase))
          .font(pressStart(7))
          .foregroundStyle(Color.white.opacity(0.75))
          .lineLimit(1)

        TimerView(state: entry.state, now: entry.date, fontSize: 30)

        actionButton(for: entry.state, now: entry.date)
      }
      .padding(.horizontal, 12)
      .padding(.vertical, 10)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .containerBackground(for: .widget) {
      CroppedBackground(skipTopFraction: 0.2)
    }
  }

  private func phaseLine(_ phase: String) -> String {
    switch phase {
    case "focus":  return "Focus Time."
    case "rest":   return "Rest Time."
    case "finish": return "Complete!"
    default:       return "RO Pomodoro"
    }
  }

  @ViewBuilder
  private func actionButton(for state: WidgetPomodoroState, now: Date) -> some View {
    let overtime = isPhaseOverTime(state, now: now)
    switch state.phase {
    case "ready":
      RetroActionButton(label: "Start Focus", intent: StartFocusIntent(),
                        color: Color(red: 0.18, green: 0.42, blue: 0.78))
    case "focus":
      if overtime {
        RetroActionButton(label: "Start Rest", intent: StartRestIntent(),
                          color: Color(red: 0.22, green: 0.55, blue: 0.32))
      } else {
        RetroActionButton(label: "Stop", intent: StopFocusIntent(),
                          color: Color(red: 0.65, green: 0.22, blue: 0.22))
      }
    case "rest":
      RetroActionButton(label: "Finish Rest", intent: FinishRestIntent(),
                        color: Color(red: 0.22, green: 0.55, blue: 0.32))
    default:
      EmptyView()
    }
  }
}

// MARK: - Entry View + Widget

struct PomodoroWidgetEntryView: View {
  @Environment(\.widgetFamily) var family
  let entry: PomodoroEntry

  var body: some View {
    switch family {
    case .systemSmall:
      SmallWidgetView(entry: entry)
    case .systemMedium:
      MediumWidgetView(entry: entry)
    default:
      SmallWidgetView(entry: entry)
    }
  }
}

struct PomodoroWidget: Widget {
  let kind = "PomodoroWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: PomodoroProvider()) { entry in
      PomodoroWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("RO Pomodoro")
    .description("Track your Pomodoro timer and control it from your home screen.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

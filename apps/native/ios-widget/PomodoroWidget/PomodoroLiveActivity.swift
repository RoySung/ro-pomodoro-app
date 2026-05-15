import ActivityKit
import SwiftUI
import WidgetKit

private func liveActivityPhaseLabel(_ phase: String) -> String {
  switch phase {
  case "focus": return "Focus"
  case "rest":  return "Rest"
  default:      return ""
  }
}

private struct LiveActivityPoring: View {
  let phase: String
  let scale: Int
  var body: some View {
    PoringFrameView(phase: phase, frameIndex: 0, scale: scale)
  }
}

// Compact / minimal regions of the Dynamic Island are very tight (~22pt).
// PoringFrameView bakes in a fixed pixel size via .frame, so we re-crop the
// sprite ourselves and use .resizable + .scaledToFit to fit the small region.
private struct CompactPoring: View {
  let phase: String
  var size: CGFloat = 22

  private struct Token {}

  private var frameImage: UIImage? {
    let bundle = Bundle(for: WidgetBundleTokenForLA.self)
    let resourceName: String
    let fw: Int
    let fh: Int
    switch phase {
    case "rest":  resourceName = "poring-drink-sprite"; fw = 74; fh = 76
    default:      resourceName = "poring-idle-sprite";  fw = 41; fh = 39
    }
    guard
      let full = UIImage(named: resourceName, in: bundle, compatibleWith: nil),
      let cg = full.cgImage
    else { return nil }
    let imgScale = full.scale
    let rect = CGRect(x: 0, y: 0, width: CGFloat(fw) * imgScale, height: CGFloat(fh) * imgScale)
    guard let cropped = cg.cropping(to: rect) else { return nil }
    return UIImage(cgImage: cropped, scale: imgScale, orientation: .up)
  }

  var body: some View {
    if let img = frameImage {
      Image(uiImage: img)
        .interpolation(.none)
        .resizable()
        .scaledToFit()
        .frame(width: size, height: size)
    } else {
      Color.clear.frame(width: size, height: size)
    }
  }
}

private class WidgetBundleTokenForLA: NSObject {}

private struct LiveActivityCountdown: View {
  let state: PomodoroActivityAttributes.ContentState
  var fontSize: CGFloat = 22
  var color: Color = .white

  var body: some View {
    Text(timerInterval: state.startedAt...state.endsAt, countsDown: true)
      .font(.system(size: fontSize, weight: .semibold, design: .monospaced))
      .monospacedDigit()
      .foregroundStyle(color)
      .multilineTextAlignment(.center)
  }
}

struct PomodoroLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: PomodoroActivityAttributes.self) { context in
      // Lock Screen / banner UI
      HStack(spacing: 12) {
        LiveActivityPoring(phase: context.state.phase, scale: 2)
          .frame(width: 84, alignment: .center)

        VStack(alignment: .leading, spacing: 6) {
          Text(liveActivityPhaseLabel(context.state.phase))
            .font(.caption.weight(.semibold))
            .foregroundStyle(.white.opacity(0.75))
          LiveActivityCountdown(state: context.state, fontSize: 28)
          ProgressView(timerInterval: context.state.startedAt...context.state.endsAt,
                       countsDown: true,
                       label: { EmptyView() },
                       currentValueLabel: { EmptyView() })
            .progressViewStyle(.linear)
            .tint(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 12)
      .activityBackgroundTint(Color(red: 0.075, green: 0.145, blue: 0.267))
      .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          CompactPoring(phase: context.state.phase, size: 66)
            .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          LiveActivityCountdown(state: context.state, fontSize: 24)
            .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(spacing: 4) {
            Text(liveActivityPhaseLabel(context.state.phase))
              .font(.caption.weight(.semibold))
              .foregroundStyle(.white.opacity(0.7))
            ProgressView(timerInterval: context.state.startedAt...context.state.endsAt,
                         countsDown: true,
                         label: { EmptyView() },
                         currentValueLabel: { EmptyView() })
              .progressViewStyle(.linear)
              .tint(.white)
          }
          .padding(.horizontal, 4)
        }
      } compactLeading: {
        CompactPoring(phase: context.state.phase, size: 30)
      } compactTrailing: {
        Text(timerInterval: context.state.startedAt...context.state.endsAt, countsDown: true)
          .monospacedDigit()
          .font(.system(size: 13, weight: .semibold, design: .monospaced))
          .foregroundStyle(.white)
          .frame(maxWidth: 56)
      } minimal: {
        CompactPoring(phase: context.state.phase, size: 27)
      }
      .keylineTint(Color(red: 0.18, green: 0.42, blue: 0.78))
    }
  }
}

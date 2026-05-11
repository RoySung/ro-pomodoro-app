import ExpoModulesCore
import WidgetKit

public class WidgetBridgeModule: Module {
  private let appGroup = "group.com.roysung.roPomodoroNative"

  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

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
  }
}

import Foundation

/// Bundle ids of the apps whose computer-use sidecar may drive this helper.
public enum TrustedOrcaApplication {
    public static func isTrusted(bundleId: String) -> Bool {
        let parent = Bundle.main.object(forInfoDictionaryKey: "OrcaParentBundleIdentifier") as? String ?? "com.stablyai.orca"
        return bundleId == parent || bundleId == "\(parent).dev" ||
            bundleId.hasPrefix("\(parent).dev.") || bundleId == "com.github.Electron"
    }
}

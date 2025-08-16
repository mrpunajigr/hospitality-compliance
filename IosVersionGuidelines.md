# iOS Version Control Guidelines

## Current Version: v1.0.0 (Build 1)

## iOS Version Number Format: MAJOR.MINOR.PATCH (Build Number)

### Marketing Version (CFBundleShortVersionString)
**Format:** MAJOR.MINOR.PATCH
**Location:** Info.plist → CFBundleShortVersionString
**Xcode:** Target Settings → General → Identity → Version

#### MAJOR Version (First Number)
- **Increments when:** Complete "Next Phase" finished, breaking changes, major feature releases
- **Examples:** New major feature sets, architectural changes, major UI overhauls
- **Current:** v1.x.x (Initial release)

#### MINOR Version (Second Number)
- **Increments when:** New features added, significant updates within current phase
- **Examples:** New screens, major functionality additions, API changes
- **Reset to 0:** When MAJOR increments

#### PATCH Version (Third Number)
- **Increments when:** Bug fixes, minor updates, hotfixes
- **Examples:** Crash fixes, UI tweaks, performance improvements
- **Reset to 0:** When MINOR increments

### Build Number (CFBundleVersion)
**Format:** Integer (incrementing)
**Location:** Info.plist → CFBundleVersion
**Xcode:** Target Settings → General → Identity → Build
**Rule:** Must be unique and incrementing for each App Store submission

## iOS Project Preparation

### Version Configuration (For Future Xcode Setup)
When you create your iOS project, these will be configured in Info.plist:
- **CFBundleShortVersionString:** Marketing version (1.0.0)
- **CFBundleVersion:** Build number (incremental integer)

### Xcode Location Reference
- **Target Settings:** General → Identity section
- **Marketing Version:** User-facing version number
- **Build Number:** Internal build tracking

## Build Number Planning (Pre-Xcode)

### Current Development Tracking
- **Project Phase:** Development/Planning
- **Target iOS Version:** 15.0+
- **Planned Bundle ID:** com.yourcompany.appname
- **Initial Marketing Version:** 1.0.0
- **Initial Build Number:** 1

### Preparation Steps
1. **Documentation:** Maintain this version control protocol
2. **Git Strategy:** Plan branching strategy for releases
3. **Build Automation:** Research CI/CD options for iOS
4. **Version Tracking:** Keep detailed change logs during development

## Version Update Process (Development Phase)

### 1. Determine Version Type
- **Major:** New phase completion, breaking changes
- **Minor:** New features, significant updates  
- **Patch:** Bug fixes, minor updates

### 2. Update Version Numbers (Current Development)
**In your current codebase:**
1. Update version in package.json
2. Update version display in your app components
3. Update "Current Version" in this file
4. Document changes in version history

**When moving to Xcode:**
1. Set CFBundleShortVersionString (marketing version)
2. Set CFBundleVersion (build number)
3. Use automated scripts for build number incrementing

### 3. Documentation Updates
1. Update "Current Version" in this file
2. Add entry to Version History
3. Update any version references in code comments

### 4. Git Tagging
```bash
git tag -a v1.0.1 -m "Release version 1.0.1"
```

```bash
git push origin v1.0.1
```

## App Store Connect Requirements

### Version Constraints
- **Marketing Version:** Must follow semantic versioning
- **Build Number:** Must be unique and incrementing
- **TestFlight:** Each build requires unique build number
- **App Store:** Cannot reuse build numbers, even for rejected builds

### Pre-submission Checklist
- [ ] Marketing version follows semantic versioning
- [ ] Build number is higher than previous submission
- [ ] Version updated in all required locations
- [ ] Git tag created for release
- [ ] Release notes prepared

## Version History

### v1.0.0 (Build 1) - INITIAL RELEASE
**Release Date:** 2025-XX-XX
**App Store Status:** In Development

**Features:**
- **🎨 STANDARDIZED TYPOGRAPHY SYSTEM**: Professional font hierarchy with iOS system fonts
- **✨ NATIVE UI COMPONENTS**: SwiftUI/UIKit components with iOS design guidelines
- **📱 iOS COMPATIBILITY**: Full iOS 15+ support with backward compatibility considerations
- **🏗️ MODERN ARCHITECTURE**: SwiftUI + Combine + MVVM foundation
- **🎯 RESPONSIVE DESIGN**: iPhone, iPad, and iPad Pro optimization
- **⚡ PERFORMANCE OPTIMIZED**: Efficient memory usage and smooth animations
- **🔧 DEVELOPER EXPERIENCE**: Complete Xcode setup with debugging tools

**Build Details:**
- **Xcode Version:** 15.x
- **iOS Deployment Target:** 15.0
- **Swift Version:** 5.9+
- **Supported Devices:** iPhone 8+ and iPad Air 2+

### Future Phases
- **Phase 2 (v2.0.0):** [To be defined based on project needs]
- **Phase 3 (v3.0.0):** [To be defined based on project needs]

## Release Notes Template

```markdown
### vX.X.X (Build XXX) - RELEASE_NAME
**Release Date:** YYYY-MM-DD
**App Store Status:** Submitted/Approved/Released

**New Features:**
- **🎯 FEATURE_NAME**: Description of major feature

**Improvements:**
- **✨ ENHANCEMENT**: Description of improvement
- **⚡ PERFORMANCE**: Speed or optimization improvements

**Bug Fixes:**
- **🐛 FIX**: Description of fix

**Technical Changes:**
- **🔧 TECHNICAL**: iOS version support, dependency updates
- **📱 COMPATIBILITY**: Device support changes

**Build Information:**
- **Xcode Version:** X.X
- **iOS Deployment Target:** XX.X
- **Swift Version:** X.X
- **Bundle ID:** com.yourcompany.appname
```

## iOS Deployment Checklist

### Pre-Build
- [ ] Increment build number (CFBundleVersion)
- [ ] Update marketing version if needed (CFBundleShortVersionString)
- [ ] Verify bundle identifier is correct
- [ ] Check code signing certificates are valid
- [ ] Run unit and UI tests

### Build Configuration
- [ ] Set correct build configuration (Debug/Release)
- [ ] Verify provisioning profiles
- [ ] Check entitlements are correct
- [ ] Validate Info.plist settings
- [ ] Ensure all required icons and launch screens are included

### Pre-Submission
- [ ] Archive build successfully
- [ ] Validate app through Xcode Organizer
- [ ] Test on multiple device types and iOS versions
- [ ] Verify app works without debugger attached
- [ ] Check App Store Connect metadata matches build

### App Store Connect
- [ ] Upload build via Xcode Organizer or Transporter
- [ ] Wait for build processing completion
- [ ] Test via TestFlight if using beta testing
- [ ] Submit for App Store review
- [ ] Monitor review status

### Post-Release
- [ ] Create git tag with marketing version and build number
- [ ] Update version history in this document
- [ ] Monitor crash reports and user feedback
- [ ] Plan next iteration based on metrics and feedback

## Future iOS Implementation

### Automated Build Number Scripts (For Xcode Setup)

**Git Commit Count Method:**
```bash
buildNumber=$(($(git rev-list HEAD --count)))
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $buildNumber" "${INFOPLIST_FILE}"
```

**Simple Increment Method:**
```bash
buildNumber=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "${INFOPLIST_FILE}")
buildNumber=$(($buildNumber + 1))
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $buildNumber" "${INFOPLIST_FILE}"
```

**agvtool Commands:**
```bash
agvtool new-marketing-version 1.0.1
```

```bash
agvtool next-version
```

## Troubleshooting

**Build Number Issues:**
- Build numbers must always increment for App Store submissions
- Cannot reuse build numbers, even for rejected builds
- Use agvtool for automated build number management

**Version Validation:**
- Marketing version should follow semantic versioning
- Build number must be positive integer
- Check Info.plist format is correct

**App Store Connect Errors:**
- Ensure build number is higher than previous submission
- Verify bundle ID matches App Store Connect app record
- Check code signing and provisioning profiles are valid
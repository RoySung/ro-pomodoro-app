# React Native Rewrite Design

## Goal

Build a new multi-platform React Native version of the Pomodoro app inside this repository while keeping the current Vue web app intact. The first delivery target is iOS, Android, and Web. Desktop support is handled through the web build, not native macOS or Windows shells.

## Constraints

- Keep the Ragnarok-style single-screen presentation and retro window treatment from the current app.
- Replace browser notifications with native local notifications on iOS and Android.
- Preserve the current timer flow: Ready -> Focus -> Rest -> Finish -> Ready.
- Avoid a Phaser port. Rebuild the scene layer with React Native-native primitives.

## Architecture

- The new app lives in apps/native as an Expo SDK 55 app.
- Timer and reporting logic are moved into a platform-agnostic domain layer under apps/native/src/features/pomodoro.
- Persistent state uses AsyncStorage instead of localStorage.
- Local notifications use expo-notifications with platform checks so web can fall back without breaking the main flow.
- The main screen stays a fixed-aspect single-stage layout with overlay windows for status, actions, settings, and reports.

## UI Direction

- Recreate the original stage proportions and visual rhythm instead of adopting a generic mobile dashboard layout.
- Keep the beveled retro windows, glossy buttons, muted blue chrome, and ROM-like typography.
- Reuse the original background and Poring assets to hold onto the existing identity from day one.

## Initial Implementation Scope

- Scaffold the Expo app in apps/native.
- Replace the starter template with a single-screen Pomodoro implementation.
- Implement timer state, records, weekly and monthly aggregation, settings modal, and report modal.
- Wire native local notifications for phase end reminders and overtime repeat reminders.
- Validate the new app with TypeScript and Expo lint.

## Follow-up Work

- Replace the temporary GIF-based Poring presentation with a richer scene and animation system.
- Add audio playback and mute handling for the imported music asset.
- Decide whether shared logic should later move into a workspace package once the native version stabilizes.
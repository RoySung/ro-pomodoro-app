# RO Pomodoro — Native App (Expo + React Native)

> CLAUDE.md is a symlink to this file — one source of truth for both.

## Project Background

A React Native (Expo) port of the original **RO Pomodoro** web app (Vue 3 + Phaser 3). The web app is a Ragnarok-Online–themed Pomodoro timer with an animated Poring character on a scrolling pixel-art background. Goal is to recreate the full web experience as a mobile-first app, preserving the retro RO aesthetic (PressStart2P pixel font, win95-style windows, dark-blue theme), Poring sprite animations keyed to Pomodoro phases, scrolling background, settings/report screens, and background music.

Web source: `../../src/` (Vue) and `../../public/game/` (Phaser assets)

## Phase → Animation Mapping (from original Phaser game)

| Phase  | isOverTime | Poring anim | Background |
|--------|-----------|-------------|------------|
| ready  | —         | idle        | static     |
| focus  | false     | walk        | scrolling  |
| focus  | true      | idle        | static     |
| rest   | false     | drink or eat (random on enter); item overlay (apple-juice or food) shown alongside poring | static |
| rest   | true      | idle        | static     |
| finish | —         | idle + heart emotion sprite plays twice then disappears | static |

## Key Implementation Decisions

- Sprite animation: `setInterval` + `useState` for frame index (discrete frames, no interpolation)
- Background scroll: `Animated.loop(Animated.timing(...))` with `useNativeDriver: true` (smooth native thread)
- Background speed: 120 px/s on the scaled image (matching original Phaser's 2px/frame at 60fps)
- `CHAR_HEIGHT = 160` in `poring-character.tsx`: fixed container height keeps the caption bubble at a stable Y position regardless of which animation (idle/walk/drink/eat have different heights) is currently rendered

## Coding Conventions

- No comments unless the WHY is non-obvious
- No new abstractions unless clearly reused
- Prefer `StyleSheet.create` for styles
- `useNativeDriver: true` for transform/opacity animations; `false` for layout
- Prefer `Animated` (RN core) over `react-native-reanimated` for simple cases
- Do not touch: `use-pomodoro-controller.ts`, `use-background-music.ts`, `domain.ts`

# Refactor KeySequenceDemo with Reka UI, UnoCSS, and VueUse

## Summary
Refactor the `KeySequenceDemo.vue` component in the playground to improve maintainability, styling, and code organization. This involves introducing UnoCSS for styling, VueUse for composables, and splitting the monolithic component into smaller, granular components using Reka UI.

## Motivation
The current `KeySequenceDemo.vue` is becoming a monolithic component handling multiple responsibilities (keyboard logic, gamepad logic, recording, UI display). Refactoring it will:
- Improve code readability and maintainability.
- Leverage modern Vue ecosystem tools (VueUse, UnoCSS).
- Demonstrate best practices for consuming the `keyboard-sequence-listener` library.

## Proposed Changes
1.  **Dependencies**: Add `unocss` and `@vueuse/core` to the playground.
2.  **Styling**: Replace custom CSS with UnoCSS utility classes.
3.  **Architecture**:
    - Extract logic into composables (e.g., `useKonamiCode`, `useGamepad`, `useSequenceRecorder`).
    - Split UI into sub-components (e.g., `KeyboardTab.vue`, `GamepadTab.vue`, `SequenceRecorder.vue`, `StatusCard.vue`).
4.  **UI Components**: Fully utilize `reka-ui` for tabs and other interactive elements.

## Detailed Design
- **Composables**:
    - `useKeySequence(sequence, options)`: Wrapper around `KeySequenceListener`.
    - `useSequenceRecorder()`: Logic for recording custom sequences.
- **Components**:
    - `KeySequenceDemo.vue`: Main container with Tabs.
    - `KonamiCard.vue`: The classic Konami code demo.
    - `CustomSequenceCard.vue`: The recording and custom sequence demo.
    - `OnceModeCard.vue`: The "once" mode demo.
    - `GamepadCard.vue`: The gamepad demo.

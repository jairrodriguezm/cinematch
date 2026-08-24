## 2024-10-24 - Missing visual feedback on clipboard operations
**Learning:** Found that the copy to clipboard button lacked both accessible labels and visual feedback upon successful copy, which leaves users uncertain if the action succeeded.
**Action:** Always include a visual state change (like a checkmark and text change) and an `aria-label` when implementing clipboard operations to provide immediate and clear feedback to all users.
## 2024-05-24 - Missing Skip Interactions & Focus Styles
**Learning:** Found a pattern where interactive custom controls (like range sliders) had `outline-none` removing keyboard focus visibility. Also discovered an unused `handleSkip` function for movie ratings, revealing that users had no explicit way to bypass content they hadn't seen.
**Action:** Always ensure custom inputs have `focus-visible` fallback styles. When building swipe/rating decks, always include an explicit "skip" button so users aren't forced to provide inaccurate ratings to proceed.

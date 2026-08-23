## 2024-10-24 - Missing visual feedback on clipboard operations
**Learning:** Found that the copy to clipboard button lacked both accessible labels and visual feedback upon successful copy, which leaves users uncertain if the action succeeded.
**Action:** Always include a visual state change (like a checkmark and text change) and an `aria-label` when implementing clipboard operations to provide immediate and clear feedback to all users.
## 2024-10-25 - Missing loading states on async actions
**Learning:** Found that async form submissions (creating and joining rooms) lacked visual loading states and disabled attributes, which could allow users to double-submit forms or cause confusion about system status.
**Action:** Always add loading spinners and disable buttons during async operations to provide clear feedback and prevent duplicate submissions. Follow existing design patterns (e.g. `animate-spin` on a small circular border) when adding visual loading indicators.

## 2024-10-24 - Missing visual feedback on clipboard operations
**Learning:** Found that the copy to clipboard button lacked both accessible labels and visual feedback upon successful copy, which leaves users uncertain if the action succeeded.
**Action:** Always include a visual state change (like a checkmark and text change) and an `aria-label` when implementing clipboard operations to provide immediate and clear feedback to all users.

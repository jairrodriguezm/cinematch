## 2024-05-23 - Custom Pill Buttons Lack Focus States
**Learning:** The application's custom gradient pill buttons (like CopyToken, ShareRoom, CreateRoom) override default browser focus outlines, making them inaccessible to keyboard users without explicit `focus-visible` utility classes.
**Action:** When creating or modifying custom styled interactive elements, especially pill buttons with gradients and shadows, always append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` with the appropriate brand color ring.

## 2024-05-18 - Missing focus states on custom interactive elements
**Learning:** Found that some buttons and inputs utilizing generic Tailwind CSS or complex rounded shapes lack proper keyboard focus rings.
**Action:** Always verify keyboard focus state visibility on new or updated buttons. Append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` alongside the appropriate color ring (e.g. `focus-visible:ring-[#f5c518]`) when working on form or interactive elements.

## 2026-09-10 - Dynamic form feedback announcements
**Learning:** The application uses framer-motion to dynamically display form feedback (success/error), but screen readers don't announce these changes by default.
**Action:** When adding dynamic feedback messages (e.g. form validation, success state), always add `role="status"` and `aria-live="polite"` to ensure screen readers announce the message without requiring manual focus.

## 2024-05-14 - Keyboard accessibility on floating/transient UI
**Learning:** Floating components like navigation bars and transient installation banners in this application often lack default keyboard focus indicators on their interactive elements (e.g., icon buttons or compact sign-out buttons). This makes it difficult for keyboard-only users to navigate the application.
**Action:** Always verify keyboard accessibility (`focus-visible` classes) on newly created floating or transient UI elements. Use `focus-visible:ring-2 focus-visible:ring-offset-2` with the appropriate brand color or neutral color for the ring and the background color for the offset to ensure visibility against the specific floating background context.

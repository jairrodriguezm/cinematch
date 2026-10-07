## 2024-05-23 - Custom Pill Buttons Lack Focus States
**Learning:** The application's custom gradient pill buttons (like CopyToken, ShareRoom, CreateRoom) override default browser focus outlines, making them inaccessible to keyboard users without explicit `focus-visible` utility classes.
**Action:** When creating or modifying custom styled interactive elements, especially pill buttons with gradients and shadows, always append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` with the appropriate brand color ring.

## 2024-05-18 - Missing focus states on custom interactive elements
**Learning:** Found that some buttons and inputs utilizing generic Tailwind CSS or complex rounded shapes lack proper keyboard focus rings.
**Action:** Always verify keyboard focus state visibility on new or updated buttons. Append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` alongside the appropriate color ring (e.g. `focus-visible:ring-[#f5c518]`) when working on form or interactive elements.

## 2026-09-10 - Dynamic form feedback announcements
**Learning:** The application uses framer-motion to dynamically display form feedback (success/error), but screen readers don't announce these changes by default.
**Action:** When adding dynamic feedback messages (e.g. form validation, success state), always add `role="status"` and `aria-live="polite"` to ensure screen readers announce the message without requiring manual focus.
## 2024-05-14 - Mobile Keyboard Interference on Code Inputs
**Learning:** In Next.js/React applications, when rendering form inputs that expect raw application codes (like room tokens), mobile keyboards often actively interfere by attempting to auto-capitalize, auto-correct, or suggest words, making it frustrating to enter or paste exact alphanumeric strings.
**Action:** Always append `autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}` to such specific inputs. Additionally, robust UX requires locking the input (`disabled`) and styling it appropriately (`disabled:opacity-60 disabled:cursor-not-allowed`) during asynchronous operations to prevent duplicate submissions or confusion while the user waits.
## 2024-10-07 - Mobile Keyboard Interference on Email Inputs
**Learning:** Mobile keyboards often erroneously capitalize the first letter or attempt to spell-check email addresses, causing friction for users on login forms. Setting `autoComplete="off"` (which I initially attempted) is actually an anti-pattern for login inputs, as it breaks password managers. `autoComplete="email"` should be used instead.
**Action:** When implementing or updating email inputs, always ensure they have `autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck={false}`, and the correct `autoComplete="email"` attribute to prevent mobile keyboard issues while preserving password manager functionality. Also remember to add `disabled:opacity-60 disabled:cursor-not-allowed` styles for visually indicating disabled state during form submission.

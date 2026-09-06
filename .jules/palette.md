## 2024-05-23 - Custom Pill Buttons Lack Focus States
**Learning:** The application's custom gradient pill buttons (like CopyToken, ShareRoom, CreateRoom) override default browser focus outlines, making them inaccessible to keyboard users without explicit `focus-visible` utility classes.
**Action:** When creating or modifying custom styled interactive elements, especially pill buttons with gradients and shadows, always append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` with the appropriate brand color ring.

## 2024-05-18 - Missing focus states on custom interactive elements
**Learning:** Found that some buttons and inputs utilizing generic Tailwind CSS or complex rounded shapes lack proper keyboard focus rings.
**Action:** Always verify keyboard focus state visibility on new or updated buttons. Append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` alongside the appropriate color ring (e.g. `focus-visible:ring-[#f5c518]`) when working on form or interactive elements.

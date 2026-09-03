## 2024-05-23 - Custom Pill Buttons Lack Focus States
**Learning:** The application's custom gradient pill buttons (like CopyToken, ShareRoom, CreateRoom) override default browser focus outlines, making them inaccessible to keyboard users without explicit `focus-visible` utility classes.
**Action:** When creating or modifying custom styled interactive elements, especially pill buttons with gradients and shadows, always append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` with the appropriate brand color ring.

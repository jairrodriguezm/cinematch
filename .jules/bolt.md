## 2024-05-30 - Prevent full component re-render on user interaction in forms/sliders
**Learning:** React state changes in a parent component triggered by high-frequency interactions in a child component (like a slider drag `onChange`) will cause the entire parent tree to re-render. In `MovieDeck.tsx`, dragging `RatingSlider` was causing full re-renders of the background, movie cast, and text sections because `rating` was kept in `MovieDeck`'s state.
**Action:** Move volatile interactive state down into the leaf component (e.g., `RatingSlider`). If the parent needs the final value, use an `onCommit` callback for when the interaction completes. Pass the initial value down as a prop if necessary.
## 2024-03-24 - Supabase Data Fetching Optimization
**Learning:** In applications using Supabase + React with real-time subscriptions, making DB queries in a loop (N+1 query problem) not only slows down the initial load but severely degrades performance on every realtime event, as the entire loop runs again.
**Action:** Always extract unique identifiers, batch DB queries using , and distribute the results locally rather than querying in loops.
## 2024-03-24 - Supabase Data Fetching Optimization
**Learning:** In applications using Supabase + React with real-time subscriptions, making DB queries in a loop (N+1 query problem) not only slows down the initial load but severely degrades performance on every realtime event, as the entire loop runs again.
**Action:** Always extract unique identifiers, batch DB queries using `.in('column', ids)`, and distribute the results locally rather than querying in loops.
## 2024-06-01 - Supabase Realtime Event Filtering
**Learning:** Subscribing to Supabase realtime events using wildcards (`*`) without client-side payload filtering causes severe N+1 re-render scaling issues, as every client reacts to every global platform event.
**Action:** When subscribing to table updates (`postgres_changes`), always filter the incoming payload using a `useRef` (populated with relevant context IDs like `user.id` or room members) to discard irrelevant events and prevent unnecessary local data refreshes.
## 2024-06-15 - Array Method O(N²) Bottlenecks
**Learning:** Using nested array methods like `.some()`, `.filter()`, or `.find()` inside a loop to group interactions or distribute relational data creates an O(N²) bottleneck in backend aggregation. While small datasets may seem fine, this setup scales poorly.
**Action:** Replace nested array loops with `Map` (or `Set`) lookup structures when assembling data in loops to preserve linear O(N) performance.
## 2024-07-25 - Proactive asset preloading in sequential UIs
**Learning:** In sequential UIs like a swipeable deck or movie queue, waiting until an item becomes active to fetch its data or images introduces perceived latency and visual flashing, degrading the user experience.
**Action:** Preload the upcoming items' images using visually hidden `<img rel="preload">` or standard `<img>` tags and cache API responses via `useRef` or local state for the immediate next elements in the queue. This creates a seamless, 0ms transition for the user.

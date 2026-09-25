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

## 2024-11-20 - DB Query Optimization for Matches
**Learning:** Fetching interactions without database filtering can cause immense N+1 payload scaling, particularly since users generate many 'DISCARD' and 'MAYBE' ratings which are never used for `PRIMARY` matches (which requires rating >= 7). Querying for every column with `select('*')` exacerbates this memory usage.
**Action:** When filtering data for matches, ensure you select only the required columns and push row filtering (e.g., `.gte('rating', 7)`) down to the database layer to dramatically decrease network payloads and application memory overhead.
## 2024-06-25 - Prevent O(N) memory scaling for user interactions
**Learning:** In getUnratedMovieQueue, fetching all user interactions into a Set before filtering the movie queue creates a memory bottleneck that scales linearly with user activity. Supabase limits queries to 1000 rows by default, so power users with >1000 interactions would silently fail to filter out older movies.
**Action:** Instead of eagerly loading the user's entire history, fetch the target movies first (e.g. 20 from TMDB), map their IDs, and then make a targeted Supabase query using `.in('movie_id', movieIds)`. This bounds the memory footprint to O(1) page size and avoids the 1000-row pagination hazard.
## 2026-09-09 - O(N²) Array Loop and Map Aggregation Avoidance
**Learning:** Computing shared intersections between datasets (like matched movies among users) by creating deep `Map` structures (e.g., `Map<movieId, Map<userId, rating>>`) incurs heavy object allocation overhead inside loops and scales poorly for server functions and realtime callbacks.
**Action:** When filtering for shared matches or intersections, group the requisite IDs by user into a `Set<number>`, then perform an O(1) `Set.prototype.has()` check across the other users' sets. This drastically reduces memory footprint and iteration complexity to linear O(N).
## 2024-11-20 - Map Aggregation Overhead
**Learning:** Building Maps of arrays and then redundantly generating Sets from them inside loops for real-time evaluations creates an O(N) allocation overhead that negates the performance benefit of O(1) Set lookups. In `fetchRoomsWithMatches`, recreating Sets of liked movies per user on every room iteration severely degrades performance as rooms and interactions scale.
**Action:** When filtering for shared matches or intersections using Sets, pre-compute the Sets directly during the initial mapping phase (e.g. `Map<userId, Set<movieId>>`), and simply reference them inside the evaluation loop to maintain true constant-time lookup performance and avoid memory garbage collection spikes.
## 2024-06-25 - O(1) Match Validation for Fixed Entity Structures
**Learning:** Room entity logic often scales with generic arrays, introducing array allocations via `.filter()` and inner loop evaluations via `.every()`. However, matchmaking rooms in this app strictly cap at two users (`created_by` and `invited_user_id`). Validating these members using dynamic arrays generates redundant garbage collection spikes during frequent realtime callbacks.
**Action:** Always evaluate structural constraints before relying on generic array methods. If an entity is bounded to exactly 2 elements, replace array chaining with simple map/set direct property access or conditional evaluations to maintain strict O(1) processing without memory bloat.

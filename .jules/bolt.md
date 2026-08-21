## 2024-03-24 - Supabase Data Fetching Optimization
**Learning:** In applications using Supabase + React with real-time subscriptions, making DB queries in a loop (N+1 query problem) not only slows down the initial load but severely degrades performance on every realtime event, as the entire loop runs again.
**Action:** Always extract unique identifiers, batch DB queries using , and distribute the results locally rather than querying in loops.
## 2024-03-24 - Supabase Data Fetching Optimization
**Learning:** In applications using Supabase + React with real-time subscriptions, making DB queries in a loop (N+1 query problem) not only slows down the initial load but severely degrades performance on every realtime event, as the entire loop runs again.
**Action:** Always extract unique identifiers, batch DB queries using `.in('column', ids)`, and distribute the results locally rather than querying in loops.

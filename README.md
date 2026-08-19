<div align="center">
  <h1>🎬 CineMatch</h1>
  <p><strong>A Next.js Application for Live Movie Rating and Discovery</strong></p>
</div>

CineMatch is a modern, responsive web application that lets users discover and rate movies in real-time. Built with a focus on performance, user experience, and modern web development practices, it features seamless animations, Progressive Web App (PWA) capabilities, and a robust backend.

## ✨ Key Features

- **Live Movie Rating Deck:** A visually engaging, swipeable deck interface for rating movies, complete with fluid animations.
- **TMDB Integration:** Real-time fetching of comprehensive movie data, cast, and watch providers from The Movie Database (TMDB).
- **Modern UI/UX:** Features a sleek dark mode design with neon glow accents (`#bc96ff` and `#ff4365`), rounded pill buttons, and glassmorphic elements.
- **Progressive Web App (PWA):** Installable on mobile and desktop devices for a native-like experience.
- **Real-time Backend:** Powered by Supabase for secure authentication, database management, and real-time interactions.

## 🛠 Tech Stack

CineMatch is built using a modern, scalable technology stack:

- **Framework:** [Next.js (App Router)](https://nextjs.org/) - Utilizing Server Components and Server Actions for optimal performance.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) - For complex, physics-based UI animations.
- **Icons:** [Lucide React](https://lucide.dev/) - Beautiful, consistent icon set.
- **Backend as a Service:** [Supabase](https://supabase.com/) - PostgreSQL database, Authentication, and Edge Functions.
- **External API:** [TMDB API](https://developer.themoviedb.org/docs) - For rich movie metadata.
- **PWA Capabilities:** `@ducanh2912/next-pwa` - For seamless offline and installable web app support.

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js 18.x or later
- npm, pnpm, or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cinematch.git
   cd cinematch
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the following required environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # TMDB Configuration
   TMDB_API_KEY=your_tmdb_api_key
   # or
   TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

## 🏗 Architecture & Design Decisions

- **App Router & Server Components:** By leveraging Next.js App Router, the application minimizes client-side JavaScript, improving load times and SEO. Data fetching is optimized on the server side.
- **Component-Driven Design:** The UI is broken down into reusable, highly cohesive components (`MovieDeck`, `RatingSlider`, `MovieCast`) for maintainability.
- **Responsive & Accessible:** Designed mobile-first, ensuring a seamless experience across all device sizes. Attention is paid to interactive elements and visual hierarchy.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

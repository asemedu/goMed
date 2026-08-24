# goMed

A gamified first-aid and CPR training application utilizing client-side computer vision and augmented reality.

![goMed Banner](public/readme-banner.png)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0081C9?style=for-the-badge&logo=google&logoColor=white)

## Core Features

### Client-Side CPR Tracking
The application uses Google's MediaPipe Pose detection to provide real-time posture and rhythm tracking during CPR practice. The analysis runs entirely on the client's device using the web camera, tracking shoulder and wrist alignment to calculate compression depth and rate without network latency.

<!-- [INSERT IMAGE: CPR_HUD.png] -->

### Augmented Reality (AR) Integration
Users can project 3D anatomical models and CPR dummies into their physical environment using WebXR. These models provide spatial context and interactive learning points for complex medical procedures, accessed seamlessly from the browser.

<!-- [INSERT IMAGE: AR_Dummy.png] -->

### Multiplayer Challenge Lobbies
Educators can host synchronous, multiplayer quiz lobbies for classroom settings. Players join via QR codes and compete in real-time, with live leaderboards and immediate feedback synchronized across all connected clients.

<!-- [INSERT IMAGE: Lobby_Quiz_Screen.png] -->

### Gamification and Metrics
A comprehensive dashboard tracks user progress across modules. It features global leaderboards, continuous day streaks, and dynamic XP calculations based on interaction frequency and quiz accuracy.

<!-- [INSERT IMAGE: Dashboard.png] -->

## Technical Architecture

### Computer Vision (MediaPipe)
To ensure zero-latency feedback during life-saving practice simulations, pose detection is executed directly in the browser via WebAssembly. The `CameraMirrorView` component feeds frames to the MediaPipe API, calculating vector angles to ensure the practitioner's arms are locked and compressions maintain a steady 100-120 BPM rhythm.

### Real-time Synchronisation
Multiplayer lobbies utilize Supabase Realtime (WebSockets) to maintain state consistency across clients. Actions such as answering a question or advancing the lobby state are broadcast to all subscribers in the channel instantly, ensuring fair and synchronized gameplay.

### Database and Optimization
The application relies on a PostgreSQL backend hosted on Supabase. To handle complex ranking logic efficiently, the application uses custom SQL Remote Procedure Calls (RPCs). For example, the `get_leaderboard_context` RPC offloads the calculation of the 5-player global leaderboard window to the database, minimizing payload size and client-side processing.

### State Management and Caching
To maintain a highly responsive UI, the application employs aggressive client-side caching. Core data, such as the user's profile and accumulated XP, is cached in `localStorage`. This allows instant renders on app launch, which are subsequently reconciled in the background via Supabase queries.

## Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/asemedu/goMed.git
   cd goMed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Rename `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Expose for mobile testing (Optional)**
   Because the camera and WebXR APIs require a secure context (HTTPS) or localhost, use a tunneling service like ngrok to test on a physical mobile device:
   ```bash
   ngrok http 5173
   ```
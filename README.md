# HabitFlow — Premium Personal Habit Command Center

HabitFlow is a production-quality, cross-platform personal habit tracking command center built with React, TypeScript, Vite, Tailwind CSS, and Cloud Firestore. It is designed to work seamlessly across Desktop PCs, tablets, iPhones, and Android devices as an installable Progressive Web App (PWA).

## Features

- **Futuristic Personal Command Center**: Cinematic dark mode (#080B12, #101522, #141B2B) with neon accents (#7C5CFC, #36C5F0, #35D49A, #FFB454), glassmorphism, and accessible contrast. Clean Light mode toggle included.
- **Authentication**:
  - Google OAuth Sign-in (`signInWithPopup`).
  - Email and password registration, login, and password reset.
  - First-time callsign, goal selection, and starter habit onboarding flow.
  - Persistent auth sessions.
- **Real Habit Tracking**:
  - **Binary habits**: Yes/no routine completions with celebration sound and confetti.
  - **Measurable habits**: Daily targets with units (minutes, pages, reps, km) and quick-increment buttons.
  - Atomic daily completion records preventing duplication (`{habitId}_{dateKey}`).
  - Historical inspection via date navigator.
- **Intelligent Streak Calculations**:
  - Respects custom frequency schedules (`daily`, `custom_days`, `weekly_target`).
  - Unscheduled days never break a streak.
  - Future days never count as missed.
  - Safe historical corrections without corrupting streak math.
- **Monthly Interactive Calendar**:
  - Color-coded daily completion percentages (100% emerald, 50-99% purple, 1-49% cyan, 0% missed).
  - Filter by individual habit or view all active routines.
  - Historical habit inspection and inline completion toggle.
- **Telemetry & Analytics**:
  - 7-day, 30-day, and 90-day interactive velocity charts (Recharts).
  - Comparison with previous period (completion rate delta).
  - Category performance breakdowns.
  - Most and least consistent routine rankings.
  - Total focused minutes and hours invested.
- **Daily Review & Notes Journal**:
  - 5-question evening debrief template (Completed, Learned, Wins, Distractions, Tomorrow's Priority).
  - Autosave indicator and private Firestore synchronization.
  - Tagging, categories, search, edit, and deletion.
- **Reminders & Push Notifications**:
  - Timed in-app alert banner with one-tap completion check.
  - Browser notification permission integration.
  - Detailed architectural guide for Firebase Cloud Messaging (FCM) background delivery when closed.
- **Data Governance & PWA**:
  - JSON full database backup export.
  - Account and data deletion flow.
  - PWA install button with automatic standalone mode detection and iOS Safari guide.
  - Non-intrusive offline connectivity banner.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend & Auth**: Firebase Authentication + Cloud Firestore
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Dates**: date-fns
- **Effects**: canvas-confetti, Web Audio API synthesizer
- **PWA**: vite-plugin-pwa

## Firestore Security Rules

Hardened security rules are provided in `firestore.rules` and intermediate representation in `firebase-blueprint.json`. Users can only read and write their own documents under `/users/{userId}/...`.

### Deploying Firestore Security Rules

To deploy the rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

## Deploying to Vercel

When deploying HabitFlow to Vercel (e.g. `habitflow-delta-eight.vercel.app`):

1. **Add Authorized Domain to Firebase Authentication**:
   - Open [Firebase Console Authentication Settings](https://console.firebase.google.com/project/inspired-tape-pg02f/authentication/settings).
   - Under the **Authorized domains** section, click **Add domain**.
   - Enter `habitflow-delta-eight.vercel.app` (without `https://` or trailing slashes).
   - Click **Save**.
   *(This enables Google OAuth and Firebase Auth on your Vercel deployment)*.

2. **Vercel Environment Variables (Optional)**:
   The repository already includes `firebase-applet-config.json`. If you prefer using environment variables in your Vercel project settings, configure:
   - `VITE_FIREBASE_PROJECT_ID`: `inspired-tape-pg02f`
   - `VITE_FIREBASE_APP_ID`: `1:35036960489:web:e1aaa7912df9c89fb04278`
   - `VITE_FIREBASE_API_KEY`: `AIzaSyB976HsyzV-d7tVeiIrnuLkxYMZHn3u0eE`
   - `VITE_FIREBASE_AUTH_DOMAIN`: `inspired-tape-pg02f.firebaseapp.com`
   - `VITE_FIREBASE_DATABASE_ID`: `ai-studio-habitflow-934b7fce-f9e3-4b32-8a3f-7c1697ea238e`
   - `VITE_FIREBASE_STORAGE_BUCKET`: `inspired-tape-pg02f.firebasestorage.app`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: `35036960489`

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

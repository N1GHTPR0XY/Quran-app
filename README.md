# Tadreeb • تدريب
### Quran Memorization & Recitation Training with Gentle Real-Time Acoustic Feedback

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synthesizer_DSP-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**Tadreeb** (Arabic: *تدريب*, meaning "disciplined training") is a Quran memorization and recitation application engineered to compete with the highest-rated educational apps on the Google Play Store. 

Instead of traditional, passive audio players or punitive flashcard quizzers, Tadreeb provides an active, voice-driven recitation experience: **the user recites aloud from memory**, and the app listens in real time, following along word by word. When a mistake occurs—a wrong harakah, a mispronounced letter, a skipped or repeated word, or a tajweed slip—it stops gently, highlights the exact syllable, plays the correct pronunciation, and allows the reciter to retry the phrase with dignity and focus.

---

## Key Features

### 🎙️ 1. Real-Time Memory Recitation
* **Active Voice Listening**: Recite from memory without glancing at the text, or enable assistive peek modes.
* **Synchronized Word-by-Word Tracking**: Real-time acoustic phoneme matching with visual illumination on each spoken word.
* **Tajweed Annotation Badges**: Interactive indicators highlighting rules such as *Ghunnah*, *Qalqalah*, *Ikhfa*, *Idgham*, *Madd*, and *Iqlab*.

### 🕊️ 2. Gentle, Non-Punitive Correction Engine
* **Zero Failure Penalty States**: Replaces harsh crimson buzzers with meditative 432 Hz warm harmonic pause chimes.
* **Syllable-Level Diagnosis**: Pinpoints whether a slip was a wrong harakah, mispronounced letter, skipped word, or tajweed rule error.
* **Instant Model Pronunciation**: Replays authentic reference audio for the exact mistake token at calibrated speeds (0.75x–1.0x).
* **Recovery Phrase Loop**: Lets the reciter comfortably re-articulate the phrase before resuming seamless flow.

### 📊 3. Hifz Progress Analytics & Spaced Repetition
* **Retention Curves**: Tracks verse mastery levels across new memorization (*Jadeed*), near revision (*Qareeb*), and far revision (*Baeed*).
* **Daily Goal & Streak Tracking**: Daily target minutes, ayah quotas, and consistency flame indicators.
* **Mistake Review Vault**: Dedicated review screen cataloging recent slips with filters for tajweed categories, review count, and mastery status.

### 📖 4. Surah Library & Wird Planner
* Complete library indexing Surahs across Juz 1 to 30, with metadata on revelation type (Makki / Madani), ayah count, and memorization progress bars.
* Search and filter by Juz, recitation difficulty, and retention health.

### 🎧 5. Multi-Layer Audio Architecture
* **Dynamic Layer Ducking**: Reference qari audio gain attenuates exponentially by 85% during corrections to maintain acoustic clarity.
* **Synthesized DSP Chimes**: Pure Web Audio API oscillators producing warm harmonic triads (432 Hz pause tone, 528 Hz affirmation chord).
* **Customizable Audio Calibration**: Fine-tune microphone sensitivity, strictness thresholds, pause detection delay, and background ambient sanctuary soundscapes.

### 🔐 6. Authentication & Account Merging
* **Sign-in & Sign-up**: Full support for Google Identity, Apple Sign-In, and Email/Password with verification flows.
* **Continue as Guest (Offline First)**: Recite immediately with local IndexedDB/localStorage storage. When ready, merge existing streaks and memorized ayahs into a permanent cloud account without data loss.

### 🌐 7. Complete Bilingual Interface (Arabic RTL & English LTR)
* Native Right-to-Left (RTL) layout switching with Arabic typography honoring Amiri and Scheherazade New typefaces.
* Natural typographic line height scaling (2.4x) ensuring harakat, shaddah, and sukoon never collide.

---

## Clean Minimalism Design System

The application follows the **Clean Minimalism** design philosophy, reflecting the quiet elegance of classical illuminated Quranic manuscripts:

| Token Name | Hex Value | Primary Usage |
| :--- | :---: | :--- |
| **Clean Linen Canvas** | `#FDFBF7` | Light mode background surface |
| **Warm Sand Border** | `#E8E2D6` | Subtle borders, dividers, and card outlines |
| **Heritage Deep Teal** | `#1A4D4E` | Primary buttons, headers, active tracking |
| **Warm Ochre Gold** | `#C5A059` | Rosettes, streak flames, interactive accents |
| **Soft Terracotta** | `#D96E54` | Gentle mistake highlight (non-punitive) |
| **Sage Emerald** | `#2E7D5A` | Ayah mastery affirmations and completion badges |
| **Dark Sanctuary** | `#122021` | Dark mode background canvas |
| **Illuminated Teal** | `#27827E` | Dark mode primary CTA and headers |

---

## Tech Stack

* **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 6](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Motion & Micro-interactions**: [Motion](https://motion.dev/)
* **Iconography**: [Lucide React](https://lucide.dev/)
* **Celebration Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
* **Audio DSP Engine**: Native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (dual oscillators, gain ramps, dynamic biquad filtering)

---

## Project Structure

```
tadreeb/
├── public/                     # Static assets and favicons
├── src/
│   ├── components/
│   │   ├── Navigation.tsx      # Responsive desktop/mobile navigation bar
│   │   └── screens/
│   │       ├── AudioSettingsScreen.tsx     # DSP tuning, chime preview & strictness
│   │       ├── AuthScreen.tsx              # Google, Apple, email auth & guest linking
│   │       ├── CorrectionOverlay.tsx       # Syllable correction & audio playback modal
│   │       ├── DashboardScreen.tsx         # Daily wird, streak tracker, quick start
│   │       ├── DesignSystemDocScreen.tsx   # Visual specification & design token docs
│   │       ├── LiveRecitationScreen.tsx    # Core voice-driven recitation interface
│   │       ├── MistakeReviewScreen.tsx     # Categorized mistake vault & retry drill
│   │       ├── OnboardingScreen.tsx        # Goal setup, pace selection & acoustic test
│   │       ├── ProfileSettingsScreen.tsx   # Account data, hifz targets & preferences
│   │       ├── ProgressAnalyticsScreen.tsx # Retention heatmaps & pace charts
│   │       └── SurahLibraryScreen.tsx      # Surah selector with Juz filters
│   ├── data/
│   │   └── quranData.ts        # Surah metadata, verses, transliteration & rules
│   ├── services/
│   │   └── audioEngine.ts      # Web Audio synthesizer, chime generators, ducking
│   ├── types/
│   │   └── index.ts            # TypeScript definitions for profiles, mistakes, Surahs
│   ├── App.tsx                 # Root application state and navigation controller
│   ├── index.css               # Tailwind CSS v4 setup and Islamic pattern layers
│   └── main.tsx                # React DOM entry point
├── index.html                  # HTML entry point with Amiri & Plus Jakarta Sans fonts
├── metadata.json               # Application metadata and permissions
├── package.json                # Dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite configuration
```

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
* npm, pnpm, or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tadreeb.git
   cd tadreeb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

4. **Type-check and lint:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled production assets will be output to the `dist/` directory.

---

## Microphone Permissions

To experience the live recitation feature:
* Grant browser microphone access when prompted.
* Tadreeb processes audio locally within the browser sandbox using the Web Audio API.

---

## Contributing

Contributions, feedback, and suggestions are welcome! Feel free to:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/tajweed-enhancement`).
3. Commit your changes (`git commit -m 'Add new Tajweed rule explanation'`).
4. Push to your branch (`git push origin feature/tajweed-enhancement`).
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).

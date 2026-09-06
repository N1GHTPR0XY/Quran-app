export type ThemeMode = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

export type ScreenId =
  | 'dashboard'
  | 'library'
  | 'recitation'
  | 'review'
  | 'analytics'
  | 'audio-settings'
  | 'profile'
  | 'onboarding'
  | 'auth'
  | 'design-system';

export type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password' | 'verify-email' | 'link-account';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  avatarUrl?: string;
  connectedMethods: ('google' | 'apple' | 'email')[];
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncedAt: string;
  totalMemorizedAyahs: number;
  currentStreak: number;
  dailyGoalMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'hafiz';
}

export interface TajweedMistake {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  wordIndex: number;
  wordArabic: string;
  expectedRecitation: string;
  userRecitation: string;
  mistakeType: 'wrong_harakah' | 'mispronounced_letter' | 'skipped_word' | 'repeated_word' | 'tajweed_slip';
  tajweedRule?: 'Ghunnah' | 'Qalqalah' | 'Ikhfa' | 'Idgham' | 'Madd' | 'Iqlab';
  explanation: string;
  timestamp: string;
  mastered: boolean;
  reviewedCount: number;
}

export interface WordToken {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  hasTajweedRule?: boolean;
  tajweedRuleName?: string;
}

export interface AyahData {
  number: number;
  numberInSurah: number;
  arabic: string;
  translation: string;
  words: WordToken[];
  audioUrl?: string;
}

export interface SurahData {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  juzNumber: number;
  pageNumber: number;
  memorizationProgress: number; // 0 - 100
  isDownloaded: boolean;
  downloadSizeMb: number;
  lastPracticed?: string;
  ayahs: AyahData[];
}

export interface AudioSettings {
  reciterId: string;
  reciterName: string;
  guidanceVoiceGender: 'female' | 'male';
  guidanceVoiceTone: 'warm' | 'instructional' | 'reflective';
  guidanceVoiceSpeed: number; // 0.75 to 1.25
  tajweedStrictness: 'lenient' | 'standard' | 'strict';
  correctionToneVolume: number; // 0 - 1
  reciterAudioVolume: number; // 0 - 1
  autoPlayCorrection: boolean;
  pauseDurationBeforeCorrectionMs: number;
  duckingLevel: number; // 0 to 1
  soundEffectsEnabled: boolean;
  offlineAudioQuality: 'standard' | 'high';
}

export interface GoalSettings {
  dailyAyahTarget: number;
  dailyMinutes: number;
  targetCompletionDate: string;
  preferredPracticeTime: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'night';
  reminderEnabled: boolean;
  primaryPace: 'steady' | 'accelerated' | 'intensive';
}

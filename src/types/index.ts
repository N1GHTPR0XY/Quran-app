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
  masteredSurahIds?: number[];
  unlockedBadgeIds?: string[];
}

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'streak' | 'mastery' | 'tajweed' | 'volume' | 'dedication';

export interface AchievementBadge {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  descriptionArabic: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  iconName: 'flame' | 'trophy' | 'award' | 'book-open' | 'check-circle' | 'sparkles' | 'crown' | 'star' | 'shield' | 'target';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  unit: string;
  unitArabic: string;
  hadithOrSpiritualNote?: string;
  hadithOrSpiritualNoteArabic?: string;
  rewardPoints: number;
}

export interface HarakahDetail {
  harf: string;
  harfNameArabic: string;
  harfNameEnglish: string;
  expectedHarakah: 'kasrah' | 'dammah' | 'fathah' | 'sukoon';
  actualHarakah: 'kasrah' | 'dammah' | 'fathah' | 'sukoon';
  expectedArabicLetter: string;
  actualArabicLetter: string;
  expectedWord: string;
  actualWord: string;
  phoneticExpected: string;
  phoneticActual: string;
  tajweedCategory: string;
  mouthShapeTip: string;
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
  harakahDetail?: HarakahDetail;
  userAudioBlobUrl?: string;
  referenceAudioUrl?: string;
  reciterId?: string;
  reciterName?: string;
  recordingDurationSeconds?: number;
}

export interface ReciterInfo {
  id: string;
  name: string;
  style: string;
  clarity: string;
  speed: string;
  gender: 'male' | 'female';
  subfolder?: string;
  country?: string;
}

export interface AcousticMetric {
  name: string;
  nameArabic: string;
  userScore: number; // 0 - 100
  targetScore: number;
  userValueText: string;
  targetValueText: string;
  category: 'pitch' | 'duration' | 'formants' | 'ghunnah' | 'pacing';
  status: 'optimal' | 'acceptable' | 'needs_adjustment';
  feedback: string;
  feedbackArabic: string;
}

export interface FormantDataPoint {
  label: string;
  labelArabic: string;
  userHz: number;
  targetHz: number;
  differenceHz: number;
  explanation: string;
  explanationArabic: string;
}

export interface VoiceCompareReport {
  id: string;
  mistakeId: string;
  generatedAt: string;
  overallMatchPercentage: number;
  scholarName: string;
  scholarGender: 'male' | 'female';
  wordArabic: string;
  ayahReference: string;
  metrics: AcousticMetric[];
  formants: FormantDataPoint[];
  spectrogramPoints: {
    timeMs: number;
    userAmplitude: number;
    scholarAmplitude: number;
    isDiscrepancy: boolean;
  }[];
  keyRecommendations: {
    title: string;
    titleArabic: string;
    description: string;
    descriptionArabic: string;
    actionType: 'jaw_aperture' | 'tongue_elevation' | 'tempo' | 'nasal_resonance';
  }[];
  badgeProgressImpact?: {
    badgeId: string;
    badgeTitle: string;
    pointsEarned: number;
  };
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

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
  | 'auth';

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
  ayahTextArabic?: string;
  wordIndex: number;
  wordArabic: string;
  expectedRecitation: string;
  userRecitation: string;
  mistakeType: 'wrong_harakah' | 'mispronounced_letter' | 'skipped_word' | 'repeated_word' | 'wrong_word' | 'tajweed_slip';
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
  pitchContour?: {
    timeMs: number;
    userPitchHz: number;
    scholarPitchHz: number;
    diffHz: number;
  }[];
  jitterPercentage?: number;
  shimmerPercentage?: number;
  harmonicToNoiseDb?: number;
  makhrajPrecision?: {
    area: string;
    areaArabic: string;
    score: number;
    status: 'optimal' | 'slight_deviation' | 'needs_adjustment';
    note: string;
    noteArabic: string;
  }[];
  dynamicRangeDb?: {
    userMin: number;
    userMax: number;
    scholarMin: number;
    scholarMax: number;
  };
  historicalComparison?: {
    previousScore: number;
    deltaScore: number;
    improvementSummary: string;
    improvementSummaryArabic: string;
  };
  userAudioUrl?: string;
  referenceAudioUrl?: string;
  userDuration?: number;
  scholarDuration?: number;
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
  guidanceVoiceLanguage?: 'ar' | 'en'; // Spoken coach & prompt language ('ar' for Arabic speaker, 'en' for English speaker)
  speakerLanguage?: 'ar' | 'en'; // Selected speaker language for recitation prompts
  beginRecitationPromptEnabled?: boolean; // Whether the speaker announces "Begin recitation" / "ابدأ التلاوة" when mic activates
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

export interface RecitationHangState {
  active: boolean;
  reason: 'mistake' | 'forgotten_ayah' | 'hesitation';
  ayahNumber: number;
  wordIndex: number;
  wordArabic: string;
  wordTransliteration: string;
  letterHint?: string;
  letterName?: string;
  highlightLetter?: string;
  explanation: string;
  isRepeatingAudio: boolean;
  repeatCount: number;
  mistakeRecord?: TajweedMistake | null;
}

export interface SurahCompletionCertificate {
  id: string;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  surahTranslation: string;
  numberOfAyahs: number;
  juzNumber: number;
  revelationType: 'Meccan' | 'Medinan';
  studentName: string;
  accuracyPercentage: number; // e.g. 98.6
  harakatAccuracy: number; // e.g. 100
  tajweedAccuracy: number; // e.g. 97.8
  grade: 'Mumtaz (Highest Distinction)' | 'Jayyid Jiddan (Very Good)' | 'Jayyid (Good)';
  gradeArabic: 'مُمْتَاز مع مرتبة الشرف' | 'جَيِّد جِدّاً' | 'جَيِّد';
  riwayah: string; // e.g. "حفص عن عاصم من طريق الشاطبية"
  riwayahEnglish: string; // "Hafs 'an 'Asim via Shatibiyyah"
  completedAt: string; // Formatted date string
  completedDateIso: string;
  certificateSerialNumber: string; // e.g. "TDRB-2026-SRH001-9842"
  verifiedBy: string;
  verifiedByArabic: string;
  scholarBenchmark: string;
}

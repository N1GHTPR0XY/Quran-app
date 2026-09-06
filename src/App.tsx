import React, { useState, useEffect } from 'react';
import {
  ScreenId,
  ThemeMode,
  Direction,
  UserProfile,
  AudioSettings,
  SurahData,
  TajweedMistake,
  GoalSettings
} from './types';
import { POPULAR_SURAHS, INITIAL_MISTAKES_REVIEW } from './data/quranData';
import { Navigation } from './components/Navigation';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { SurahLibraryScreen } from './components/screens/SurahLibraryScreen';
import { LiveRecitationScreen } from './components/screens/LiveRecitationScreen';
import { MistakeReviewScreen } from './components/screens/MistakeReviewScreen';
import { ProgressAnalyticsScreen } from './components/screens/ProgressAnalyticsScreen';
import { AudioSettingsScreen } from './components/screens/AudioSettingsScreen';
import { ProfileSettingsScreen } from './components/screens/ProfileSettingsScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { DesignSystemDocScreen } from './components/screens/DesignSystemDocScreen';
import { AuthScreen } from './components/screens/AuthScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [direction, setDirection] = useState<Direction>('ltr');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Active User Profile (Defaults to Guest initially to let user test both guest & linked flows)
  const [user, setUser] = useState<UserProfile>({
    id: 'guest_1048',
    name: 'Zaid (Guest)',
    email: '',
    isGuest: true,
    connectedMethods: [],
    cloudSyncStatus: 'offline',
    lastSyncedAt: 'Local device only',
    totalMemorizedAyahs: 14,
    currentStreak: 14,
    dailyGoalMinutes: 15,
    level: 'intermediate'
  });

  // Audio Configuration
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    reciterId: 'alafasy',
    reciterName: 'Mishary Rashid Alafasy',
    guidanceVoiceGender: 'female',
    guidanceVoiceTone: 'warm',
    guidanceVoiceSpeed: 0.95,
    tajweedStrictness: 'standard',
    correctionToneVolume: 0.8,
    reciterAudioVolume: 0.9,
    autoPlayCorrection: true,
    pauseDurationBeforeCorrectionMs: 600,
    duckingLevel: 0.15,
    soundEffectsEnabled: true,
    offlineAudioQuality: 'high'
  });

  // Active Surah for Recitation
  const [selectedSurah, setSelectedSurah] = useState<SurahData>(POPULAR_SURAHS[0]);

  // Mistakes for Review Queue
  const [mistakes, setMistakes] = useState<TajweedMistake[]>(INITIAL_MISTAKES_REVIEW);

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync direction with document attribute
  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', direction === 'rtl' ? 'ar' : 'en');
  }, [direction]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleDirection = () => {
    setDirection(prev => (prev === 'rtl' ? 'ltr' : 'rtl'));
  };

  const handleRecordMistake = (newMistake: TajweedMistake) => {
    setMistakes(prev => [newMistake, ...prev]);
  };

  const handleMarkMastered = (id: string) => {
    setMistakes(prev => prev.map(m => (m.id === id ? { ...m, mastered: true } : m)));
  };

  const handleAuthSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setShowAuthModal(false);
  };

  const handleOnboardingComplete = (goals: GoalSettings) => {
    setUser(prev => ({
      ...prev,
      dailyGoalMinutes: goals.dailyMinutes
    }));
    setCurrentScreen('dashboard');
  };

  return (
    <div className={`min-h-screen bg-[#FDFBF7] dark:bg-[#0E1A1A] text-[#1A4D4E] dark:text-[#E8ECE9] font-latin transition-colors`}>
      {/* Top Header & Sticky Navigation */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={screen => setCurrentScreen(screen)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        direction={direction}
        onToggleDirection={handleToggleDirection}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Screen Views */}
      <main className="relative">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            user={user}
            direction={direction}
            onNavigate={setCurrentScreen}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {currentScreen === 'library' && (
          <SurahLibraryScreen
            direction={direction}
            onSelectSurah={surah => {
              setSelectedSurah(surah);
              setCurrentScreen('recitation');
            }}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'recitation' && (
          <LiveRecitationScreen
            surah={selectedSurah}
            audioSettings={audioSettings}
            direction={direction}
            onNavigate={setCurrentScreen}
            onRecordMistake={handleRecordMistake}
            onSelectSurah={setSelectedSurah}
          />
        )}

        {currentScreen === 'review' && (
          <MistakeReviewScreen
            mistakes={mistakes}
            audioSettings={audioSettings}
            direction={direction}
            onNavigate={setCurrentScreen}
            onMarkMastered={handleMarkMastered}
          />
        )}

        {currentScreen === 'analytics' && (
          <ProgressAnalyticsScreen
            user={user}
            direction={direction}
            mistakes={mistakes}
          />
        )}

        {currentScreen === 'audio-settings' && (
          <AudioSettingsScreen
            settings={audioSettings}
            onUpdateSettings={setAudioSettings}
            direction={direction}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileSettingsScreen
            user={user}
            onUpdateUser={updates => setUser(prev => ({ ...prev, ...updates }))}
            direction={direction}
            onOpenAuth={() => setShowAuthModal(true)}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            direction={direction}
          />
        )}

        {currentScreen === 'design-system' && (
          <DesignSystemDocScreen
            direction={direction}
          />
        )}
      </main>

      {/* Authentication Modal / Account Linking Flow */}
      {showAuthModal && (
        <AuthScreen
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          direction={direction}
          isGuestUser={user.isGuest}
        />
      )}
    </div>
  );
}

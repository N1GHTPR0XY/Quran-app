import React, { useState, useEffect, useCallback } from 'react';
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
import { auth, onAuthStateChanged } from './services/firebase';
import { userCloudService } from './services/userCloudService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    try {
      const isAuthed = localStorage.getItem('tadreeb_authenticated');
      if (isAuthed === 'true') {
        return 'dashboard';
      }
    } catch {
      // fallback
    }
    return 'auth';
  });
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [direction, setDirection] = useState<Direction>('ltr');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Active User Profile (Window-isolated guest profile by default)
  const [user, setUser] = useState<UserProfile>(() => userCloudService.createGuestProfileForWindow());

  // Audio Configuration
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    reciterId: 'alafasy',
    reciterName: 'Mishary Rashid Alafasy',
    guidanceVoiceGender: 'female',
    guidanceVoiceTone: 'warm',
    guidanceVoiceSpeed: 0.95,
    guidanceVoiceLanguage: 'ar',
    speakerLanguage: 'ar',
    beginRecitationPromptEnabled: true,
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

  // Real-time Cloud Synchronization & Auth Listener
  useEffect(() => {
    let unsubscribeMistakes: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const cloudProfile = await userCloudService.loadOrCreateUserProfile(
            firebaseUser.uid,
            firebaseUser.displayName || undefined,
            firebaseUser.email || undefined
          );
          if (firebaseUser.photoURL) {
            cloudProfile.avatarUrl = firebaseUser.photoURL;
          }
          setUser(cloudProfile);

          // Subscribe to cloud mistakes for this user
          if (unsubscribeMistakes) unsubscribeMistakes();
          unsubscribeMistakes = userCloudService.subscribeToMistakes(firebaseUser.uid, (cloudMistakes) => {
            setMistakes(cloudMistakes);
          });
        } catch (err) {
          console.error('[App] Failed to load cloud profile:', err);
        }
      } else {
        // Fallback to window-isolated guest session
        const guest = userCloudService.createGuestProfileForWindow();
        setUser(guest);
        if (unsubscribeMistakes) unsubscribeMistakes();
        unsubscribeMistakes = userCloudService.subscribeToMistakes(guest.id, (localMistakes) => {
          setMistakes(localMistakes);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMistakes) unsubscribeMistakes();
    };
  }, []);

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

  const handleRecordMistake = useCallback((newMistake: TajweedMistake) => {
    setMistakes(prev => [newMistake, ...prev]);
    userCloudService.saveMistakeToCloud(user.id, newMistake).catch(err => {
      console.warn('Mistake save notice:', err);
    });
  }, [user.id]);

  const handleMarkMastered = useCallback((id: string) => {
    setMistakes(prev => prev.map(m => (m.id === id ? { ...m, mastered: true } : m)));
    userCloudService.markMistakeMastered(user.id, id).catch(err => {
      console.warn('Mistake mark mastered notice:', err);
    });
  }, [user.id]);

  const handleUpdateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      userCloudService.saveUserProfileToCloud(updated).catch(err => {
        console.warn('User profile cloud save notice:', err);
      });
      return updated;
    });
  }, []);

  const handleAuthSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('tadreeb_authenticated', 'true');
    } catch {
      // ignore
    }
    setShowAuthModal(false);
    if (currentScreen === 'auth') {
      setCurrentScreen('dashboard');
    }
  };

  const handleSignOut = useCallback(() => {
    try {
      localStorage.removeItem('tadreeb_authenticated');
    } catch {
      // ignore
    }
    const guest = userCloudService.createGuestProfileForWindow();
    setUser(guest);
    setCurrentScreen('auth');
  }, []);

  const handleOnboardingComplete = (goals: GoalSettings) => {
    handleUpdateUser({ dailyGoalMinutes: goals.dailyMinutes });
    setCurrentScreen('dashboard');
  };

  return (
    <div className={`min-h-screen bg-[#FDFBF7] dark:bg-[#0E1A1A] text-[#1A4D4E] dark:text-[#E8ECE9] font-latin transition-colors`}>
      {/* Top Header & Sticky Navigation (Hidden on Login Screen) */}
      {currentScreen !== 'auth' && (
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
      )}

      {/* Main Screen Views */}
      <main className="relative">
        {currentScreen === 'auth' && (
          <AuthScreen
            isFullScreen={true}
            onSuccess={handleAuthSuccess}
            direction={direction}
            onToggleDirection={handleToggleDirection}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            isGuestUser={user.isGuest}
          />
        )}

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
            onUpdateAudioSettings={setAudioSettings}
            direction={direction}
            onToggleDirection={handleToggleDirection}
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
            onUpdateUser={handleUpdateUser}
            direction={direction}
            onOpenAuth={() => setShowAuthModal(true)}
            onNavigate={setCurrentScreen}
            onSignOut={handleSignOut}
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

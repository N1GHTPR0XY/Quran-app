import React from 'react';
import { ScreenId, ThemeMode, Direction, UserProfile } from '../types';
import {
  Home,
  BookOpen,
  Mic,
  RotateCcw,
  BarChart2,
  Sliders,
  User,
  Sun,
  Moon,
  Languages,
  ShieldCheck
} from 'lucide-react';

interface NavigationProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  direction: Direction;
  onToggleDirection: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  theme,
  onToggleTheme,
  direction,
  onToggleDirection,
  user,
  onOpenAuth
}) => {
  const navItems: { id: ScreenId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: direction === 'rtl' ? 'الرئيسية' : 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'library', label: direction === 'rtl' ? 'المصحف' : 'Library', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'recitation', label: direction === 'rtl' ? 'التسميع' : 'Recite', icon: <Mic className="w-5 h-5" /> },
    { id: 'review', label: direction === 'rtl' ? 'المراجعة' : 'Review', icon: <RotateCcw className="w-5 h-5" />, badge: '3' },
    { id: 'analytics', label: direction === 'rtl' ? 'الإحصاء' : 'Progress', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'audio-settings', label: direction === 'rtl' ? 'الصوت' : 'Audio', icon: <Sliders className="w-5 h-5" /> },
    { id: 'profile', label: direction === 'rtl' ? 'الحساب' : 'Account', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Top Utility Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FDFBF7]/90 dark:bg-[#0E1A1A]/90 border-b border-[#E8E2D6] dark:border-[#232E2F] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-9 h-9 border-2 border-[#C5A059] rounded-lg flex items-center justify-center transform rotate-45 shadow-sm bg-[#FDFBF7] dark:bg-[#122021] mx-1">
              <span className="transform -rotate-45 font-arabic text-[#1A4D4E] dark:text-[#C5A059] text-xl font-bold leading-none select-none">ت</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arabic text-xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">تَدْرِيب</span>
                <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Tadreeb</span>
              </div>
              <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] hidden sm:block">
                Quran Memorization & Real-Time Acoustic Trainer
              </p>
            </div>
          </div>

          {/* Quick Controls & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guest Banner Badge / Account */}
            {user.isGuest ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F5F2ED] dark:bg-[#172526] text-[#1A4D4E] dark:text-[#C5A059] border border-[#E8E2D6] dark:border-[#232E2F] hover:bg-[#EAE5DC] dark:hover:bg-[#1E3032] transition-all cursor-pointer"
                title="Guest Mode: Click to link Google or Apple account to preserve data"
              >
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                <span>{direction === 'rtl' ? 'وضع الضيف • ربط الحساب' : 'Guest Mode • Link Account'}</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] border border-[#C2DBCB]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1A4D4E] dark:text-[#72D6A5]" />
                <span>{user.name.split(' ')[0]}</span>
              </div>
            )}

            {/* Language Selector (Arabic / English) */}
            <div className="flex items-center bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] rounded-xl p-0.5 text-xs font-semibold">
              <button
                onClick={() => {
                  if (direction !== 'rtl') onToggleDirection();
                }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  direction === 'rtl'
                    ? 'bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] shadow-xs'
                    : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9]'
                }`}
                title="التبديل إلى العربية"
                aria-label="Switch to Arabic"
              >
                <span>عربي</span>
              </button>
              <button
                onClick={() => {
                  if (direction !== 'ltr') onToggleDirection();
                }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  direction === 'ltr'
                    ? 'bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] shadow-xs'
                    : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9]'
                }`}
                title="Switch to English"
                aria-label="Switch to English"
              >
                <span>EN</span>
              </button>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-[#5F6E6C] dark:text-[#A6B2AF] hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors border border-transparent hover:border-[#E8E2D6] dark:hover:border-[#232E2F] cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle light/dark theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#C5A059]" /> : <Moon className="w-4 h-4 text-[#1A4D4E]" />}
            </button>

            {/* Quick Live Recitation Launch */}
            {currentScreen !== 'recitation' && (
              <button
                onClick={() => onNavigate('recitation')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A4D4E] dark:bg-[#27827E] text-white text-xs font-semibold hover:bg-[#153e3f] dark:hover:bg-[#21706D] transition-all shadow-sm cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#C5A059]" />
                <span>{direction === 'rtl' ? 'بدء التسميع' : 'Start Reciting'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Sticky Mobile/Desktop Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 dark:bg-[#0E1A1A]/95 backdrop-blur-lg border-t border-[#E8E2D6] dark:border-[#232E2F] px-2 py-1.5 transition-colors">
        <nav className="max-w-3xl mx-auto flex items-center justify-around">
          {navItems.map(item => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#1A4D4E] dark:text-[#C5A059] font-semibold'
                    : 'text-[#6F7D7B] dark:text-[#8E9B98] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9]'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#D96E54] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[#C5A059]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

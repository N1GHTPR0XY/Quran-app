import React, { useState } from 'react';
import { AchievementBadge, Direction, UserProfile, TajweedMistake } from '../../types';
import { achievementService } from '../../services/achievementService';
import { audioEngine } from '../../services/audioEngine';
import { BadgeDetailModal } from './BadgeDetailModal';
import {
  Award,
  Trophy,
  Flame,
  Crown,
  BookOpen,
  Sparkles,
  Shield,
  Star,
  Target,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Medal,
  Check,
  Zap,
  Info
} from 'lucide-react';

interface AchievementsSectionProps {
  user: UserProfile;
  mistakes?: TajweedMistake[];
  direction: Direction;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  user,
  mistakes,
  direction
}) => {
  const isRtl = direction === 'rtl';

  const [badges, setBadges] = useState<AchievementBadge[]>(() =>
    achievementService.getBadgesForUser(user, mistakes)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const summary = achievementService.getAchievementSummary(badges);

  const handleToggleUnlock = (badgeId: string) => {
    const updated = achievementService.toggleBadgeUnlock(badgeId);
    setBadges(updated);
    const target = updated.find(b => b.id === badgeId);
    if (target) {
      setSelectedBadge(target);
      if (target.unlocked) {
        showToast(
          isRtl
            ? `مبروك! تم فتح وسام: ${target.titleArabic}`
            : `Unlocked: ${target.title} (+${target.rewardPoints} XP)!`
        );
      }
    }
  };

  const handleSimulateSurahMastered = () => {
    const { badge, isNew } = achievementService.unlockBadge('surah_mastered');
    if (badge) {
      audioEngine.playSuccessChime();
      setBadges(achievementService.getBadgesForUser(user, mistakes));
      showToast(
        isRtl
          ? 'مبروك! أتممت حفظ وتسميع سورة كاملة بنجاح (وسام خاتم السورة)'
          : 'Achievement Unlocked: Surah Mastered! Full chapter completed!'
      );
    }
  };

  const handleSimulateConsistentReciter = () => {
    const { badge } = achievementService.unlockBadge('consistent_reciter_7d');
    if (badge) {
      audioEngine.playSuccessChime();
      setBadges(achievementService.getBadgesForUser(user, mistakes));
      showToast(
        isRtl
          ? 'مبروك! واظبت على 7 أيام تلاوة متتالية (وسام المداوم على التلاوة)'
          : 'Achievement Unlocked: Consistent Reciter (7-Day Streak)!'
      );
    }
  };

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  const filteredBadges = badges.filter(badge => {
    if (statusFilter === 'unlocked' && !badge.unlocked) return false;
    if (statusFilter === 'locked' && badge.unlocked) return false;
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    return true;
  });

  const renderIcon = (name: string, className = 'w-6 h-6') => {
    switch (name) {
      case 'flame':
        return <Flame className={className} />;
      case 'trophy':
        return <Trophy className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'book-open':
        return <BookOpen className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'star':
        return <Star className={className} />;
      case 'target':
        return <Target className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'diamond':
        return {
          cardBg: 'bg-gradient-to-br from-[#1A4D4E]/10 via-[#FDFBF7] to-[#72D6A5]/10 dark:from-[#122021] dark:to-[#172526]',
          border: 'border-[#72D6A5]/40 hover:border-[#72D6A5]',
          iconColor: 'text-[#1A4D4E] dark:text-[#72D6A5]',
          iconBg: 'bg-[#72D6A5]/20 dark:bg-[#72D6A5]/25 border border-[#72D6A5]/40',
          badgeText: isRtl ? 'ماسي' : 'Diamond',
          badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
        };
      case 'gold':
        return {
          cardBg: 'bg-gradient-to-br from-[#C5A059]/10 via-[#FDFBF7] to-[#F5E8C7]/20 dark:from-[#122021] dark:to-[#1a2522]',
          border: 'border-[#C5A059]/40 hover:border-[#C5A059]',
          iconColor: 'text-[#C5A059]',
          iconBg: 'bg-[#C5A059]/20 border border-[#C5A059]/40',
          badgeText: isRtl ? 'ذهبي' : 'Gold',
          badgeClass: 'bg-[#C5A059]/20 text-[#A27A2F] dark:text-[#E2C37E] border-[#C5A059]/40'
        };
      case 'silver':
        return {
          cardBg: 'bg-gradient-to-br from-slate-100/40 via-[#FDFBF7] to-slate-200/20 dark:from-[#122021] dark:to-[#152020]',
          border: 'border-slate-300 dark:border-slate-700 hover:border-slate-400',
          iconColor: 'text-slate-600 dark:text-slate-300',
          iconBg: 'bg-slate-200/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600',
          badgeText: isRtl ? 'فضي' : 'Silver',
          badgeClass: 'bg-slate-400/15 text-slate-700 dark:text-slate-300 border-slate-400/30'
        };
      default:
        return {
          cardBg: 'bg-gradient-to-br from-amber-50/50 via-[#FDFBF7] to-amber-100/20 dark:from-[#122021] dark:to-[#172020]',
          border: 'border-amber-600/30 hover:border-amber-600/50',
          iconColor: 'text-amber-700 dark:text-amber-400',
          iconBg: 'bg-amber-100/60 dark:bg-amber-950/40 border border-amber-600/30',
          badgeText: isRtl ? 'برونزي' : 'Bronze',
          badgeClass: 'bg-amber-700/15 text-amber-800 dark:text-amber-400 border-amber-700/30'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification for Real-Time Unlocks */}
      {notificationToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="px-5 py-3 rounded-2xl bg-[#1A4D4E] dark:bg-[#72D6A5] text-white dark:text-[#122021] font-bold text-xs shadow-2xl flex items-center gap-2.5 border-2 border-white/20">
            <Trophy className="w-5 h-5 text-[#C5A059] dark:text-[#122021] fill-current" />
            <span>{notificationToast}</span>
          </div>
        </div>
      )}

      {/* OVERVIEW BANNER: ACHIEVEMENT RANK & SCORE */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#1A4D4E] via-[#235859] to-[#163f40] text-white shadow-md space-y-5 relative overflow-hidden">
        {/* Subtle Decorative Arabic Calligraphic Backdrop */}
        <div
          className="absolute -bottom-10 -right-10 font-arabic text-9xl text-white/5 font-extrabold select-none pointer-events-none"
          dir="rtl"
        >
          ورتل
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#72D6A5] text-xs font-semibold backdrop-blur-xs">
              <Medal className="w-3.5 h-3.5" />
              <span>{isRtl ? 'نظام الأوسمة والإنجازات القرآنية' : 'Quranic Milestones & Mastery Badges'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <span>{isRtl ? summary.rankArabic : summary.rank}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C5A059] text-[#0E1A1A] font-bold">
                Tier II
              </span>
            </h2>
            <p className="text-xs text-white/80 max-w-lg leading-relaxed">
              {isRtl
                ? 'تحفيز مستمر لتثبيت المحفوظ عبر أوسمة التميز، وسلسلة الأيام المستمرة، وإتقان السور وأحكام التجويد.'
                : 'Earn badges for consistent daily streaks, mastering full Surahs, and attaining phonetic precision.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center min-w-[95px]">
              <span className="text-[10px] uppercase text-white/70 tracking-wider font-semibold">
                {isRtl ? 'الأوسمة' : 'Badges'}
              </span>
              <p className="text-xl font-bold text-[#72D6A5]">
                {summary.unlockedCount} / {summary.totalBadges}
              </p>
              <span className="text-[10px] text-white/60">{summary.percentage}% Done</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center min-w-[95px]">
              <span className="text-[10px] uppercase text-white/70 tracking-wider font-semibold">
                {isRtl ? 'نقاط الحفظ' : 'Hifz XP'}
              </span>
              <p className="text-xl font-bold text-[#C5A059]">{summary.totalPoints}</p>
              <span className="text-[10px] text-white/60">XP Earned</span>
            </div>
          </div>
        </div>

        {/* Dynamic Next Milestone Teaser */}
        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-[#C5A059] fill-current" />
            <div>
              <span className="font-bold text-white">
                {isRtl ? 'الإنجاز القادم المرتقب:' : 'Next Closest Milestone:'}
              </span>{' '}
              <span className="text-white/90">
                {isRtl ? 'حارس الحركات (3 / 5 مواضع متقنة)' : 'Harakah Guardian (3 / 5 vowel slips corrected)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateConsistentReciter}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Test awarding 7-Day Consistent Reciter badge"
            >
              <Flame className="w-3.5 h-3.5 text-[#D96E54] fill-current" />
              <span>{isRtl ? 'اختبار وسام المواظبة' : 'Claim 7d Streak'}</span>
            </button>

            <button
              onClick={handleSimulateSurahMastered}
              className="px-3 py-1.5 rounded-xl bg-[#C5A059] hover:bg-[#b5924d] text-[#0E1A1A] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Test awarding Surah Mastered badge"
            >
              <Trophy className="w-3.5 h-3.5 fill-current" />
              <span>{isRtl ? 'إتقان سورة كاملة' : 'Master Surah'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS (Status & Categories) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F5F2ED] dark:bg-[#172526] p-1 rounded-2xl border border-[#E8E2D6] dark:border-[#232E2F] w-fit">
          {[
            { id: 'all', label: isRtl ? 'الكل' : 'All Badges', count: badges.length },
            { id: 'unlocked', label: isRtl ? 'المُكتسبة' : 'Unlocked', count: summary.unlockedCount },
            { id: 'locked', label: isRtl ? 'قيد الإنجاز' : 'In Progress', count: badges.length - summary.unlockedCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-[#122021] text-[#1A4D4E] dark:text-[#72D6A5] shadow-xs'
                  : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E8E2D6] dark:bg-[#232E2F]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: isRtl ? 'جميع التصنيفات' : 'All Types' },
            { id: 'streak', label: isRtl ? 'سلسلة الأيام' : 'Streaks' },
            { id: 'mastery', label: isRtl ? 'إتقان السور' : 'Surah Mastery' },
            { id: 'tajweed', label: isRtl ? 'التجويد' : 'Tajweed' },
            { id: 'volume', label: isRtl ? 'الحجم' : 'Volume' },
            { id: 'dedication', label: isRtl ? 'الإخبات' : 'Dedication' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1A4D4E] dark:bg-[#72D6A5] text-white dark:text-[#122021]'
                  : 'bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] text-[#6F7D7B] dark:text-[#9AA5A3] hover:bg-[#F5F2ED]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map(badge => {
          const config = getRarityConfig(badge.rarity);
          const progressPercent = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-4 relative overflow-hidden group ${config.cardBg} ${config.border}`}
            >
              {/* Top Row: Rarity Pill & Status */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeClass}`}>
                  {config.badgeText}
                </span>

                <div className="flex items-center gap-1.5 text-xs">
                  {badge.unlocked ? (
                    <span className="flex items-center gap-1 text-[#1A4D4E] dark:text-[#72D6A5] font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'مُنجز' : 'Achieved'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#8E9B98] text-[11px] font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>{progressPercent}%</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Central Badge Info */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs transition-transform group-hover:scale-105 ${config.iconBg} ${
                    badge.unlocked ? config.iconColor : 'text-slate-400 opacity-60'
                  }`}
                >
                  {renderIcon(badge.iconName, 'w-6 h-6')}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9] truncate">
                    {isRtl ? badge.titleArabic : badge.title}
                  </h3>
                  <p className="font-arabic text-xs text-[#C5A059] font-medium" dir="rtl">
                    {isRtl ? badge.title : badge.titleArabic}
                  </p>
                  <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] line-clamp-2 leading-relaxed pt-0.5">
                    {isRtl ? badge.descriptionArabic : badge.description}
                  </p>
                </div>
              </div>

              {/* Bottom Progress Bar & Points */}
              <div className="space-y-1.5 pt-2 border-t border-[#E8E2D6]/70 dark:border-[#232E2F]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#5F6E6C] dark:text-[#A6B2AF]">
                    {badge.progress} / {badge.maxProgress} {isRtl ? badge.unitArabic : badge.unit}
                  </span>
                  <span className="font-bold text-[#C5A059]">+{badge.rewardPoints} XP</span>
                </div>

                <div className="w-full h-1.5 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.unlocked ? 'bg-[#1A4D4E] dark:bg-[#72D6A5]' : 'bg-[#C5A059]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal View for Selected Badge */}
      <BadgeDetailModal
        badge={selectedBadge}
        direction={direction}
        onClose={() => setSelectedBadge(null)}
        onToggleUnlock={handleToggleUnlock}
      />
    </div>
  );
};

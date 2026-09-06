import React from 'react';
import { AchievementBadge, Direction } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import {
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  Flame,
  Crown,
  BookOpen,
  Award,
  Shield,
  Star,
  Target,
  Volume2,
  Calendar,
  Check
} from 'lucide-react';

interface BadgeDetailModalProps {
  badge: AchievementBadge | null;
  direction: Direction;
  onClose: () => void;
  onToggleUnlock: (badgeId: string) => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  direction,
  onClose,
  onToggleUnlock
}) => {
  if (!badge) return null;

  const isRtl = direction === 'rtl';

  const renderIcon = (name: string, className = 'w-10 h-10') => {
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

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'diamond':
        return {
          pill: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
          gradient: 'from-[#1A4D4E]/20 via-[#72D6A5]/20 to-[#1A4D4E]/10',
          border: 'border-[#72D6A5]/40',
          textColor: 'text-[#1A4D4E] dark:text-[#72D6A5]',
          label: isRtl ? 'ماسي نادر' : 'Diamond Rarity'
        };
      case 'gold':
        return {
          pill: 'bg-[#C5A059]/20 text-[#A27A2F] dark:text-[#E2C37E] border-[#C5A059]/40',
          gradient: 'from-[#C5A059]/25 via-[#F5E8C7]/20 to-[#C5A059]/10',
          border: 'border-[#C5A059]/50',
          textColor: 'text-[#C5A059]',
          label: isRtl ? 'ذهبي مميز' : 'Gold Rarity'
        };
      case 'silver':
        return {
          pill: 'bg-slate-400/15 text-slate-700 dark:text-slate-300 border-slate-400/30',
          gradient: 'from-slate-200/40 via-slate-100/30 to-slate-200/10 dark:from-slate-700/30',
          border: 'border-slate-300 dark:border-slate-600',
          textColor: 'text-slate-600 dark:text-slate-300',
          label: isRtl ? 'فضي متقدم' : 'Silver Rarity'
        };
      default:
        return {
          pill: 'bg-amber-700/15 text-amber-800 dark:text-amber-400 border-amber-700/30',
          gradient: 'from-amber-100/40 to-amber-50 dark:from-amber-950/20',
          border: 'border-amber-600/30',
          textColor: 'text-amber-700 dark:text-amber-400',
          label: isRtl ? 'برونزي تأسيسي' : 'Bronze Rarity'
        };
    }
  };

  const style = getRarityBadgeStyle(badge.rarity);
  const progressPercent = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

  const handlePlayChime = () => {
    audioEngine.playSuccessChime();
  };

  const handleToggle = () => {
    onToggleUnlock(badge.id);
    if (!badge.unlocked) {
      audioEngine.playSuccessChime();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Top Decorative Background Glow */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-br ${style.gradient} blur-3xl opacity-60 pointer-events-none`}
        />

        {/* Header Close Button */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.pill}`}>
              {style.label}
            </span>
            <span className="text-[11px] font-semibold text-[#8E9B98] uppercase tracking-wider">
              +{badge.rewardPoints} Hifz XP
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8E9B98] hover:text-[#1A4D4E] dark:hover:text-white hover:bg-[#F5F2ED] dark:hover:bg-[#172526] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Badge Emblem Display */}
        <div className="flex flex-col items-center text-center space-y-3 relative z-10">
          <div
            className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${style.gradient} border-2 ${style.border} flex items-center justify-center shadow-lg relative ${
              badge.unlocked ? style.textColor : 'text-slate-400 opacity-60'
            }`}
          >
            {renderIcon(badge.iconName, 'w-12 h-12')}
            {badge.unlocked ? (
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#1A4D4E] dark:bg-[#72D6A5] text-white dark:text-[#122021] flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4" />
              </div>
            ) : (
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-500 text-white flex items-center justify-center shadow-sm">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? badge.titleArabic : badge.title}
            </h2>
            <p className="font-arabic text-sm text-[#C5A059] font-semibold mt-0.5" dir="rtl">
              {isRtl ? badge.title : badge.titleArabic}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] max-w-sm leading-relaxed">
            {isRtl ? badge.descriptionArabic : badge.description}
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'التقدم نحو الهدف:' : 'Milestone Progress:'}
            </span>
            <span className="font-semibold text-[#8E9B98]">
              {badge.progress} / {badge.maxProgress} {isRtl ? badge.unitArabic : badge.unit} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#E8E2D6] dark:bg-[#232E2F] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                badge.unlocked ? 'bg-[#1A4D4E] dark:bg-[#72D6A5]' : 'bg-[#C5A059]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8E9B98] pt-1">
            <span className="flex items-center gap-1">
              {badge.unlocked ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1A4D4E] dark:text-[#72D6A5]" />
                  <span className="text-[#1A4D4E] dark:text-[#72D6A5] font-semibold">
                    {isRtl ? 'تم تحقيق هذا الوسام' : 'Milestone Achieved'}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isRtl
                      ? `متبقي ${badge.maxProgress - badge.progress} ${badge.unitArabic}`
                      : `${badge.maxProgress - badge.progress} ${badge.unit} remaining`}
                  </span>
                </>
              )}
            </span>
            {badge.unlockedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{badge.unlockedAt}</span>
              </span>
            )}
          </div>
        </div>

        {/* Hadith / Spiritual Reflection */}
        {badge.hadithOrSpiritualNote && (
          <div className="p-4 rounded-2xl bg-[#EAF2ED]/60 dark:bg-[#142A20]/60 border border-[#C2DBCB]/60 dark:border-[#203D2E] text-xs text-[#1A4D4E] dark:text-[#9DD1B7] space-y-1 relative z-10">
            <div className="flex items-center gap-1.5 font-bold text-[#1A4D4E] dark:text-[#72D6A5]">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>{isRtl ? 'إشراقة قرآنية ونبوية:' : 'Quranic & Spiritual Reflection:'}</span>
            </div>
            <p className="italic leading-relaxed">
              {isRtl ? badge.hadithOrSpiritualNoteArabic : badge.hadithOrSpiritualNote}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 relative z-10">
          {badge.unlocked && (
            <button
              onClick={handlePlayChime}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#EAF2ED] dark:bg-[#172526] hover:bg-[#DCEEE3] dark:hover:bg-[#1E3032] border border-[#C2DBCB] dark:border-[#232E2F] text-[#1A4D4E] dark:text-[#72D6A5] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isRtl ? 'استمع لنغمة الإنجاز' : 'Play Celebration Chime'}</span>
            </button>
          )}

          <button
            onClick={handleToggle}
            className={`w-full ${badge.unlocked ? 'sm:w-auto' : 'sm:flex-1'} py-3 px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              badge.unlocked
                ? 'bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-[#6F7D7B] hover:text-[#D96E54]'
                : 'bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#27827E] text-white'
            }`}
          >
            {badge.unlocked ? (
              <span>{isRtl ? 'إعادة ضبط للاختبار' : 'Reset Milestone'}</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isRtl ? 'تحقيق هذا الإنجاز الآن (تجربة)' : 'Earn Badge Now (Simulate)'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

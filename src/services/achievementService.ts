import { AchievementBadge, UserProfile, TajweedMistake } from '../types';

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'consistent_reciter_7d',
    title: 'Consistent Reciter',
    titleArabic: 'المُداوم على التلاوة',
    description: 'Maintain an unbroken 7-day recitation streak',
    descriptionArabic: 'المواظبة على تلاوة وتسميع القرآن لـ 7 أيام متتالية دون انقطاع',
    category: 'streak',
    rarity: 'silver',
    iconName: 'flame',
    unlocked: true,
    unlockedAt: '2 days ago',
    progress: 14,
    maxProgress: 7,
    unit: 'days',
    unitArabic: 'يوم',
    hadithOrSpiritualNote: '«أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ» — The deeds most loved by Allah are those that are consistent, even if they are small.',
    hadithOrSpiritualNoteArabic: '«أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ» — رواه البخاري ومسلم',
    rewardPoints: 150
  },
  {
    id: 'surah_mastered',
    title: 'Surah Mastered',
    titleArabic: 'خاتم السورة المتقن',
    description: 'Complete and master every verse of a full Surah without phonetic errors',
    descriptionArabic: 'إتمام وتسميع سورة كاملة بنجاح مع مطابقة الحركات والتجويد',
    category: 'mastery',
    rarity: 'gold',
    iconName: 'trophy',
    unlocked: true,
    unlockedAt: 'Yesterday',
    progress: 1,
    maxProgress: 1,
    unit: 'surahs',
    unitArabic: 'سورة',
    hadithOrSpiritualNote: '«يقال لصاحب القرآن: اقرأ وارتقِ ورتل كما كنت ترتل في الدنيا» — Recite and ascend, reciting distinctly as you did in the world.',
    hadithOrSpiritualNoteArabic: '«يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا»',
    rewardPoints: 250
  },
  {
    id: 'streak_14d',
    title: 'Fortnight of Focus',
    titleArabic: 'أسبوعان من الإخبات',
    description: 'Maintain an unbroken 14-day recitation streak',
    descriptionArabic: 'المحافظة على ورد الحفظ اليومي لمدة أسبوعين متتاليين',
    category: 'streak',
    rarity: 'gold',
    iconName: 'crown',
    unlocked: true,
    unlockedAt: 'Today',
    progress: 14,
    maxProgress: 14,
    unit: 'days',
    unitArabic: 'يوم',
    hadithOrSpiritualNote: 'Consistency solidifies Quranic memory into long-term recall, protecting against forgetfulness.',
    hadithOrSpiritualNoteArabic: 'تعاهدوا هذا القرآن، فوالذي نفس محمد بيده لهو أشد تفلتا من الإبل في عقلها',
    rewardPoints: 300
  },
  {
    id: 'first_10_ayahs',
    title: 'First Steps in Hifz',
    titleArabic: 'أولى خطوات الحفظ',
    description: 'Commit your first 10 holy verses to memory',
    descriptionArabic: 'حفظ وتثبيت أول 10 آيات مباركة في الذاكرة الدائمة',
    category: 'volume',
    rarity: 'bronze',
    iconName: 'book-open',
    unlocked: true,
    unlockedAt: '1 week ago',
    progress: 14,
    maxProgress: 10,
    unit: 'verses',
    unitArabic: 'آية',
    hadithOrSpiritualNote: 'Every majestic journey through the 6,236 verses starts with ten steadfast ayahs.',
    hadithOrSpiritualNoteArabic: 'كان الصحابة يتعلمون عشر آيات فلا يجاوزونها حتى يتعلموا ما فيها من العلم والعمل',
    rewardPoints: 100
  },
  {
    id: 'tajweed_perfectionist',
    title: 'Tajweed Perfectionist',
    titleArabic: 'مُتقن التجويد والمخارج',
    description: 'Achieve 95%+ phonetic accuracy in live recitation tracking',
    descriptionArabic: 'تحقيق دقة تلاوة تفوق 95% في ضبط الحركات ومخارج الحروف',
    category: 'tajweed',
    rarity: 'diamond',
    iconName: 'sparkles',
    unlocked: true,
    unlockedAt: '3 days ago',
    progress: 96,
    maxProgress: 95,
    unit: '% accuracy',
    unitArabic: '% دقة',
    hadithOrSpiritualNote: '«الماهر بالقرآن مع السفرة الكرام البررة» — The one who is proficient in the recitation of the Quran will be with the honorable, obedient scribes (angels).',
    hadithOrSpiritualNoteArabic: '«الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ» — صحيح مسلم',
    rewardPoints: 350
  },
  {
    id: 'harakah_guardian',
    title: 'Harakah Guardian',
    titleArabic: 'حارس الحركات والسكنات',
    description: 'Review and successfully master 5 phonetic slips with the acoustic coach',
    descriptionArabic: 'تصحيح وإتقان 5 مواضع من زلات الحركات (الكسرة والضمة والفتحة) في محطة المراجعة',
    category: 'tajweed',
    rarity: 'silver',
    iconName: 'shield',
    unlocked: false,
    progress: 3,
    maxProgress: 5,
    unit: 'slips mastered',
    unitArabic: 'مواضع متقنة',
    hadithOrSpiritualNote: 'Meticulous attention to vowel diacritics safeguards the divine meanings of the sacred text.',
    hadithOrSpiritualNoteArabic: 'العناية بالحركات الإعرابية تصون اللسان عن اللحن في كتاب الله',
    rewardPoints: 180
  },
  {
    id: 'century_club',
    title: 'Century Club',
    titleArabic: 'مائة آية مباركة',
    description: 'Commit 100 holy verses into permanent memory',
    descriptionArabic: 'بلوغ حفظ 100 آية كريمة في مسيرة حفظ القرآن الكريم',
    category: 'volume',
    rarity: 'gold',
    iconName: 'award',
    unlocked: false,
    progress: 14,
    maxProgress: 100,
    unit: 'verses',
    unitArabic: 'آية',
    hadithOrSpiritualNote: 'Reaching one hundred memorized ayahs builds an enduring spiritual sanctuary in the heart.',
    hadithOrSpiritualNoteArabic: 'من قرأ بمائة آية في ليلة كُتب من القانتين',
    rewardPoints: 500
  },
  {
    id: 'juz_amma_ambassador',
    title: 'Juz Amma Master',
    titleArabic: 'سفير جزء عم',
    description: 'Master 5 complete Surahs from the 30th Juz of the Quran',
    descriptionArabic: 'إتقان وحفظ 5 سور كاملة من جزء عم المبارك',
    category: 'mastery',
    rarity: 'diamond',
    iconName: 'star',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    unit: 'surahs',
    unitArabic: 'سور',
    hadithOrSpiritualNote: 'Foundational short surahs are the cornerstone of heartfelt daily prayers.',
    hadithOrSpiritualNoteArabic: 'سور جزء عم رياض خاشعة تجتمع فيها حقائق الإيمان ورقة الموعظة',
    rewardPoints: 400
  },
  {
    id: 'dawn_reciter',
    title: 'Fajr Dawn Reciter',
    titleArabic: 'قرآن الفجر المشهود',
    description: 'Recite verses during the serene early hours of dawn',
    descriptionArabic: 'التسميع والمراجعة في وقت الفجر والسحر المبارك',
    category: 'dedication',
    rarity: 'silver',
    iconName: 'target',
    unlocked: true,
    unlockedAt: 'Yesterday',
    progress: 1,
    maxProgress: 1,
    unit: 'sessions',
    unitArabic: 'جلسة',
    hadithOrSpiritualNote: '«إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا» — Indeed, the recitation of dawn is ever witnessed.',
    hadithOrSpiritualNoteArabic: '«وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا» — سورة الإسراء',
    rewardPoints: 200
  },
  {
    id: 'acoustic_scholar',
    title: 'Acoustic Scholar',
    titleArabic: 'المستمع الحصيف',
    description: 'Compare your voice with 3 different world-renowned Qaris in the review screen',
    descriptionArabic: 'مقارنة تلاوتك جنباً إلى جنب مع 3 قراء وشيوخ مختلفين في شاشة المراجعة',
    category: 'dedication',
    rarity: 'bronze',
    iconName: 'check-circle',
    unlocked: false,
    progress: 2,
    maxProgress: 3,
    unit: 'reciters',
    unitArabic: 'قراء',
    hadithOrSpiritualNote: 'Attuning your ears to multiple classical scholars deepens your appreciation of authentic Tajweed.',
    hadithOrSpiritualNoteArabic: 'سماع كبار القراء يغرس في الأذن نغمة الترتيل السليم ومخارج الحروف الفصيحة',
    rewardPoints: 150
  }
];

const STORAGE_KEY = 'hifz_achievements_state';

class AchievementService {
  private badges: AchievementBadge[];

  constructor() {
    this.badges = this.loadBadges();
  }

  private loadBadges(): AchievementBadge[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial badges to ensure new fields exist
        return INITIAL_BADGES.map(initial => {
          const match = parsed.find((p: AchievementBadge) => p.id === initial.id);
          return match ? { ...initial, ...match } : initial;
        });
      }
    } catch {
      // ignore
    }
    return [...INITIAL_BADGES];
  }

  private saveBadges(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.badges));
    } catch {
      // ignore
    }
  }

  /**
   * Recalculates badge progress dynamically using the user's latest profile and review queue
   */
  public getBadgesForUser(user: UserProfile, mistakes?: TajweedMistake[]): AchievementBadge[] {
    const masteredMistakesCount = mistakes ? mistakes.filter(m => m.mastered).length : 2;

    return this.badges.map(badge => {
      let progress = badge.progress;
      let unlocked = badge.unlocked;

      if (badge.id === 'consistent_reciter_7d') {
        progress = Math.max(progress, user.currentStreak);
        if (progress >= 7 && !unlocked) {
          unlocked = true;
          badge.unlockedAt = 'Unlocked!';
        }
      } else if (badge.id === 'streak_14d') {
        progress = Math.max(progress, user.currentStreak);
        if (progress >= 14 && !unlocked) {
          unlocked = true;
          badge.unlockedAt = 'Unlocked!';
        }
      } else if (badge.id === 'first_10_ayahs') {
        progress = Math.max(progress, user.totalMemorizedAyahs);
        if (progress >= 10 && !unlocked) {
          unlocked = true;
          badge.unlockedAt = 'Unlocked!';
        }
      } else if (badge.id === 'century_club') {
        progress = Math.max(progress, user.totalMemorizedAyahs);
        if (progress >= 100 && !unlocked) {
          unlocked = true;
          badge.unlockedAt = 'Unlocked!';
        }
      } else if (badge.id === 'harakah_guardian') {
        progress = Math.max(progress, masteredMistakesCount);
        if (progress >= 5 && !unlocked) {
          unlocked = true;
          badge.unlockedAt = 'Unlocked!';
        }
      }

      return {
        ...badge,
        progress,
        unlocked
      };
    });
  }

  /**
   * Toggle or unlock a specific badge directly (e.g. for testing milestone completion or rewarding user)
   */
  public toggleBadgeUnlock(badgeId: string): AchievementBadge[] {
    this.badges = this.badges.map(b => {
      if (b.id === badgeId) {
        const nextUnlocked = !b.unlocked;
        return {
          ...b,
          unlocked: nextUnlocked,
          unlockedAt: nextUnlocked ? 'Just now' : undefined,
          progress: nextUnlocked ? b.maxProgress : Math.min(b.progress, b.maxProgress - 1)
        };
      }
      return b;
    });
    this.saveBadges();
    return [...this.badges];
  }

  /**
   * Unlock a badge upon completing an in-app milestone (e.g., finishing a Surah)
   */
  public unlockBadge(badgeId: string): { badge: AchievementBadge | null; isNew: boolean } {
    const badgeIndex = this.badges.findIndex(b => b.id === badgeId);
    if (badgeIndex === -1) return { badge: null, isNew: false };

    const badge = this.badges[badgeIndex];
    if (badge.unlocked) {
      return { badge, isNew: false };
    }

    const updated = {
      ...badge,
      unlocked: true,
      unlockedAt: 'Just now',
      progress: badge.maxProgress
    };

    this.badges[badgeIndex] = updated;
    this.saveBadges();
    return { badge: updated, isNew: true };
  }

  /**
   * Calculate summary points and rank
   */
  public getAchievementSummary(badges: AchievementBadge[]) {
    const unlockedBadges = badges.filter(b => b.unlocked);
    const totalPoints = unlockedBadges.reduce((acc, b) => acc + b.rewardPoints, 0);
    const maxPossiblePoints = badges.reduce((acc, b) => acc + b.rewardPoints, 0);

    let rank = 'Murattil (Reciter)';
    let rankArabic = 'مرتل مبتدئ';
    if (unlockedBadges.length >= 8) {
      rank = 'Hafiz Al-Quran (Master Qari)';
      rankArabic = 'حافظ متقن';
    } else if (unlockedBadges.length >= 5) {
      rank = 'Mutqin (Proficient Scholar)';
      rankArabic = 'متقن مجود';
    } else if (unlockedBadges.length >= 3) {
      rank = 'Salik (Steadfast Seeker)';
      rankArabic = 'سالك مواظب';
    }

    return {
      unlockedCount: unlockedBadges.length,
      totalBadges: badges.length,
      totalPoints,
      maxPossiblePoints,
      percentage: Math.round((unlockedBadges.length / badges.length) * 100),
      rank,
      rankArabic
    };
  }
}

export const achievementService = new AchievementService();

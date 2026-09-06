import { SurahData } from '../types';

export const PRE_EMBEDDED_SURAHS: SurahData[] = [
  // 1. Al-Fatihah
  {
    number: 1,
    nameArabic: "الفاتحة",
    nameEnglish: "Al-Fatihah",
    nameTranslation: "The Opening",
    revelationType: "Meccan",
    numberOfAyahs: 7,
    juzNumber: 1,
    pageNumber: 1,
    memorizationProgress: 100,
    isDownloaded: true,
    downloadSizeMb: 1.4,
    lastPracticed: "Today, 10:15 AM",
    ayahs: [
      {
        number: 1,
        numberInSurah: 1,
        arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
        words: [
          { id: "1-1-1", arabic: "بِسْمِ", transliteration: "Bismi", meaning: "In the name" },
          { id: "1-1-2", arabic: "ٱللَّهِ", transliteration: "Allāhi", meaning: "of Allah" },
          { id: "1-1-3", arabic: "ٱلرَّحْمَٰنِ", transliteration: "ar-Raḥmāni", meaning: "the Entirely Merciful" },
          { id: "1-1-4", arabic: "ٱلرَّحِيمِ", transliteration: "ar-Raḥīm", meaning: "the Especially Merciful" }
        ]
      },
      {
        number: 2,
        numberInSurah: 2,
        arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        translation: "[All] praise is [due] to Allah, Lord of the worlds -",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001002.mp3",
        words: [
          { id: "1-2-1", arabic: "ٱلْحَمْدُ", transliteration: "Al-ḥamdu", meaning: "[All] praise" },
          { id: "1-2-2", arabic: "لِلَّهِ", transliteration: "lillāhi", meaning: "is [due] to Allah" },
          { id: "1-2-3", arabic: "رَبِّ", transliteration: "Rabbi", meaning: "Lord" },
          { id: "1-2-4", arabic: "ٱلْعَٰلَمِينَ", transliteration: "al-ʿālamīn", meaning: "of the worlds" }
        ]
      },
      {
        number: 3,
        numberInSurah: 3,
        arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        translation: "The Entirely Merciful, the Especially Merciful,",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001003.mp3",
        words: [
          { id: "1-3-1", arabic: "ٱلرَّحْمَٰنِ", transliteration: "Ar-Raḥmāni", meaning: "The Entirely Merciful" },
          { id: "1-3-2", arabic: "ٱلرَّحِيمِ", transliteration: "ar-Raḥīm", meaning: "the Especially Merciful" }
        ]
      },
      {
        number: 4,
        numberInSurah: 4,
        arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
        translation: "Sovereign of the Day of Recompense.",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001004.mp3",
        words: [
          { id: "1-4-1", arabic: "مَٰلِكِ", transliteration: "Māliki", meaning: "Sovereign" },
          { id: "1-4-2", arabic: "يَوْمِ", transliteration: "yawmi", meaning: "of the Day" },
          { id: "1-4-3", arabic: "ٱلدِّينِ", transliteration: "ad-Dīn", meaning: "of Recompense" }
        ]
      },
      {
        number: 5,
        numberInSurah: 5,
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        translation: "It is You we worship and You we ask for help.",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001005.mp3",
        words: [
          { id: "1-5-1", arabic: "إِيَّاكَ", transliteration: "Iyyāka", meaning: "It is You" },
          { id: "1-5-2", arabic: "نَعْبُدُ", transliteration: "naʿbudu", meaning: "we worship" },
          { id: "1-5-3", arabic: "وَإِيَّاكَ", transliteration: "wa-iyyāka", meaning: "and You" },
          { id: "1-5-4", arabic: "نَسْتَعِينُ", transliteration: "nastaʿīn", meaning: "we ask for help" }
        ]
      },
      {
        number: 6,
        numberInSurah: 6,
        arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        translation: "Guide us to the straight path -",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001006.mp3",
        words: [
          { id: "1-6-1", arabic: "ٱهْدِنَا", transliteration: "Ihdinā", meaning: "Guide us" },
          { id: "1-6-2", arabic: "ٱلصِّرَٰطَ", transliteration: "aṣ-ṣirāṭa", meaning: "to the path" },
          { id: "1-6-3", arabic: "ٱلْمُسْتَقِيمَ", transliteration: "al-mustaqīm", meaning: "the straight" }
        ]
      },
      {
        number: 7,
        numberInSurah: 7,
        arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3",
        words: [
          { id: "1-7-1", arabic: "صِرَٰطَ", transliteration: "Ṣirāṭa", meaning: "The path" },
          { id: "1-7-2", arabic: "ٱلَّذِينَ", transliteration: "alladhīna", meaning: "of those" },
          { id: "1-7-3", arabic: "أَنْعَمْتَ", transliteration: "anʿamta", meaning: "You have bestowed favor" },
          { id: "1-7-4", arabic: "عَلَيْهِمْ", transliteration: "ʿalayhim", meaning: "upon them" },
          { id: "1-7-5", arabic: "غَيْرِ", transliteration: "ghayri", meaning: "not" },
          { id: "1-7-6", arabic: "ٱلْمَغْضُوبِ", transliteration: "al-maghḍūbi", meaning: "of those who have evoked anger" },
          { id: "1-7-7", arabic: "عَلَيْهِمْ", transliteration: "ʿalayhim", meaning: "upon them" },
          { id: "1-7-8", arabic: "وَلَا", transliteration: "wa-lā", meaning: "and not" },
          { id: "1-7-9", arabic: "ٱلضَّآلِّينَ", transliteration: "aḍ-ḍāllīn", meaning: "of those who are astray", hasTajweedRule: true, tajweedRuleName: "Madd Lazim Kalimi (6 Harakat)" }
        ]
      }
    ]
  },

  // 67. Al-Mulk
  {
    number: 67,
    nameArabic: "الملك",
    nameEnglish: "Al-Mulk",
    nameTranslation: "The Sovereignty",
    revelationType: "Meccan",
    numberOfAyahs: 30,
    juzNumber: 29,
    pageNumber: 562,
    memorizationProgress: 72,
    isDownloaded: true,
    downloadSizeMb: 12.8,
    lastPracticed: "Yesterday, 8:40 PM",
    ayahs: [
      {
        number: 5242,
        numberInSurah: 1,
        arabic: "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ",
        translation: "Blessed is He in whose hand is dominion, and He is over all things competent -",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/067001.mp3",
        words: [
          { id: "67-1-1", arabic: "تَبَٰرَكَ", transliteration: "Tabāraka", meaning: "Blessed is" },
          { id: "67-1-2", arabic: "ٱلَّذِى", transliteration: "alladhī", meaning: "He who" },
          { id: "67-1-3", arabic: "بِيَدِهِ", transliteration: "biyadihi", meaning: "in His hand is" },
          { id: "67-1-4", arabic: "ٱلْمُلْكُ", transliteration: "al-mulku", meaning: "the dominion" },
          { id: "67-1-5", arabic: "وَهُوَ", transliteration: "wahuwa", meaning: "and He" },
          { id: "67-1-6", arabic: "عَلَىٰ", transliteration: "ʿalā", meaning: "over" },
          { id: "67-1-7", arabic: "كُلِّ", transliteration: "kulli", meaning: "all" },
          { id: "67-1-8", arabic: "شَىْءٍۢ", transliteration: "shay-in", meaning: "things", hasTajweedRule: true, tajweedRuleName: "Ikhfa Haqiqi" },
          { id: "67-1-9", arabic: "قَدِيرٌ", transliteration: "qadīr", meaning: "competent" }
        ]
      },
      {
        number: 5243,
        numberInSurah: 2,
        arabic: "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًۭا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ",
        translation: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/067002.mp3",
        words: [
          { id: "67-2-1", arabic: "ٱلَّذِى", transliteration: "Alladhī", meaning: "He who" },
          { id: "67-2-2", arabic: "خَلَقَ", transliteration: "khalaqa", meaning: "created" },
          { id: "67-2-3", arabic: "ٱلْمَوْتَ", transliteration: "al-mawta", meaning: "death" },
          { id: "67-2-4", arabic: "وَٱلْحَيَوٰةَ", transliteration: "wal-ḥayāta", meaning: "and life" },
          { id: "67-2-5", arabic: "لِيَبْلُوَكُمْ", transliteration: "li-yabluwakum", meaning: "to test you", hasTajweedRule: true, tajweedRuleName: "Qalqalah Sughra" },
          { id: "67-2-6", arabic: "أَيُّكُمْ", transliteration: "ayyukum", meaning: "which of you is" },
          { id: "67-2-7", arabic: "أَحْسَنُ", transliteration: "aḥsanu", meaning: "best" },
          { id: "67-2-8", arabic: "عَمَلًۭا", transliteration: "ʿamalan", meaning: "in deed" },
          { id: "67-2-9", arabic: "وَهُوَ", transliteration: "wahuwa", meaning: "and He is" },
          { id: "67-2-10", arabic: "ٱلْعَزِيزُ", transliteration: "al-ʿazīz", meaning: "the Exalted in Might" },
          { id: "67-2-11", arabic: "ٱلْغَفُورُ", transliteration: "al-ghafūr", meaning: "the Forgiving" }
        ]
      },
      {
        number: 5244,
        numberInSurah: 3,
        arabic: "ٱلَّذِى خَلَقَ سَبْعَ سَمَٰوَٰتٍۢ طِبَاقًۭا ۖ مَّا تَرَىٰ فِى خَلْقِ ٱلرَّحْمَٰنِ مِن تَفَٰوُتٍۢ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍۢ",
        translation: "[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return your vision to the sky, do you see any breaks?",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/067003.mp3",
        words: [
          { id: "67-3-1", arabic: "ٱلَّذِى", transliteration: "Alladhī", meaning: "He who" },
          { id: "67-3-2", arabic: "خَلَقَ", transliteration: "khalaqa", meaning: "created" },
          { id: "67-3-3", arabic: "سَبْعَ", transliteration: "sabʿa", meaning: "seven" },
          { id: "67-3-4", arabic: "سَمَٰوَٰتٍۢ", transliteration: "samāwātin", meaning: "heavens" },
          { id: "67-3-5", arabic: "طِبَاقًۭا", transliteration: "ṭibāqan", meaning: "in layers" },
          { id: "67-3-6", arabic: "مَّا", transliteration: "mā", meaning: "not" },
          { id: "67-3-7", arabic: "تَرَىٰ", transliteration: "tarā", meaning: "you see" },
          { id: "67-3-8", arabic: "فِى", transliteration: "fī", meaning: "in" },
          { id: "67-3-9", arabic: "خَلْقِ", transliteration: "khalqi", meaning: "the creation of" },
          { id: "67-3-10", arabic: "ٱلرَّحْمَٰنِ", transliteration: "ar-Raḥmāni", meaning: "the Most Merciful" },
          { id: "67-3-11", arabic: "مِن", transliteration: "min", meaning: "any" },
          { id: "67-3-12", arabic: "تَفَٰوُتٍۢ", transliteration: "tafāwutin", meaning: "inconsistency" },
          { id: "67-3-13", arabic: "فَٱرْجِعِ", transliteration: "farjiʿi", meaning: "so return" },
          { id: "67-3-14", arabic: "ٱلْبَصَرَ", transliteration: "al-baṣara", meaning: "the vision" },
          { id: "67-3-15", arabic: "هَلْ", transliteration: "hal", meaning: "do" },
          { id: "67-3-16", arabic: "تَرَىٰ", transliteration: "tarā", meaning: "you see" },
          { id: "67-3-17", arabic: "مِن", transliteration: "min", meaning: "any" },
          { id: "67-3-18", arabic: "فُطُورٍۢ", transliteration: "fuṭūr", meaning: "flaws", hasTajweedRule: true, tajweedRuleName: "Ikhfa" }
        ]
      }
    ]
  },

  // 112. Al-Ikhlas
  {
    number: 112,
    nameArabic: "الإخلاص",
    nameEnglish: "Al-Ikhlas",
    nameTranslation: "The Sincerity",
    revelationType: "Meccan",
    numberOfAyahs: 4,
    juzNumber: 30,
    pageNumber: 604,
    memorizationProgress: 100,
    isDownloaded: true,
    downloadSizeMb: 1.1,
    lastPracticed: "Today, 9:00 AM",
    ayahs: [
      {
        number: 6222,
        numberInSurah: 1,
        arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
        translation: "Say, 'He is Allah, [who is] One,",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112001.mp3",
        words: [
          { id: "112-1-1", arabic: "قُلْ", transliteration: "Qul", meaning: "Say" },
          { id: "112-1-2", arabic: "هُوَ", transliteration: "huwa", meaning: "He is" },
          { id: "112-1-3", arabic: "ٱللَّهُ", transliteration: "Allāhu", meaning: "Allah" },
          { id: "112-1-4", arabic: "أَحَدٌ", transliteration: "Aḥad", meaning: "[who is] One", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      },
      {
        number: 6223,
        numberInSurah: 2,
        arabic: "ٱللَّهُ ٱلصَّمَدُ",
        translation: "Allah, the Eternal Refuge.",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112002.mp3",
        words: [
          { id: "112-2-1", arabic: "ٱللَّهُ", transliteration: "Allāhu", meaning: "Allah" },
          { id: "112-2-2", arabic: "ٱلصَّمَدُ", transliteration: "aṣ-Ṣamad", meaning: "the Eternal Refuge", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      },
      {
        number: 6224,
        numberInSurah: 3,
        arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        translation: "He neither begets nor is born,",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112003.mp3",
        words: [
          { id: "112-3-1", arabic: "لَمْ", transliteration: "Lam", meaning: "He not" },
          { id: "112-3-2", arabic: "يَلِدْ", transliteration: "yalid", meaning: "begets", hasTajweedRule: true, tajweedRuleName: "Qalqalah Sughra" },
          { id: "112-3-3", arabic: "وَلَمْ", transliteration: "wa-lam", meaning: "and not" },
          { id: "112-3-4", arabic: "يُولَدْ", transliteration: "yūlad", meaning: "is born", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      },
      {
        number: 6225,
        numberInSurah: 4,
        arabic: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
        translation: "Nor is there to Him any equivalent.'",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112004.mp3",
        words: [
          { id: "112-4-1", arabic: "وَلَمْ", transliteration: "Wa-lam", meaning: "And not" },
          { id: "112-4-2", arabic: "يَكُن", transliteration: "yakun", meaning: "is there" },
          { id: "112-4-3", arabic: "لَّهُۥ", transliteration: "lahū", meaning: "to Him", hasTajweedRule: true, tajweedRuleName: "Idgham Bila Ghunnah" },
          { id: "112-4-4", arabic: "كُفُوًا", transliteration: "kufuwan", meaning: "an equivalent" },
          { id: "112-4-5", arabic: "أَحَدٌۢ", transliteration: "aḥad", meaning: "anyone", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      }
    ]
  },

  // 113. Al-Falaq
  {
    number: 113,
    nameArabic: "الفلق",
    nameEnglish: "Al-Falaq",
    nameTranslation: "The Daybreak",
    revelationType: "Meccan",
    numberOfAyahs: 5,
    juzNumber: 30,
    pageNumber: 604,
    memorizationProgress: 100,
    isDownloaded: true,
    downloadSizeMb: 1.3,
    lastPracticed: "Today, 9:02 AM",
    ayahs: [
      {
        number: 6226,
        numberInSurah: 1,
        arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
        translation: "Say, 'I seek refuge in the Lord of daybreak",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113001.mp3",
        words: [
          { id: "113-1-1", arabic: "قُلْ", transliteration: "Qul", meaning: "Say" },
          { id: "113-1-2", arabic: "أَعُوذُ", transliteration: "aʿūdhu", meaning: "I seek refuge" },
          { id: "113-1-3", arabic: "بِرَبِّ", transliteration: "bi-Rabbi", meaning: "in the Lord of" },
          { id: "113-1-4", arabic: "ٱلْفَلَقِ", transliteration: "al-falaq", meaning: "the daybreak", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      },
      {
        number: 6227,
        numberInSurah: 2,
        arabic: "مِن شَرِّ مَا خَلَقَ",
        translation: "From the evil of that which He created",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113002.mp3",
        words: [
          { id: "113-2-1", arabic: "مِن", transliteration: "Min", meaning: "From" },
          { id: "113-2-2", arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
          { id: "113-2-3", arabic: "مَا", transliteration: "mā", meaning: "that which" },
          { id: "113-2-4", arabic: "خَلَقَ", transliteration: "khalaq", meaning: "He created", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      },
      {
        number: 6228,
        numberInSurah: 3,
        arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        translation: "And from the evil of darkness when it settles",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113003.mp3",
        words: [
          { id: "113-3-1", arabic: "وَمِن", transliteration: "Wa-min", meaning: "And from" },
          { id: "113-3-2", arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
          { id: "113-3-3", arabic: "غَاسِقٍ", transliteration: "ghāsiqin", meaning: "darkness" },
          { id: "113-3-4", arabic: "إِذَا", transliteration: "idhā", meaning: "when" },
          { id: "113-3-5", arabic: "وَقَبَ", transliteration: "waqab", meaning: "it settles", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      },
      {
        number: 6229,
        numberInSurah: 4,
        arabic: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
        translation: "And from the evil of the blowers in knots",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113004.mp3",
        words: [
          { id: "113-4-1", arabic: "وَمِن", transliteration: "Wa-min", meaning: "And from" },
          { id: "113-4-2", arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
          { id: "113-4-3", arabic: "ٱلنَّفَّٰثَٰتِ", transliteration: "an-naffāthāti", meaning: "the blowers" },
          { id: "113-4-4", arabic: "فِى", transliteration: "fī", meaning: "in" },
          { id: "113-4-5", arabic: "ٱلْعُقَدِ", transliteration: "al-ʿuqad", meaning: "the knots", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      },
      {
        number: 6230,
        numberInSurah: 5,
        arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        translation: "And from the evil of an envier when he envies.'",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113005.mp3",
        words: [
          { id: "113-5-1", arabic: "وَمِن", transliteration: "Wa-min", meaning: "And from" },
          { id: "113-5-2", arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
          { id: "113-5-3", arabic: "حَاسِدٍ", transliteration: "ḥāsidin", meaning: "an envier" },
          { id: "113-5-4", arabic: "إِذَا", transliteration: "idhā", meaning: "when" },
          { id: "113-5-5", arabic: "حَسَدَ", transliteration: "ḥasad", meaning: "he envies", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra" }
        ]
      }
    ]
  },

  // 114. An-Nas
  {
    number: 114,
    nameArabic: "الناس",
    nameEnglish: "An-Nas",
    nameTranslation: "Mankind",
    revelationType: "Meccan",
    numberOfAyahs: 6,
    juzNumber: 30,
    pageNumber: 604,
    memorizationProgress: 100,
    isDownloaded: true,
    downloadSizeMb: 1.4,
    lastPracticed: "Today, 9:05 AM",
    ayahs: [
      {
        number: 6231,
        numberInSurah: 1,
        arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
        translation: "Say, 'I seek refuge in the Lord of mankind,",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114001.mp3",
        words: [
          { id: "114-1-1", arabic: "قُلْ", transliteration: "Qul", meaning: "Say" },
          { id: "114-1-2", arabic: "أَعُوذُ", transliteration: "aʿūdhu", meaning: "I seek refuge" },
          { id: "114-1-3", arabic: "بِرَبِّ", transliteration: "bi-Rabbi", meaning: "in the Lord of" },
          { id: "114-1-4", arabic: "ٱلنَّاسِ", transliteration: "an-nās", meaning: "mankind", hasTajweedRule: true, tajweedRuleName: "Ghunnah Mushaddadah" }
        ]
      },
      {
        number: 6232,
        numberInSurah: 2,
        arabic: "مَلِكِ ٱلنَّاسِ",
        translation: "The Sovereign of mankind,",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114002.mp3",
        words: [
          { id: "114-2-1", arabic: "مَلِكِ", transliteration: "Maliki", meaning: "The Sovereign of" },
          { id: "114-2-2", arabic: "ٱلنَّاسِ", transliteration: "an-nās", meaning: "mankind", hasTajweedRule: true, tajweedRuleName: "Ghunnah Mushaddadah" }
        ]
      },
      {
        number: 6233,
        numberInSurah: 3,
        arabic: "إِلَٰهِ ٱلنَّاسِ",
        translation: "The God of mankind,",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114003.mp3",
        words: [
          { id: "114-3-1", arabic: "إِلَٰهِ", transliteration: "Ilāhi", meaning: "The God of" },
          { id: "114-3-2", arabic: "ٱلنَّاسِ", transliteration: "an-nās", meaning: "mankind", hasTajweedRule: true, tajweedRuleName: "Ghunnah Mushaddadah" }
        ]
      },
      {
        number: 6234,
        numberInSurah: 4,
        arabic: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
        translation: "From the evil of the retreating whisperer -",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114004.mp3",
        words: [
          { id: "114-4-1", arabic: "مِن", transliteration: "Min", meaning: "From" },
          { id: "114-4-2", arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
          { id: "114-4-3", arabic: "ٱلْوَسْوَاسِ", transliteration: "al-waswāsi", meaning: "the whisperer" },
          { id: "114-4-4", arabic: "ٱلْخَنَّاسِ", transliteration: "al-khannās", meaning: "the retreating", hasTajweedRule: true, tajweedRuleName: "Ghunnah Mushaddadah" }
        ]
      },
      {
        number: 6235,
        numberInSurah: 5,
        arabic: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
        translation: "Who whispers into the breasts of mankind -",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114005.mp3",
        words: [
          { id: "114-5-1", arabic: "ٱلَّذِى", transliteration: "Alladhī", meaning: "Who" },
          { id: "114-5-2", arabic: "يُوَسْوِسُ", transliteration: "yuwaswisu", meaning: "whispers" },
          { id: "114-5-3", arabic: "فِى", transliteration: "fī", meaning: "into" },
          { id: "114-5-4", arabic: "صُدُورِ", transliteration: "ṣudūri", meaning: "the breasts of" },
          { id: "114-5-5", arabic: "ٱلنَّاسِ", transliteration: "an-nās", meaning: "mankind", hasTajweedRule: true, tajweedRuleName: "Ghunnah Mushaddadah" }
        ]
      },
      {
        number: 6236,
        numberInSurah: 6,
        arabic: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        translation: "From among the jinn and mankind.'",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114006.mp3",
        words: [
          { id: "114-6-1", arabic: "مِنَ", transliteration: "Mina", meaning: "From among" },
          { id: "114-6-2", arabic: "ٱلْجِنَّةِ", transliteration: "al-jinnati", meaning: "the jinn" },
          { id: "114-6-3", arabic: "وَٱلنَّاسِ", transliteration: "wan-nās", meaning: "and mankind", hasTajweedRule: true, tajweedRuleName: "Ghunnah Mushaddadah" }
        ]
      }
    ]
  },

  // 108. Al-Kawthar
  {
    number: 108,
    nameArabic: "الكوثر",
    nameEnglish: "Al-Kawthar",
    nameTranslation: "The Abundance",
    revelationType: "Meccan",
    numberOfAyahs: 3,
    juzNumber: 30,
    pageNumber: 602,
    memorizationProgress: 100,
    isDownloaded: true,
    downloadSizeMb: 1.0,
    ayahs: [
      {
        number: 6205,
        numberInSurah: 1,
        arabic: "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ",
        translation: "Indeed, We have granted you, [O Muhammad], al-Kawthar.",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/108001.mp3",
        words: [
          { id: "108-1-1", arabic: "إِنَّآ", transliteration: "Innā", meaning: "Indeed We", hasTajweedRule: true, tajweedRuleName: "Ghunnah & Madd" },
          { id: "108-1-2", arabic: "أَعْطَيْنَٰكَ", transliteration: "aʿṭaynāka", meaning: "have granted you" },
          { id: "108-1-3", arabic: "ٱلْكَوْثَرَ", transliteration: "al-kawthar", meaning: "the abundance" }
        ]
      },
      {
        number: 6206,
        numberInSurah: 2,
        arabic: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ",
        translation: "So pray to your Lord and sacrifice [to Him alone].",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/108002.mp3",
        words: [
          { id: "108-2-1", arabic: "فَصَلِّ", transliteration: "Fa-ṣalli", meaning: "So pray" },
          { id: "108-2-2", arabic: "لِرَبِّكَ", transliteration: "li-Rabbika", meaning: "to your Lord" },
          { id: "108-2-3", arabic: "وَٱنْحَرْ", transliteration: "wan-ḥar", meaning: "and sacrifice" }
        ]
      },
      {
        number: 6207,
        numberInSurah: 3,
        arabic: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ",
        translation: "Indeed, your enemy is the one cut off.",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/108003.mp3",
        words: [
          { id: "108-3-1", arabic: "إِنَّ", transliteration: "Inna", meaning: "Indeed", hasTajweedRule: true, tajweedRuleName: "Ghunnah Mushaddadah" },
          { id: "108-3-2", arabic: "شَانِئَكَ", transliteration: "shāni-aka", meaning: "your enemy" },
          { id: "108-3-3", arabic: "هُوَ", transliteration: "huwa", meaning: "he is" },
          { id: "108-3-4", arabic: "ٱلْأَبْتَرُ", transliteration: "al-abtar", meaning: "the one cut off", hasTajweedRule: true, tajweedRuleName: "Qalqalah Sughra" }
        ]
      }
    ]
  },

  // 103. Al-Asr
  {
    number: 103,
    nameArabic: "العصر",
    nameEnglish: "Al-'Asr",
    nameTranslation: "The Declining Day",
    revelationType: "Meccan",
    numberOfAyahs: 3,
    juzNumber: 30,
    pageNumber: 601,
    memorizationProgress: 100,
    isDownloaded: true,
    downloadSizeMb: 1.1,
    ayahs: [
      {
        number: 6177,
        numberInSurah: 1,
        arabic: "وَٱلْعَصْرِ",
        translation: "By time,",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/103001.mp3",
        words: [
          { id: "103-1-1", arabic: "وَٱلْعَصْرِ", transliteration: "Wal-ʿaṣr", meaning: "By time" }
        ]
      },
      {
        number: 6178,
        numberInSurah: 2,
        arabic: "إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ",
        translation: "Indeed, mankind is in loss,",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/103002.mp3",
        words: [
          { id: "103-2-1", arabic: "إِنَّ", transliteration: "Inna", meaning: "Indeed", hasTajweedRule: true, tajweedRuleName: "Ghunnah Mushaddadah" },
          { id: "103-2-2", arabic: "ٱلْإِنسَٰنَ", transliteration: "al-insāna", meaning: "mankind", hasTajweedRule: true, tajweedRuleName: "Ikhfa" },
          { id: "103-2-3", arabic: "لَفِى", transliteration: "la-fī", meaning: "is in" },
          { id: "103-2-4", arabic: "خُسْرٍ", transliteration: "khusr", meaning: "loss" }
        ]
      },
      {
        number: 6179,
        numberInSurah: 3,
        arabic: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ",
        translation: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/103003.mp3",
        words: [
          { id: "103-3-1", arabic: "إِلَّا", transliteration: "Illā", meaning: "Except" },
          { id: "103-3-2", arabic: "ٱلَّذِينَ", transliteration: "alladhīna", meaning: "those who" },
          { id: "103-3-3", arabic: "ءَامَنُوا۟", transliteration: "āmanū", meaning: "believed" },
          { id: "103-3-4", arabic: "وَعَمِلُوا۟", transliteration: "wa-ʿamilū", meaning: "and did" },
          { id: "103-3-5", arabic: "ٱلصَّٰلِحَٰتِ", transliteration: "aṣ-ṣāliḥāti", meaning: "righteous deeds" },
          { id: "103-3-6", arabic: "وَتَوَاصَوْا۟", transliteration: "wa-tawāṣaw", meaning: "and advised each other" },
          { id: "103-3-7", arabic: "بِٱلْحَقِّ", transliteration: "bil-ḥaqq", meaning: "to truth" },
          { id: "103-3-8", arabic: "وَتَوَاصَوْا۟", transliteration: "wa-tawāṣaw", meaning: "and advised each other" },
          { id: "103-3-9", arabic: "بِٱلصَّبْرِ", transliteration: "biṣ-ṣabr", meaning: "to patience" }
        ]
      }
    ]
  }
];

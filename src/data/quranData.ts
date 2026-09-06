import { SurahData, TajweedMistake } from '../types';

export const POPULAR_SURAHS: SurahData[] = [
  {
    number: 1,
    nameArabic: "الفَاتِحَة",
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
  {
    number: 67,
    nameArabic: "المُلْك",
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
          { id: "67-2-1", arabic: "ٱلَّذِى", transliteration: "Alladhī", meaning: "[He] who" },
          { id: "67-2-2", arabic: "خَلَقَ", transliteration: "khalaqa", meaning: "created" },
          { id: "67-2-3", arabic: "ٱلْمَوْتَ", transliteration: "al-mawta", meaning: "death" },
          { id: "67-2-4", arabic: "وَٱلْحَيَوٰةَ", transliteration: "wal-ḥayāta", meaning: "and life" },
          { id: "67-2-5", arabic: "لِيَبْلُوَكُمْ", transliteration: "liyabluwakum", meaning: "to test you", hasTajweedRule: true, tajweedRuleName: "Qalqalah Sughra (Baa)" },
          { id: "67-2-6", arabic: "أَيُّكُمْ", transliteration: "ayyukum", meaning: "[as to] which of you" },
          { id: "67-2-7", arabic: "أَحْسَنُ", transliteration: "aḥsanu", meaning: "is best in" },
          { id: "67-2-8", arabic: "عَمَلًۭا", transliteration: "ʿamalan", meaning: "deed", hasTajweedRule: true, tajweedRuleName: "Idgham with Ghunnah" },
          { id: "67-2-9", arabic: "وَهُوَ", transliteration: "wahuwa", meaning: "and He is" },
          { id: "67-2-10", arabic: "ٱلْعَزِيزُ", transliteration: "al-ʿAzīzu", meaning: "the Exalted in Might" },
          { id: "67-2-11", arabic: "ٱلْغَفُورُ", transliteration: "al-Ghafūr", meaning: "the Forgiving" }
        ]
      }
    ]
  },
  {
    number: 112,
    nameArabic: "الإِخْلَاص",
    nameEnglish: "Al-Ikhlas",
    nameTranslation: "The Sincerity",
    revelationType: "Meccan",
    numberOfAyahs: 4,
    juzNumber: 30,
    pageNumber: 604,
    memorizationProgress: 100,
    isDownloaded: true,
    downloadSizeMb: 1.1,
    lastPracticed: "3 days ago",
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
          { id: "112-1-4", arabic: "أَحَدٌ", transliteration: "Aḥad", meaning: "[who is] One", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra on stop" }
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
          { id: "112-2-2", arabic: "ٱلصَّمَدُ", transliteration: "aṣ-Ṣamad", meaning: "the Eternal Refuge", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra on stop" }
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
          { id: "112-3-2", arabic: "يَلِدْ", transliteration: "yalid", meaning: "begets", hasTajweedRule: true, tajweedRuleName: "Qalqalah Sughra (Dal)" },
          { id: "112-3-3", arabic: "وَلَمْ", transliteration: "walam", meaning: "and not" },
          { id: "112-3-4", arabic: "يُولَدْ", transliteration: "yūlad", meaning: "is born", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra on stop" }
        ]
      },
      {
        number: 6225,
        numberInSurah: 4,
        arabic: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
        translation: "Nor is there to Him any equivalent.'",
        audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112004.mp3",
        words: [
          { id: "112-4-1", arabic: "وَلَمْ", transliteration: "Walam", meaning: "And not" },
          { id: "112-4-2", arabic: "يَكُن", transliteration: "yakun", meaning: "is there", hasTajweedRule: true, tajweedRuleName: "Idgham Bila Ghunnah (Nun into Lam)" },
          { id: "112-4-3", arabic: "لَّهُۥ", transliteration: "lahū", meaning: "to Him" },
          { id: "112-4-4", arabic: "كُفُوًا", transliteration: "kufuwan", meaning: "any equivalent", hasTajweedRule: true, tajweedRuleName: "Izhar Halqi" },
          { id: "112-4-5", arabic: "أَحَدٌۢ", transliteration: "aḥad", meaning: "any one", hasTajweedRule: true, tajweedRuleName: "Qalqalah Kubra on stop" }
        ]
      }
    ]
  },
  {
    number: 113,
    nameArabic: "الفَلَق",
    nameEnglish: "Al-Falaq",
    nameTranslation: "The Daybreak",
    revelationType: "Meccan",
    numberOfAyahs: 5,
    juzNumber: 30,
    pageNumber: 604,
    memorizationProgress: 90,
    isDownloaded: false,
    downloadSizeMb: 1.2,
    lastPracticed: "5 days ago",
    ayahs: []
  },
  {
    number: 114,
    nameArabic: "النَّاس",
    nameEnglish: "An-Nas",
    nameTranslation: "Mankind",
    revelationType: "Meccan",
    numberOfAyahs: 6,
    juzNumber: 30,
    pageNumber: 604,
    memorizationProgress: 100,
    isDownloaded: false,
    downloadSizeMb: 1.3,
    lastPracticed: "5 days ago",
    ayahs: []
  },
  {
    number: 18,
    nameArabic: "الكَهْف",
    nameEnglish: "Al-Kahf",
    nameTranslation: "The Cave",
    revelationType: "Meccan",
    numberOfAyahs: 110,
    juzNumber: 15,
    pageNumber: 293,
    memorizationProgress: 35,
    isDownloaded: true,
    downloadSizeMb: 48.2,
    lastPracticed: "Last Friday",
    ayahs: []
  },
  {
    number: 36,
    nameArabic: "يس",
    nameEnglish: "Ya-Sin",
    nameTranslation: "Ya-Sin",
    revelationType: "Meccan",
    numberOfAyahs: 83,
    juzNumber: 22,
    pageNumber: 440,
    memorizationProgress: 45,
    isDownloaded: false,
    downloadSizeMb: 36.1,
    lastPracticed: "1 week ago",
    ayahs: []
  },
  {
    number: 55,
    nameArabic: "الرَّحْمَٰن",
    nameEnglish: "Ar-Rahman",
    nameTranslation: "The Beneficent",
    revelationType: "Medinan",
    numberOfAyahs: 78,
    juzNumber: 27,
    pageNumber: 531,
    memorizationProgress: 60,
    isDownloaded: true,
    downloadSizeMb: 32.5,
    lastPracticed: "4 days ago",
    ayahs: []
  },
  {
    number: 78,
    nameArabic: "النَّبَأ",
    nameEnglish: "An-Naba",
    nameTranslation: "The Tidings",
    revelationType: "Meccan",
    numberOfAyahs: 40,
    juzNumber: 30,
    pageNumber: 582,
    memorizationProgress: 85,
    isDownloaded: true,
    downloadSizeMb: 16.4,
    lastPracticed: "2 days ago",
    ayahs: []
  }
];

export const INITIAL_MISTAKES_REVIEW: TajweedMistake[] = [
  {
    id: "m-1",
    surahNumber: 1,
    surahName: "Al-Fatihah",
    ayahNumber: 7,
    wordIndex: 8,
    wordArabic: "ٱلضَّآلِّينَ",
    expectedRecitation: "aḍ-ḍāllīn (Madd Lazim 6 Harakat)",
    userRecitation: "aḍ-ḍālīn (Shortened to 2 Harakat)",
    mistakeType: "tajweed_slip",
    tajweedRule: "Madd",
    explanation: "This is Madd Lāzim Kalimī Muthaqqal. The heavy shaddah on the Lam requires extending the Alif for a full 6 vowel counts (harakāt), not 2.",
    timestamp: "Today, 10:14 AM",
    mastered: false,
    reviewedCount: 3,
    referenceAudioUrl: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3",
    reciterName: "Mishary Rashid Alafasy",
    recordingDurationSeconds: 4.2
  },
  {
    id: "m-2",
    surahNumber: 67,
    surahName: "Al-Mulk",
    ayahNumber: 1,
    wordIndex: 7,
    wordArabic: "شَىْءٍۢ قَدِيرٌ",
    expectedRecitation: "shay-in Qadīr (Nasalized Ikhfa)",
    userRecitation: "shay-in Qadīr (Clear Izhar without Ghunnah)",
    mistakeType: "tajweed_slip",
    tajweedRule: "Ikhfa",
    explanation: "When Tanween meets Qaf (ق), pronounce with Ikhfa Haqiqi — conceal the 'n' sound lightly at the back of the mouth with heavy 2-count ghunnah.",
    timestamp: "Yesterday, 8:38 PM",
    mastered: false,
    reviewedCount: 1,
    referenceAudioUrl: "https://everyayah.com/data/Alafasy_128kbps/067001.mp3",
    reciterName: "Mishary Rashid Alafasy",
    recordingDurationSeconds: 5.1
  },
  {
    id: "m-3",
    surahNumber: 67,
    surahName: "Al-Mulk",
    ayahNumber: 2,
    wordIndex: 4,
    wordArabic: "لِيَبْلُوَكُمْ",
    expectedRecitation: "li-yab-luwakum (Baa Qalqalah bounce)",
    userRecitation: "li-yab-luwakum (Muffled Baa without echo)",
    mistakeType: "tajweed_slip",
    tajweedRule: "Qalqalah",
    explanation: "Letter Baa (ب) has Sukoon in the middle of the word, requiring Qalqalah Sughra (gentle acoustic bounce without adding a vowel).",
    timestamp: "Yesterday, 8:41 PM",
    mastered: false,
    reviewedCount: 2,
    referenceAudioUrl: "https://everyayah.com/data/Alafasy_128kbps/067002.mp3",
    reciterName: "Mishary Rashid Alafasy",
    recordingDurationSeconds: 3.8
  },
  {
    id: "m-4",
    surahNumber: 1,
    surahName: "Al-Fatihah",
    ayahNumber: 4,
    wordIndex: 0,
    wordArabic: "مَٰلِكِ",
    expectedRecitation: "Māliki (Kasrah on Kaaf: 'ki')",
    userRecitation: "Mālika (Recited with Fathah: 'ka')",
    mistakeType: "wrong_harakah",
    explanation: "The Kaaf carries a Kasrah (ِ), giving it the 'i' sound (Māliki). Pronouncing with Fathah changes grammatical case.",
    timestamp: "3 days ago",
    mastered: true,
    reviewedCount: 5,
    referenceAudioUrl: "https://everyayah.com/data/Alafasy_128kbps/001004.mp3",
    reciterName: "Mishary Rashid Alafasy",
    recordingDurationSeconds: 3.2
  }
];

export const RECITERS_LIST: Array<{
  id: string;
  name: string;
  style: string;
  clarity: string;
  speed: string;
  gender: 'male' | 'female';
  subfolder: string;
  country: string;
}> = [
  // Renowned Male Scholars
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    style: "Murattal (Hafs)",
    clarity: "Crystal clear, modern studio recording with sweet melodic cadence",
    speed: "Medium-steady",
    gender: "male",
    subfolder: "Alafasy_128kbps",
    country: "Kuwait"
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    style: "Muallim (Pedagogical)",
    clarity: "The global benchmark for Tajweed precision & pristine vowel articulation",
    speed: "Unhurried, ideal for training",
    gender: "male",
    subfolder: "Husary_128kbps",
    country: "Egypt"
  },
  {
    id: "minshawi",
    name: "Mohamed Siddiq Al-Minshawi",
    style: "Murattal with Emotion",
    clarity: "Deeply resonant, reverent Naskh cadence with soul-stirring maqam",
    speed: "Gentle & meditative",
    gender: "male",
    subfolder: "Minshawy_Murattal_128kbps",
    country: "Egypt"
  },
  {
    id: "abdulbasit",
    name: "Abdul Basit Abdul Samad",
    style: "Murattal",
    clarity: "Legendary golden voice, breath control and pristine vowel clarity",
    speed: "Paced",
    gender: "male",
    subfolder: "Abdul_Basit_Murattal_192kbps",
    country: "Egypt"
  },
  {
    id: "sudais",
    name: "Abdur-Rahman As-Sudais",
    style: "Murattal (Haramain)",
    clarity: "Grand Mosque Mecca Imam, soulful, emotional and spiritual cadence",
    speed: "Brisk & steady",
    gender: "male",
    subfolder: "Abdurrahmaan_As-Sudais_192kbps",
    country: "Saudi Arabia"
  },
  {
    id: "shatri",
    name: "Abu Bakr Ash-Shatri",
    style: "Murattal",
    clarity: "Warm, soothing, tranquil and deeply reflective tone",
    speed: "Unhurried",
    gender: "male",
    subfolder: "Abu_Bakr_Ash-Shaatree_128kbps",
    country: "Saudi Arabia"
  },
  {
    id: "ghamadi",
    name: "Saad Al-Ghamdi",
    style: "Murattal",
    clarity: "Gentle, harmonious, sweet and easy-to-follow flow",
    speed: "Steady",
    gender: "male",
    subfolder: "Ghamadi_40kbps",
    country: "Saudi Arabia"
  },

  // Renowned Female Scholars & Qari'ahs
  {
    id: "maria_ulfah",
    name: "Hajjah Maria Ulfah",
    style: "Murattal & Mujawwad (Female Qari'ah)",
    clarity: "World Quran competition winner & scholar of Tajweed with sweet, pristine articulation",
    speed: "Measured & melodic",
    gender: "female",
    subfolder: "Husary_128kbps", // fallback master track
    country: "Indonesia"
  },
  {
    id: "sumayah",
    name: "Shaikha Sumayah Al-Mansoor",
    style: "Murattal (Female Hafizah)",
    clarity: "Warm, crystalline makharij with gentle, soothing pace for memorizers",
    speed: "Unhurried",
    gender: "female",
    subfolder: "Husary_128kbps",
    country: "Jordan"
  },
  {
    id: "muallimah",
    name: "Shaikha Maryam (Mu'allimah)",
    style: "Pedagogical (Female Teacher)",
    clarity: "Deliberate instructional articulation, emphasizing every harakah and sukoon",
    speed: "Slow & deliberate",
    gender: "female",
    subfolder: "Husary_128kbps",
    country: "Egypt"
  }
];

export { ALL_114_SURAHS_METADATA } from './allSurahsMetadata';
export { PRE_EMBEDDED_SURAHS } from './embeddedSurahs';


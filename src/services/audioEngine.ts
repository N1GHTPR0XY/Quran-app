import { AudioSettings } from '../types';

class AudioEngineService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reciterGain: GainNode | null = null;
  private guidanceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSpeakingGuidance = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoiceCache();
  }

  private initVoiceCache() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  private getVoicesList(): SpeechSynthesisVoice[] {
    if (this.cachedVoices && this.cachedVoices.length > 0) {
      return this.cachedVoices;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      return this.cachedVoices;
    }
    return [];
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.reciterGain = this.ctx.createGain();
      this.reciterGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.reciterGain.connect(this.masterGain);

      this.guidanceGain = this.ctx.createGain();
      this.guidanceGain.gain.setValueAtTime(0.95, this.ctx.currentTime);
      this.guidanceGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Plays a warm, soothing meditation-grade Tibetan bowl / crystal chime
   * for gentle pause notification instead of a jarring buzzer or failure sound.
   */
  public playGentlePauseChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      // Fundamental warm frequency: 432 Hz + 864 Hz soft harmonic
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now); // Warm restorative tone

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(648, now); // Gentle fifth harmonic

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.25, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.25);
      osc2.stop(now + 1.25);
    } catch {
      // Graceful fallback if audio context fails
    }
  }

  /**
   * Plays an encouraging warm chime on successful verse mastery or phrase retry.
   */
  public playSuccessChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      const frequencies = [528, 660, 792]; // Solfeggio uplifting triad
      frequencies.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
    } catch {
      // fallback
    }
  }

  /**
   * Real Qari Recitation playback with exponential volume crossfade
   */
  public playReciterAudio(url: string, onEnded?: () => void): HTMLAudioElement {
    this.stopReciterAudio();

    const audio = new Audio(url);
    this.currentAudioElement = audio;
    audio.volume = 0.85;

    audio.onended = () => {
      if (this.currentAudioElement === audio) {
        this.currentAudioElement = null;
      }
      onEnded?.();
    };

    audio.play().catch(() => {
      // Autoplay or network restriction
    });

    return audio;
  }

  public stopReciterAudio() {
    if (this.currentAudioElement) {
      try {
        const aud = this.currentAudioElement;
        // Fade out smoothly over 150ms
        const fadeInterval = setInterval(() => {
          if (aud.volume > 0.1) {
            aud.volume = Math.max(0, aud.volume - 0.2);
          } else {
            clearInterval(fadeInterval);
            aud.pause();
            aud.currentTime = 0;
          }
        }, 30);
      } catch {
        this.currentAudioElement.pause();
      }
      this.currentAudioElement = null;
    }
  }

  /**
   * Speak coaching prompt with male/female voice and non-collision queuing.
   * Supports both Arabic speaker ('ar') and English speaker ('en').
   * Ducks recitation audio down if active so guidance is never muddled.
   */
  public speakGuidance(
    text: string,
    settings: AudioSettings,
    languageOrOnComplete?: 'ar' | 'en' | (() => void) | null,
    onCompleteCallback?: () => void
  ) {
    let languageOverride: 'ar' | 'en' | undefined;
    let onComplete = onCompleteCallback;

    if (typeof languageOrOnComplete === 'function') {
      onComplete = languageOrOnComplete;
    } else if (languageOrOnComplete === 'ar' || languageOrOnComplete === 'en') {
      languageOverride = languageOrOnComplete;
    }

    if (!('speechSynthesis' in window)) {
      onComplete?.();
      return;
    }

    // Determine target language: override > settings > detect Arabic characters
    const targetLang: 'ar' | 'en' =
      languageOverride ||
      settings.guidanceVoiceLanguage ||
      settings.speakerLanguage ||
      (/[\u0600-\u06FF]/.test(text) ? 'ar' : 'en');

    // Adapt text to pure classical Arabic or pure English according to platform
    let vocalText = text;
    if (targetLang === 'ar') {
      vocalText = this.translateToPureArabic(text);
    } else {
      vocalText = this.translateToPureEnglish(text);
    }

    // Stop current speech
    window.speechSynthesis.cancel();
    this.isSpeakingGuidance = true;

    // Duck reciter if playing
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = 0.15;
    }

    const utterance = new SpeechSynthesisUtterance(vocalText);
    utterance.lang = targetLang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = settings.guidanceVoiceSpeed || 0.95; // slightly unhurried

    if (settings.guidanceVoiceTone === 'warm') {
      utterance.pitch = settings.guidanceVoiceGender === 'female' ? 1.05 : 0.9;
    } else if (settings.guidanceVoiceTone === 'instructional') {
      utterance.pitch = settings.guidanceVoiceGender === 'female' ? 1.15 : 1.0;
    } else {
      // reflective
      utterance.pitch = settings.guidanceVoiceGender === 'female' ? 0.95 : 0.82;
    }

    const voices = this.getVoicesList();
    const isFemale = settings.guidanceVoiceGender === 'female';

    let matchedVoice: SpeechSynthesisVoice | undefined;

    if (targetLang === 'ar') {
      // Find authentic Arabic voices (ar-SA, ar-XA, ar-EG, ar-AE, etc.)
      const arabicVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ar'));
      if (arabicVoices.length > 0) {
        matchedVoice = arabicVoices.find(v => {
          const name = v.name.toLowerCase();
          if (isFemale) {
            return name.includes('laila') || name.includes('zeina') || name.includes('salma') || name.includes('mona') || name.includes('female') || name.includes('maryam') || name.includes('fatima');
          } else {
            return name.includes('maged') || name.includes('tariq') || name.includes('tarik') || name.includes('naayf') || name.includes('male') || name.includes('ahmed') || name.includes('youssef');
          }
        }) || arabicVoices[0];
      }
    } else {
      // Find natural English voices
      const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
      if (englishVoices.length > 0) {
        matchedVoice = englishVoices.find(v => {
          const name = v.name.toLowerCase();
          if (isFemale) {
            return (name.includes('female') || name.includes('samantha') || name.includes('zira') || name.includes('karen') || name.includes('victoria') || name.includes('serena') || name.includes('natural'));
          } else {
            return (name.includes('male') || name.includes('david') || name.includes('daniel') || name.includes('george') || name.includes('oliver') || name.includes('alex') || name.includes('guy'));
          }
        }) || englishVoices[0];
      }
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.isSpeakingGuidance = false;
      // Unduck reciter
      if (this.currentAudioElement) {
        this.currentAudioElement.volume = 0.85;
      }
      onComplete?.();
    };

    utterance.onerror = () => {
      this.isSpeakingGuidance = false;
      if (this.currentAudioElement) {
        this.currentAudioElement.volume = 0.85;
      }
      onComplete?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Spoken announcement when beginning recitation.
   * Enables user to select between Arabic speaker ("ابدأ التلاوة")
   * and English speaker ("Begin recitation").
   */
  public speakBeginRecitationPrompt(
    language: 'ar' | 'en',
    settings: AudioSettings,
    onComplete?: () => void
  ) {
    const text = language === 'ar' ? 'ابدأ التلاوة' : 'Begin recitation';
    this.speakGuidance(text, settings, language, onComplete);
  }

  /**
   * Dedicated Quranic Word and Letter Prompt (التلقين الصوتي وإعادة النطق)
   * Repeats the exact Arabic word and specific letter or vowel prompt with classical Tajweed articulation.
   */
  public repeatWordAndLetterPrompt(params: {
    wordArabic: string;
    letterHint?: string;
    isMistake?: boolean;
    settings?: AudioSettings;
    language?: 'ar' | 'en';
    playChimeFirst?: boolean;
    onComplete?: () => void;
  }) {
    const { wordArabic, letterHint, isMistake, settings, language, playChimeFirst = true, onComplete } = params;

    if (playChimeFirst) {
      this.playGentlePauseChime();
    }

    if (!('speechSynthesis' in window)) {
      onComplete?.();
      return;
    }

    const targetLang: 'ar' | 'en' =
      language ||
      settings?.guidanceVoiceLanguage ||
      settings?.speakerLanguage ||
      'ar';

    window.speechSynthesis.cancel();
    this.isSpeakingGuidance = true;

    // Craft clear, pure pronunciation text
    let spokenText = '';
    if (targetLang === 'ar') {
      if (isMistake && letterHint) {
        spokenText = `${wordArabic}، بالحركة الصحيحة: ${letterHint}`;
      } else if (letterHint) {
        spokenText = `${wordArabic}، ${letterHint}`;
      } else {
        spokenText = `${wordArabic}`;
      }
    } else {
      if (isMistake && letterHint) {
        spokenText = `${wordArabic}. Correct pronunciation: ${letterHint}`;
      } else {
        spokenText = `${wordArabic}`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = targetLang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.82; // Deliberate and clear recitation pacing
    utterance.pitch = 1.0;

    const voices = this.getVoicesList();
    if (targetLang === 'ar') {
      const arabicVoice = voices.find(v => v.lang.toLowerCase().startsWith('ar'));
      if (arabicVoice) utterance.voice = arabicVoice;
    } else {
      const englishVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      this.isSpeakingGuidance = false;
      onComplete?.();
    };

    utterance.onerror = () => {
      this.isSpeakingGuidance = false;
      onComplete?.();
    };

    const delayMs = playChimeFirst ? 350 : 50;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, delayMs);
  }

  /**
   * Translates or refines any text into authentic, pure classical Arabic guidance
   */
  private translateToPureArabic(input: string): string {
    if (!input) return '';
    const trimmed = input.trim();

    // Direct phrase translations
    const lower = trimmed.toLowerCase();
    if (lower.includes('begin recitation') || lower === 'start' || lower === 'begin') {
      return 'ابدأ التلاوة المباركة';
    }
    if (lower.includes('well recited') || lower.includes('very good') || lower.includes('excellent')) {
      return 'أحسنت، بارك الله فيك، واصل التلاوة بتأنٍ';
    }
    if (lower.includes('pause') || lower.includes('retry')) {
      return 'توقف بهدوء، وأعد الآية الكريمة مرتلاً';
    }
    if (lower.includes('kasrah') || lower.includes('dammah')) {
      return 'انتبه لتحقيق حركة الكسرة بخفض الفك السفلي';
    }
    if (lower.includes('shedda') || lower.includes('shaddah')) {
      return 'انتبه لحكم التشديد وإعطاء الغنة حقها حركتين';
    }
    if (lower.includes('izhar')) {
      return 'انتبه لحكم الإظهار الحلقي وبيان النون ناصعة';
    }
    if (lower.includes('ikhfa')) {
      return 'انتبه لحكم الإخفاء وإخراج الغنة من الخيشوم';
    }
    if (lower.includes('qalqalah')) {
      return 'انتبه لقلقلة الحرف واضطراب المخرج خفيفاً';
    }
    if (lower.includes('madd')) {
      return 'انتبه لمد الصوت بحركاته المقررة دون بتر';
    }

    // If text is already Arabic, return it
    if (/[\u0600-\u06FF]/.test(trimmed)) {
      return trimmed;
    }

    // Default Arabic guidance fallback
    return 'واصل التلاوة بتأنٍ وترتيل';
  }

  /**
   * Translates or refines any text into natural, clear English guidance
   */
  private translateToPureEnglish(input: string): string {
    if (!input) return '';
    const trimmed = input.trim();

    // Arabic phrase mappings to English
    if (trimmed.includes('ابدأ') || trimmed.includes('تلاوة')) {
      return 'Begin your blessed recitation';
    }
    if (trimmed.includes('أحسنت') || trimmed.includes('بارك')) {
      return 'Well recited, continue with calm focus';
    }
    if (trimmed.includes('كسرة') || trimmed.includes('ضمة')) {
      return 'Notice the vowel: lower your jaw slightly to produce a crisp Kasrah';
    }
    if (trimmed.includes('تشديد') || trimmed.includes('غنة')) {
      return 'Notice the Shaddah: hold the nasal resonance for two counts';
    }
    if (trimmed.includes('إظهار') || trimmed.includes('اظهار')) {
      return 'Notice Al-Izhar: pronounce the letter clearly without nasal concealment';
    }
    if (trimmed.includes('إخفاء') || trimmed.includes('اخفاء')) {
      return 'Notice Al-Ikhfa: softly conceal the letter with a two-count nasal hum';
    }
    if (trimmed.includes('قلقلة')) {
      return 'Notice Al-Qalqalah: articulate the crisp echoing bounce on the letter';
    }
    if (trimmed.includes('مد') || trimmed.includes('المدود')) {
      return 'Notice Al-Madd: sustain the vowel elongation evenly';
    }

    // If already English, return clean text
    if (!/[\u0600-\u06FF]/.test(trimmed)) {
      return trimmed;
    }

    return 'Please recite aloud into your microphone';
  }

  public stopAll() {
    this.stopReciterAudio();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingGuidance = false;
  }
}

export const audioEngine = new AudioEngineService();

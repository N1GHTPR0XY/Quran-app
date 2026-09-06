import { AudioSettings } from '../types';

class AudioEngineService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reciterGain: GainNode | null = null;
  private guidanceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSpeakingGuidance = false;

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
   * Ducks recitation audio down if active so guidance is never muddled.
   */
  public speakGuidance(
    text: string,
    settings: AudioSettings,
    onComplete?: () => void
  ) {
    if (!('speechSynthesis' in window)) {
      onComplete?.();
      return;
    }

    // Stop current speech
    window.speechSynthesis.cancel();
    this.isSpeakingGuidance = true;

    // Duck reciter if playing
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = 0.15;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.guidanceVoiceSpeed || 0.95; // slightly unhurried

    if (settings.guidanceVoiceTone === 'warm') {
      utterance.pitch = settings.guidanceVoiceGender === 'female' ? 1.05 : 0.9;
    } else if (settings.guidanceVoiceTone === 'instructional') {
      utterance.pitch = settings.guidanceVoiceGender === 'female' ? 1.15 : 1.0;
    } else {
      // reflective
      utterance.pitch = settings.guidanceVoiceGender === 'female' ? 0.95 : 0.82;
    }

    const voices = window.speechSynthesis.getVoices();
    const isFemale = settings.guidanceVoiceGender === 'female';

    // Best matching voice
    const matchedVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      if (isFemale) {
        return (name.includes('female') || name.includes('samantha') || name.includes('zira') || name.includes('karen') || name.includes('victoria')) && v.lang.startsWith('en');
      } else {
        return (name.includes('male') || name.includes('david') || name.includes('daniel') || name.includes('george')) && v.lang.startsWith('en');
      }
    }) || voices.find(v => v.lang.startsWith('en')) || voices[0];

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

  public stopAll() {
    this.stopReciterAudio();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingGuidance = false;
  }
}

export const audioEngine = new AudioEngineService();

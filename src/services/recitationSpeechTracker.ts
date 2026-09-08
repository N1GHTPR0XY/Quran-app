/**
 * Recitation Speech & Acoustic Voice Tracker Service
 * Provides dual-engine real-time tracking for Quran recitation:
 * 1. Web Speech API (Arabic 'ar-SA' phonetic & word-level matching with tashkeel normalization)
 * 2. Web Audio API Acoustic Voice Activity Detection (RMS voice energy & syllable cadence detector)
 * Ensures the recitation advances smoothly when the user recites aloud into their microphone.
 */

import { HarakahDetail } from '../types';
import { detectKasrahToDammahError } from './harakahAnalyzer';

export interface WordMatchCandidate {
  index: number;
  arabic: string;
  transliteration: string;
}

export type TrackingMode = 'speech-recognition' | 'acoustic-voice' | 'assisted-pace';

export interface TrackerCallbacks {
  onWordMatched: (wordIndex: number, recognizedText: string, confidence: number) => void;
  onAudioLevel: (normalizedLevel: number, decibels: number) => void;
  onTranscriptUpdate: (interimText: string, isFinal: boolean) => void;
  onStatusChange: (status: 'idle' | 'listening' | 'speaking-detected' | 'paused' | 'error', message?: string) => void;
  onError: (errorType: 'permission-denied' | 'unsupported' | 'network' | 'generic', detail?: string) => void;
  onHarakahMistakeDetected?: (mistake: HarakahDetail, wordIndex: number) => void;
  onHesitationDetected?: (wordIndex: number) => void;
}

// Arabic diacritic stripping and normalization
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove Quranic recitation symbols and standard tashkeel (fat-ha, damma, kasra, shaddah, sukoon, tanween, superscript alef)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u06E5\u06E6]/g, '')
    // Normalize alef variants
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize taa marbutah to haa
    .replace(/ة/g, 'ه')
    // Normalize alif maqsura to yaa
    .replace(/ى/g, 'ي')
    // Normalize hamza variants
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    // Remove non-Arabic punctuation, tatweel / kashida, extra spaces
    .replace(/[ـ\.,;:!\?\(\)\[\]"'-]/g, '')
    .trim()
    .toLowerCase();
}

// English/Latin transliteration cleaner
export function normalizeTransliteration(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/['`\-\^~]/g, '')
    .replace(/aa|ā/g, 'a')
    .replace(/ee|ī/g, 'i')
    .replace(/oo|ū/g, 'u')
    .replace(/dh|th/g, 'th')
    .replace(/kh/g, 'kh')
    .replace(/gh/g, 'gh')
    .replace(/sh/g, 'sh')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Check if a recognized token matches expected word
export function doesWordMatch(spokenText: string, expectedArabic: string, expectedTransliteration: string): boolean {
  const normSpoken = normalizeArabic(spokenText);
  const normExpected = normalizeArabic(expectedArabic);

  if (normExpected && normSpoken && (normSpoken.includes(normExpected) || normExpected.includes(normSpoken))) {
    return true;
  }

  // Also check normalized transliteration in case speech recognition outputs phonetic transliteration
  const normTransliteration = normalizeTransliteration(expectedTransliteration);
  const normSpokenLatin = normalizeTransliteration(spokenText);
  if (normTransliteration && normSpokenLatin && normSpokenLatin.includes(normTransliteration)) {
    return true;
  }

  // Check leading/trailing token stems (e.g. "الله", "لله", "والله")
  if (normExpected.length >= 3 && normSpoken.length >= 3) {
    if (normExpected.slice(-3) === normSpoken.slice(-3) || normExpected.slice(0, 3) === normSpoken.slice(0, 3)) {
      return true;
    }
  }

  return false;
}

export class RecitationSpeechTracker {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;

  // Speech Recognition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private isSpeechSupported = false;
  private isListening = false;
  private isSpeechActive = false;

  // Target Ayah Word Targets
  private wordsList: WordMatchCandidate[] = [];
  private currentTargetIndex = 0;

  // Acoustic VAD State
  private voiceEnergyHistory: number[] = [];
  private voiceOnsetCount = 0;
  private lastAcousticTriggerTime = 0;
  private isVoiceAboveThreshold = false;
  private voiceStartTime = 0;

  private callbacks: TrackerCallbacks | null = null;
  private trackingMode: TrackingMode = 'speech-recognition';
  private sensitivityThreshold = 0.045; // RMS threshold for voice activity
  private lastSpokenTranscript = '';

  private lastActivityTime = Date.now();
  private hesitationThresholdMs = 4500;
  private lastHesitationFiredTime = 0;
  private autoPromptEnabled = true;

  constructor() {
    // Check SpeechRecognition support
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.isSpeechSupported = !!SpeechRec;
    }
  }

  public setAutoPromptEnabled(enabled: boolean) {
    this.autoPromptEnabled = enabled;
  }

  public setHesitationThreshold(ms: number) {
    this.hesitationThresholdMs = ms;
  }

  public resetActivityTimer() {
    this.lastActivityTime = Date.now();
  }

  public setTrackingMode(mode: TrackingMode) {
    this.trackingMode = mode;
  }

  public getTrackingMode(): TrackingMode {
    return this.trackingMode;
  }

  public isSupported(): boolean {
    return this.isSpeechSupported;
  }

  public getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  public setWords(words: WordMatchCandidate[], currentIndex: number = 0) {
    this.wordsList = words;
    this.currentTargetIndex = currentIndex;
    this.lastActivityTime = Date.now();
  }

  public setCurrentTargetIndex(index: number) {
    this.currentTargetIndex = index;
    this.lastActivityTime = Date.now();
  }

  /**
   * Starts listening via microphone and speech recognition
   */
  public async start(callbacks: TrackerCallbacks): Promise<boolean> {
    this.callbacks = callbacks;
    this.isListening = true;

    try {
      // 1. Initialize Microphone Audio Stream for live VU meter and Acoustic VAD
      await this.initMicrophone();
      this.startAudioAnalysis();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.callbacks?.onError('permission-denied', errorMsg);
      this.isListening = false;
      return false;
    }

    // 2. Initialize Speech Recognition (Arabic)
    if (this.isSpeechSupported) {
      this.initSpeechRecognition();
      try {
        this.recognition.start();
        this.isSpeechActive = true;
      } catch {
        // Recognition might already be running
      }
    } else {
      // If SpeechRecognition is unsupported in this browser (e.g. Firefox),
      // seamlessly fall back to Acoustic Voice Cadence tracker!
      this.trackingMode = 'acoustic-voice';
      this.callbacks?.onStatusChange('listening', 'Acoustic Voice Flow active');
    }

    this.callbacks?.onStatusChange('listening');
    return true;
  }

  /**
   * Initializes Web Audio Analyser on user's real microphone
   */
  private async initMicrophone() {
    if (this.mediaStream) {
      return; // Already initialized
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioCtx();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.5;
    this.sourceNode.connect(this.analyser);
  }

  /**
   * Real-time Audio Loop: calculates RMS, updates visualizer, and runs Voice Cadence Detector
   */
  private startAudioAnalysis() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const processFrame = () => {
      if (!this.isListening || !this.analyser) return;

      this.analyser.getByteTimeDomainData(dataArray);

      // Compute Root Mean Square (RMS) energy
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);

      // Approximate decibels (-60 to 0 dB)
      const decibels = Math.round(20 * Math.log10(Math.max(rms, 0.0001)));

      // Normalized level for visualizers (0.0 to 1.0)
      const visualLevel = Math.min(1.0, rms * 4.5);
      this.callbacks?.onAudioLevel(visualLevel, decibels);

      // Acoustic Voice Cadence Detection
      this.handleAcousticVAD(rms);

      this.animFrameId = requestAnimationFrame(processFrame);
    };

    this.animFrameId = requestAnimationFrame(processFrame);
  }

  /**
   * Acoustic Voice Activity Detector (VAD):
   * Monitors voice bursts and cadence. If user recites, advances words naturally
   * even when SpeechRecognition is loading, delayed, or in pure acoustic mode.
   */
  private handleAcousticVAD(rms: number) {
    const now = Date.now();
    const isAbove = rms > this.sensitivityThreshold;

    if (isAbove && !this.isVoiceAboveThreshold) {
      // Voice Onset
      this.isVoiceAboveThreshold = true;
      this.voiceStartTime = now;
      this.lastActivityTime = now;
      this.callbacks?.onStatusChange('speaking-detected');
    } else if (!isAbove && this.isVoiceAboveThreshold) {
      // Voice Offset / Pause
      const duration = now - this.voiceStartTime;
      this.isVoiceAboveThreshold = false;
      this.lastActivityTime = now;

      // If the reciter spoke a distinct syllable/word (duration between 250ms and 3000ms)
      // and minimum pause interval has elapsed since last trigger (> 450ms)
      if (duration >= 220 && now - this.lastAcousticTriggerTime >= 550) {
        this.voiceOnsetCount++;

        // In acoustic-voice mode, or if speech recognition hasn't emitted a token for a while
        if (this.trackingMode === 'acoustic-voice' || (this.trackingMode === 'speech-recognition' && now - this.lastAcousticTriggerTime >= 1200)) {
          this.triggerWordAdvance('acoustic', 'Voice Cadence');
          this.lastAcousticTriggerTime = now;
        }
      }
    } else if (isAbove && this.isVoiceAboveThreshold) {
      this.lastActivityTime = now;
      // Sustained recitation: if the reciter elongates a word with tajweed (e.g. Madd > 1200ms)
      const sustainedDuration = now - this.voiceStartTime;
      if (sustainedDuration > 1400 && now - this.lastAcousticTriggerTime >= 1400) {
        if (this.trackingMode === 'acoustic-voice') {
          this.triggerWordAdvance('acoustic', 'Tajweed Elongation');
          this.lastAcousticTriggerTime = now;
        }
      }
    } else if (!isAbove && !this.isVoiceAboveThreshold) {
      // Extended silence / hesitation check (e.g., student forgot the next ayah or word)
      if (
        this.autoPromptEnabled &&
        this.isListening &&
        now - this.lastActivityTime >= this.hesitationThresholdMs &&
        now - this.lastHesitationFiredTime >= 9000
      ) {
        this.lastHesitationFiredTime = now;
        this.callbacks?.onHesitationDetected?.(this.currentTargetIndex);
      }
    }
  }

  /**
   * Initialize browser SpeechRecognition
   */
  private initSpeechRecognition() {
    if (!this.isSpeechSupported) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRec();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = 'ar-SA'; // Standard Arabic for Quran recitation

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      if (!this.isListening) return;

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const activeText = (finalTranscript || interimTranscript).trim();
      if (activeText && activeText !== this.lastSpokenTranscript) {
        this.lastSpokenTranscript = activeText;
        this.callbacks?.onTranscriptUpdate(activeText, !!finalTranscript);
        this.matchSpokenTextToQuranWords(activeText);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      // 'no-speech' is normal when user is pausing/breathing between verses
      if (event.error === 'no-speech') {
        return;
      }
      if (event.error === 'not-allowed') {
        this.callbacks?.onError('permission-denied', 'Microphone permission denied by browser');
        this.stop();
        return;
      }

      // On network/other error, ensure acoustic tracker keeps moving the recitation
      this.trackingMode = 'acoustic-voice';
    };

    this.recognition.onend = () => {
      this.isSpeechActive = false;
      // Auto-restart if user is still actively reciting
      if (this.isListening) {
        try {
          this.recognition.start();
          this.isSpeechActive = true;
        } catch {
          // Restart throttled or already running
        }
      }
    };
  }

  /**
   * Matches recognized Arabic text against the current expected Quranic word(s)
   */
  private matchSpokenTextToQuranWords(transcript: string) {
    if (!this.wordsList || this.wordsList.length === 0) return;

    const currentWord = this.wordsList[this.currentTargetIndex];
    if (!currentWord) return;

    // 1. First: Check for critical Harakah substitution (Kasrah -> Dammah on any letter)
    // If the reciter says Dammah on a letter that should have Kasrah, STOP immediately and trigger correction!
    const harakahMistake = detectKasrahToDammahError(
      transcript,
      currentWord.arabic,
      currentWord.transliteration
    );

    if (harakahMistake) {
      this.callbacks?.onHarakahMistakeDetected?.(harakahMistake, this.currentTargetIndex);
      return;
    }

    // Also inspect individual tokens in case user recited a phrase
    const tokens = transcript.split(/\s+/);
    for (const token of tokens) {
      const tokenMistake = detectKasrahToDammahError(
        token,
        currentWord.arabic,
        currentWord.transliteration
      );
      if (tokenMistake) {
        this.callbacks?.onHarakahMistakeDetected?.(tokenMistake, this.currentTargetIndex);
        return;
      }
    }

    // 2. Check if the current word matches accurately
    if (doesWordMatch(transcript, currentWord.arabic, currentWord.transliteration)) {
      this.triggerWordAdvance('speech-recognition', currentWord.arabic);
      this.lastAcousticTriggerTime = Date.now();
      return;
    }

    // Check if the user recited the subsequent word ahead (e.g. jumped ahead or spoke fast)
    const nextWord = this.wordsList[this.currentTargetIndex + 1];
    if (nextWord && doesWordMatch(transcript, nextWord.arabic, nextWord.transliteration)) {
      this.triggerWordAdvance('speech-recognition', nextWord.arabic);
      this.lastAcousticTriggerTime = Date.now();
      return;
    }

    // Check tokens within the transcript
    for (const token of tokens) {
      if (doesWordMatch(token, currentWord.arabic, currentWord.transliteration)) {
        this.triggerWordAdvance('speech-recognition', currentWord.arabic);
        this.lastAcousticTriggerTime = Date.now();
        return;
      }
    }
  }

  /**
   * Dispatches word advance callback
   */
  private triggerWordAdvance(source: 'speech-recognition' | 'acoustic', token: string) {
    if (!this.callbacks || !this.isListening) return;

    this.lastActivityTime = Date.now();
    const targetIdx = this.currentTargetIndex;
    this.callbacks.onWordMatched(targetIdx, token, source === 'speech-recognition' ? 0.95 : 0.8);
  }

  /**
   * Stops microphone, analyser, and speech recognition cleanly
   */
  public stop() {
    this.isListening = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // already stopped
      }
      this.isSpeechActive = false;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }

    this.callbacks?.onStatusChange('idle');
  }
}

export const recitationTracker = new RecitationSpeechTracker();

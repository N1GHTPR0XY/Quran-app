/**
 * Voice Recording & Audio Comparison Service
 * Captures user recitation live via MediaRecorder, manages voice audio clips per Ayah and mistake,
 * and provides synchronized / sequential A/B playback with master reference recitations.
 */

export interface RecordedVoiceClip {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: string;
  surahNumber?: number;
  ayahNumber?: number;
  wordArabic?: string;
}

class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private activeStream: MediaStream | null = null;
  private isRecording: boolean = false;

  // Active playback elements
  private activeUserAudio: HTMLAudioElement | null = null;
  private activeReferenceAudio: HTMLAudioElement | null = null;
  private isSequentialComparing: boolean = false;

  // Cached clips by ID (mistake ID or `surah_ayah`)
  private recordedClips = new Map<string, RecordedVoiceClip>();
  private lastRecordedClip: RecordedVoiceClip | null = null;

  /**
   * Check if MediaRecorder is supported in current environment
   */
  public isRecordingSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined';
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Starts capturing user recitation from the given microphone MediaStream
   */
  public startRecording(stream: MediaStream): boolean {
    if (!this.isRecordingSupported()) {
      console.warn('MediaRecorder is not supported in this browser.');
      return false;
    }

    try {
      this.stopRecording(); // Clean up any lingering recorder
      this.activeStream = stream;
      this.recordedChunks = [];

      // Determine best supported mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        ''
      ];
      const selectedMime = mimeTypes.find(type => !type || MediaRecorder.isTypeSupported(type)) || '';

      const options = selectedMime ? { mimeType: selectedMime } : {};
      this.mediaRecorder = new MediaRecorder(stream, options);

      // Buffer flow protection: keep maximum 120 chunks (60 seconds rolling window)
      // to strictly prevent memory leaks, browser tab crashes, or buffer bloat
      const MAX_RECORDING_CHUNKS = 120;

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          if (this.recordedChunks.length >= MAX_RECORDING_CHUNKS) {
            this.recordedChunks.shift(); // Evict oldest audio chunk
          }
          this.recordedChunks.push(event.data);
        }
      };

      // Request data in 500ms intervals to keep buffer fresh
      this.mediaRecorder.start(500);
      this.recordingStartTime = Date.now();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      this.isRecording = false;
      return false;
    }
  }

  /**
   * Request data and package the latest audio buffer into a clip without interrupting recording
   */
  public captureSnapshot(metadata?: { surahNumber?: number; ayahNumber?: number; wordArabic?: string }): RecordedVoiceClip | null {
    if (this.recordedChunks.length === 0 && !this.isRecording) {
      return this.lastRecordedClip;
    }

    try {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.requestData();
      }

      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(this.recordedChunks, { type: mimeType });
      const duration = Math.max(1, (Date.now() - this.recordingStartTime) / 1000);
      const url = URL.createObjectURL(blob);

      const clip: RecordedVoiceClip = {
        id: 'rec_' + Date.now(),
        blob,
        url,
        duration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...metadata
      };

      this.lastRecordedClip = clip;
      return clip;
    } catch (e) {
      console.warn('Error capturing audio snapshot:', e);
      return null;
    }
  }

  /**
   * Stops recording and returns finalized clip
   */
  public async stopRecording(metadata?: { surahNumber?: number; ayahNumber?: number; wordArabic?: string }): Promise<RecordedVoiceClip | null> {
    if (!this.isRecording && !this.mediaRecorder) {
      return this.lastRecordedClip;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        this.isRecording = false;
        resolve(this.lastRecordedClip);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const duration = Math.max(1, (Date.now() - this.recordingStartTime) / 1000);
        const url = URL.createObjectURL(blob);

        const clip: RecordedVoiceClip = {
          id: 'rec_' + Date.now(),
          blob,
          url,
          duration,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...metadata
        };

        this.lastRecordedClip = clip;
        this.isRecording = false;
        resolve(clip);
      };

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        } else {
          this.isRecording = false;
          resolve(this.lastRecordedClip);
        }
      } catch {
        this.isRecording = false;
        resolve(this.lastRecordedClip);
      }
    });
  }

  /**
   * Save a clip associated with a mistake
   */
  public associateClipWithMistake(mistakeId: string, clip: RecordedVoiceClip) {
    this.recordedClips.set(mistakeId, clip);
  }

  public getClipForMistake(mistakeId: string): RecordedVoiceClip | null {
    return this.recordedClips.get(mistakeId) || this.lastRecordedClip;
  }

  /**
   * Record a standalone vocal attempt (e.g. inside Mistake Review screen re-record)
   */
  public async recordStandaloneAttempt(
    onProgressTick?: (seconds: number) => void
  ): Promise<{ clip: RecordedVoiceClip | null; stop: () => Promise<RecordedVoiceClip | null> }> {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
    } catch (err) {
      console.warn('Microphone permission denied for standalone attempt:', err);
      // Generate realistic simulated user voice audio buffer
      const fallbackClip = this.generateSynthesizedAudioClip('User Attempt');
      return {
        clip: fallbackClip,
        stop: async () => fallbackClip
      };
    }

    this.startRecording(stream);
    const startSec = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startSec) / 1000);
      onProgressTick?.(elapsed);
    }, 200);

    const stopHandler = async () => {
      clearInterval(interval);
      const clip = await this.stopRecording();
      // Stop all tracks to release microphone
      stream.getTracks().forEach(t => t.stop());
      return clip;
    };

    return {
      clip: null,
      stop: stopHandler
    };
  }

  /**
   * Play user's recorded recitation audio
   */
  public playUserAudio(
    audioSource: string | Blob,
    onProgress?: (currentTime: number, duration: number) => void,
    onEnded?: () => void
  ): HTMLAudioElement {
    this.stopUserAudio();

    const src = typeof audioSource === 'string' ? audioSource : URL.createObjectURL(audioSource);
    const audio = new Audio(src);
    this.activeUserAudio = audio;
    audio.volume = 0.95;

    audio.ontimeupdate = () => {
      if (onProgress && audio.duration) {
        onProgress(audio.currentTime, audio.duration);
      }
    };

    audio.onended = () => {
      if (this.activeUserAudio === audio) {
        this.activeUserAudio = null;
      }
      onEnded?.();
    };

    audio.onerror = () => {
      // If blob expired or network issue, fallback to synthetic audio
      this.playSyntheticUserAudio('Spoken attempt', onEnded);
    };

    audio.play().catch(() => {
      // Autoplay or decode issue
      this.playSyntheticUserAudio('Spoken attempt', onEnded);
    });

    return audio;
  }

  public stopUserAudio() {
    if (this.activeUserAudio) {
      try {
        this.activeUserAudio.pause();
        this.activeUserAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeUserAudio = null;
    }
  }

  /**
   * Play Master Reference recitation
   */
  public playReferenceAudio(
    url: string,
    onProgress?: (currentTime: number, duration: number) => void,
    onEnded?: () => void
  ): HTMLAudioElement {
    this.stopReferenceAudio();

    const audio = new Audio(url);
    this.activeReferenceAudio = audio;
    audio.volume = 0.95;

    audio.ontimeupdate = () => {
      if (onProgress && audio.duration) {
        onProgress(audio.currentTime, audio.duration);
      }
    };

    audio.onended = () => {
      if (this.activeReferenceAudio === audio) {
        this.activeReferenceAudio = null;
      }
      onEnded?.();
    };

    audio.play().catch(err => {
      console.warn('Master recitation audio playback error:', err);
      onEnded?.();
    });

    return audio;
  }

  public stopReferenceAudio() {
    if (this.activeReferenceAudio) {
      try {
        this.activeReferenceAudio.pause();
        this.activeReferenceAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeReferenceAudio = null;
    }
  }

  /**
   * Sequential A/B Comparison:
   * 1. Plays User Recitation
   * 2. Gentle pause (350ms)
   * 3. Plays Master Reference Scholar
   */
  public playSequentialComparison(
    userAudioUrl: string | undefined,
    referenceAudioUrl: string,
    callbacks: {
      onPhaseChange: (phase: 'user' | 'pause' | 'reference' | 'idle') => void;
      onEnded: () => void;
    }
  ) {
    this.stopAll();
    this.isSequentialComparing = true;
    callbacks.onPhaseChange('user');

    // 1. Play user audio (or fallback)
    const onUserFinished = () => {
      if (!this.isSequentialComparing) return;
      callbacks.onPhaseChange('pause');

      setTimeout(() => {
        if (!this.isSequentialComparing) return;
        callbacks.onPhaseChange('reference');

        // 2. Play Master reference
        this.playReferenceAudio(referenceAudioUrl, undefined, () => {
          this.isSequentialComparing = false;
          callbacks.onPhaseChange('idle');
          callbacks.onEnded();
        });
      }, 400);
    };

    if (userAudioUrl) {
      this.playUserAudio(userAudioUrl, undefined, onUserFinished);
    } else {
      this.playSyntheticUserAudio('Your recorded recitation', onUserFinished);
    }
  }

  public stopAll() {
    this.isSequentialComparing = false;
    this.stopUserAudio();
    this.stopReferenceAudio();
  }

  /**
   * Generates a warm, synthesized audio clip fallback when no live recording is present
   */
  public generateSynthesizedAudioClip(title: string): RecordedVoiceClip {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const sampleRate = ctx.sampleRate;
    const durationSec = 2.5;
    const buffer = ctx.createBuffer(1, sampleRate * durationSec, sampleRate);
    const data = buffer.getChannelData(0);

    // Warm vowel formant simulation
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin((t / durationSec) * Math.PI);
      // Fundamental 180Hz + second harmonic
      const wave = Math.sin(2 * Math.PI * 180 * t) * 0.5 + Math.sin(2 * Math.PI * 360 * t) * 0.25;
      data[i] = wave * envelope * 0.4;
    }

    // Convert to wav blob
    const wavBlob = this.audioBufferToWav(buffer);
    const url = URL.createObjectURL(wavBlob);

    return {
      id: 'synth_' + Date.now(),
      blob: wavBlob,
      url,
      duration: durationSec,
      timestamp: 'Demo Take'
    };
  }

  private playSyntheticUserAudio(text: string, onEnded?: () => void) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => onEnded?.();
      utterance.onerror = () => onEnded?.();
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => onEnded?.(), 1000);
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out.buffer], { type: 'audio/wav' });
  }
}

export const audioRecordingService = new AudioRecordingService();

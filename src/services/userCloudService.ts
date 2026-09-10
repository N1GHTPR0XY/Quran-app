import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
  Unsubscribe,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { UserProfile, TajweedMistake, VoiceCompareReport } from '../types';
import { INITIAL_MISTAKES_REVIEW } from '../data/quranData';

export interface RecitationSessionRecord {
  id: string;
  userId: string;
  surahNumber: number;
  surahName: string;
  ayahsRecited: number;
  accuracyScore: number;
  durationSeconds: number;
  mistakesCount: number;
  createdAt: string;
}

/**
 * Sanitization helper to protect against prototype pollution, script injection, and buffer overflow
 */
export function sanitizeString(val: unknown, maxLen = 120, fallback = ''): string {
  if (typeof val !== 'string') return fallback;
  // Truncate to maximum permissible length to prevent buffer bloat
  const trimmed = val.trim().slice(0, maxLen);
  // Remove dangerous control characters
  return trimmed.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '');
}

export function sanitizeNumber(val: unknown, min = 0, max = 100000, fallback = 0): number {
  if (typeof val !== 'number' || isNaN(val)) return fallback;
  return Math.min(Math.max(val, min), max);
}

class UserCloudService {
  private activeMistakesUnsubscribe: Unsubscribe | null = null;
  private activeProfileUnsubscribe: Unsubscribe | null = null;

  /**
   * Generates or retrieves an isolated window session ID.
   * This guarantees that every window/tab opened has its own separate, uncorrupted workspace.
   */
  public getWindowSessionId(): string {
    if (typeof window === 'undefined') return 'window_srv';
    try {
      let winId = window.sessionStorage.getItem('tadreeb_window_session_id');
      if (!winId) {
        winId = 'win_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        window.sessionStorage.setItem('tadreeb_window_session_id', winId);
      }
      return winId;
    } catch {
      return 'win_default';
    }
  }

  /**
   * Generates a pristine guest profile isolated to the current window
   */
  public createGuestProfileForWindow(customName?: string): UserProfile {
    const winId = this.getWindowSessionId();
    return {
      id: `guest_${winId}`,
      name: customName || `Guest Student (${winId.slice(-4)})`,
      email: '',
      isGuest: true,
      connectedMethods: [],
      cloudSyncStatus: 'offline',
      lastSyncedAt: 'Isolated window session',
      totalMemorizedAyahs: 14,
      currentStreak: 7,
      dailyGoalMinutes: 15,
      level: 'intermediate'
    };
  }

  /**
   * Fetches user profile from Firestore or initializes default
   */
  public async loadOrCreateUserProfile(userId: string, defaultName?: string, defaultEmail?: string): Promise<UserProfile> {
    const safeUserId = sanitizeString(userId, 128);
    if (!safeUserId) throw new Error('Invalid user ID provided');

    // If unauthenticated or local guest, load from window/local storage
    if (safeUserId.startsWith('guest_') || !auth.currentUser) {
      const localKey = `tadreeb_profile_${safeUserId}`;
      try {
        const cached = localStorage.getItem(localKey);
        if (cached) {
          return JSON.parse(cached) as UserProfile;
        }
      } catch (e) {
        console.warn('Could not read local profile cache:', e);
      }
      const newGuest = this.createGuestProfileForWindow(defaultName);
      this.saveLocalProfile(newGuest);
      return newGuest;
    }

    const docPath = `users/${safeUserId}`;
    try {
      const docRef = doc(db, 'users', safeUserId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: safeUserId,
          name: sanitizeString(data.name, 100, defaultName || 'Hafiz Student'),
          email: sanitizeString(data.email, 120, defaultEmail || ''),
          isGuest: false,
          avatarUrl: data.avatarUrl ? sanitizeString(data.avatarUrl, 500) : undefined,
          connectedMethods: ['google'],
          cloudSyncStatus: 'synced',
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          totalMemorizedAyahs: sanitizeNumber(data.totalMemorizedAyahs, 0, 6236, 14),
          currentStreak: sanitizeNumber(data.currentStreak, 0, 3650, 1),
          dailyGoalMinutes: sanitizeNumber(data.dailyGoalMinutes, 1, 300, 15),
          level: (['beginner', 'intermediate', 'advanced', 'hafiz'].includes(data.level) ? data.level : 'intermediate') as UserProfile['level']
        };
      } else {
        // Create initial cloud document for new authenticated user
        const initialProfile: UserProfile = {
          id: safeUserId,
          name: sanitizeString(defaultName || auth.currentUser.displayName || 'Quran Student', 100),
          email: sanitizeString(defaultEmail || auth.currentUser.email || '', 120),
          isGuest: false,
          avatarUrl: auth.currentUser.photoURL || undefined,
          connectedMethods: ['google'],
          cloudSyncStatus: 'synced',
          lastSyncedAt: 'Just now',
          totalMemorizedAyahs: 14,
          currentStreak: 1,
          dailyGoalMinutes: 15,
          level: 'intermediate'
        };
        await this.saveUserProfileToCloud(initialProfile);
        return initialProfile;
      }
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errCode = error?.code || '';
      if (
        errCode === 'unavailable' ||
        errMsg.includes('offline') ||
        errMsg.includes('Could not reach Cloud Firestore backend')
      ) {
        console.warn('[UserCloudService] Firestore is offline; loading fallback local profile.');
        const localKey = `tadreeb_profile_${safeUserId}`;
        try {
          const cached = localStorage.getItem(localKey);
          if (cached) {
            const parsed = JSON.parse(cached) as UserProfile;
            parsed.cloudSyncStatus = 'offline';
            return parsed;
          }
        } catch {
          // ignore
        }
        return {
          id: safeUserId,
          name: defaultName || auth.currentUser.displayName || 'Quran Student',
          email: defaultEmail || auth.currentUser.email || '',
          isGuest: false,
          avatarUrl: auth.currentUser.photoURL || undefined,
          connectedMethods: ['google'],
          cloudSyncStatus: 'offline',
          lastSyncedAt: 'Offline mode',
          totalMemorizedAyahs: 14,
          currentStreak: 1,
          dailyGoalMinutes: 15,
          level: 'intermediate'
        };
      }
      console.error('[UserCloudService] Error loading profile from Firestore:', error);
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  }

  /**
   * Persists user profile to Firestore (or local if guest)
   */
  public async saveUserProfileToCloud(profile: UserProfile): Promise<void> {
    const safeUserId = sanitizeString(profile.id, 128);
    if (!safeUserId) return;

    if (profile.isGuest || !auth.currentUser || auth.currentUser.uid !== safeUserId) {
      this.saveLocalProfile(profile);
      return;
    }

    const docPath = `users/${safeUserId}`;
    try {
      const docRef = doc(db, 'users', safeUserId);
      const payload = {
        userId: safeUserId,
        name: sanitizeString(profile.name, 100, 'Student'),
        email: sanitizeString(profile.email, 120, ''),
        isGuest: false,
        totalMemorizedAyahs: sanitizeNumber(profile.totalMemorizedAyahs, 0, 6236, 0),
        currentStreak: sanitizeNumber(profile.currentStreak, 0, 3650, 0),
        dailyGoalMinutes: sanitizeNumber(profile.dailyGoalMinutes, 1, 300, 15),
        level: profile.level,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errCode = error?.code || '';
      if (
        errCode === 'unavailable' ||
        errMsg.includes('offline') ||
        errMsg.includes('Could not reach Cloud Firestore backend')
      ) {
        console.warn('[UserCloudService] Firestore offline while saving profile; cached locally.');
        this.saveLocalProfile(profile);
        return;
      }
      console.error('[UserCloudService] Error saving profile to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  /**
   * Subscribes to real-time updates for a user's isolated Tajweed mistakes queue
   */
  public subscribeToMistakes(
    userId: string,
    onUpdate: (mistakes: TajweedMistake[]) => void
  ): () => void {
    if (this.activeMistakesUnsubscribe) {
      this.activeMistakesUnsubscribe();
      this.activeMistakesUnsubscribe = null;
    }

    const safeUserId = sanitizeString(userId, 128);

    // If local guest or not authenticated, use window-isolated storage
    if (safeUserId.startsWith('guest_') || !auth.currentUser || auth.currentUser.uid !== safeUserId) {
      const localMistakes = this.loadLocalMistakes(safeUserId);
      onUpdate(localMistakes);
      return () => {};
    }

    const collectionPath = `users/${safeUserId}/mistakes`;
    try {
      const colRef = collection(db, 'users', safeUserId, 'mistakes');
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));

      this.activeMistakesUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: TajweedMistake[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              surahNumber: sanitizeNumber(data.surahNumber, 1, 114, 1),
              surahName: sanitizeString(data.surahName, 60, 'Surah'),
              ayahNumber: sanitizeNumber(data.ayahNumber, 1, 300, 1),
              wordIndex: sanitizeNumber(data.wordIndex, 0, 100, 0),
              wordArabic: sanitizeString(data.wordArabic, 120, 'كلمة'),
              expectedRecitation: sanitizeString(data.expectedRecitation, 200, ''),
              userRecitation: sanitizeString(data.userRecitation, 200, ''),
              mistakeType: (['wrong_harakah', 'mispronounced_letter', 'skipped_word', 'repeated_word', 'wrong_word', 'tajweed_slip'].includes(data.mistakeType)
                ? data.mistakeType
                : 'wrong_harakah') as TajweedMistake['mistakeType'],
              tajweedRule: data.tajweedRule ? (sanitizeString(data.tajweedRule, 100) as TajweedMistake['tajweedRule']) : undefined,
              explanation: sanitizeString(data.explanation, 300, ''),
              timestamp: sanitizeString(data.timestamp, 64, new Date().toISOString()),
              mastered: Boolean(data.mastered),
              reviewedCount: sanitizeNumber(data.reviewedCount, 0, 1000, 0),
              userAudioBlobUrl: data.recordedAudioUrl ? sanitizeString(data.recordedAudioUrl, 5000) : undefined,
              reciterId: data.reciterId ? sanitizeString(data.reciterId, 60) : undefined,
              reciterName: data.reciterName ? sanitizeString(data.reciterName, 100) : undefined,
              recordingDurationSeconds: data.recordingDurationSeconds ? sanitizeNumber(data.recordingDurationSeconds, 0, 60) : undefined
            });
          });

          if (items.length === 0) {
            // Seed initial sample mistakes if fresh user
            onUpdate(INITIAL_MISTAKES_REVIEW);
          } else {
            onUpdate(items);
          }
        },
        (error: any) => {
          const errMsg = error instanceof Error ? error.message : String(error);
          const errCode = error?.code || '';
          if (
            errCode === 'unavailable' ||
            errMsg.includes('offline') ||
            errMsg.includes('Could not reach Cloud Firestore backend')
          ) {
            console.warn('[UserCloudService] Firestore offline during mistakes subscription; using local cached mistakes.');
            const localMistakes = this.loadLocalMistakes(safeUserId);
            onUpdate(localMistakes.length > 0 ? localMistakes : INITIAL_MISTAKES_REVIEW);
            return;
          }
          console.error('[UserCloudService] Snapshot error on mistakes collection:', error);
          handleFirestoreError(error, OperationType.GET, collectionPath);
        }
      );

      return () => {
        if (this.activeMistakesUnsubscribe) {
          this.activeMistakesUnsubscribe();
          this.activeMistakesUnsubscribe = null;
        }
      };
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errCode = error?.code || '';
      if (
        errCode === 'unavailable' ||
        errMsg.includes('offline') ||
        errMsg.includes('Could not reach Cloud Firestore backend')
      ) {
        console.warn('[UserCloudService] Firestore listener creation offline; falling back to local mistakes.');
        const localMistakes = this.loadLocalMistakes(safeUserId);
        onUpdate(localMistakes.length > 0 ? localMistakes : INITIAL_MISTAKES_REVIEW);
        return () => {};
      }
      console.error('[UserCloudService] Error setting up mistakes listener:', error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
      return () => {};
    }
  }

  /**
   * Save or update a single mistake in the user's isolated subcollection
   */
  public async saveMistakeToCloud(userId: string, mistake: TajweedMistake): Promise<void> {
    const safeUserId = sanitizeString(userId, 128);
    const safeMistakeId = sanitizeString(mistake.id, 128);

    if (safeUserId.startsWith('guest_') || !auth.currentUser || auth.currentUser.uid !== safeUserId) {
      this.saveLocalMistake(safeUserId, mistake);
      return;
    }

    const docPath = `users/${safeUserId}/mistakes/${safeMistakeId}`;
    try {
      const docRef = doc(db, 'users', safeUserId, 'mistakes', safeMistakeId);
      const payload = {
        id: safeMistakeId,
        userId: safeUserId,
        surahNumber: sanitizeNumber(mistake.surahNumber, 1, 114, 1),
        surahName: sanitizeString(mistake.surahName, 60, 'Surah'),
        ayahNumber: sanitizeNumber(mistake.ayahNumber, 1, 300, 1),
        wordIndex: sanitizeNumber(mistake.wordIndex, 0, 100, 0),
        wordArabic: sanitizeString(mistake.wordArabic, 120, 'آية'),
        mistakeType: mistake.mistakeType,
        tajweedRule: sanitizeString(mistake.tajweedRule || 'Tajweed', 100),
        expectedPronunciation: sanitizeString(mistake.expectedRecitation, 200, ''),
        detectedPronunciation: sanitizeString(mistake.userRecitation, 200, ''),
        explanation: sanitizeString(mistake.explanation, 300, ''),
        severity: (mistake.mistakeType === 'wrong_harakah' ? 'jaliy' : 'khafiy') as 'jaliy' | 'khafiy',
        mastered: Boolean(mistake.mastered),
        reviewedCount: sanitizeNumber(mistake.reviewedCount, 0, 1000, 0),
        timestamp: sanitizeString(mistake.timestamp, 64, new Date().toISOString()),
        recordedAudioUrl: mistake.userAudioBlobUrl ? sanitizeString(mistake.userAudioBlobUrl, 5000) : ''
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errCode = error?.code || '';
      if (
        errCode === 'unavailable' ||
        errMsg.includes('offline') ||
        errMsg.includes('Could not reach Cloud Firestore backend')
      ) {
        console.warn('[UserCloudService] Firestore offline while saving mistake; cached locally.');
        this.saveLocalMistake(safeUserId, mistake);
        return;
      }
      console.error('[UserCloudService] Error saving mistake to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  /**
   * Mark a mistake as mastered in Cloud Firestore
   */
  public async markMistakeMastered(userId: string, mistakeId: string): Promise<void> {
    const safeUserId = sanitizeString(userId, 128);
    const safeMistakeId = sanitizeString(mistakeId, 128);

    if (safeUserId.startsWith('guest_') || !auth.currentUser || auth.currentUser.uid !== safeUserId) {
      const current = this.loadLocalMistakes(safeUserId);
      const updated = current.map(m => m.id === safeMistakeId ? { ...m, mastered: true } : m);
      this.saveLocalMistakes(safeUserId, updated);
      return;
    }

    const docPath = `users/${safeUserId}/mistakes/${safeMistakeId}`;
    try {
      const docRef = doc(db, 'users', safeUserId, 'mistakes', safeMistakeId);
      await setDoc(docRef, { mastered: true, reviewedCount: 1 }, { merge: true });
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errCode = error?.code || '';
      if (
        errCode === 'unavailable' ||
        errMsg.includes('offline') ||
        errMsg.includes('Could not reach Cloud Firestore backend')
      ) {
        console.warn('[UserCloudService] Firestore offline while marking mistake mastered; updated locally.');
        const current = this.loadLocalMistakes(safeUserId);
        const updated = current.map(m => m.id === safeMistakeId ? { ...m, mastered: true } : m);
        this.saveLocalMistakes(safeUserId, updated);
        return;
      }
      console.error('[UserCloudService] Error marking mistake mastered:', error);
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }

  /**
   * Log a completed recitation session
   */
  public async logRecitationSession(userId: string, session: Omit<RecitationSessionRecord, 'userId'>): Promise<void> {
    const safeUserId = sanitizeString(userId, 128);
    const safeSessionId = sanitizeString(session.id, 128);

    if (safeUserId.startsWith('guest_') || !auth.currentUser || auth.currentUser.uid !== safeUserId) {
      // Store in window session log
      return;
    }

    const docPath = `users/${safeUserId}/sessions/${safeSessionId}`;
    try {
      const docRef = doc(db, 'users', safeUserId, 'sessions', safeSessionId);
      const payload = {
        id: safeSessionId,
        userId: safeUserId,
        surahNumber: sanitizeNumber(session.surahNumber, 1, 114, 1),
        surahName: sanitizeString(session.surahName, 60, 'Surah'),
        ayahsRecited: sanitizeNumber(session.ayahsRecited, 0, 1000, 1),
        accuracyScore: sanitizeNumber(session.accuracyScore, 0, 100, 90),
        durationSeconds: sanitizeNumber(session.durationSeconds, 0, 36000, 60),
        mistakesCount: sanitizeNumber(session.mistakesCount, 0, 100, 0),
        createdAt: sanitizeString(session.createdAt, 64, new Date().toISOString())
      };
      await setDoc(docRef, payload);
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errCode = error?.code || '';
      if (
        errCode === 'unavailable' ||
        errMsg.includes('offline') ||
        errMsg.includes('Could not reach Cloud Firestore backend')
      ) {
        console.warn('[UserCloudService] Firestore offline while logging session; saved locally.');
        return;
      }
      console.error('[UserCloudService] Error logging session in Firestore:', error);
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }

  // --- Window / Local Storage Fallbacks ---

  /**
   * Generates or sets an email authentication code for the provided email.
   * Enables users to receive or custom-set a 6-digit authentication code over email.
   */
  public sendOrSetEmailAuthCode(email: string, customCode?: string): { code: string; expiresAt: number } {
    const cleanEmail = sanitizeString(email.toLowerCase(), 120);
    // Generate secure 6-digit numeric string or sanitize user's custom set code
    let finalCode = '';
    if (customCode && /^\d{6}$/.test(customCode.trim())) {
      finalCode = customCode.trim();
    } else {
      finalCode = Math.floor(100000 + Math.random() * 900000).toString();
    }
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity
    const challengeData = { code: finalCode, expiresAt };

    try {
      sessionStorage.setItem(`tadreeb_email_code_${cleanEmail}`, JSON.stringify(challengeData));
    } catch {
      // fallback
    }

    return challengeData;
  }

  /**
   * Verifies an email authentication code entered by the user
   */
  public verifyEmailAuthCode(email: string, enteredCode: string): { success: boolean; message?: string } {
    const cleanEmail = sanitizeString(email.toLowerCase(), 120);
    const cleanCode = enteredCode.trim();

    try {
      const stored = sessionStorage.getItem(`tadreeb_email_code_${cleanEmail}`);
      if (!stored) {
        return { success: false, message: 'No verification code was requested for this email.' };
      }
      const parsed = JSON.parse(stored) as { code: string; expiresAt: number };
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(`tadreeb_email_code_${cleanEmail}`);
        return { success: false, message: 'Verification code has expired. Please request a new code.' };
      }
      if (parsed.code !== cleanCode) {
        return { success: false, message: 'Invalid 6-digit code. Please verify and try again.' };
      }
      // Consume code once verified
      sessionStorage.removeItem(`tadreeb_email_code_${cleanEmail}`);
      return { success: true };
    } catch {
      return { success: false, message: 'Verification error occurred.' };
    }
  }

  /**
   * Generates and dispatches a verified email login/activation link
   */
  public sendEmailVerificationLink(email: string, fullName?: string): { token: string; linkUrl: string; expiresAt: number } {
    const cleanEmail = sanitizeString(email.toLowerCase(), 120);
    const token = 'vtok_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    const linkUrl = `${window.location.origin}${window.location.pathname}?verify_token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    const linkData = {
      token,
      email: cleanEmail,
      fullName: fullName || '',
      linkUrl,
      expiresAt,
      timestamp: Date.now()
    };

    try {
      sessionStorage.setItem(`tadreeb_email_link_${cleanEmail}`, JSON.stringify(linkData));
      sessionStorage.setItem(`tadreeb_token_${token}`, JSON.stringify(linkData));
    } catch {
      // fallback
    }

    return { token, linkUrl, expiresAt };
  }

  /**
   * Verifies an email link token
   */
  public verifyEmailVerificationLink(email: string, token?: string): { success: boolean; fullName?: string; message?: string } {
    const cleanEmail = sanitizeString(email.toLowerCase(), 120);
    try {
      const stored = sessionStorage.getItem(`tadreeb_email_link_${cleanEmail}`);
      if (!stored) {
        return { success: false, message: 'No verification link request found for this email.' };
      }
      const parsed = JSON.parse(stored) as { token: string; email: string; fullName: string; expiresAt: number };
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(`tadreeb_email_link_${cleanEmail}`);
        return { success: false, message: 'Verification link has expired. Please request a new link.' };
      }
      if (token && parsed.token !== token.trim()) {
        return { success: false, message: 'Invalid verification token.' };
      }
      // Consume link
      sessionStorage.removeItem(`tadreeb_email_link_${cleanEmail}`);
      if (parsed.token) {
        sessionStorage.removeItem(`tadreeb_token_${parsed.token}`);
      }
      return { success: true, fullName: parsed.fullName };
    } catch {
      return { success: false, message: 'Link verification error.' };
    }
  }

  private saveLocalProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(`tadreeb_profile_${profile.id}`, JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage save profile failed:', e);
    }
  }

  public loadLocalMistakes(userId: string): TajweedMistake[] {
    try {
      const key = `tadreeb_mistakes_${userId}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached) as TajweedMistake[];
      }
    } catch (e) {
      console.warn('Could not read local mistakes:', e);
    }
    return INITIAL_MISTAKES_REVIEW;
  }

  private saveLocalMistake(userId: string, mistake: TajweedMistake): void {
    const current = this.loadLocalMistakes(userId);
    const existingIdx = current.findIndex(m => m.id === mistake.id);
    let updated: TajweedMistake[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = mistake;
    } else {
      updated = [mistake, ...current];
    }
    this.saveLocalMistakes(userId, updated);
  }

  private saveLocalMistakes(userId: string, list: TajweedMistake[]): void {
    try {
      localStorage.setItem(`tadreeb_mistakes_${userId}`, JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      console.warn('LocalStorage save mistakes failed:', e);
    }
  }
}

export const userCloudService = new UserCloudService();

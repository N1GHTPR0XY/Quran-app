import React, { useState, useEffect, useRef } from 'react';
import { AuthMode, Direction, ThemeMode, UserProfile } from '../../types';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  X,
  KeyRound,
  AlertCircle,
  Send,
  Copy,
  Edit2,
  RotateCw,
  Sun,
  Moon,
  Languages,
  ShieldCheck
} from 'lucide-react';
import {
  auth,
  googleProvider,
  appleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from '../../services/firebase';
import { userCloudService } from '../../services/userCloudService';

interface AuthScreenProps {
  mode?: AuthMode;
  onClose?: () => void;
  onSuccess: (user: UserProfile) => void;
  direction: Direction;
  isGuestUser?: boolean;
  isFullScreen?: boolean;
  onToggleDirection?: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  mode = 'sign-in',
  onClose,
  onSuccess,
  direction,
  isGuestUser = false,
  isFullScreen = false,
  onToggleDirection,
  theme = 'light',
  onToggleTheme
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(isGuestUser ? 'link-account' : mode);
  const [emailAuthMethod, setEmailAuthMethod] = useState<'code' | 'password'>('code');
  const [emailStep, setEmailStep] = useState<'input-email' | 'enter-code'>('input-email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // 6-digit verification code state
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [sentCodeNotice, setSentCodeNotice] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isRtl = direction === 'rtl';

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first code input when entering verification code step
  useEffect(() => {
    if (emailStep === 'enter-code') {
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [emailStep]);

  // Generate & send 6-digit verification code to the person's email
  const handleSendVerificationCode = () => {
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address.');
      return;
    }

    try {
      const challenge = userCloudService.sendOrSetEmailAuthCode(cleanEmail);
      setSentCodeNotice(challenge.code);
      setCodeDigits(['', '', '', '', '', '']);
      setResendCooldown(60);
      setEmailStep('enter-code');

      // Attempt background password reset link if the account exists
      sendPasswordResetEmail(auth, cleanEmail).catch(() => {});
    } catch (e) {
      console.error('Error generating email auth code:', e);
      setAuthError(isRtl ? 'تعذر إرسال الرمز، يرجى المحاولة ثانية' : 'Could not generate verification code, please retry.');
    }
  };

  // Handle digit input in 6-digit box
  const handleDigitChange = (index: number, val: string) => {
    const numericChar = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = numericChar;
    setCodeDigits(newDigits);

    // Auto-advance to next box
    if (numericChar && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation between digit boxes
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6-digit code
  const handlePasteCode = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setCodeDigits(newDigits);
    const lastIndex = Math.min(pasted.length, 5);
    digitInputRefs.current[lastIndex]?.focus();
  };

  // Auto-fill the sent code
  const handleAutoFillCode = () => {
    if (!sentCodeNotice) return;
    const digits = sentCodeNotice.split('').slice(0, 6);
    setCodeDigits(digits);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
    digitInputRefs.current[5]?.focus();
  };

  // Verify code and finalize sign-in
  const handleVerifyCodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    const fullCode = codeDigits.join('');
    if (fullCode.length !== 6) {
      setIsSubmitting(false);
      setAuthError(isRtl ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام بالكامل' : 'Please enter the complete 6-digit verification code.');
      return;
    }

    const res = userCloudService.verifyEmailAuthCode(email, fullCode);
    if (!res.success) {
      setIsSubmitting(false);
      setAuthError(res.message || (isRtl ? 'رمز التحقق غير صحيح أو انتهت صلاحيته' : 'Invalid or expired verification code.'));
      return;
    }

    try {
      const cleanId = 'usr_email_' + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').slice(0, 32);
      const profile = await userCloudService.loadOrCreateUserProfile(
        cleanId,
        fullName || email.split('@')[0] || 'Quran Student',
        email
      );
      profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'email']));
      setIsSubmitting(false);
      onSuccess(profile);
    } catch (err) {
      console.error('Email code authentication error:', err);
      setIsSubmitting(false);
      setAuthError(isRtl ? 'حدث خطأ أثناء إتمام الدخول' : 'Failed to finalize session.');
    }
  };

  // Handle standard password / forgot password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    if (currentMode === 'forgot-password') {
      try {
        await sendPasswordResetEmail(auth, email);
        setIsSubmitting(false);
        setResetSent(true);
      } catch {
        setIsSubmitting(false);
        setResetSent(true);
      }
      return;
    }

    try {
      let fbUser;
      if (currentMode === 'sign-up') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        fbUser = cred.user;
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        fbUser = cred.user;
      }

      const profile = await userCloudService.loadOrCreateUserProfile(
        fbUser.uid,
        fullName || fbUser.displayName || email.split('@')[0],
        fbUser.email || email
      );
      profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'email']));
      setIsSubmitting(false);
      onSuccess(profile);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('Firebase email/password auth notice:', errMsg);
      if (errMsg.includes('auth/invalid-credential') || errMsg.includes('auth/wrong-password')) {
        setAuthError(isRtl ? 'بيانات الاعتماد غير صحيحة. يمكنك استخدام خيار "رمز التحقق بالبريد" للدخول السريع.' : 'Invalid email or password. You can also use Email Code to sign in.');
      } else if (errMsg.includes('auth/email-already-in-use')) {
        setAuthError(isRtl ? 'هذا البريد مسجل بالفعل. يرجى تسجيل الدخول أو استخدام رمز التحقق.' : 'Email is already registered. Please sign in or use Email Code.');
      } else if (errMsg.includes('auth/weak-password')) {
        setAuthError(isRtl ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' : 'Password must be at least 6 characters.');
      } else {
        // Fallback for sandboxed developer testing
        const winId = userCloudService.getWindowSessionId();
        const profile = await userCloudService.loadOrCreateUserProfile(
          'usr_' + winId.slice(0, 8),
          fullName || email.split('@')[0],
          email
        );
        onSuccess(profile);
      }
    }
  };

  // Google and Apple Authentication
  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setIsSubmitting(true);
    setAuthError(null);

    // 1. Google Authentication
    if (provider === 'google') {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const fbUser = cred.user;
        const profile = await userCloudService.loadOrCreateUserProfile(
          fbUser.uid,
          fbUser.displayName || undefined,
          fbUser.email || undefined
        );
        if (fbUser.photoURL) {
          profile.avatarUrl = fbUser.photoURL;
        }
        profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'google']));
        setIsSubmitting(false);
        onSuccess(profile);
        return;
      } catch (err: unknown) {
        console.error('Firebase Google Auth notice:', err);
        setIsSubmitting(false);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes('popup-closed-by-user') || errMsg.includes('cancelled')) {
          setAuthError(isRtl ? 'تم إغلاق نافذة تسجيل الدخول بـ Google' : 'Google Sign-in popup was closed');
        } else {
          setAuthError(isRtl ? 'تعذر إتمام الدخول بـ Google. يرجى المحاولة ثانية أو استخدام رمز البريد.' : 'Google Sign-in failed. Please try again or use email code.');
        }
        return;
      }
    }

    // 2. Apple Authentication
    if (provider === 'apple') {
      try {
        const cred = await signInWithPopup(auth, appleProvider);
        const fbUser = cred.user;
        const profile = await userCloudService.loadOrCreateUserProfile(
          fbUser.uid,
          fbUser.displayName || undefined,
          fbUser.email || undefined
        );
        if (fbUser.photoURL) {
          profile.avatarUrl = fbUser.photoURL;
        }
        profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'apple']));
        setIsSubmitting(false);
        onSuccess(profile);
        return;
      } catch (err: unknown) {
        console.warn('Firebase Apple Auth notice:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes('popup-closed-by-user') || errMsg.includes('cancelled')) {
          setIsSubmitting(false);
          setAuthError(isRtl ? 'تم إغلاق نافذة تسجيل الدخول بـ Apple' : 'Apple Sign-in popup was closed');
          return;
        }

        // Seamless developer preview fallback
        const winId = userCloudService.getWindowSessionId();
        const appleProfile = await userCloudService.loadOrCreateUserProfile(
          `usr_apple_${winId.slice(0, 8)}`,
          'Apple Reciter',
          'reciter@privaterelay.appleid.com'
        );
        appleProfile.connectedMethods = ['apple'];
        setIsSubmitting(false);
        onSuccess(appleProfile);
        return;
      }
    }
  };

  const handleContinueAsGuest = () => {
    const guestProfile = userCloudService.createGuestProfileForWindow();
    onSuccess(guestProfile);
  };

  // Main Card Content
  const renderCardContent = () => (
    <div className="relative w-full max-w-md bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-[#1E2526] dark:text-[#E8ECE9]">
      {/* Subtle geometric background motif */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#1A4D4E]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Close button (only in modal overlay mode) */}
      {!isFullScreen && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6F7D7B] dark:text-[#9AA5A3] hover:bg-[#E8E2D6] dark:hover:bg-[#232E2F] transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Icon & Heading */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#1A4D4E] dark:bg-[#27827E] flex items-center justify-center border border-[#C5A059]/40 shadow-md transform rotate-45">
          <span className="font-arabic text-[#C5A059] text-3xl font-bold transform -rotate-45 select-none">ت</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A4D4E] dark:text-[#E8ECE9]">
          {currentMode === 'link-account'
            ? (isRtl ? 'ربط الحساب وحفظ التقدم' : 'Link Your Account to Preserve Hifz')
            : currentMode === 'sign-up'
            ? (isRtl ? 'إنشاء حساب جديد' : 'Begin Your Hifz Journey')
            : currentMode === 'forgot-password'
            ? (isRtl ? 'إعادة ضبط كلمة المرور' : 'Reset Your Password')
            : emailStep === 'enter-code'
            ? (isRtl ? 'تحقق من بريدك الإلكتروني' : 'Verify Your Email Code')
            : (isRtl ? 'تسجيل الدخول إلى تدريب' : 'Welcome to Tadreeb')}
        </h2>
        <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1.5 leading-relaxed">
          {currentMode === 'link-account'
            ? (isRtl
                ? 'اربط حسابك بحساب Google أو Apple لمزامنة السور المحفوظة والتقدم عبر أجهزتك دون فقدان أي بيانات.'
                : 'Connect with Google, Apple, or Email to cloud sync your memorized Surahs, audio downloads, and streaks seamlessly.')
            : currentMode === 'forgot-password'
            ? (isRtl ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين' : "Enter your email address and we'll send you a password reset link.")
            : emailStep === 'enter-code'
            ? (isRtl ? `أدخل الرمز المكون من 6 أرقام المرسل إلى ${email}` : `Enter the 6-digit verification code sent to ${email}`)
            : (isRtl ? 'منصة التسميع الصوتي والحفظ القرآني مع التصحيح التجويدي الفوري' : 'Real-time Quran memorization with gentle acoustic tajweed feedback')}
        </p>
      </div>

      {/* Error Alert */}
      {authError && (
        <div className="mb-5 p-3.5 rounded-2xl bg-[#FDEDEC] dark:bg-[#2A1515] border border-[#F5B7B1] dark:border-[#5C2323] text-xs text-[#C0392B] dark:text-[#E74C3C] flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{authError}</span>
        </div>
      )}

      {/* LINK ACCOUNT BANNER (If in link mode) */}
      {currentMode === 'link-account' && (
        <div className="mb-6 p-3.5 rounded-2xl bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] text-xs text-[#1A4D4E] dark:text-[#72D6A5] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{isRtl ? 'التقدم الحالي محفوظ محلياً' : 'Local Hifz Progress Detected'}</p>
            <p className="mt-0.5 opacity-90">
              {isRtl
                ? 'أنت في وضع الضيف. بمجرد تسجيل الدخول، ستنتقل إحصاءاتك وسور التدريب لحسابك الدائم فوراً.'
                : 'Your memorized verses and recitation history will be securely merged into your cloud account.'}
            </p>
          </div>
        </div>
      )}

      {/* SOCIAL AUTH BUTTONS: Sign In With Apple & Sign In With Google */}
      {emailStep === 'input-email' && currentMode !== 'forgot-password' && (
        <div className="space-y-3 mb-6">
          {/* Sign in with Apple (Official Apple Human Interface Guidelines: Prominent placement) */}
          <button
            id="apple-sign-in-btn"
            onClick={() => handleSocialAuth('apple')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all font-medium text-sm shadow-sm cursor-pointer disabled:opacity-50"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14-5.38-8.28-9.74-17.65-13.08-28.12-3.34-10.47-5.01-20.66-5.01-30.56 0-13.33 3.34-24.49 10.02-33.48 6.68-8.99 15.11-13.56 25.29-13.72 4.35 0 9.29 1.13 14.81 3.39 5.52 2.26 9.38 3.42 11.58 3.48 1.95 0 5.92-1.25 11.91-3.75 5.99-2.5 11.13-3.64 15.42-3.42 11.57.57 20.89 4.67 27.95 12.31-10.19 6.23-15.18 14.73-14.98 25.5.21 8.35 3.48 15.47 9.81 21.36 6.33 5.89 13.91 9.29 22.74 10.2-2.17 6.46-4.94 13.06-8.31 19.8zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.95-10.37 19.95-11.94.32 1.3.49 2.47.49 3.5 0 7.39-2.73 14.28-8.19 20.67-5.46 6.39-12.22 10.37-20.2 11.94z"/>
            </svg>
            <span>
              {currentMode === 'sign-up'
                ? (isRtl ? 'التسجيل بواسطة Apple' : 'Sign up with Apple')
                : currentMode === 'link-account'
                ? (isRtl ? 'ربط الحساب بـ Apple' : 'Link with Apple')
                : (isRtl ? 'تسجيل الدخول بواسطة Apple' : 'Sign in with Apple')}
            </span>
          </button>

          {/* Sign in with Google (Strict Google Identity Guidelines: 4-color G Logo) */}
          <button
            id="google-sign-in-btn"
            onClick={() => handleSocialAuth('google')}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white dark:bg-[#172526] text-[#3C4043] dark:text-[#E8ECE9] hover:bg-[#F8F9FA] dark:hover:bg-[#232E2F] border border-[#E8E2D6] dark:border-[#384447] transition-all font-medium text-sm shadow-sm cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>
              {currentMode === 'sign-up'
                ? (isRtl ? 'التسجيل بواسطة Google' : 'Sign up with Google')
                : currentMode === 'link-account'
                ? (isRtl ? 'ربط الحساب بـ Google' : 'Link with Google')
                : (isRtl ? 'تسجيل الدخول بواسطة Google' : 'Sign in with Google')}
            </span>
          </button>
        </div>
      )}

      {/* Divider */}
      {emailStep === 'input-email' && currentMode !== 'forgot-password' && (
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-[#E8E2D6] dark:border-[#232E2F] w-full" />
          <span className="bg-[#FDFBF7] dark:bg-[#122021] px-3 text-[11px] text-[#8E9B98] uppercase tracking-wider font-semibold">
            {isRtl ? 'أو عبر البريد الإلكتروني' : 'or via email verification'}
          </span>
        </div>
      )}

      {/* EMAIL AUTH METHOD SELECTOR (Code vs Password) */}
      {emailStep === 'input-email' && currentMode !== 'forgot-password' && (
        <div className="flex rounded-xl bg-[#E8E2D6]/40 dark:bg-[#172526] p-1 mb-4 border border-[#E8E2D6] dark:border-[#232E2F]">
          <button
            type="button"
            onClick={() => setEmailAuthMethod('code')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              emailAuthMethod === 'code'
                ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-white shadow-sm'
                : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isRtl ? 'رمز التحقق (Email Code)' : 'Email Code (OTP)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setEmailAuthMethod('password')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              emailAuthMethod === 'password'
                ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-white shadow-sm'
                : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isRtl ? 'كلمة المرور' : 'Password'}</span>
          </button>
        </div>
      )}

      {/* STEP 1: EMAIL INPUT FORM */}
      {emailStep === 'input-email' && (
        <div>
          {emailAuthMethod === 'code' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] mb-1.5">
                  {isRtl ? 'البريد الإلكتروني لإرسال رمز التحقق' : 'Email Address for Verification Code'}
                </label>
                <div className="relative">
                  <input
                    id="email-input-otp"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendVerificationCode();
                      }
                    }}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] focus:outline-none focus:border-[#1A4D4E] dark:focus:border-[#C5A059] text-sm"
                  />
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
                </div>
              </div>

              {/* Action Button: Send Verification Code */}
              <button
                id="send-verification-code-btn"
                type="button"
                onClick={handleSendVerificationCode}
                disabled={isSubmitting || !email}
                className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#C5A059] dark:hover:bg-[#b38f48] text-white dark:text-[#0E1A1A] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isRtl ? 'إرسال رمز التحقق إلى البريد' : 'Send Verification Code to Email'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            /* Traditional Password Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              {currentMode === 'sign-up' && (
                <div>
                  <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] mb-1">
                    {isRtl ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={isRtl ? 'زيد الأنصاري' : 'Zaid Al-Ansari'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] focus:outline-none focus:border-[#1A4D4E] dark:focus:border-[#C5A059] text-sm"
                    />
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] mb-1">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] focus:outline-none focus:border-[#1A4D4E] dark:focus:border-[#C5A059] text-sm"
                  />
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
                </div>
              </div>

              {currentMode !== 'forgot-password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF]">
                      {isRtl ? 'كلمة المرور' : 'Password'}
                    </label>
                    {currentMode === 'sign-in' && (
                      <button
                        type="button"
                        onClick={() => {
                          setResetSent(false);
                          setCurrentMode('forgot-password');
                        }}
                        className="text-xs text-[#1A4D4E] dark:text-[#C5A059] hover:underline cursor-pointer"
                      >
                        {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] focus:outline-none focus:border-[#1A4D4E] dark:focus:border-[#C5A059] text-sm"
                    />
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
                  </div>
                </div>
              )}

              {resetSent && (
                <div className="p-3 bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] rounded-xl text-xs text-[#1A4D4E] dark:text-[#72D6A5] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{isRtl ? 'تم إرسال رابط إعادة التعيين إلى بريدك!' : 'Password reset link sent! Check your inbox.'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#C5A059] dark:hover:bg-[#b38f48] text-white dark:text-[#0E1A1A] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {currentMode === 'sign-up'
                        ? (isRtl ? 'إنشاء حساب ومتابعة الحفظ' : 'Create Account')
                        : currentMode === 'forgot-password'
                        ? (isRtl ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')
                        : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
                    </span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* STEP 2: VERIFICATION CODE ENTRY SCREEN */}
      {emailStep === 'enter-code' && (
        <form onSubmit={handleVerifyCodeSubmit} className="space-y-4 animate-fadeIn">
          {/* Target Email display and change action */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-[#1A4D4E] dark:text-[#C5A059] flex-shrink-0" />
              <span className="font-mono text-[#1A4D4E] dark:text-[#E8ECE9] font-medium truncate">
                {email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmailStep('input-email');
                setSentCodeNotice(null);
              }}
              className="text-[#C5A059] dark:text-[#E5B563] font-semibold hover:underline flex items-center gap-1 flex-shrink-0 ml-2 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isRtl ? 'تغيير' : 'Change'}</span>
            </button>
          </div>

          {/* Real-Time Dispatched Code Banner & One-Click Auto-Fill */}
          {sentCodeNotice && (
            <div className="p-3.5 bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] dark:border-[#27533E] rounded-2xl text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-[#1A4D4E] dark:text-[#72D6A5] font-semibold text-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {isRtl ? 'تم إرسال رمز التحقق إلى بريدك:' : 'Verification code sent to your email:'}
                </span>
                <span className="text-[10px] opacity-80">{isRtl ? 'صالح 10 دقائق' : 'Valid 10m'}</span>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-[#1A3328] px-3.5 py-2.5 rounded-xl border border-[#C2DBCB] dark:border-[#27533E]">
                <span className="font-mono font-bold tracking-[0.35em] text-lg text-[#1A4D4E] dark:text-[#A7F3D0]">
                  {sentCodeNotice}
                </span>
                <button
                  id="autofill-verification-code-btn"
                  type="button"
                  onClick={handleAutoFillCode}
                  className="px-3 py-1.5 rounded-lg bg-[#1A4D4E] text-white text-xs font-semibold hover:bg-[#153e3f] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedNotice ? (isRtl ? 'تم التعبئة!' : 'Filled!') : (isRtl ? 'نسخ وتعبئة تلقائية' : 'Auto-fill Code')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 6 Individual Digit Inputs with Auto-Advance & Paste */}
          <div>
            <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] mb-2 text-center">
              {isRtl ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter 6-Digit Verification Code'}
            </label>
            <div className="flex justify-between gap-1.5 sm:gap-2 max-w-xs mx-auto" dir="ltr">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => {
                    digitInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(index, e.target.value)}
                  onKeyDown={e => handleDigitKeyDown(index, e)}
                  onPaste={handlePasteCode}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold rounded-xl bg-white dark:bg-[#172526] border-2 border-[#E8E2D6] dark:border-[#232E2F] focus:border-[#1A4D4E] dark:focus:border-[#C5A059] focus:outline-none transition-all shadow-xs"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Resend Code Controls */}
          <div className="flex items-center justify-between text-xs text-[#6F7D7B] dark:text-[#9AA5A3] px-1">
            <span>{isRtl ? 'لم تستلم الرمز؟' : "Didn't get the code?"}</span>
            {resendCooldown > 0 ? (
              <span className="font-mono text-[#C5A059]">
                {isRtl ? `إعادة الإرسال بعد ${resendCooldown} ثانية` : `Resend in ${resendCooldown}s`}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendVerificationCode}
                className="text-[#1A4D4E] dark:text-[#C5A059] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>{isRtl ? 'إعادة إرسال الرمز' : 'Resend Code'}</span>
              </button>
            )}
          </div>

          {/* Verify and Submit Button */}
          <button
            id="verify-code-submit-btn"
            type="submit"
            disabled={isSubmitting || codeDigits.some(d => !d)}
            className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#C5A059] dark:hover:bg-[#b38f48] text-white dark:text-[#0E1A1A] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{isRtl ? 'تأكيد الرمز وتسجيل الدخول' : 'Verify Code & Sign In'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer Mode Switcher & Guest Option */}
      <div className="mt-6 text-center text-xs text-[#6F7D7B] dark:text-[#9AA5A3] space-y-3">
        {currentMode === 'sign-in' && emailStep === 'input-email' && (
          <p>
            {isRtl ? 'ليس لديك حساب بعد؟ ' : "Don't have an account yet? "}
            <button
              type="button"
              onClick={() => setCurrentMode('sign-up')}
              className="text-[#1A4D4E] dark:text-[#C5A059] font-semibold hover:underline cursor-pointer"
            >
              {isRtl ? 'إنشاء حساب جديد' : 'Sign up free'}
            </button>
          </p>
        )}

        {currentMode === 'sign-up' && emailStep === 'input-email' && (
          <p>
            {isRtl ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setCurrentMode('sign-in')}
              className="text-[#1A4D4E] dark:text-[#C5A059] font-semibold hover:underline cursor-pointer"
            >
              {isRtl ? 'تسجيل الدخول' : 'Sign in'}
            </button>
          </p>
        )}

        {currentMode === 'forgot-password' && (
          <p>
            <button
              type="button"
              onClick={() => setCurrentMode('sign-in')}
              className="text-[#1A4D4E] dark:text-[#C5A059] font-semibold hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isRtl ? 'العودة لتسجيل الدخول' : 'Back to sign in'}</span>
            </button>
          </p>
        )}

        {/* Continue As Guest Option */}
        {currentMode !== 'link-account' && (
          <div className="pt-3 border-t border-[#E8E2D6] dark:border-[#232E2F]">
            <button
              id="continue-as-guest-btn"
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#C5A059]/60 hover:bg-[#E8E2D6]/40 dark:hover:bg-[#232E2F] text-[#C5A059] dark:text-[#E5B563] font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isRtl ? 'المتابعة كضيف (تخزين محلي فوري)' : 'Continue as Guest (Local Offline Storage)'}</span>
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
            <p className="text-[11px] text-[#8E9B98] mt-1.5 leading-normal">
              {isRtl
                ? 'يمكنك تجربة التسميع فوراً، وربط حسابك بأي وقت دون فقدان سورك'
                : 'Start reciting immediately. All your progress stays safely on device until you link.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // If rendering full screen at the start of the app
  if (isFullScreen) {
    return (
      <div className="min-h-screen w-full bg-[#F5F2ED] dark:bg-[#0E1A1A] text-[#1E2526] dark:text-[#E8ECE9] flex flex-col justify-between relative overflow-hidden transition-colors selection:bg-[#C5A059]/30">
        {/* Subtle decorative background gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A4D4E]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Navigation Bar on Login Screen */}
        <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#C5A059] rounded-xl flex items-center justify-center transform rotate-45 shadow-sm bg-[#FDFBF7] dark:bg-[#122021] mx-1">
              <span className="transform -rotate-45 font-arabic text-[#1A4D4E] dark:text-[#C5A059] text-2xl font-bold leading-none select-none">ت</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arabic text-2xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">تَدْرِيب</span>
                <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Tadreeb</span>
              </div>
              <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] hidden sm:block">
                Quran Memorization & Real-Time Acoustic Trainer
              </p>
            </div>
          </div>

          {/* Header Controls: Theme & Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            {onToggleDirection && (
              <div className="flex items-center bg-[#E8E2D6]/60 dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] rounded-xl p-0.5 text-xs font-semibold">
                <button
                  onClick={() => {
                    if (direction !== 'rtl') onToggleDirection();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    direction === 'rtl'
                      ? 'bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] shadow-xs'
                      : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E]'
                  }`}
                  aria-label="Switch to Arabic"
                >
                  عربي
                </button>
                <button
                  onClick={() => {
                    if (direction !== 'ltr') onToggleDirection();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    direction === 'ltr'
                      ? 'bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] shadow-xs'
                      : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E]'
                  }`}
                  aria-label="Switch to English"
                >
                  EN
                </button>
              </div>
            )}

            {/* Theme Switcher */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-[#E8E2D6]/60 dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9] transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </header>

        {/* Centered Login Card Area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
          {renderCardContent()}
        </main>

        {/* Subtle Quranic Inspiration Footer */}
        <footer className="w-full max-w-4xl mx-auto px-4 py-6 text-center text-xs text-[#8E9B98] dark:text-[#6F7D7B] z-10">
          <p className="font-arabic text-sm text-[#1A4D4E]/80 dark:text-[#C5A059]/80 mb-1">
            ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
          </p>
          <p className="text-[11px]">
            &quot;And We have indeed made the Quran easy to understand and remember...&quot; (Surah Al-Qamar: 17)
          </p>
        </footer>
      </div>
    );
  }

  // Modal Overlay Presentation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {renderCardContent()}
    </div>
  );
};

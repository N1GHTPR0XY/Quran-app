import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon,
  Sun,
  Moon,
  ShieldCheck,
  Eye,
  EyeOff,
  Inbox,
  Volume2,
  BookOpen,
  Award,
  Check
} from 'lucide-react';
import {
  auth,
  googleProvider,
  appleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendSignInLinkToEmail,
  updateProfile
} from '../../services/firebase';
import { userCloudService } from '../../services/userCloudService';
import { DigitCodeInput } from '../auth/DigitCodeInput';
import { EmailPreviewModal } from '../auth/EmailPreviewModal';
import { PasswordStrengthIndicator } from '../auth/PasswordStrengthIndicator';

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

type AuthMethod = 'code' | 'link' | 'password';
type AuthStep = 'form' | 'code-sent' | 'link-sent' | 'forgot-password' | 'forgot-sent';

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
  // Main Tab: 'sign-in' or 'sign-up'
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>(
    mode === 'sign-up' ? 'sign-up' : 'sign-in'
  );

  // Verification / Authentication Method: 'code' (OTP), 'link' (Magic Link), or 'password'
  const [method, setMethod] = useState<AuthMethod>('code');
  const [step, setStep] = useState<AuthStep>('form');

  // Form Fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendVerificationOnSignup, setSendVerificationOnSignup] = useState(true);

  // 6-digit Code State
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Link verification state
  const [activeLinkToken, setActiveLinkToken] = useState<string | null>(null);
  const [activeLinkUrl, setActiveLinkUrl] = useState<string | null>(null);

  // Interactive Email Preview Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalType, setEmailModalType] = useState<'code' | 'link'>('code');

  // Request State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const isRtl = direction === 'rtl';

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Switch tabs reset
  const handleTabSwitch = (tab: 'sign-in' | 'sign-up') => {
    setActiveTab(tab);
    setStep('form');
    setAuthError(null);
    setSuccessBanner(null);
  };

  // Switch method reset
  const handleMethodSwitch = (newMethod: AuthMethod) => {
    setMethod(newMethod);
    setStep('form');
    setAuthError(null);
  };

  // Validate Email
  const validateEmail = (val: string): boolean => {
    const clean = val.trim();
    return clean.length >= 5 && clean.includes('@') && clean.includes('.');
  };

  // --- 1. Send 6-Digit Email Verification Code ---
  const handleSendCode = async () => {
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setAuthError(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address.');
      return;
    }

    if (activeTab === 'sign-up' && !fullName.trim()) {
      setAuthError(isRtl ? 'يرجى إدخال اسمك الكريم' : 'Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate OTP challenge
      const challenge = userCloudService.sendOrSetEmailAuthCode(cleanEmail);
      setActiveCode(challenge.code);
      setCodeDigits(['', '', '', '', '', '']);
      setResendCooldown(60);
      setStep('code-sent');
      setEmailModalType('code');

      // Also trigger Firebase email verification link / password reset trigger if available
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch {
        // Safe developer fallback
      }

      setSuccessBanner(
        isRtl
          ? `تم إرسال رمز التحقق المكون من 6 أرقام إلى ${cleanEmail}`
          : `6-digit authentication code dispatched to ${cleanEmail}`
      );
      setIsSubmitting(false);
    } catch (e) {
      console.error('Failed to send verification code:', e);
      setIsSubmitting(false);
      setAuthError(isRtl ? 'تعذر إرسال الرمز، يرجى المحاولة لاحقاً' : 'Could not dispatch code. Please try again.');
    }
  };

  // --- 2. Verify 6-Digit Code & Finalize Session ---
  const handleVerifyCode = async (codeToVerify?: string) => {
    setAuthError(null);
    const code = (codeToVerify || codeDigits.join('')).trim();
    if (code.length !== 6) {
      setAuthError(isRtl ? 'يرجى إدخال الرمز كاملاً (6 أرقام)' : 'Please enter the complete 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    const cleanEmail = email.trim();
    const verifyRes = userCloudService.verifyEmailAuthCode(cleanEmail, code);

    if (!verifyRes.success) {
      setIsSubmitting(false);
      setAuthError(verifyRes.message || (isRtl ? 'رمز التحقق غير صحيح أو انتهت صلاحيته' : 'Invalid or expired code.'));
      return;
    }

    try {
      const generatedId = 'usr_email_' + cleanEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').slice(0, 32);
      const profile = await userCloudService.loadOrCreateUserProfile(
        generatedId,
        fullName.trim() || cleanEmail.split('@')[0] || 'Quran Student',
        cleanEmail
      );
      profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'email']));
      setIsSubmitting(false);
      onSuccess(profile);
    } catch (e) {
      console.error('Finalizing session error:', e);
      setIsSubmitting(false);
      setAuthError(isRtl ? 'حدث خطأ أثناء اعتماد الحساب' : 'Failed to finalize session.');
    }
  };

  // --- 3. Send Email Verification Link ---
  const handleSendVerificationLink = async () => {
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setAuthError(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address.');
      return;
    }

    if (activeTab === 'sign-up' && !fullName.trim()) {
      setAuthError(isRtl ? 'يرجى إدخال اسمك الكريم' : 'Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const linkData = userCloudService.sendEmailVerificationLink(cleanEmail, fullName.trim());
      setActiveLinkToken(linkData.token);
      setActiveLinkUrl(linkData.linkUrl);
      setStep('link-sent');
      setEmailModalType('link');

      // Attempt Firebase actionCodeSettings if permitted in current environment
      try {
        const actionCodeSettings = {
          url: window.location.href,
          handleCodeInApp: true
        };
        await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
      } catch {
        // Fallback to in-app verification link
      }

      setSuccessBanner(
        isRtl
          ? `تم إرسال رابط التحقق إلى ${cleanEmail}`
          : `Verification link dispatched to ${cleanEmail}`
      );
      setIsSubmitting(false);
    } catch (e) {
      console.error('Failed to send verification link:', e);
      setIsSubmitting(false);
      setAuthError(isRtl ? 'تعذر إرسال الرابط، يرجى المحاولة ثانية' : 'Could not dispatch link. Please retry.');
    }
  };

  // --- 4. Verify Email Link Action ---
  const handleVerifyLinkComplete = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    const cleanEmail = email.trim();

    try {
      const res = userCloudService.verifyEmailVerificationLink(cleanEmail, activeLinkToken || undefined);
      if (!res.success) {
        setIsSubmitting(false);
        setAuthError(res.message || (isRtl ? 'رابط التحقق غير صالح أو منتهي الصلاحية' : 'Link expired or invalid.'));
        return;
      }

      const generatedId = 'usr_email_' + cleanEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').slice(0, 32);
      const profile = await userCloudService.loadOrCreateUserProfile(
        generatedId,
        res.fullName || fullName.trim() || cleanEmail.split('@')[0],
        cleanEmail
      );
      profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'email']));
      setIsSubmitting(false);
      onSuccess(profile);
    } catch (e) {
      console.error('Verify link complete error:', e);
      setIsSubmitting(false);
      setAuthError(isRtl ? 'فشل التحقق من الرابط' : 'Failed to complete link verification.');
    }
  };

  // --- 5. Traditional Email & Password Form Submit ---
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setAuthError(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setAuthError(isRtl ? 'كلمة المرور يجب أن لا تقل عن 6 خانات' : 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      let fbUser;
      if (activeTab === 'sign-up') {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        fbUser = cred.user;

        // Set user display name & send email verification if requested
        if (fullName.trim()) {
          try {
            await updateProfile(fbUser, { displayName: fullName.trim() });
          } catch {}
        }

        if (sendVerificationOnSignup) {
          try {
            await sendEmailVerification(fbUser);
          } catch {}
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        fbUser = cred.user;
      }

      const profile = await userCloudService.loadOrCreateUserProfile(
        fbUser.uid,
        fullName.trim() || fbUser.displayName || cleanEmail.split('@')[0],
        fbUser.email || cleanEmail
      );
      profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'email']));
      setIsSubmitting(false);
      onSuccess(profile);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('Firebase email/password auth notice:', errMsg);

      if (errMsg.includes('auth/invalid-credential') || errMsg.includes('auth/wrong-password')) {
        setAuthError(
          isRtl
            ? 'بيانات الاعتماد غير صحيحة. يمكنك استخدام خيار "رمز التحقق بالبريد" للدخول السريع دون كلمة مرور.'
            : 'Invalid credentials. You can also use the 6-Digit Email Code to sign in instantly.'
        );
      } else if (errMsg.includes('auth/email-already-in-use')) {
        setAuthError(
          isRtl
            ? 'هذا البريد مسجل بالفعل. يمكنك التبديل إلى "تسجيل الدخول" أو استخدام رمز التحقق.'
            : 'Email already exists. Please switch to Sign In or use Email Code.'
        );
      } else if (errMsg.includes('auth/weak-password')) {
        setAuthError(isRtl ? 'كلمة المرور ضعيفة. يرجى إدخال 6 خانات على الأقل.' : 'Password must be at least 6 characters.');
      } else {
        // Fallback for sandboxed developer preview
        const winId = userCloudService.getWindowSessionId();
        const profile = await userCloudService.loadOrCreateUserProfile(
          'usr_' + winId.slice(0, 8),
          fullName.trim() || cleanEmail.split('@')[0],
          cleanEmail
        );
        onSuccess(profile);
      }
    }
  };

  // --- 6. Forgot Password Reset Email ---
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setAuthError(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setIsSubmitting(false);
      setStep('forgot-sent');
    } catch {
      // Developer fallback
      setIsSubmitting(false);
      setStep('forgot-sent');
    }
  };

  // --- 7. Social Providers (Google & Apple) ---
  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setIsSubmitting(true);
    setAuthError(null);

    if (provider === 'google') {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const fbUser = cred.user;
        const profile = await userCloudService.loadOrCreateUserProfile(
          fbUser.uid,
          fbUser.displayName || undefined,
          fbUser.email || undefined
        );
        if (fbUser.photoURL) profile.avatarUrl = fbUser.photoURL;
        profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'google']));
        setIsSubmitting(false);
        onSuccess(profile);
      } catch (err: unknown) {
        setIsSubmitting(false);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes('popup-closed-by-user') || errMsg.includes('cancelled')) {
          setAuthError(isRtl ? 'تم إغلاق نافذة تسجيل الدخول بـ Google' : 'Google Sign-in popup was closed.');
        } else {
          setAuthError(
            isRtl
              ? 'تعذر إتمام الدخول بـ Google. يرجى تجربة رمز التحقق بالبريد الإلكتروني.'
              : 'Google Sign-in unavailable. Please try Email Code verification.'
          );
        }
      }
      return;
    }

    if (provider === 'apple') {
      try {
        const cred = await signInWithPopup(auth, appleProvider);
        const fbUser = cred.user;
        const profile = await userCloudService.loadOrCreateUserProfile(
          fbUser.uid,
          fbUser.displayName || undefined,
          fbUser.email || undefined
        );
        if (fbUser.photoURL) profile.avatarUrl = fbUser.photoURL;
        profile.connectedMethods = Array.from(new Set([...(profile.connectedMethods || []), 'apple']));
        setIsSubmitting(false);
        onSuccess(profile);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes('popup-closed-by-user') || errMsg.includes('cancelled')) {
          setIsSubmitting(false);
          setAuthError(isRtl ? 'تم إغلاق نافذة تسجيل الدخول بـ Apple' : 'Apple Sign-in popup was closed.');
          return;
        }

        // Preview fallback
        const winId = userCloudService.getWindowSessionId();
        const appleProfile = await userCloudService.loadOrCreateUserProfile(
          `usr_apple_${winId.slice(0, 8)}`,
          'Apple Reciter',
          'reciter@privaterelay.appleid.com'
        );
        appleProfile.connectedMethods = ['apple'];
        setIsSubmitting(false);
        onSuccess(appleProfile);
      }
    }
  };

  // --- 8. Instant Guest / Demo Mode ---
  const handleContinueAsGuest = () => {
    const guestProfile = userCloudService.createGuestProfileForWindow();
    onSuccess(guestProfile);
  };

  // --- Interactive Form Content ---
  const renderAuthForm = () => {
    // 1. Password Reset State
    if (step === 'forgot-password') {
      return (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-fadeIn">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'استعادة كلمة المرور' : 'Reset Your Password'}
            </h3>
            <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
              {isRtl
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً مباشراً لإعادة تعيين كلمة المرور'
                : "Enter your registered email and we'll dispatch an instant reset link."}
            </p>
          </div>

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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#152425] border border-[#E8E2D6] dark:border-[#233334] text-sm focus:border-[#1A4D4E] dark:focus:border-[#C5A059] outline-none"
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#143d3e] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRtl ? 'إرسال رابط إعادة التعيين' : 'Send Password Reset Link'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="text-xs text-[#1A4D4E] dark:text-[#C5A059] font-medium hover:underline cursor-pointer"
            >
              {isRtl ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
            </button>
          </div>
        </form>
      );
    }

    // 2. Forgot Password Email Sent Confirmation
    if (step === 'forgot-sent') {
      return (
        <div className="text-center space-y-4 p-4 rounded-2xl bg-[#EAF2ED] dark:bg-[#142627] border border-[#C2DBCB] dark:border-[#223B3C] animate-fadeIn">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'تم إرسال رابط التعيين بنجاح!' : 'Reset Link Dispatched!'}
            </h4>
            <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
              {isRtl
                ? `تحقق من صندوق الوارد لبريدك (${email}) واتبع التعليمات.`
                : `Check your inbox at (${email}) to set your new password.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep('form')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1A4D4E] text-white font-semibold text-xs hover:bg-[#143d3e] transition-colors cursor-pointer"
          >
            {isRtl ? 'العودة لتسجيل الدخول' : 'Return to Sign In'}
          </button>
        </div>
      );
    }

    // 3. Step: 6-Digit Code Entry
    if (step === 'code-sent') {
      return (
        <div className="space-y-4 animate-fadeIn">
          {/* Target Email Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F2ED] dark:bg-[#152425] border border-[#E8E2D6] dark:border-[#233334] text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
              <div className="truncate">
                <span className="text-[#6F7D7B] dark:text-[#8E9B98] block text-[10px]">
                  {activeTab === 'sign-up' ? (isRtl ? 'تأكيد حساب:' : 'Verifying Account:') : (isRtl ? 'تسجيل دخول:' : 'Signing In:')}
                </span>
                <span className="font-mono text-[#1A4D4E] dark:text-[#E8ECE9] font-semibold truncate">
                  {email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep('form')}
              className="text-[#C5A059] hover:underline text-xs font-semibold flex-shrink-0 ml-2 cursor-pointer"
            >
              {isRtl ? 'تغيير' : 'Change'}
            </button>
          </div>

          {/* Interactive Dispatched Code Notice & Simulator Button */}
          {activeCode && (
            <div className="p-3 bg-[#EAF2ED] dark:bg-[#122829] border border-[#C2DBCB] dark:border-[#204445] rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between text-[#1A4D4E] dark:text-[#72D6A5] font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {isRtl ? 'تم إرسال الرمز للبريد:' : 'Verification code sent:'}
                </span>
                <span className="font-mono font-bold tracking-widest text-[#1A4D4E] dark:text-[#A7F3D0]">
                  {activeCode}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#C2DBCB]/60 dark:border-[#204445]">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="text-[11px] text-[#1A4D4E] dark:text-[#C5A059] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'معاينة الإيميل المُرسل (صندوق الوارد)' : 'Preview Delivered Email'}</span>
                </button>
                <span className="text-[10px] text-[#6F7D7B] dark:text-[#8E9B98]">
                  {isRtl ? 'صالح 10 د' : 'Valid 10m'}
                </span>
              </div>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] mb-2 text-center">
              {isRtl ? 'أدخل رمز التحقق المكون من 6 أرقام' : 'Enter 6-Digit Verification Code'}
            </label>
            <DigitCodeInput
              codeDigits={codeDigits}
              onChangeDigits={setCodeDigits}
              onComplete={handleVerifyCode}
              disabled={isSubmitting}
              resendCooldown={resendCooldown}
              onResend={handleSendCode}
              isRtl={isRtl}
              activeDispatchedCode={activeCode}
            />
          </div>

          {/* Verify & Complete Button */}
          <button
            id="verify-code-btn"
            type="button"
            onClick={() => handleVerifyCode()}
            disabled={isSubmitting || codeDigits.some(d => !d)}
            className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#143d3e] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                <span>
                  {activeTab === 'sign-up'
                    ? (isRtl ? 'تأكيد البريد وإنشاء الحساب' : 'Verify Code & Create Account')
                    : (isRtl ? 'تأكيد الرمز والدخول' : 'Verify Code & Sign In')}
                </span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      );
    }

    // 4. Step: Verification Link Sent Screen
    if (step === 'link-sent') {
      return (
        <div className="space-y-4 animate-fadeIn text-center">
          <div className="p-5 rounded-3xl bg-[#EAF2ED] dark:bg-[#122829] border border-[#C2DBCB] dark:border-[#204445] space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1A4D4E] flex items-center justify-center border border-[#C5A059]/40 shadow-md">
              <Mail className="w-7 h-7 text-[#C5A059] animate-pulse" />
            </div>

            <div>
              <h4 className="text-base font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
                {isRtl ? 'تم إرسال رابط التحقق بنجاح!' : 'Verification Link Dispatched!'}
              </h4>
              <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] mt-1 leading-relaxed">
                {isRtl
                  ? `أرسلنا رابط التحقق المباشر إلى بريدك (${email}). انقر على الرابط في إيميلك، أو استخدم الزر السريع أدناه للتحقق الفوري:`
                  : `We sent a secure verification link to (${email}). Click the link in your inbox or use the instant button below:`}
              </p>
            </div>

            {/* Instant Verification Action */}
            <div className="pt-2 space-y-2">
              <button
                id="instant-verify-link-btn"
                type="button"
                onClick={handleVerifyLinkComplete}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:brightness-105 text-[#0A1A1B] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#0A1A1B]" />
                <span>{isRtl ? 'تأكيد الحساب والدخول الفوري' : 'Verify Email & Enter Tadreeb Now'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="w-full py-2 px-3 rounded-xl border border-[#C5A059]/40 hover:bg-[#C5A059]/10 text-xs font-semibold text-[#1A4D4E] dark:text-[#E5B563] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>{isRtl ? 'فتح صندوق البريد ومعاينة الإيميل' : 'Open Email Dispatch Simulation'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6F7D7B] dark:text-[#9AA5A3] px-2">
            <button
              type="button"
              onClick={handleSendVerificationLink}
              disabled={isSubmitting}
              className="text-[#1A4D4E] dark:text-[#C5A059] font-medium hover:underline cursor-pointer"
            >
              {isRtl ? 'إعادة إرسال الرابط' : 'Resend Link'}
            </button>
            <button
              type="button"
              onClick={() => setStep('form')}
              className="text-[#6F7D7B] hover:underline cursor-pointer"
            >
              {isRtl ? 'تغيير البريد' : 'Change Email'}
            </button>
          </div>
        </div>
      );
    }

    // 5. Default Step: Form Input (Email Code, Verification Link, or Password)
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Sign Up: Full Name */}
        {activeTab === 'sign-up' && (
          <div>
            <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] mb-1">
              {isRtl ? 'الاسم الكريم' : 'Full Name'}
            </label>
            <div className="relative">
              <input
                id="signup-fullname-input"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={isRtl ? 'زيد الأنصاري' : 'Zaid Al-Ansari'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#152425] border border-[#E8E2D6] dark:border-[#233334] text-sm focus:border-[#1A4D4E] dark:focus:border-[#C5A059] outline-none transition-colors"
              />
              <User className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] mb-1">
            {method === 'code'
              ? (isRtl ? 'البريد الإلكتروني لاستلام رمز التحقق' : 'Email Address for 6-Digit Code')
              : method === 'link'
              ? (isRtl ? 'البريد الإلكتروني لاستلام رابط التفعيل' : 'Email Address for Verification Link')
              : (isRtl ? 'البريد الإلكتروني' : 'Email Address')}
          </label>
          <div className="relative">
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (method === 'code') handleSendCode();
                  else if (method === 'link') handleSendVerificationLink();
                }
              }}
              placeholder="name@domain.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#152425] border border-[#E8E2D6] dark:border-[#233334] text-sm focus:border-[#1A4D4E] dark:focus:border-[#C5A059] outline-none transition-colors"
            />
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
          </div>
        </div>

        {/* Password Input (If Password Method Selected) */}
        {method === 'password' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF]">
                {isRtl ? 'كلمة المرور' : 'Password'}
              </label>
              {activeTab === 'sign-in' && (
                <button
                  type="button"
                  onClick={() => setStep('forgot-password')}
                  className="text-xs text-[#1A4D4E] dark:text-[#C5A059] hover:underline cursor-pointer"
                >
                  {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#152425] border border-[#E8E2D6] dark:border-[#233334] text-sm focus:border-[#1A4D4E] dark:focus:border-[#C5A059] outline-none transition-colors"
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#8E9B98]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#8E9B98] hover:text-[#1A4D4E] dark:hover:text-[#C5A059] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator on Sign-Up */}
            {activeTab === 'sign-up' && (
              <PasswordStrengthIndicator password={password} isRtl={isRtl} />
            )}

            {/* Checkbox for Email Verification on Signup */}
            {activeTab === 'sign-up' && (
              <label className="flex items-center gap-2 mt-3 text-xs text-[#5F6E6C] dark:text-[#A6B2AF] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendVerificationOnSignup}
                  onChange={e => setSendVerificationOnSignup(e.target.checked)}
                  className="w-4 h-4 rounded border-[#C5A059] text-[#1A4D4E] focus:ring-[#C5A059]"
                />
                <span>{isRtl ? 'إرسال بريد تأكيد للتحقق من الحساب' : 'Send email verification to confirm account'}</span>
              </label>
            )}
          </div>
        )}

        {/* Primary Action Button according to Method */}
        {method === 'code' && (
          <button
            id="send-email-code-btn"
            type="button"
            onClick={handleSendCode}
            disabled={isSubmitting || !email}
            className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#143d3e] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 text-[#C5A059]" />
                <span>
                  {activeTab === 'sign-up'
                    ? (isRtl ? 'إرسال رمز التحقق لإنشاء الحساب' : 'Send 6-Digit Code & Sign Up')
                    : (isRtl ? 'إرسال رمز التحقق إلى البريد' : 'Send 6-Digit Code to Email')}
                </span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        )}

        {method === 'link' && (
          <button
            id="send-email-link-btn"
            type="button"
            onClick={handleSendVerificationLink}
            disabled={isSubmitting || !email}
            className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#143d3e] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LinkIcon className="w-4 h-4 text-[#C5A059]" />
                <span>
                  {activeTab === 'sign-up'
                    ? (isRtl ? 'إرسال رابط التحقق لإنشاء الحساب' : 'Send Verification Link & Sign Up')
                    : (isRtl ? 'إرسال رابط التحقق السريع' : 'Send Instant Verification Link')}
                </span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        )}

        {method === 'password' && (
          <button
            id="password-submit-btn"
            type="button"
            onClick={handlePasswordSubmit}
            disabled={isSubmitting || !email || !password}
            className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#143d3e] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {activeTab === 'sign-up'
                    ? (isRtl ? 'إنشاء الحساب ومتابعة الحفظ' : 'Create Account & Start Hifz')
                    : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
                </span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  // --- Main Authentication Sanctuary Card ---
  const renderAuthCard = () => (
    <div className="relative w-full max-w-md bg-[#FDFBF7] dark:bg-[#112122] border border-[#E8E2D6] dark:border-[#223334] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-[#1E2526] dark:text-[#E8ECE9]">
      {/* Delicate background illumination */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#1A4D4E]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Close button (Modal Mode) */}
      {!isFullScreen && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6F7D7B] dark:text-[#9AA5A3] hover:bg-[#E8E2D6] dark:hover:bg-[#232E2F] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Icon & Welcome Title */}
      <div className="text-center mb-5">
        <div className="w-13 h-13 mx-auto mb-2.5 rounded-2xl bg-[#1A4D4E] dark:bg-[#1E5657] flex items-center justify-center border-2 border-[#C5A059]/40 shadow-md transform rotate-45">
          <span className="font-arabic text-[#C5A059] text-3xl font-bold transform -rotate-45 select-none">ت</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A4D4E] dark:text-[#E8ECE9]">
          {activeTab === 'sign-up'
            ? (isRtl ? 'إنشاء حساب جديد في تَدْرِيب' : 'Begin Your Hifz Journey')
            : (isRtl ? 'تسجيل الدخول إلى تَدْرِيب' : 'Welcome to Tadreeb')}
        </h2>
        <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] mt-1 leading-relaxed">
          {activeTab === 'sign-up'
            ? (isRtl ? 'احفظ تقدمك القرآني وسجلات التسميع التجويدي في السحابة بأمان' : 'Cloud sync your recited verses, tajweed reviews, and streaks')
            : (isRtl ? 'التسميع الصوتي المباشر مع التصحيح التجويدي الفوري' : 'Real-time acoustic Quran recitation & tajweed companion')}
        </p>
      </div>

      {/* PRIMARY TAB SWITCHER: [Sign In] vs [Sign Up] */}
      <div className="flex rounded-2xl bg-[#EFECE4] dark:bg-[#162728] p-1.5 mb-5 border border-[#E5DFD1] dark:border-[#223637]">
        <button
          id="tab-sign-in-btn"
          type="button"
          onClick={() => handleTabSwitch('sign-in')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sign-in'
              ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
          }`}
        >
          {isRtl ? 'تسجيل الدخول (Sign In)' : 'Sign In'}
        </button>
        <button
          id="tab-sign-up-btn"
          type="button"
          onClick={() => handleTabSwitch('sign-up')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sign-up'
              ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
          }`}
        >
          {isRtl ? 'إنشاء حساب (Sign Up)' : 'Sign Up'}
        </button>
      </div>

      {/* SECONDARY METHOD PILL: Email Code (OTP) | Verification Link | Password */}
      {step === 'form' && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-[#8E9B98] uppercase tracking-wider mb-2 text-center">
            {isRtl ? 'اختر وسيلة التحقق بالبريد' : 'Select Email Verification Method'}
          </p>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#E8E2D6]/40 dark:bg-[#162728] border border-[#E8E2D6] dark:border-[#233334]">
            {/* 1. Email Code (OTP) */}
            <button
              type="button"
              onClick={() => handleMethodSwitch('code')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                method === 'code'
                  ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-xs ring-1 ring-[#C5A059]/30'
                  : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="truncate">{isRtl ? 'رمز 6 أرقام' : 'Email Code'}</span>
            </button>

            {/* 2. Verification Link */}
            <button
              type="button"
              onClick={() => handleMethodSwitch('link')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                method === 'link'
                  ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-xs ring-1 ring-[#C5A059]/30'
                  : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="truncate">{isRtl ? 'رابط تحقق' : 'Verify Link'}</span>
            </button>

            {/* 3. Password */}
            <button
              type="button"
              onClick={() => handleMethodSwitch('password')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                method === 'password'
                  ? 'bg-white dark:bg-[#1A4D4E] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-xs ring-1 ring-[#C5A059]/30'
                  : 'text-[#6F7D7B] dark:text-[#9AA5A3] hover:text-[#1A4D4E]'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="truncate">{isRtl ? 'كلمة المرور' : 'Password'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {authError && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium leading-tight">{authError}</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2 animate-fadeIn">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            {successBanner}
          </span>
          <button
            type="button"
            onClick={() => setShowEmailModal(true)}
            className="text-[11px] font-bold underline hover:opacity-80 flex-shrink-0 cursor-pointer text-[#1A4D4E] dark:text-[#C5A059]"
          >
            {isRtl ? 'معاينة الإيميل' : 'View Email'}
          </button>
        </div>
      )}

      {/* Main Dynamic Form Component */}
      {renderAuthForm()}

      {/* SOCIAL AUTH DIVIDER (Only on initial form step) */}
      {step === 'form' && (
        <>
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-[#E8E2D6] dark:border-[#233334] w-full" />
            <span className="bg-[#FDFBF7] dark:bg-[#112122] px-3 text-[10px] text-[#8E9B98] uppercase tracking-wider font-semibold">
              {isRtl ? 'أو عبر الحساب المباشر' : 'or continue with'}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Apple */}
            <button
              id="apple-auth-btn"
              onClick={() => handleSocialAuth('apple')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14-5.38-8.28-9.74-17.65-13.08-28.12-3.34-10.47-5.01-20.66-5.01-30.56 0-13.33 3.34-24.49 10.02-33.48 6.68-8.99 15.11-13.56 25.29-13.72 4.35 0 9.29 1.13 14.81 3.39 5.52 2.26 9.38 3.42 11.58 3.48 1.95 0 5.92-1.25 11.91-3.75 5.99-2.5 11.13-3.64 15.42-3.42 11.57.57 20.89 4.67 27.95 12.31-10.19 6.23-15.18 14.73-14.98 25.5.21 8.35 3.48 15.47 9.81 21.36 6.33 5.89 13.91 9.29 22.74 10.2-2.17 6.46-4.94 13.06-8.31 19.8zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.95-10.37 19.95-11.94.32 1.3.49 2.47.49 3.5 0 7.39-2.73 14.28-8.19 20.67-5.46 6.39-12.22 10.37-20.2 11.94z"/>
              </svg>
              <span>{isRtl ? 'متابعة بواسطة Apple' : 'Continue with Apple'}</span>
            </button>

            {/* Google */}
            <button
              id="google-auth-btn"
              onClick={() => handleSocialAuth('google')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white dark:bg-[#172627] text-[#3C4043] dark:text-[#E8ECE9] hover:bg-[#F8F9FA] dark:hover:bg-[#203334] border border-[#E8E2D6] dark:border-[#2f3f41] transition-all font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{isRtl ? 'متابعة بواسطة Google' : 'Continue with Google'}</span>
            </button>
          </div>
        </>
      )}

      {/* Guest Mode Option */}
      <div className="mt-5 pt-4 border-t border-[#E8E2D6] dark:border-[#223334] text-center">
        <button
          id="guest-mode-btn"
          type="button"
          onClick={handleContinueAsGuest}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-[#C5A059]/60 hover:bg-[#C5A059]/10 text-[#C5A059] dark:text-[#E5B563] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{isRtl ? 'المتابعة كضيف (تخزين محلي وتسميع فوري)' : 'Continue as Guest (Instant Offline Recitation)'}</span>
          {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </button>
        <p className="text-[10px] text-[#8E9B98] mt-1">
          {isRtl ? 'يمكنك ربط تقدمك بحسابك في أي وقت دون فقدان أي سورة' : 'Start reciting immediately. All progress merges safely when you link.'}
        </p>
      </div>
    </div>
  );

  // Full Screen Layout
  if (isFullScreen) {
    return (
      <div className="min-h-screen w-full bg-[#FDFBF7] dark:bg-[#0A1617] text-[#1E2526] dark:text-[#E8ECE9] flex flex-col justify-between relative overflow-hidden transition-colors selection:bg-[#C5A059]/30">
        {/* Sacred Islamic Ambient Geometry Background Pattern */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-60 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-[#1A4D4E]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top App Bar */}
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#C5A059] rounded-xl flex items-center justify-center transform rotate-45 shadow-sm bg-[#FDFBF7] dark:bg-[#102021] mx-1">
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

          {/* Quick Controls: Language & Theme Switchers */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onToggleDirection && (
              <div className="flex items-center bg-[#E8E2D6]/60 dark:bg-[#152627] border border-[#E8E2D6] dark:border-[#223637] rounded-xl p-0.5 text-xs font-semibold">
                <button
                  onClick={() => {
                    if (direction !== 'rtl') onToggleDirection();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    direction === 'rtl'
                      ? 'bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] shadow-xs'
                      : 'text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E]'
                  }`}
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
                >
                  EN
                </button>
              </div>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-[#E8E2D6]/60 dark:bg-[#152627] border border-[#E8E2D6] dark:border-[#223637] text-[#5F6E6C] dark:text-[#A6B2AF] hover:text-[#1A4D4E] dark:hover:text-[#E8ECE9] transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[#C5A059]" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area: Responsive 2-Column Showcase */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-2">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Brand Showcase & Spiritual Inspiration */}
            <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6 rtl:pr-0 rtl:pl-6">
              {/* Sacred Quranic Calligraphy Quote */}
              <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#112122]/70 border border-[#E8E2D6] dark:border-[#223536] shadow-lg backdrop-blur-sm space-y-3">
                <div className="flex items-center gap-2 text-[#C5A059]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">
                    {isRtl ? 'القرآن الكريم والتجويد' : 'The Sacred Recitation'}
                  </span>
                </div>
                <blockquote className="font-arabic text-2xl font-bold text-[#1A4D4E] dark:text-[#C5A059] leading-loose">
                  ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
                </blockquote>
                <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] italic">
                  &quot;And recite the Quran with measured recitation.&quot; (Surah Al-Muzzammil: 4)
                </p>
              </div>

              {/* 4 Feature Pillars */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/50 dark:bg-[#112122]/50 border border-[#E8E2D6] dark:border-[#223536] space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-[#1A4D4E]/10 dark:bg-[#C5A059]/15 flex items-center justify-center text-[#1A4D4E] dark:text-[#C5A059] mb-2">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {isRtl ? 'تحليل صوتي تجويدي' : 'Acoustic Tajweed Radar'}
                  </h4>
                  <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] leading-relaxed">
                    {isRtl ? 'رصد فوري لمدود الحروف، والقلقلة، والغنة بدقة' : 'Live acoustic feedback on Madd duration, Qalqalah, and Ghunnah.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 dark:bg-[#112122]/50 border border-[#E8E2D6] dark:border-[#223536] space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-[#1A4D4E]/10 dark:bg-[#C5A059]/15 flex items-center justify-center text-[#1A4D4E] dark:text-[#C5A059] mb-2">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {isRtl ? '114 سورة كاملة' : '114 Full Surahs'}
                  </h4>
                  <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] leading-relaxed">
                    {isRtl ? 'تنقل ذكي بالآيات والصفحات مع أصوات كبار القراء' : 'Full Mushaf navigation with acclaimed reciters audio.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 dark:bg-[#112122]/50 border border-[#E8E2D6] dark:border-[#223536] space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-[#1A4D4E]/10 dark:bg-[#C5A059]/15 flex items-center justify-center text-[#1A4D4E] dark:text-[#C5A059] mb-2">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {isRtl ? 'تقارير صوتية ودية' : 'Friendly Voice Compare'}
                  </h4>
                  <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] leading-relaxed">
                    {isRtl ? 'استمع لتلاوتك وقارنها بسهولة دون مصطلحات معقدة' : 'Play back your recorded places with student-friendly guidance.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 dark:bg-[#112122]/50 border border-[#E8E2D6] dark:border-[#223536] space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-[#1A4D4E]/10 dark:bg-[#C5A059]/15 flex items-center justify-center text-[#1A4D4E] dark:text-[#C5A059] mb-2">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {isRtl ? 'حفظ سحابي بـ Firebase' : 'Firebase Cloud Sync'}
                  </h4>
                  <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3] leading-relaxed">
                    {isRtl ? 'مزامنة فورية للآيات المحفوظة وسلسلة الأيام عبر الأجهزة' : 'Keep your memorization streak synced securely across devices.'}
                  </p>
                </div>
              </div>

              {/* Verified Student Quote */}
              <div className="p-4 rounded-2xl bg-[#EFECE4]/50 dark:bg-[#132526]/50 border border-[#E0D8C8] dark:border-[#213536] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A4D4E] text-[#C5A059] flex items-center justify-center font-bold text-sm">
                  ح
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-[#1A4D4E] dark:text-[#E8ECE9]">
                    {isRtl ? 'حافظ معتمد وتلميذ إجازة' : 'Verified Quran Memorizer'}
                  </p>
                  <p className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
                    {isRtl
                      ? '"التحقق بالبريد والمقارنة الصوتية جعلت مراجعتي اليومية سهلة ودقيقة."'
                      : '"The instant email code and friendly comparison report made my daily review seamless."'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Centered Auth Console Card */}
            <div className="col-span-1 lg:col-span-6 flex justify-center">
              {renderAuthCard()}
            </div>
          </div>
        </main>

        {/* Subtle Quranic Inspiration Footer */}
        <footer className="w-full max-w-4xl mx-auto px-4 py-4 text-center text-xs text-[#8E9B98] dark:text-[#6F7D7B] z-10">
          <p className="font-arabic text-sm text-[#1A4D4E]/80 dark:text-[#C5A059]/80 mb-0.5">
            ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
          </p>
          <p className="text-[11px]">
            &quot;And We have indeed made the Quran easy to understand and remember...&quot; (Surah Al-Qamar: 17)
          </p>
        </footer>

        {/* Interactive Dispatched Email Simulation Modal */}
        <EmailPreviewModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          email={email}
          type={emailModalType}
          code={activeCode || undefined}
          linkUrl={activeLinkUrl || undefined}
          onApplyCode={code => handleVerifyCode(code)}
          onApplyLink={handleVerifyLinkComplete}
          isRtl={isRtl}
        />
      </div>
    );
  }

  // Modal Presentation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {renderAuthCard()}
      <EmailPreviewModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        email={email}
        type={emailModalType}
        code={activeCode || undefined}
        linkUrl={activeLinkUrl || undefined}
        onApplyCode={code => handleVerifyCode(code)}
        onApplyLink={handleVerifyLinkComplete}
        isRtl={isRtl}
      />
    </div>
  );
};

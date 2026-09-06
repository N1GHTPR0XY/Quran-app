import React, { useState } from 'react';
import { AuthMode, Direction, UserProfile } from '../../types';
import { Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, X, KeyRound } from 'lucide-react';

interface AuthScreenProps {
  mode?: AuthMode;
  onClose?: () => void;
  onSuccess: (user: UserProfile) => void;
  direction: Direction;
  isGuestUser?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  mode = 'sign-in',
  onClose,
  onSuccess,
  direction,
  isGuestUser = false
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(isGuestUser ? 'link-account' : mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const isRtl = direction === 'rtl';

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (currentMode === 'forgot-password') {
        setResetSent(true);
      } else if (currentMode === 'sign-up') {
        setVerificationSent(true);
        setCurrentMode('verify-email');
      } else if (currentMode === 'verify-email') {
        onSuccess({
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          name: fullName || 'Hafiz Student',
          email: email || 'student@tadreeb.app',
          isGuest: false,
          connectedMethods: ['email'],
          cloudSyncStatus: 'synced',
          lastSyncedAt: 'Just now',
          totalMemorizedAyahs: 142,
          currentStreak: 14,
          dailyGoalMinutes: 15,
          level: 'intermediate'
        });
      } else {
        // Sign in or Link
        onSuccess({
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          name: fullName || 'Zaid Al-Ansari',
          email: email || 'zaid@example.com',
          isGuest: false,
          connectedMethods: ['email'],
          cloudSyncStatus: 'synced',
          lastSyncedAt: 'Just now',
          totalMemorizedAyahs: 142,
          currentStreak: 14,
          dailyGoalMinutes: 15,
          level: 'intermediate'
        });
      }
    }, 600);
  };

  const handleSocialAuth = (provider: 'google' | 'apple') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess({
        id: 'usr_' + provider + '_' + Math.random().toString(36).substr(2, 9),
        name: provider === 'apple' ? 'Tadreeb User' : 'Zaid Al-Ansari',
        email: provider === 'apple' ? 'user@privaterelay.appleid.com' : 'zaid.ansari@gmail.com',
        isGuest: false,
        avatarUrl: provider === 'google' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : undefined,
        connectedMethods: [provider],
        cloudSyncStatus: 'synced',
        lastSyncedAt: 'Just now',
        totalMemorizedAyahs: 142,
        currentStreak: 14,
        dailyGoalMinutes: 15,
        level: 'intermediate'
      });
    }, 500);
  };

  const handleContinueAsGuest = () => {
    onSuccess({
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      name: isRtl ? 'ضيف (تخزين محلي)' : 'Guest Reciter',
      email: '',
      isGuest: true,
      connectedMethods: [],
      cloudSyncStatus: 'offline',
      lastSyncedAt: 'Local device only',
      totalMemorizedAyahs: 14,
      currentStreak: 3,
      dailyGoalMinutes: 10,
      level: 'beginner'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-[#1E2526] dark:text-[#E8ECE9]">
        {/* Subtle geometric background motif */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#1A4D4E]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[#6F7D7B] dark:text-[#9AA5A3] hover:bg-[#E8E2D6] dark:hover:bg-[#232E2F] transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#1A4D4E] dark:bg-[#27827E] flex items-center justify-center border border-[#C5A059]/40 shadow-md">
            <span className="font-arabic text-[#C5A059] text-3xl font-bold">ت</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A4D4E] dark:text-[#E8ECE9]">
            {currentMode === 'link-account'
              ? (isRtl ? 'ربط الحساب وحفظ التقدم' : 'Link Your Account to Preserve Hifz')
              : currentMode === 'sign-up'
              ? (isRtl ? 'إنشاء حساب جديد' : 'Begin Your Hifz Journey')
              : currentMode === 'forgot-password'
              ? (isRtl ? 'إعادة ضبط كلمة المرور' : 'Reset Your Password')
              : currentMode === 'verify-email'
              ? (isRtl ? 'تأكيد البريد الإلكتروني' : 'Verify Your Email')
              : (isRtl ? 'تسجيل الدخول إلى تدريب' : 'Welcome Back to Tadreeb')}
          </h2>
          <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
            {currentMode === 'link-account'
              ? (isRtl
                  ? 'اربط حسابك بحساب Google أو Apple لمزامنة السور المحفوظة والتقدم عبر أجهزتك دون فقدان أي بيانات.'
                  : 'Connect with Google or Apple to cloud sync your memorized Surahs, audio downloads, and streaks seamlessly.')
              : currentMode === 'forgot-password'
              ? (isRtl ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين' : "Enter your email address and we'll send you a password reset link.")
              : currentMode === 'verify-email'
              ? (isRtl ? `أدخل الرمز المكون من 6 أرقام المرسل إلى ${email || 'بريدك'}` : `Enter the 6-digit security code sent to ${email || 'your email'}`)
              : (isRtl ? 'تلاوة، حفظ، وتصحيح فوري بأعلى المعايير' : 'Real-time Quran memorization with gentle acoustic tajweed feedback')}
          </p>
        </div>

        {/* LINK ACCOUNT BANNER (If in link mode) */}
        {currentMode === 'link-account' && (
          <div className="mb-6 p-3.5 rounded-2xl bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] text-xs text-[#1A4D4E] dark:text-[#72D6A5] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{isRtl ? 'التقدم الحالي محفوظ محلياً' : 'Local Hifz Progress Detected'}</p>
              <p className="mt-0.5 opacity-90">
                {isRtl
                  ? 'أنت في وضع الضيف (14 آية محفوظة • سلسلة 3 أيام). بمجرد الربط، ستنتقل إحصاءاتك لحسابك الدائم فوراً.'
                  : '14 ayahs and your 3-day streak will be securely merged into your new cloud account.'}
              </p>
            </div>
          </div>
        )}

        {/* SOCIAL AUTH BUTTONS: Strict Google & Apple Guidelines */}
        {(currentMode === 'sign-in' || currentMode === 'sign-up' || currentMode === 'link-account') && (
          <div className="space-y-3 mb-6">
            {/* Apple Sign-In Button (Placed according to App Store Review Guidelines: above or equal to other 3rd party providers) */}
            <button
              onClick={() => handleSocialAuth('apple')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all font-medium text-sm shadow-sm cursor-pointer"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14-5.38-8.28-9.74-17.65-13.08-28.12-3.34-10.47-5.01-20.66-5.01-30.56 0-13.33 3.34-24.49 10.02-33.48 6.68-8.99 15.11-13.56 25.29-13.72 4.35 0 9.29 1.13 14.81 3.39 5.52 2.26 9.38 3.42 11.58 3.48 1.95 0 5.92-1.25 11.91-3.75 5.99-2.5 11.13-3.64 15.42-3.42 11.57.57 20.89 4.67 27.95 12.31-10.19 6.23-15.18 14.73-14.98 25.5.21 8.35 3.48 15.47 9.81 21.36 6.33 5.89 13.91 9.29 22.74 10.2-2.17 6.46-4.94 13.06-8.31 19.8zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.95-10.37 19.95-11.94.32 1.3.49 2.47.49 3.5 0 7.39-2.73 14.28-8.19 20.67-5.46 6.39-12.22 10.37-20.2 11.94z"/>
              </svg>
              <span>
                {currentMode === 'sign-up'
                  ? (isRtl ? 'التسجيل بواسطة Apple' : 'Sign up with Apple')
                  : currentMode === 'link-account'
                  ? (isRtl ? 'ربط الحساب بـ Apple' : 'Link with Apple')
                  : (isRtl ? 'متابعة باستخدام Apple' : 'Sign in with Apple')}
              </span>
            </button>

            {/* Google Sign-In Button (Strict Google Identity Branding guidelines) */}
            <button
              onClick={() => handleSocialAuth('google')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white dark:bg-[#172526] text-[#3C4043] dark:text-[#E8ECE9] hover:bg-[#F8F9FA] dark:hover:bg-[#232E2F] border border-[#E8E2D6] dark:border-[#384447] transition-all font-medium text-sm shadow-sm cursor-pointer"
            >
              {/* Official 4-color Google G Logo */}
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
                  : (isRtl ? 'متابعة باستخدام Google' : 'Sign in with Google')}
              </span>
            </button>
          </div>
        )}

        {/* Divider */}
        {(currentMode === 'sign-in' || currentMode === 'sign-up' || currentMode === 'link-account') && (
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-[#E8E2D6] dark:border-[#232E2F] w-full" />
            <span className="bg-[#FDFBF7] dark:bg-[#122021] px-3 text-xs text-[#8E9B98] uppercase tracking-wider font-medium">
              {isRtl ? 'أو عبر البريد' : 'or email'}
            </span>
          </div>
        )}

        {/* EMAIL / PASSWORD FORM */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {/* Full Name (Only on Sign Up) */}
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

          {/* Email Address */}
          {currentMode !== 'verify-email' && (
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
          )}

          {/* Password (Sign in, Sign up, Link) */}
          {(currentMode === 'sign-in' || currentMode === 'sign-up' || currentMode === 'link-account') && (
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

          {/* Verification Code Box (If verify-email) */}
          {currentMode === 'verify-email' && (
            <div>
              <label className="block text-xs font-semibold text-[#5F6E6C] dark:text-[#A6B2AF] mb-1">
                {isRtl ? 'رمز التأكيد (6 أرقام)' : '6-Digit Security Code'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] text-center tracking-[0.4em] font-mono text-lg font-bold"
                />
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E9B98]" />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-[#6F7D7B]">
                <span>{isRtl ? 'لم يصلك الرمز؟' : "Didn't receive code?"}</span>
                <button
                  type="button"
                  onClick={() => alert(isRtl ? 'تم إرسال رمز جديد' : 'New code sent')}
                  className="text-[#1A4D4E] dark:text-[#C5A059] hover:underline font-medium cursor-pointer"
                >
                  {isRtl ? 'إعادة الإرسال (30 ثانية)' : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {/* Reset Sent Message */}
          {resetSent && (
            <div className="p-3 bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] rounded-xl text-xs text-[#1A4D4E] dark:text-[#72D6A5] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{isRtl ? 'تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك!' : 'Password reset link sent! Please check your inbox.'}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#C5A059] dark:hover:bg-[#b38f48] text-white dark:text-[#0E1A1A] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
                    : currentMode === 'verify-email'
                    ? (isRtl ? 'تأكيد وإتمام التسجيل' : 'Confirm Code & Enter')
                    : currentMode === 'link-account'
                    ? (isRtl ? 'ربط البيانات وحفظ السلسلة' : 'Link Progress')
                    : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
                </span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-5 text-center text-xs text-[#6F7D7B] dark:text-[#9AA5A3] space-y-2">
          {currentMode === 'sign-in' && (
            <p>
              {isRtl ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setCurrentMode('sign-up')}
                className="text-[#1A4D4E] dark:text-[#C5A059] font-semibold hover:underline cursor-pointer"
              >
                {isRtl ? 'إنشاء حساب جديد' : 'Sign up free'}
              </button>
            </p>
          )}

          {currentMode === 'sign-up' && (
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

          {(currentMode === 'forgot-password' || currentMode === 'verify-email') && (
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

          {/* Continue As Guest Option (Preserves local progress) */}
          {currentMode !== 'link-account' && (
            <div className="pt-2 border-t border-[#E8E2D6] dark:border-[#232E2F]">
              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#C5A059]/60 hover:bg-[#E8E2D6]/40 dark:hover:bg-[#232E2F] text-[#C5A059] font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isRtl ? 'المتابعة كضيف (حفظ محلي فوري)' : 'Continue as Guest (Local Offline Storage)'}</span>
              </button>
              <p className="text-[11px] text-[#8E9B98] mt-1">
                {isRtl
                  ? 'يمكنك تجربة التسميع مباشرةً وربط حسابك لاحقاً دون فقدان تقدمك'
                  : 'Start reciting immediately. All progress stays safely on device until you link.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


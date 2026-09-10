import React from 'react';
import { X, Mail, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  type: 'code' | 'link';
  code?: string;
  linkUrl?: string;
  onApplyCode?: (code: string) => void;
  onApplyLink?: () => void;
  isRtl: boolean;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  email,
  type,
  code,
  linkUrl,
  onApplyCode,
  onApplyLink,
  isRtl
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#101F20] border border-[#E0D8C8] dark:border-[#263738] rounded-3xl shadow-2xl overflow-hidden text-[#1E2526] dark:text-[#E8ECE9]">
        {/* Email Header Bar */}
        <div className="bg-[#1A4D4E] text-white px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C5A059]">
                {isRtl ? 'محاكاة صندوق الوارد الآمن' : 'Interactive Email Dispatch'}
              </p>
              <h3 className="text-sm font-bold truncate">
                {type === 'code'
                  ? (isRtl ? 'رمز التحقق من حساب تَدْرِيب' : 'Tadreeb Quran: Your 6-Digit Verification Code')
                  : (isRtl ? 'رابط تفعيل الدخول إلى تَدْرِيب' : 'Tadreeb Quran: Confirm Your Account Verification Link')}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close email simulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Meta Information */}
        <div className="px-6 py-3 bg-[#EFECE4]/60 dark:bg-[#142627] border-b border-[#E0D8C8] dark:border-[#223334] text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#6F7D7B] dark:text-[#8E9B98]">{isRtl ? 'من:' : 'From:'}</span>
            <span className="font-mono text-[#1A4D4E] dark:text-[#C5A059] font-medium">
              Tadreeb Security &lt;auth@tadreeb-quran.firebaseapp.com&gt;
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6F7D7B] dark:text-[#8E9B98]">{isRtl ? 'إلى:' : 'To:'}</span>
            <span className="font-mono font-medium truncate">{email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6F7D7B] dark:text-[#8E9B98]">{isRtl ? 'الحالة:' : 'Status:'}</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isRtl ? 'تم الإرسال بنجاح عبر Firebase' : 'Delivered via Firebase Service'}
            </span>
          </div>
        </div>

        {/* Email Body Content */}
        <div className="p-6 space-y-5">
          {/* Brand Letterhead */}
          <div className="text-center pb-3 border-b border-[#E8E2D6] dark:border-[#223334]">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#1A4D4E] flex items-center justify-center border border-[#C5A059]/40 shadow-sm mb-2 transform rotate-45">
              <span className="font-arabic text-[#C5A059] text-2xl font-bold transform -rotate-45 select-none">ت</span>
            </div>
            <h4 className="font-bold text-lg text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'مرحباً بك في منصة تَدْرِيب للقرآن الكريم' : 'Welcome to Tadreeb Quran'}
            </h4>
            <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] mt-1 font-arabic">
              ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
            </p>
          </div>

          {/* Body Narrative */}
          <div className="text-xs leading-relaxed text-[#3E4D4B] dark:text-[#C4D0CE] space-y-2">
            <p>
              {isRtl
                ? `السلام عليكم ورحمة الله، لقد طلبت التحقق من بريدك الإلكتروني (${email}) لبدء رحلة التسميع الصوتي والحفظ.`
                : `Assalamu Alaykum. You requested email verification for your account (${email}) to start your intelligent Quran memorization journey.`}
            </p>
            <p className="text-[11px] text-[#6F7D7B] dark:text-[#8E9B98]">
              {isRtl
                ? 'لحماية أمان حسابك، هذا الطلب صالح لمدة 10 دقائق فقط.'
                : 'For your security, this verification credential remains valid for 10 minutes.'}
            </p>
          </div>

          {/* Primary Action Section */}
          {type === 'code' && code && (
            <div className="p-4 rounded-2xl bg-[#F0EBE1] dark:bg-[#162728] border-2 border-[#C5A059]/40 text-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1A4D4E] dark:text-[#C5A059]">
                {isRtl ? 'رمز التحقق المكون من 6 أرقام' : 'Your 6-Digit Verification Code'}
              </p>
              <div className="font-mono text-3xl font-extrabold tracking-[0.35em] text-[#1A4D4E] dark:text-[#E5B563] select-all">
                {code}
              </div>
              <p className="text-[11px] text-[#6F7D7B] dark:text-[#8E9B98]">
                {isRtl ? 'أدخل هذا الرمز في شاشة التحقق أو انقر للتحقق الفوري:' : 'Enter this code in the verification screen or click below:'}
              </p>
              {onApplyCode && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyCode(code);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1A4D4E] hover:bg-[#143d3e] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  <span>{isRtl ? 'تعبئة الرمز والتحقق الفوري' : 'Auto-Fill Code & Verify Now'}</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}

          {type === 'link' && (
            <div className="p-4 rounded-2xl bg-[#F0EBE1] dark:bg-[#162728] border-2 border-[#C5A059]/40 text-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1A4D4E] dark:text-[#C5A059]">
                {isRtl ? 'رابط التفعيل الآمن الفوري' : 'Instant Verification Link'}
              </p>
              <p className="text-xs text-[#3E4D4B] dark:text-[#C4D0CE]">
                {isRtl
                  ? 'انقر على الزر الذهبي أدناه لتأكيد بريدك وتسجيل الدخول مباشرة:'
                  : 'Click the button below to authenticate your email and enter Tadreeb directly:'}
              </p>
              {onApplyLink && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyLink();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:brightness-105 text-[#0A1A1B] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-[#0A1A1B]" />
                  <span>{isRtl ? 'تأكيد الحساب وبدء التسميع الآن' : 'Verify Email & Enter Tadreeb Now'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
              {linkUrl && (
                <div className="pt-2 text-[10px] font-mono text-[#8E9B98] break-all opacity-80">
                  {linkUrl}
                </div>
              )}
            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 border-t border-[#E8E2D6] dark:border-[#223334] flex items-center justify-between text-[11px] text-[#8E9B98]">
            <span>© Tadreeb Quran Memorization</span>
            <button
              onClick={onClose}
              className="font-semibold text-[#1A4D4E] dark:text-[#C5A059] hover:underline cursor-pointer"
            >
              {isRtl ? 'إغلاق الصندوق' : 'Dismiss'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

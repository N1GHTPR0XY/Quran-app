import React, { useRef, useEffect } from 'react';
import { RotateCw, Copy, Check, ShieldCheck } from 'lucide-react';

interface DigitCodeInputProps {
  codeDigits: string[];
  onChangeDigits: (digits: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  resendCooldown: number;
  onResend: () => void;
  isRtl: boolean;
  activeDispatchedCode?: string | null;
}

export const DigitCodeInput: React.FC<DigitCodeInputProps> = ({
  codeDigits,
  onChangeDigits,
  onComplete,
  disabled = false,
  resendCooldown,
  onResend,
  isRtl,
  activeDispatchedCode
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [copiedNotice, setCopiedNotice] = React.useState(false);

  useEffect(() => {
    // Focus first empty box on mount
    const firstEmpty = codeDigits.findIndex(d => !d);
    const targetIdx = firstEmpty >= 0 ? firstEmpty : 0;
    inputRefs.current[targetIdx]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...codeDigits];
    updated[index] = clean;
    onChangeDigits(updated);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.every(d => d.length === 1) && onComplete) {
      onComplete(updated.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    onChangeDigits(updated);

    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();

    if (pasted.length === 6 && onComplete) {
      onComplete(pasted);
    }
  };

  const handleAutoFill = () => {
    if (!activeDispatchedCode) return;
    const digits = activeDispatchedCode.split('').slice(0, 6);
    onChangeDigits(digits);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
    inputRefs.current[5]?.focus();
    if (digits.length === 6 && onComplete) {
      onComplete(digits.join(''));
    }
  };

  return (
    <div className="space-y-4">
      {/* 6 Digit Inputs Container */}
      <div className="flex justify-between gap-1.5 sm:gap-2 max-w-xs mx-auto" dir="ltr">
        {codeDigits.map((digit, idx) => (
          <div key={idx} className="relative group">
            <input
              ref={el => {
                inputRefs.current[idx] = el;
              }}
              id={`digit-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${idx + 1}`}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-2xl bg-white dark:bg-[#152425] border-2 transition-all duration-200 outline-none select-all ${
                digit
                  ? 'border-[#C5A059] text-[#1A4D4E] dark:text-[#E8ECE9] shadow-sm ring-2 ring-[#C5A059]/20'
                  : 'border-[#E8E2D6] dark:border-[#243335] text-[#1A4D4E] dark:text-[#E8ECE9] focus:border-[#1A4D4E] dark:focus:border-[#C5A059] focus:ring-4 focus:ring-[#1A4D4E]/10 dark:focus:ring-[#C5A059]/15'
              } disabled:opacity-50`}
            />
            {digit && (
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            )}
          </div>
        ))}
      </div>

      {/* Auto-fill shortcut if code was dispatched */}
      {activeDispatchedCode && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAutoFill}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C5A059]/15 text-[#9E7A32] dark:text-[#E5B563] hover:bg-[#C5A059]/25 transition-colors cursor-pointer border border-[#C5A059]/30"
          >
            {copiedNotice ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>
              {copiedNotice
                ? (isRtl ? 'تمت التعبئة بنجاح!' : 'Code filled!')
                : (isRtl ? `تعبئة الرمز المُستلم (${activeDispatchedCode})` : `Paste received code (${activeDispatchedCode})`)}
            </span>
          </button>
        </div>
      )}

      {/* Resend Cooldown and Actions */}
      <div className="flex items-center justify-between text-xs text-[#6F7D7B] dark:text-[#9AA5A3] px-1 pt-1">
        <span>{isRtl ? 'لم يصلك الرمز؟' : "Didn't receive the code?"}</span>
        {resendCooldown > 0 ? (
          <span className="font-mono text-[#C5A059] font-medium">
            {isRtl ? `إعادة الإرسال بعد ${resendCooldown} ث` : `Resend in ${resendCooldown}s`}
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={disabled}
            className="text-[#1A4D4E] dark:text-[#C5A059] font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إرسال رمز جديد' : 'Resend Code'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

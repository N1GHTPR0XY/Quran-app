import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  isRtl: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  isRtl
}) => {
  if (!password) return null;

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (score <= 1) return isRtl ? 'ضعيفة' : 'Weak';
    if (score === 2) return isRtl ? 'متوسطة' : 'Fair';
    if (score === 3) return isRtl ? 'جيدة' : 'Strong';
    return isRtl ? 'ممتازة (درجة الحُفّاظ)' : 'Hafiz-Grade Strong';
  };

  const getColor = () => {
    if (score <= 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-emerald-500';
    return 'bg-[#C5A059]';
  };

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Strength Bar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#6F7D7B] dark:text-[#9AA5A3]">
          {isRtl ? 'قوة كلمة المرور:' : 'Password Security:'}
        </span>
        <span className="font-semibold text-[11px] text-[#1A4D4E] dark:text-[#E8ECE9]">
          {getStrengthLabel()}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`rounded-full transition-all duration-300 ${
              score >= step ? getColor() : 'bg-[#E8E2D6] dark:bg-[#233334]'
            }`}
          />
        ))}
      </div>

      {/* Rules Criteria */}
      <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-[#6F7D7B] dark:text-[#8E9B98]">
        <div className={`flex items-center gap-1 ${hasLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
          {hasLength ? <Check className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0 opacity-40" />}
          <span>{isRtl ? '8 أحرف على الأقل' : 'At least 8 chars'}</span>
        </div>
        <div className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
          {hasUpper ? <Check className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0 opacity-40" />}
          <span>{isRtl ? 'حرف كبير (A-Z)' : 'Uppercase letter'}</span>
        </div>
        <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
          {hasNumber ? <Check className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0 opacity-40" />}
          <span>{isRtl ? 'رقم (0-9)' : 'Number'}</span>
        </div>
        <div className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
          {hasSpecial ? <Check className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0 opacity-40" />}
          <span>{isRtl ? 'رمز خاص (!@#$)' : 'Special character'}</span>
        </div>
      </div>
    </div>
  );
};

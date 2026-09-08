import React, { useState } from 'react';
import { AudioSettings, Direction } from '../../types';
import { RECITERS_LIST } from '../../data/quranData';
import { audioEngine } from '../../services/audioEngine';
import {
  Volume2,
  Sliders,
  Play,
  Check,
  Sparkles,
  Layers,
  ShieldCheck,
  Clock,
  Radio,
  VolumeX
} from 'lucide-react';

interface AudioSettingsScreenProps {
  settings: AudioSettings;
  onUpdateSettings: (newSettings: AudioSettings) => void;
  direction: Direction;
}

export const AudioSettingsScreen: React.FC<AudioSettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  direction
}) => {
  const isRtl = direction === 'rtl';
  const [testingDucking, setTestingDucking] = useState(false);

  const handleTestAudioCollisionDucking = () => {
    setTestingDucking(true);
    // Play Qari audio
    audioEngine.playReciterAudio('https://everyayah.com/data/Alafasy_128kbps/001001.mp3');

    // After 1.5 seconds, coach voice speaks; audio engine automatically ducks reciter to 15%!
    setTimeout(() => {
      audioEngine.speakGuidance(
        `Notice how the coach voice smoothly ducks the recitation audio, giving you crystal clear guidance with zero collision.`,
        settings,
        () => {
          setTestingDucking(false);
        }
      );
    }, 1400);
  };

  const handleReciterSample = (reciterId: string) => {
    const url = 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3';
    audioEngine.playReciterAudio(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn pb-28">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
          {isRtl ? 'إعدادات الصوت والمرشد الصوتي' : 'Audio Experience & Voice Coach'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
          {isRtl
            ? 'تخصيص القارئ المرجعي، أصوات التوجيه (ذكورية/أنثوية)، سرعة الإرشاد وسلوك طبقات الصوت الذكية.'
            : 'Configure reference qaris, male/female guidance voices, pacing, and intelligent audio ducking layers.'}
        </p>
      </div>

      {/* INTERACTIVE AUDIO ENGINE TEST BANNER */}
      <div className="p-5 rounded-3xl bg-[#1A4D4E] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#C5A059]/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C5A059]" />
            <span className="text-xs uppercase tracking-wider font-bold text-[#C5A059]">
              {isRtl ? 'محرك تداخل الصوت المتقدم' : 'Non-Collision Audio Layer Engine'}
            </span>
          </div>
          <p className="text-xs text-neutral-200 max-w-lg leading-relaxed">
            {isRtl
              ? 'تسمع تلاوة القارئ والمرشد الصوتي دون انقطاع حاد؛ تخفت التلاوة بلطف أثناء التوجيه ثم تعود تدريجياً.'
              : 'Reciter audio smoothly dips to 15% with a 300ms exponential curve when the coach speaks, preventing cognitive clutter.'}
          </p>
        </div>

        <button
          onClick={handleTestAudioCollisionDucking}
          disabled={testingDucking}
          className="px-5 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#B38F48] text-[#0E1A1A] font-bold text-xs shadow-md transition-all whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{testingDucking ? (isRtl ? 'جاري الاختبار...' : 'Testing Layers...') : (isRtl ? 'تجربة التداخل الذكي' : 'Test Live Ducking')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 1: REFERENCE RECITER SELECTION */}
        <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#C5A059]" />
              <span>{isRtl ? 'القارئ المرجعي للتصحيح' : 'Reference Qari (Real Audio)'}</span>
            </h3>
            <span className="text-[11px] text-[#1A4D4E] dark:text-[#72D6A5] bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB]/40 px-2 py-0.5 rounded-full font-semibold">
              Murattal Audio
            </span>
          </div>

          <div className="space-y-2.5">
            {RECITERS_LIST.map(reciter => {
              const isSelected = settings.reciterId === reciter.id;
              return (
                <div
                  key={reciter.id}
                  onClick={() => onUpdateSettings({ ...settings, reciterId: reciter.id, reciterName: reciter.name })}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#F5F2ED] dark:bg-[#1A2627] shadow-sm'
                      : 'border-[#E8E2D6] dark:border-[#232E2F] hover:border-[#C5A059] bg-[#FDFBF7] dark:bg-[#122021]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">{reciter.name}</p>
                      <p className="text-[11px] text-[#C5A059]">{reciter.style}</p>
                      <p className="text-[10px] text-[#8E9B98] mt-1">{reciter.clarity}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleReciterSample(reciter.id);
                        }}
                        className="p-1.5 rounded-lg bg-[#F5F2ED] dark:bg-[#232E2F] text-[#1A4D4E] dark:text-[#C5A059] hover:scale-105 transition-transform"
                        title="Sample Audio"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: GUIDANCE VOICE & COACHING TONE */}
        <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>{isRtl ? 'صوت ونبرة المرشد' : 'Interface Guidance & Coaching Voice'}</span>
          </h3>

          {/* Guidance & Recitation Speaker Language (Arabic vs English) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#C5A059]">
                {isRtl ? 'لغة المتحدث الصوتي والتوجيه' : 'Recitation Speaker & Coach Language'}
              </label>
              <span className="text-[10px] text-[#1A4D4E] dark:text-[#72D6A5] bg-[#EAF2ED] dark:bg-[#142A20] px-2 py-0.5 rounded-full font-semibold">
                {settings.speakerLanguage === 'ar' || (!settings.speakerLanguage && isRtl) ? 'العربية' : 'English'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              {/* Arabic Speaker Option */}
              <div
                onClick={() => onUpdateSettings({ ...settings, speakerLanguage: 'ar', guidanceVoiceLanguage: 'ar' })}
                className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer space-y-1.5 ${
                  (settings.speakerLanguage === 'ar' || (!settings.speakerLanguage && isRtl))
                    ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#EAF2ED] dark:bg-[#142A20] shadow-sm'
                    : 'border-[#E8E2D6] dark:border-[#232E2F] bg-[#FDFBF7] dark:bg-[#172526] hover:border-[#C5A059]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-1.5">
                    <span>🇸🇦</span>
                    <span>{isRtl ? 'متحدث بالعربية' : 'Arabic Speaker'}</span>
                  </span>
                  {(settings.speakerLanguage === 'ar' || (!settings.speakerLanguage && isRtl)) && (
                    <span className="w-4 h-4 rounded-full bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5F6E6C] dark:text-[#A6B2AF]">
                  {isRtl ? 'نداء البدء: "ابدأ التلاوة"' : 'Prompt: "ابدأ التلاوة" (Arabic)'}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioEngine.speakBeginRecitationPrompt('ar', { ...settings, speakerLanguage: 'ar', guidanceVoiceLanguage: 'ar' });
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-[#1A2627] border border-[#C2DBCB] dark:border-[#232E2F] text-[10px] font-semibold text-[#1A4D4E] dark:text-[#C5A059] hover:bg-[#EAE5DC] dark:hover:bg-[#203031] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{isRtl ? 'استمع لـ: "ابدأ التلاوة"' : 'Listen: "ابدأ التلاوة"'}</span>
                </button>
              </div>

              {/* English Speaker Option */}
              <div
                onClick={() => onUpdateSettings({ ...settings, speakerLanguage: 'en', guidanceVoiceLanguage: 'en' })}
                className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer space-y-1.5 ${
                  (settings.speakerLanguage === 'en' || (!settings.speakerLanguage && !isRtl))
                    ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#EAF2ED] dark:bg-[#142A20] shadow-sm'
                    : 'border-[#E8E2D6] dark:border-[#232E2F] bg-[#FDFBF7] dark:bg-[#172526] hover:border-[#C5A059]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9] flex items-center gap-1.5">
                    <span>🇬🇧</span>
                    <span>{isRtl ? 'متحدث بالإنجليزية' : 'English Speaker'}</span>
                  </span>
                  {(settings.speakerLanguage === 'en' || (!settings.speakerLanguage && !isRtl)) && (
                    <span className="w-4 h-4 rounded-full bg-[#1A4D4E] dark:bg-[#C5A059] text-white dark:text-[#0E1A1A] flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5F6E6C] dark:text-[#A6B2AF]">
                  {isRtl ? 'نداء البدء: "Begin recitation"' : 'Prompt: "Begin recitation"'}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioEngine.speakBeginRecitationPrompt('en', { ...settings, speakerLanguage: 'en', guidanceVoiceLanguage: 'en' });
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-[#1A2627] border border-[#C2DBCB] dark:border-[#232E2F] text-[10px] font-semibold text-[#1A4D4E] dark:text-[#C5A059] hover:bg-[#EAE5DC] dark:hover:bg-[#203031] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{isRtl ? 'استمع لـ: "Begin recitation"' : 'Listen: "Begin recitation"'}</span>
                </button>
              </div>
            </div>

            {/* Spoken Announcement on Recitation Start Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] mt-2">
              <div>
                <span className="font-semibold text-xs text-[#1A4D4E] dark:text-[#E8ECE9] block">
                  {isRtl ? 'نداء المتحدث عند بدء التسميع' : 'Announce on Recitation Start'}
                </span>
                <span className="text-[10px] text-[#8E9B98]">
                  {isRtl ? 'ينطق "ابدأ التلاوة" أو "Begin recitation" عند تشغيل الميكروفون' : 'Spoken audio alert ("Begin recitation" or "ابدأ التلاوة") when mic triggers'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, beginRecitationPromptEnabled: settings.beginRecitationPromptEnabled === false ? true : false })}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.beginRecitationPromptEnabled !== false ? 'bg-[#1A4D4E] dark:bg-[#C5A059]' : 'bg-[#D1D5DB] dark:bg-[#374151]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.beginRecitationPromptEnabled !== false ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Voice Gender Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-2">
              {isRtl ? 'جنس الصوت' : 'Voice Gender'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'female', label: isRtl ? 'أنثوي (دافئ وهادئ)' : 'Female (Warm & Gentle)' },
                { id: 'male', label: isRtl ? 'ذكوري (وقور ومتأنٍ)' : 'Male (Reverent & Clear)' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => onUpdateSettings({ ...settings, guidanceVoiceGender: g.id as 'female' | 'male' })}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                    settings.guidanceVoiceGender === g.id
                      ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#1A4D4E] text-white dark:bg-[#C5A059] dark:text-[#0E1A1A]'
                      : 'border-[#E8E2D6] dark:border-[#232E2F] bg-[#FDFBF7] dark:bg-[#172526] text-[#6F7D7B] dark:text-[#A6B2AF] hover:border-[#C5A059]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coaching Tone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-2">
              {isRtl ? 'نبرة الإرشاد والتصحيح' : 'Coaching Tone'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'warm', label: 'Warm & Encouraging', labelAr: 'دافئة ومشجعة' },
                { id: 'instructional', label: 'Instructional', labelAr: 'تعليمية دقيقة' },
                { id: 'reflective', label: 'Reflective', labelAr: 'تأملية هادئة' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ ...settings, guidanceVoiceTone: t.id as typeof settings.guidanceVoiceTone })}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all text-center cursor-pointer ${
                    settings.guidanceVoiceTone === t.id
                      ? 'border-[#1A4D4E] dark:border-[#C5A059] bg-[#F5F2ED] dark:bg-[#232E2F] text-[#1A4D4E] dark:text-[#C5A059] font-bold'
                      : 'border-[#E8E2D6] dark:border-[#232E2F] bg-[#FDFBF7] dark:bg-[#172526] text-[#6F7D7B] dark:text-[#9AA5A3] hover:border-[#C5A059]'
                  }`}
                >
                  {isRtl ? t.labelAr : t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speed Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-semibold text-[#5F6E6C] dark:text-[#A6B2AF]">
              <span>{isRtl ? 'سرعة الإرشاد الصوتي' : 'Guidance Pacing / Speed'}</span>
              <span className="text-[#1A4D4E] dark:text-[#C5A059]">{settings.guidanceVoiceSpeed}x (Unhurried)</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={settings.guidanceVoiceSpeed}
              onChange={e => onUpdateSettings({ ...settings, guidanceVoiceSpeed: parseFloat(e.target.value) })}
              className="w-full accent-[#1A4D4E] dark:accent-[#C5A059] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E9B98] mt-1">
              <span>0.75x (Deliberate)</span>
              <span>1.0x (Standard)</span>
              <span>1.25x (Brisk)</span>
            </div>
          </div>

          {/* Tajweed Strictness Filter */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-semibold text-[#5F6E6C] dark:text-[#A6B2AF]">
              <span>{isRtl ? 'مستوى صرامة تصحيح التجويد' : 'Tajweed Acoustic Strictness'}</span>
              <span className="text-[#1A4D4E] dark:text-[#72D6A5] font-bold capitalize">{settings.tajweedStrictness}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lenient', label: 'Lenient (Harakat only)', labelAr: 'ميسر (حركات فقط)' },
                { id: 'standard', label: 'Standard (Hafs rules)', labelAr: 'معياري (حفص)' },
                { id: 'strict', label: 'Hafiz (All micro-rules)', labelAr: 'متقن (تدقيق شامل)' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => onUpdateSettings({ ...settings, tajweedStrictness: lvl.id as typeof settings.tajweedStrictness })}
                  className={`p-2 rounded-xl border text-[11px] transition-all text-center cursor-pointer ${
                    settings.tajweedStrictness === lvl.id
                      ? 'border-[#1A4D4E] bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] font-bold'
                      : 'border-[#E8E2D6] dark:border-[#232E2F] text-[#6F7D7B] dark:text-[#9AA5A3] hover:border-[#C5A059]'
                  }`}
                >
                  {isRtl ? lvl.labelAr : lvl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

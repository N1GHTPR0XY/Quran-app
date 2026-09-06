import React, { useState } from 'react';
import { Direction, UserProfile, ScreenId } from '../../types';
import {
  User,
  ShieldCheck,
  CloudCheck,
  RefreshCw,
  Download,
  Trash2,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Smartphone,
  Flame,
  Award
} from 'lucide-react';

interface ProfileSettingsScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  direction: Direction;
  onOpenAuth: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  user,
  onUpdateUser,
  direction,
  onOpenAuth,
  onNavigate
}) => {
  const isRtl = direction === 'rtl';
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onUpdateUser({
        cloudSyncStatus: 'synced',
        lastSyncedAt: 'Just now'
      });
    }, 1200);
  };

  const handleExportData = () => {
    const exportData = {
      app: "Tadreeb Quran Memorization & Recitation",
      version: "1.0.0",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        totalMemorizedAyahs: user.totalMemorizedAyahs,
        currentStreak: user.currentStreak,
        lastSyncedAt: user.lastSyncedAt
      },
      memorizationProgress: {
        surah1_AlFatihah: { progress: 100, masteredDate: "2026-08-15" },
        surah67_AlMulk: { progress: 72, masteredAyahs: 22, totalAyahs: 30 },
        surah112_AlIkhlas: { progress: 100, masteredDate: "2026-08-20" }
      },
      mistakesReviewHistory: [
        { rule: "Madd Lazim 6 Harakat", word: "ٱلضَّآلِّينَ", status: "reviewed_3_times" },
        { rule: "Qalqalah Sughra Baa", word: "لِيَبْلُوَكُمْ", status: "reviewed_2_times" }
      ],
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tadreeb-hifz-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toLowerCase() === 'delete') {
      setShowDeleteModal(false);
      onUpdateUser({
        id: 'guest_' + Math.random().toString(36).substr(2, 9),
        name: 'Guest Reciter',
        email: '',
        isGuest: true,
        connectedMethods: [],
        cloudSyncStatus: 'offline',
        lastSyncedAt: 'Never',
        totalMemorizedAyahs: 0,
        currentStreak: 0,
        dailyGoalMinutes: 15
      });
      alert(isRtl ? 'تم حذف الحساب ومسح البيانات السحابية بنجاح' : 'Account and cloud data permanently purged.');
      onNavigate('dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn pb-28">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">
          {isRtl ? 'إعدادات الملف الشخصي والحساب' : 'Profile & Account Settings'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6F7D7B] dark:text-[#9AA5A3] mt-1">
          {isRtl
            ? 'إدارة طرق تسجيل الدخول المرتبطة، حالة المزامنة السحابية، تصدير البيانات وحذف الحساب.'
            : 'Manage connected identity providers, cloud backup sync status, personal data export, and privacy.'}
        </p>
      </div>

      {/* USER PROFILE IDENTITY CARD */}
      <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1A4D4E] dark:bg-[#27827E] flex items-center justify-center text-white font-bold text-2xl border border-[#C5A059]/40 shadow-md">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span>{user.name.charAt(0)}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">{user.name}</h2>
              {user.isGuest ? (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F5F2ED] dark:bg-[#232E2F] text-[#C5A059] border border-[#E8E2D6]">
                  Guest Reciter
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#EAF2ED] dark:bg-[#142A20] text-[#1A4D4E] dark:text-[#72D6A5] border border-[#C2DBCB]">
                  Verified Cloud Account
                </span>
              )}
            </div>
            <p className="text-xs text-[#6F7D7B] dark:text-[#9AA5A3] mt-0.5">
              {user.isGuest ? (isRtl ? 'لا يوجد بريد مرتبط (تخزين محلي)' : 'Local offline storage on this device') : user.email}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[#5F6E6C] dark:text-[#A6B2AF]">
              <span className="flex items-center gap-1 font-semibold text-[#D96E54]">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {user.currentStreak} {isRtl ? 'يوم متواصل' : 'Day Streak'}
              </span>
              <span>•</span>
              <span className="font-semibold text-[#1A4D4E] dark:text-[#72D6A5]">
                {user.totalMemorizedAyahs} {isRtl ? 'آية محفوظة' : 'Ayahs Mastered'}
              </span>
            </div>
          </div>
        </div>

        {/* Guest Link CTA */}
        {user.isGuest && (
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl bg-[#1A4D4E] hover:bg-[#153e3f] dark:bg-[#C5A059] dark:hover:bg-[#b38f48] text-white dark:text-[#0E1A1A] font-bold text-xs shadow-sm transition-opacity whitespace-nowrap cursor-pointer"
          >
            {isRtl ? 'ربط الحساب الآن' : 'Link Google / Apple'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 1: CONNECTED SIGN-IN METHODS */}
        <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'طرق تسجيل الدخول المتصلة' : 'Connected Identity Providers'}
            </h3>
            <span className="text-xs text-[#8E9B98]">Security & OAuth</span>
          </div>

          <div className="space-y-3">
            {/* Google */}
            <div className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#232E2F] flex items-center justify-center border border-[#E8E2D6] dark:border-[#384447]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">Google Account</p>
                  <p className="text-[10px] text-[#8E9B98]">
                    {user.connectedMethods.includes('google') ? 'Connected (zaid.ansari@gmail.com)' : 'Not Connected'}
                  </p>
                </div>
              </div>
              {user.connectedMethods.includes('google') ? (
                <span className="text-xs font-semibold text-[#1A4D4E] dark:text-[#72D6A5] bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Linked</span>
                </span>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] hover:underline cursor-pointer"
                >
                  {isRtl ? 'ربط' : 'Connect'}
                </button>
              )}
            </div>

            {/* Apple */}
            <div className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14-5.38-8.28-9.74-17.65-13.08-28.12-3.34-10.47-5.01-20.66-5.01-30.56 0-13.33 3.34-24.49 10.02-33.48 6.68-8.99 15.11-13.56 25.29-13.72 4.35 0 9.29 1.13 14.81 3.39 5.52 2.26 9.38 3.42 11.58 3.48 1.95 0 5.92-1.25 11.91-3.75 5.99-2.5 11.13-3.64 15.42-3.42 11.57.57 20.89 4.67 27.95 12.31-10.19 6.23-15.18 14.73-14.98 25.5.21 8.35 3.48 15.47 9.81 21.36 6.33 5.89 13.91 9.29 22.74 10.2-2.17 6.46-4.94 13.06-8.31 19.8zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.95-10.37 19.95-11.94.32 1.3.49 2.47.49 3.5 0 7.39-2.73 14.28-8.19 20.67-5.46 6.39-12.22 10.37-20.2 11.94z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">Sign in with Apple</p>
                  <p className="text-[10px] text-[#8E9B98]">
                    {user.connectedMethods.includes('apple') ? 'Connected (Private Relay ID)' : 'Not Connected'}
                  </p>
                </div>
              </div>
              {user.connectedMethods.includes('apple') ? (
                <span className="text-xs font-semibold text-[#1A4D4E] dark:text-[#72D6A5] bg-[#EAF2ED] dark:bg-[#142A20] border border-[#C2DBCB] px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Linked</span>
                </span>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-[#1A4D4E] dark:text-[#C5A059] hover:underline cursor-pointer"
                >
                  {isRtl ? 'ربط' : 'Connect'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: CLOUD SYNC STATUS */}
        <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'حالة المزامنة السحابية' : 'Cloud Hifz Synchronization'}
            </h3>
            <span className="text-xs text-[#1A4D4E] dark:text-[#72D6A5] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1A4D4E] dark:bg-[#72D6A5]" />
              <span>Real-Time</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#5F6E6C] dark:text-[#A6B2AF]">
              <span>{isRtl ? 'آخر مزامنة ناجحة:' : 'Last Cloud Backup:'}</span>
              <span className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">{user.lastSyncedAt}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#5F6E6C] dark:text-[#A6B2AF]">
              <span>{isRtl ? 'الأجهزة المتصلة:' : 'Connected Devices:'}</span>
              <span className="font-bold text-[#1A4D4E] dark:text-[#E8ECE9]">2 devices (Mobile & Tablet)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#5F6E6C] dark:text-[#A6B2AF]">
              <span>{isRtl ? 'تشفير البيانات:' : 'Data Encryption:'}</span>
              <span className="font-bold text-[#1A4D4E] dark:text-[#72D6A5]">AES-256 Cloud Vault</span>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full mt-2 py-2.5 rounded-xl border border-[#C5A059]/40 text-xs font-semibold text-[#1A4D4E] dark:text-[#C5A059] hover:bg-[#E8E2D6]/40 dark:hover:bg-[#232E2F] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isRtl ? 'جاري المزامنة...' : 'Syncing Data...') : (isRtl ? 'مزامنة السور والآيات الآن' : 'Sync Now')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DATA EXPORT & PRIVACY CONTROLS */}
      <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#122021] border border-[#E8E2D6] dark:border-[#232E2F] shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[#1A4D4E] dark:text-[#E8ECE9]">
          {isRtl ? 'تصدير البيانات والخصوصية' : 'Data Portability & Account Safeguards'}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F5F2ED] dark:bg-[#172526] border border-[#E8E2D6] dark:border-[#232E2F]">
          <div>
            <h4 className="font-bold text-xs text-[#1A4D4E] dark:text-[#E8ECE9]">
              {isRtl ? 'تصدير بيانات الحفظ (JSON)' : 'Export My Recitation & Hifz Archive'}
            </h4>
            <p className="text-[11px] text-[#8E9B98] mt-0.5">
              {isRtl
                ? 'قم بتنزيل نسخة كاملة من سجل حفظك، إحصاءات الآيات، وسجل أخطاء التجويد كملف قياسي.'
                : 'Download a clean, structured JSON file containing all your mastered ayahs, streak dates, and tajweed review cards.'}
            </p>
          </div>

          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-[#FDFBF7] dark:bg-[#232E2F] hover:bg-[#E8E2D6] dark:hover:bg-[#2B3839] border border-[#E8E2D6] dark:border-[#384447] text-[#1A4D4E] dark:text-[#C5A059] font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{exportSuccess ? (isRtl ? 'تم التنزيل بنجاح!' : 'Exported!') : (isRtl ? 'تصدير البيانات' : 'Export JSON')}</span>
          </button>
        </div>

        {/* Delete Account Button */}
        <div className="pt-2 flex justify-between items-center text-xs text-[#6F7D7B]">
          <span>{isRtl ? 'حذف الحساب والبيانات السحابية نهائياً' : 'Permanent Account Removal'}</span>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-[#D96E54] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isRtl ? 'حذف الحساب' : 'Delete Account'}</span>
          </button>
        </div>
      </div>

      {/* ACCOUNT DELETION TWO-STEP CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#1A2022] border border-[#D96E54]/30 rounded-3xl p-6 shadow-2xl space-y-4 text-[#1E2526] dark:text-[#E8ECE9]">
            <div className="w-12 h-12 rounded-2xl bg-[#D96E54]/15 text-[#D96E54] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-[#D96E54]">
                {isRtl ? 'تأكيد حذف الحساب نهائياً' : 'Are you sure you want to delete your account?'}
              </h3>
              <p className="text-xs text-[#6B7876] dark:text-[#9AA5A3] mt-1.5 leading-relaxed">
                {isRtl
                  ? 'هذا الإجراء لا يمكن التراجع عنه. سيتم مسح جميع الآيات المحفوظة وسلسلة الأيام والملفات الصوتية المخزنة.'
                  : 'This action cannot be undone. All your memorized verses, streak statistics, and cloud backups will be permanently purged.'}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B7876] dark:text-[#9AA5A3] mb-1">
                Type <span className="font-bold text-[#D96E54]">delete</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder="delete"
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#232B2D] border border-[#EAE3D6] dark:border-[#2A3437] text-sm text-center font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl border border-[#EAE3D6] dark:border-[#2A3437] text-xs font-semibold text-[#6B7876] hover:bg-[#EAE3D6]/50"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText.trim().toLowerCase() !== 'delete'}
                className="py-2.5 rounded-xl bg-[#D96E54] hover:bg-[#C85D43] disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isRtl ? 'حذف نهائي' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

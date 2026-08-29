import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, LogOut, KeyRound, X, AlertCircle, CheckCircle2, History } from 'lucide-react';

interface AdminTopBarProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefreshNow: () => void;
  onLogout: () => void;
  isChangingPassword: boolean;
  changePasswordError: string | null;
  changePasswordSuccess: boolean;
  onClearChangePasswordState: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onOpenHistory: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  autoRefresh,
  onToggleAutoRefresh,
  onRefreshNow,
  onLogout,
  isChangingPassword,
  changePasswordError,
  changePasswordSuccess,
  onClearChangePasswordState,
  onChangePassword,
  onOpenHistory
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const openModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLocalError(null);
    onClearChangePasswordState();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    onClearChangePasswordState();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword.length < 8) {
      setLocalError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('New password and confirmation do not match');
      return;
    }

    const ok = await onChangePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-ink-200 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-brand-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">Admin Control Center</h2>
            <p className="text-xs text-ink-500 font-medium">Main Kitchen Counter Queue & Inventory</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onToggleAutoRefresh}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
              autoRefresh ? 'bg-ok-50 border-ok-200 text-ok-700' : 'bg-ink-100 text-ink-500'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Live Auto-Sync ON' : 'Auto-Sync Paused'}</span>
          </button>

          <button
            onClick={onRefreshNow}
            className="px-3 py-1.5 bg-white border border-ink-200 text-ink-700 rounded-xl text-xs font-bold hover:bg-ink-50"
          >
            Refresh Now
          </button>

          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 bg-white border border-ink-200 text-ink-700 rounded-xl text-xs font-bold hover:bg-ink-50 flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Order History</span>
          </button>

          <button
            onClick={openModal}
            className="px-3 py-1.5 bg-white border border-ink-200 text-ink-700 rounded-xl text-xs font-bold hover:bg-ink-50 flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-err-50 border border-err-200 text-err-700 rounded-xl text-xs font-bold hover:bg-err-100 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4" onClick={closeModal}>
          <div
            className="bg-white rounded-3xl shadow-xl border border-ink-200 p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-600" /> Change Admin Password
              </h3>
              <button onClick={closeModal} className="text-ink-400 hover:text-ink-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {changePasswordSuccess ? (
              <div className="p-3 bg-ok-50 border border-ok-200 rounded-xl text-ok-700 text-xs flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password updated. Use it next time you log in.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {(localError || changePasswordError) && (
                  <div className="p-3 bg-err-50 border border-err-200 rounded-xl text-err-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{localError || changePasswordError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">Current password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">New password (min 8 characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-brand-sm flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

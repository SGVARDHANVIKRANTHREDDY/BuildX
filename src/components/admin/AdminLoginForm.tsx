import React from 'react';
import { ShieldCheck, Lock, RefreshCw, AlertCircle } from 'lucide-react';

interface AdminLoginFormProps {
  username: string;
  password: string;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  loginError: string | null;
  isLoggingIn: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  loginError,
  isLoggingIn,
  onSubmit
}) => {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-ink-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-brand-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-ink-900">Canteen Staff Portal</h2>
          <p className="text-xs text-ink-500 mt-1">
            Authenticate to manage live order queues and item availability
          </p>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-err-50 border border-err-200 rounded-xl text-err-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-ink-700 block mb-1">Username</label>
            <input
              id="admin-username-input"
              type="text"
              value={username}
              onChange={e => onUsernameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink-700 block mb-1">Password</label>
            <input
              id="admin-password-input"
              type="password"
              value={password}
              onChange={e => onPasswordChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="p-3 bg-ink-50 border border-ink-200 rounded-xl text-[11px] text-ink-500">
            <span className="font-bold text-ink-700">Demo Credentials:</span>
            <div className="font-mono mt-0.5">admin / admin123</div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-brand-sm flex items-center justify-center gap-2 transition-all"
          >
            {isLoggingIn ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Access Admin Dashboard</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

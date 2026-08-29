import { useState, useEffect } from 'react';
import type React from 'react';
import { registerServiceWorkerAndSubscribe } from './usePushSubscription';

export function useAdminAuth(onLoginStatusChange: (isLoggedIn: boolean) => void) {

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/session', { credentials: 'include' })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        const loggedIn = ok && data.success;
        setIsAuthenticated(loggedIn);
        onLoginStatusChange(loggedIn);
        if (loggedIn && data.user?.username) {
          registerServiceWorkerAndSubscribe(data.user.username, 'admin').catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAuthenticated(false);
          onLoginStatusChange(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };

  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      setIsAuthenticated(true);
      onLoginStatusChange(true);

      registerServiceWorkerAndSubscribe(data.user?.username || username, 'admin').catch(() => {});
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {

    }
    setIsAuthenticated(false);
    onLoginStatusChange(false);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsChangingPassword(true);
    setChangePasswordError(null);
    setChangePasswordSuccess(false);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }
      setChangePasswordSuccess(true);
      return true;
    } catch (err: any) {
      setChangePasswordError(err.message || 'Failed to change password');
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    isAuthenticated,
    isCheckingSession,
    username,
    setUsername,
    password,
    setPassword,
    loginError,
    isLoggingIn,
    handleLogin,
    handleLogout,
    isChangingPassword,
    changePasswordError,
    changePasswordSuccess,
    setChangePasswordError,
    setChangePasswordSuccess,
    handleChangePassword
  };
}

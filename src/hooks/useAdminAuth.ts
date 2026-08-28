import { useState, useEffect } from 'react';
import type React from 'react';

export function useAdminAuth(onLoginStatusChange: (isLoggedIn: boolean) => void) {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('canteen_admin_jwt'));
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    onLoginStatusChange(!!authToken);
  }, [authToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('canteen_admin_jwt', data.token);
      setAuthToken(data.token);
      onLoginStatusChange(true);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('canteen_admin_jwt');
    setAuthToken(null);
    onLoginStatusChange(false);
  };

  return {
    authToken,
    username,
    setUsername,
    password,
    setPassword,
    loginError,
    isLoggingIn,
    handleLogin,
    handleLogout
  };
}

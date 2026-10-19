import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContextValue';
import { clearToken, getToken, setToken } from '../services/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const saveSession = useCallback((newToken, newUser) => {
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setTokenState(null);
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      setUser,
      setLoading,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'Admin',
      saveSession,
      clearSession,
    }),
    [user, token, loading, saveSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

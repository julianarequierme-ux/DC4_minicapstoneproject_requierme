import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContextValue';
import api, { clearToken, getToken, setToken } from '../services/api';
import { parseApiError } from '../services/errors';

const extractAuth = (response) => {
  const data = response.data?.data ?? response.data;
  return {
    token: data?.token ?? data?.access_token ?? null,
    user: data?.user ?? null,
  };
};

const extractUser = (response) =>
  response.data?.data ?? response.data?.user ?? response.data;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const clearSession = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setAuthError('');
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setTokenState(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/user');
        if (active) {
          setUser(extractUser(response));
        }
      } catch (error) {
        if (active) {
          if (error?.response?.status === 401) {
            clearSession();
          } else {
            setAuthError(parseApiError(error).message);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const response = await api.post('/login', credentials);
    const { token: newToken, user: newUser } = extractAuth(response);
    if (!newToken) {
      throw new Error('The API did not return a token.');
    }

    setToken(newToken);
    setTokenState(newToken);
    setAuthError('');

    let currentUser = newUser;
    if (!currentUser) {
      try {
        const userResponse = await api.get('/user');
        currentUser = extractUser(userResponse);
      } catch (error) {
        clearSession();
        throw error;
      }
    }

    setUser(currentUser);
    setLoading(false);
    return currentUser;
  }, [clearSession]);

  const register = useCallback(async (payload) => {
    const response = await api.post('/register', payload);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      if (error?.response?.status !== 401) {
        throw error;
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authError,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role?.toLowerCase() === 'admin',
      login,
      register,
      logout,
    }),
    [user, token, loading, authError, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

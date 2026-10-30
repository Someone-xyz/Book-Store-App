import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the cookie on first load.
  useEffect(() => {
    api.get('/users/me').then((r) => setUser(r.data.userData)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data } = await api.post('/users/signin', { email, password });
    setUser(data.userData);
  }, []);

  const signUp = useCallback(async (formData) => {
    const { data } = await api.post('/users/signup', formData);
    setUser(data.userData);
  }, []);

  const signOut = useCallback(async () => {
    await api.post('/users/signout').catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

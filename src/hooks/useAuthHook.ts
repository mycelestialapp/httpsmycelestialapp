import { useContext } from 'react';
import { AuthContext } from './authContext';
import type { AuthContextType } from './authContext';

const defaultCtx: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: new Error('AuthProvider not mounted') }),
  signIn: async () => ({ error: new Error('AuthProvider not mounted') }),
  signOut: async () => {},
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  return ctx ?? defaultCtx;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  position: string;
  signature: string;
  avatar: string;
  phone: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
}

interface UserContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const DEFAULT_USER: UserProfile = {
  id: 'default',
  name: '一宸',
  position: '资深销售顾问',
  signature: '以诚待人，以礼从商。传递华夏智慧，服务雅士人生。',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
  phone: '13800000000',
  email: 'yichen@example.com',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const token = api.getStoredToken();
    if (token) {
      setAuthState({ isAuthenticated: true, user: DEFAULT_USER, loading: false });
    }

    const bootstrap = async () => {
      try {
        if (!token) {
          setAuthState({ isAuthenticated: false, user: null, loading: false });
          return;
        }

        const res = await api.getMe();
        setAuthState({
          isAuthenticated: true,
          user: res.user,
          loading: false,
        });
      } catch (error) {
        console.error('Bootstrap error:', error);
        api.clearStoredToken();
        setAuthState({ isAuthenticated: false, user: null, loading: false });
      }
    };

    bootstrap();
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const res = await api.login({ phone, password });
      api.setStoredToken(res.token);
      setAuthState({
        isAuthenticated: true,
        user: res.user,
        loading: false,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || '登录失败' };
    }
  };

  const register = async (phone: string, password: string, name: string) => {
    try {
      const res = await api.register({ phone, password, name });
      api.setStoredToken(res.token);
      setAuthState({
        isAuthenticated: true,
        user: res.user,
        loading: false,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || '注册失败' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    api.clearStoredToken();
    setAuthState({ isAuthenticated: false, user: null, loading: false });
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!authState.user) return;
    const previous = authState.user;
    const optimistic = { ...previous, ...updates };

    setAuthState(prev => ({
      ...prev,
      user: optimistic,
    }));

    try {
      const res = await api.updateMe(updates);
      setAuthState(prev => ({
        ...prev,
        user: res.user,
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        user: previous,
      }));
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{
      user: authState.user || DEFAULT_USER,
      isAuthenticated: authState.isAuthenticated,
      loading: authState.loading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

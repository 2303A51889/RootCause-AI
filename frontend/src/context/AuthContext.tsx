import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  sendRegistrationOtp: (name: string, email: string, password: string) => Promise<boolean>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount: validate the stored token via /auth/me
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        if (res.data && res.data.success && res.data.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
          localStorage.setItem('rootcause_user', JSON.stringify(res.data.user));
        } else {
          // token invalid — clear it
          removeStoredToken();
          localStorage.removeItem('rootcause_user');
        }
      })
      .catch(() => {
        removeStoredToken();
        localStorage.removeItem('rootcause_user');
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Persist user profile locally for quick reads
  useEffect(() => {
    if (user) {
      localStorage.setItem('rootcause_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rootcause_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success && res.data.user) {
        // Store the JWT token so Bearer header is sent on all future requests
        if (res.data.token) {
          setStoredToken(res.data.token);
        }
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid email or password';
      throw new Error(message);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    return sendRegistrationOtp(name, email, password);
  };

  const sendRegistrationOtp = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data && res.data.success) {
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  };

  const verifyRegistrationOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register/verify', { email, otp });
      if (res.data && res.data.success && res.data.user) {
        if (res.data.token) {
          setStoredToken(res.data.token);
        }
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'OTP verification failed.';
      throw new Error(message);
    }
  };

  const logout = async () => {
    removeStoredToken();
    localStorage.removeItem('rootcause_user');
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore errors during logout
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    try {
      const res = await api.put('/user/profile', data);
      setUser(res.data.user);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update profile';
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

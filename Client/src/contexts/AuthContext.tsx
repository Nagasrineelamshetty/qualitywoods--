import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../api/axios';

// Helper to clear all auth-related data
export const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
};

type UserType = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserType | null>; 
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Normalize user data
  const normalizeUser = (userData: any): UserType => ({
    _id: userData._id || userData.id,
    name: userData.name,
    email: userData.email,
    isAdmin: userData.isAdmin,
  });

  // Auto-login / restore session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const storedUser = rememberMe 
          ? localStorage.getItem('user') 
          : sessionStorage.getItem('user');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
if (!refreshToken) throw new Error('No refresh token found');

const res = await axios.post('/api/auth/refresh-token',{ refreshToken },{ withCredentials: true });

          const newToken = res.data.accessToken;
          if (newToken) {
            if (rememberMe) localStorage.setItem('accessToken', newToken);
            // const userRes = await axios.get('/api/users/me');
            const token =
              localStorage.getItem("accessToken") ||
              sessionStorage.getItem("accessToken");

            if (!token) throw new Error("No access token");

            const userRes = await axios.get("/api/users/me", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            setUser(userRes.data);
          }
        }
      } catch(err: any) {
        console.error('Refresh Error:', err?.response?.data || err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Signup
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post('/api/users/signup', { name, email, password });
      const { accessToken, user } = res.data;
      if (!accessToken || !user) throw new Error('Invalid signup response');

      const normalized = normalizeUser(user);
      localStorage.setItem('user', JSON.stringify(normalized));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('rememberMe', 'true');
      setUser(normalized);
      return true;
    } catch (err: any) {
      console.error('Signup Error:', err?.response?.data?.message || err.message);
      return false;
    }
  };

  // Login
  const login = async (email: string, password: string, rememberMe = false): Promise<UserType|null> => {
    try {
      const res = await axios.post('/api/auth/login', { email, password, rememberMe }, { withCredentials: true });
      const { accessToken, refreshToken, user } = res.data;
      if (!accessToken || !user) throw new Error('Invalid login response');

      const normalized = normalizeUser(user);

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(normalized));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        sessionStorage.setItem('user', JSON.stringify(normalized));
        sessionStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('rememberMe', 'false');
      }

      setUser(normalized);
      return normalized;
    } catch (err: any) {
      console.error('Login Error:', err?.response?.data?.message || err.message);
      return null;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
      // ignore
    }
    setUser(null);
    clearAuthData();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

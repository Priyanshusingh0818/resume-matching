import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiLogin as apiLoginFn } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  userType: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, isAuthenticated: false, login: async () => ({}), logout: () => {}, loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!stored || !token) {
        setLoading(false);
        return;
      }

      try {
        // Validate the token against the server
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const userObj: User = {
              id: json.data.id,
              name: json.data.name,
              email: json.data.email,
              role: json.data.role,
              userType: json.data.role,
            };
            localStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
          } else {
            localStorage.clear();
          }
        } else {
          // Token expired or invalid
          localStorage.clear();
        }
      } catch {
        // Server unreachable — trust local data for offline dev
        try { setUser(JSON.parse(stored)); } catch { localStorage.clear(); }
      }
      setLoading(false);
    };
    validateSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await apiLoginFn(email, password);
      const { token, user: userData } = res.data;

      const userObj: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        userType: userData.role,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);

      return {};
    } catch (err: any) {
      return { error: err.message || 'Login failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

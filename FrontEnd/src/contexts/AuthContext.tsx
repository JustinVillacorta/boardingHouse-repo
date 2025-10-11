import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/apiService';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'tenant';
  isActive: boolean;
  lastLogin?: string;
  tenant?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roomNumber?: string;
    tenantStatus: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          
          // Validate token by fetching current profile
          await validateToken();
        } catch (error) {
          console.error('Error initializing auth:', error);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Auto refresh token every 30 minutes
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        refreshToken().catch(console.error);
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(interval);
    }
  }, [token]);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const validateToken = async () => {
    try {
      const response = await apiService.request('/auth/validate-token');
      if (response.success && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      clearAuth();
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        
        setToken(newToken);
        setUser(userData);
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await apiService.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (response.success && response.data) {
        const updatedUser = response.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await apiService.request('/auth/refresh-token', {
        method: 'POST',
      });

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        
        setToken(newToken);
        setUser(userData);
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    updateProfile,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
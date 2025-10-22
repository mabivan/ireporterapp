import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../utils/types';
import { mockUsers } from '../utils/data';

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

  useEffect(() => {
    const savedUser = localStorage.getItem('ireporter_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const userData = { ...foundUser };
      setUser(userData);
      localStorage.setItem('ireporter_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const signup = async (userData: Omit<User, 'id' | 'registered' | 'isAdmin'>): Promise<boolean> => {
    const newUser: User = {
      ...userData,
      id: Math.max(...mockUsers.map(u => u.id)) + 1,
      registered: new Date(),
      isAdmin: false
    };
    
    if (mockUsers.find(u => u.email === userData.email)) {
      return false;
    }

    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('ireporter_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ireporter_user');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
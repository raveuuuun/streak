import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types/user';
import * as authService from '@/lib/supabase/auth';
import { storage } from '@/lib/storage';
import { config } from '@/constants/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    // Removed Supabase auth state listener since we're using mock auth
  }, []);

  const loadUser = async () => {
    try {
      // Try to load from storage first
      const storedUser = await storage.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      
      // Then check Supabase session
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await storage.setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      // Create user from mock result
      const mockUser: User = {
        id: result.user.id,
        email: result.user.email || email,
        createdAt: result.user.created_at,
        updatedAt: result.user.updated_at || result.user.created_at,
      };
      setUser(mockUser);
      await storage.setUser(mockUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password);
      // Create user from mock result
      const mockUser: User = {
        id: result.user.id,
        email: result.user.email || email,
        createdAt: result.user.created_at,
        updatedAt: result.user.updated_at || result.user.created_at,
      };
      setUser(mockUser);
      await storage.setUser(mockUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      await storage.remove(config.storage.keys.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


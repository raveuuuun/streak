import type { User } from '@/types/user';
import { storage } from '@/lib/storage';
import { config } from '@/constants/config';

export const signUp = async (email: string, password: string) => {
  // Bypass authentication - accept any credentials
  // Create a mock user object
  const mockUser = {
    id: `user_${Date.now()}`,
    email: email || 'demo@streakflow.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    user: mockUser,
    session: {
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: mockUser,
    },
  };
};

export const signIn = async (email: string, password: string) => {
  // Bypass authentication - accept any credentials
  // Create a mock user object
  const mockUser = {
    id: `user_${Date.now()}`,
    email: email || 'demo@streakflow.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    user: mockUser,
    session: {
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: mockUser,
    },
  };
};

export const signOut = async () => {
  // Bypass Supabase signout - just clear local storage
  try {
    await storage.remove(config.storage.keys.user);
  } catch (error) {
    // Ignore errors
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  // Try to get from storage first (for mock users)
  try {
    const storedUser = await storage.getUser<User>();
    if (storedUser) {
      return storedUser;
    }
  } catch (error) {
    // Ignore storage errors
  }

  // If no stored user, return null (user needs to login)
  return null;
};

export const getSession = async () => {
  // Return null for mock auth (no real session needed)
  return null;
};


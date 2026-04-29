import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { setAuthToken } from '../services/api';

interface User {
  fullName: string;
  email: string;
  isPro: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPro: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (fullName: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isPro: false,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

let memoryStore: Record<string, string> = {};

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryStore[key] || null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    memoryStore[key] = value;
  }
}

async function safeRemoveItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    delete memoryStore[key];
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadUser();
    return () => { mounted.current = false; };
  }, []);

  const loadUser = async () => {
    try {
      const token = await safeGetItem('access_token');
      if (token && mounted.current) {
        setAuthToken(token);
        const userData = await safeGetItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
        // Refresh profile to get latest isPro status
        try {
          const profile = await authService.getProfile();
          const updatedUser = {
            fullName: profile.first_name || profile.username,
            email: profile.email,
            isPro: profile.is_pro || false,
          };
          await safeSetItem('user', JSON.stringify(updatedUser));
          if (mounted.current) setUser(updatedUser);
        } catch {
          // token might be expired, keep existing user data
        }
      }
    } catch (error) {
      console.warn('Error loading user:', error);
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      const updatedUser = {
        fullName: profile.first_name || profile.username,
        email: profile.email,
        isPro: profile.is_pro || false,
      };
      await safeSetItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.warn('Error refreshing profile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ username: email, password: password });
      if (response && response.access) {
        await safeSetItem('access_token', response.access);
        const profile = await authService.getProfile();
        const newUser: User = {
          fullName: profile.first_name || profile.username,
          email: profile.email || email,
          isPro: profile.is_pro || false,
        };
        await safeSetItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error: any) {
      console.warn('Sign in error:', error);
      Alert.alert('Sign In Failed', error?.message || 'An error occurred during sign in.');
      return false;
    }
  };

  const signUp = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      await authService.register({ username: email, email, password, first_name: fullName });
      return await signIn(email, password);
    } catch (error: any) {
      console.warn('Sign up error:', error);
      Alert.alert('Sign Up Failed', error?.message || 'An error occurred during registration. The username might be taken.');
      return false;
    }
  };

  const signOut = async () => {
    try {
      await safeRemoveItem('access_token');
      await safeRemoveItem('user');
      authService.logout();
      setUser(null);
    } catch (error) {
      console.warn('Sign out error:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isPro: user?.isPro || false,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

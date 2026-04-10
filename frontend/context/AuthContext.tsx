import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (fullName: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// In-memory fallback when AsyncStorage native module is not available
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
      const userData = await safeGetItem('user');
      if (userData && mounted.current) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.warn('Error loading user:', error);
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  const signIn = async (email: string, _password: string): Promise<boolean> => {
    try {
      const storedUser = await safeGetItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email === email) {
          setUser(parsed);
          return true;
        }
      }
      // For demo, allow any login
      const newUser = { fullName: 'User', email };
      await safeSetItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.warn('Sign in error:', error);
      return false;
    }
  };

  const signUp = async (fullName: string, email: string, _password: string): Promise<boolean> => {
    try {
      const newUser = { fullName, email };
      await safeSetItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.warn('Sign up error:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await safeRemoveItem('user');
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
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getUserProfile } from '@/lib/supabase/authHelpers';

// Create Auth Context
const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Wrap your app with this in layout.jsx
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // Get user profile from database
          const userProfile = await getUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          setUser(session.user);
          try {
            const userProfile = await getUserProfile(session.user.id);
            setProfile(userProfile);
          } catch (error) {
            console.error('Profile fetch error:', error);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    refreshProfile: async () => {
      if (user) {
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
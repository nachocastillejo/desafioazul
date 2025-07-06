import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signInWithGoogle: () => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, create one
        console.log('No profile found, creating new profile for user:', userId);
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              full_name: userData.user.email?.split('@')[0] || 'Usuario',
              subscription_status: 'free',
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }

          setProfile(newProfile);
          return;
        }
      }
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data && !error) {
        setProfile(data); // Solo actualizamos el perfil, no el usuario.
      } else {
        console.error('Error refreshing profile:', error?.message);
      }
    }
  }, [user]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error, data: null };
      }

      if (data.user && !data.session) {
        // Email confirmation required
        return { data, error: null };
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            subscription_status: 'free',
          });

        if (profileError) {
          console.error('Error creating profile during signup:', profileError);
          // Don't return error, profile will be created on next login
        }
      }

      return { data, error: null };
    } catch (error) {
      return { error, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error, data: null };
      }

      // Ensure profile exists and update last_login
      if (data.user) {
        // First try to update, if it fails then the profile doesn't exist
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);

        if (updateError && updateError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              full_name: data.user.email?.split('@')[0] || 'Usuario',
              subscription_status: 'free',
              last_login: new Date().toISOString(),
            });
        }
      }

      return { data, error: null };
    } catch (error) {
      return { error, data: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // O la URL a la que quieras redirigir tras el login
        },
      });

      if (error) {
        return { error, data: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: any) => {
    try {
      const { data: updatedData, error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', user?.id)
        .select()
        .single();

      if (error) {
        return { error, data: null };
      }

      setProfile(updatedData);
      return { data: updatedData, error: null };
    } catch (error) {
      return { error, data: null };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
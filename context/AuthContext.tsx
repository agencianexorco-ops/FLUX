
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Profile, AppMode } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authError: Error | null;
  signOut: () => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// FIX: Explicitly typed AuthProvider as a React.FC to resolve a type inference issue.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    const getInitialSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Erro ao obter sessão:", error);
            setAuthError(error);
        } else {
            setSession(session);
            setUser(session?.user ?? null);
        }
        setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Não é necessário definir carregamento aqui, pois o estado inicial já foi tratado.
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
        setProfile(null);
        return;
    }

    const fetchOrCreateProfile = async () => {
        let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (error && error.code === 'PGRST116') { // "PGRST116" = 0 rows found
          console.log('Nenhum perfil encontrado, criando um para o novo usuário.');
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              user_name: user.user_metadata?.user_name || user.email,
              mode: AppMode.INDIVIDUAL,
              theme: 'dark',
              has_access: true, // Novos usuários têm acesso por padrão
              plan: 'pro'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Erro ao criar perfil para novo usuário:', insertError);
            setAuthError(insertError);
          } else {
            setProfile(newProfile);
          }
        } else if (error) {
          console.error('Erro ao buscar perfil:', error);
          setAuthError(error);
        } else {
          setProfile(data);
        }
    };

    fetchOrCreateProfile();
  }, [user]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Erro ao sair:', error);
    }
    // O onAuthStateChange cuidará de limpar os estados.
  };
  
  const updateProfile = async (newProfileData: Profile) => {
    if (!user) return;
    const { id, ...profileUpdates } = newProfileData;
    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
    } else if (data) {
      setProfile(data);
    }
  };

  const value = { session, user, profile, loading, authError, signOut, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { Profile, AppMode } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authError: string | null; // Novo estado de erro
  signOut: () => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        // SOLUÇÃO: Adicionado try-catch para lidar com falhas de conexão com o Supabase.
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Verifica se a resposta é válida, mas a URL é o placeholder
        if (session === null && supabase.auth['supabaseUrl'].includes('SUA_URL_DO_PROJETO_AQUI')) {
            throw new Error("As credenciais do Supabase não foram configuradas. Por favor, atualize o arquivo 'supabase/client.ts'.");
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (e: any) {
        console.error("Erro ao conectar com o Supabase:", e.message);
        setAuthError(e.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Limpa o erro ao obter um estado de autenticação válido
      setAuthError(null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getProfile = async () => {
        if (user) {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(data);
                } else if (error && error.code === 'PGRST116') {
                    // Profile does not exist, which can happen with DB trigger race conditions.
                    // SOLUTION: Create a "self-healing" mechanism. If the profile is missing, create it now.
                    console.warn("Perfil não encontrado, criando um novo perfil para o usuário.");
                    const newUserProfile: Omit<Profile, 'id'> = {
                        user_name: user.user_metadata.user_name || user.email,
                        partner_name: '',
                        mode: AppMode.INDIVIDUAL,
                        theme: 'dark',
                        has_access: true, // Assuming new users get access by default.
                        plan: 'free',
                    };
                    
                    const { data: createdProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({ ...newUserProfile, id: user.id })
                        .select()
                        .single();
                    
                    if (createError) {
                         throw new Error(`Falha ao criar o perfil do usuário: ${createError.message}`);
                    }
                    
                    setProfile(createdProfile);

                } else if (error) {
                    // A different error occurred
                    throw error;
                }

            } catch (error) {
                console.error("Erro ao buscar ou criar perfil:", error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        }
    }
    // Só busca o perfil se não houver erro de autenticação
    if (!authError) {
        getProfile();
    }
  }, [user, authError]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };
  
  const updateProfile = async (newProfile: Profile) => {
      if (!user) return;
      setLoading(true);
      const { id, ...profileData } = newProfile;
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
        
      if(error) {
          console.error("Error updating profile", error);
      } else if (data) {
          setProfile(data);
      }
      setLoading(false);
  }

  const value = {
    session,
    user,
    profile,
    loading,
    authError,
    signOut,
    updateProfile,
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
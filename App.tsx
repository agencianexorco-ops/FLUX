import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import MainApp from './MainApp';
import Auth from './pages/Auth';
import AccessDenied from './pages/AccessDenied';
import BackendDown from './pages/BackendDown'; // Importa a nova página de erro

// FIX: Explicitly type AppContent as React.FC to resolve typing issue with provider components.
const AppContent: React.FC = () => {
    const { session, profile, loading, authError } = useAuth(); // Adiciona authError

    // SOLUÇÃO: Adicionada verificação de erro de autenticação/conexão.
    // Se houver um erro ao conectar ao Supabase, exibe a página de erro.
    if (authError) {
        return <BackendDown />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-dark-primary">
                <div className="text-xl font-semibold text-gray-900 dark:text-white">Carregando...</div>
            </div>
        );
    }

    if (!session) {
        return <Auth />;
    }

    // FIX: Changed condition from `!profile?.has_access` to `profile && !profile.has_access`.
    // This prevents the AccessDenied page from showing incorrectly if the profile fails to load (profile is null).
    // It now correctly checks for access only if a profile object actually exists.
    if (profile && !profile.has_access) {
        return <AccessDenied />;
    }

    // Render MainApp only if session and profile are loaded and access is granted.
    // If profile is null after loading, this will render an empty fragment, preventing crashes.
    if (session && profile) {
      return (
          // FIX: Explicitly pass children prop to resolve typing issue.
          <AppProvider children={<MainApp />} />
      );
    }

    // Fallback for the brief moment where session exists but profile is still null after loading.
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-dark-primary">
            <div className="text-xl font-semibold text-gray-900 dark:text-white">Carregando perfil do usuário...</div>
        </div>
    );
};


// FIX: Explicitly type App as React.FC to resolve typing issue with provider components.
const App: React.FC = () => {
  return (
    // FIX: Explicitly pass children prop to resolve typing issue.
    <AuthProvider children={<AppContent />} />
  );
};

export default App;


import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import MainApp from './MainApp';
import Auth from './pages/Auth';
import AccessDenied from './pages/AccessDenied';
import BackendDown from './pages/BackendDown';
import Icon from './components/ui/Icon';

// FIX: Explicitly type as React.FC to prevent potential type inference issues.
const LoadingScreen: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-dark-primary text-center p-4">
        <h1 className="text-4xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-tech-blue to-finance-green">
            Flux
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">Controle suas finanças com clareza.</p>
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-tech-blue"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-4">Carregando...</p>
    </div>
);

// FIX: Explicitly typing the component with React.FC resolves a type inference issue where the children of AppProvider were not being recognized.
const AppContent: React.FC = () => {
  const { session, user, profile, loading, authError } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (authError) {
    return <BackendDown />;
  }
  
  if (!session || !user) {
    return <Auth />;
  }
  
  if (profile && !profile.has_access) {
    return <AccessDenied />;
  }

  // A sessão existe, mas o perfil ainda não foi carregado.
  if (!profile) {
      return <LoadingScreen />;
  }

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

// FIX: Explicitly typing the component with React.FC resolves a type inference issue where the children of AuthProvider were not being recognized.
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

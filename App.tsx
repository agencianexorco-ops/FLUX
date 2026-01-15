
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Cards from './pages/Cards';
import Goals from './pages/Goals';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'cards':
        return <Cards />;
      case 'goals':
        return <Goals />;
      case 'categories':
        return <Categories />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const pageToRender = renderPage();

  return (
    <AppProvider>
      {/* FIX: The MainLayout component requires a `children` prop. To fix the error, the `pageToRender` component is passed as a child to `MainLayout`. */}
      <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {pageToRender}
      </MainLayout>
    </AppProvider>
  );
};

export default App;

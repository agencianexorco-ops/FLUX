
import React, { useState } from 'react';
import { Page } from '../../types';
import Icon from '../ui/Icon';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems: { id: Page; name: string; icon: string }[] = [
  { id: 'dashboard', name: 'Dashboard', icon: 'home' },
  { id: 'transactions', name: 'Lançamentos', icon: 'switch-horizontal' },
  { id: 'cards', name: 'Cartões', icon: 'credit-card' },
  { id: 'goals', name: 'Metas', icon: 'chart-pie' },
  { id: 'categories', name: 'Categorias', icon: 'tag' },
  { id: 'settings', name: 'Configurações', icon: 'cog' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-dark-secondary border-r border-gray-200 dark:border-r-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-tech-blue to-finance-green">Flux</h1>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full text-gray-500 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-tertiary">
            <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="w-5 h-5"/>
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 group ${currentPage === item.id ? 'bg-tech-blue/20 text-tech-blue shadow-neon-blue' : 'text-gray-500 hover:bg-gray-100 hover:text-tech-blue dark:text-gray-400 dark:hover:bg-dark-tertiary dark:hover:text-white'}`}
            >
              <Icon name={item.icon} className="w-6 h-6" />
              {!isCollapsed && <span className="ml-4 font-semibold">{item.name}</span>}
              {isCollapsed && <span className="absolute left-full ml-4 w-max px-2 py-1 bg-gray-800 text-white dark:bg-dark-tertiary text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity">{item.name}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-gray-700 z-50">
        <nav className="flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center p-2 transition-colors duration-200 ${currentPage === item.id ? 'text-tech-blue' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <Icon name={item.icon} className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

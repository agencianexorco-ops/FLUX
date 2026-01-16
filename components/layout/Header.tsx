
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';
import MonthNavigator from '../ui/MonthNavigator';

const Header: React.FC = () => {
    const { notifications, selectedDate, setSelectedDate, markNotificationAsRead } = useAppContext();
    const { profile, signOut } = useAuth();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
          e.preventDefault();
          setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
      
        return () => {
          window.removeEventListener('beforeinstallprompt', handler);
        };
      }, []);
    
    const handleInstallClick = () => {
        if (!installPrompt) {
          return;
        }
        (installPrompt as any).prompt();
        (installPrompt as any).userChoice.then(() => {
            setInstallPrompt(null);
        });
    };
    
    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIconColor = (type: 'due' | 'overdue' | 'info') => {
        switch (type) {
            case 'overdue': return 'text-red-500';
            case 'due': return 'text-energetic-orange';
            default: return 'text-tech-blue';
        }
    };
    
    const getNotificationIcon = (type: 'due' | 'overdue' | 'info') => {
        switch (type) {
            case 'overdue': return 'bell';
            case 'due': return 'bell';
            default: return 'check';
        }
    };
    
    if (!profile) return null;

    return (
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200/80 dark:bg-dark-secondary/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white md:hidden">Flux</h1>
                </div>

                <div className="hidden md:flex flex-1 justify-center">
                    <MonthNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="relative">
                        <button 
                            onClick={() => setIsNotificationsOpen(prev => !prev)} 
                            className="relative p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-dark-tertiary hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                            aria-label="Notificações"
                        >
                            <Icon name="bell" className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energetic-orange opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-energetic-orange justify-center items-center text-white text-[8px] font-bold">
                                        {unreadCount}
                                    </span>
                                </span>
                            )}
                        </button>
                        {isNotificationsOpen && (
                             <div 
                                className="absolute right-0 mt-2 w-72 sm:w-96 bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20"
                            >
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                className={`flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 cursor-pointer ${n.read ? 'opacity-60' : ''}`}
                                                onClick={() => markNotificationAsRead(n.id)}
                                            >
                                                <Icon name={getNotificationIcon(n.type)} className={`w-5 h-5 mt-1 flex-shrink-0 ${getNotificationIconColor(n.type)}`} />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-800 dark:text-gray-300">{n.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(n.date).toLocaleString('pt-BR')}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center p-6">Nenhuma notificação.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button onClick={() => setIsProfileOpen(p => !p)} className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tech-blue to-finance-green flex items-center justify-center font-bold text-white">
                                {profile.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div className='hidden sm:block'>
                                <p className="font-semibold text-gray-900 dark:text-white">{profile.user_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{profile.mode === 'couple' ? 'Modo Casal' : 'Modo Individual'}</p>
                            </div>
                        </button>
                         {isProfileOpen && (
                             <div 
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-secondary rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20"
                            >
                                <div className="p-2">
                                    {installPrompt && (
                                        <button
                                            onClick={handleInstallClick}
                                            className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-md"
                                        >
                                            <Icon name="arrow-down-tray" className="w-5 h-5 mr-2" />
                                            <span>Instalar App</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={signOut}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-md"
                                    >
                                        Sair
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
             <div className="md:hidden pb-3 px-4">
                <MonthNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </div>
        </header>
    );
};

export default Header;
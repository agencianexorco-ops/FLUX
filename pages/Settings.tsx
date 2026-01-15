
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings as SettingsType, AppMode } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Settings: React.FC = () => {
    const { settings, updateSettings } = useAppContext();
    const [formState, setFormState] = useState<SettingsType>(settings);

    useEffect(() => {
        setFormState(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleModeChange = (mode: AppMode) => {
        setFormState(prev => ({ 
            ...prev, 
            mode,
            partnerName: mode === AppMode.INDIVIDUAL ? '' : prev.partnerName
        }));
    };

    const handleThemeChange = (theme: 'dark' | 'light') => {
        setFormState(prev => ({ ...prev, theme }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formState);
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto pb-16 md:pb-0">
            <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Configurações</h1>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Seu Nome</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={formState.userName}
                            onChange={handleChange}
                            className="w-full mt-1 bg-gray-100 dark:bg-dark-tertiary border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-blue focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Modo de Uso</label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleModeChange(AppMode.INDIVIDUAL)}
                                className={`p-4 text-center border rounded-lg transition-all ${formState.mode === AppMode.INDIVIDUAL ? 'border-tech-blue bg-tech-blue/10 dark:bg-tech-blue/20 ring-2 ring-tech-blue' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                Individual
                            </button>
                             <button
                                type="button"
                                onClick={() => handleModeChange(AppMode.COUPLE)}
                                className={`p-4 text-center border rounded-lg transition-all ${formState.mode === AppMode.COUPLE ? 'border-tech-blue bg-tech-blue/10 dark:bg-tech-blue/20 ring-2 ring-tech-blue' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                Casal
                            </button>
                        </div>
                    </div>

                    {formState.mode === AppMode.COUPLE && (
                        <div className="transition-all duration-300">
                            <label htmlFor="partnerName" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Cônjuge</label>
                            <input
                                type="text"
                                id="partnerName"
                                name="partnerName"
                                value={formState.partnerName || ''}
                                onChange={handleChange}
                                className="w-full mt-1 bg-gray-100 dark:bg-dark-tertiary border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-blue focus:outline-none"
                            />
                        </div>
                    )}
                    
                     <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Tema Visual</label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleThemeChange('dark')}
                                className={`p-4 text-center border rounded-lg transition-all ${formState.theme === 'dark' ? 'border-tech-blue bg-tech-blue/10 dark:bg-tech-blue/20 ring-2 ring-tech-blue' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                Flux Dark
                            </button>
                             <button
                                type="button"
                                onClick={() => handleThemeChange('light')}
                                className={`p-4 text-center border rounded-lg transition-all ${formState.theme === 'light' ? 'border-tech-blue bg-tech-blue/10 dark:bg-tech-blue/20 ring-2 ring-tech-blue' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                Flux Clean
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50">
                        <Button type="submit" size="lg" className="w-full">
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;

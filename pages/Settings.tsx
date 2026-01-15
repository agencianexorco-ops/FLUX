
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Profile, AppMode } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Settings: React.FC = () => {
    const { profile, updateProfile, loading } = useAuth();
    const [formState, setFormState] = useState<Profile | null>(profile);

    useEffect(() => {
        setFormState(profile);
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formState) return;
        const { name, value } = e.target;
        setFormState(prev => prev ? ({ ...prev, [name]: value }) : null);
    };
    
    const handleModeChange = (mode: AppMode) => {
        if (!formState) return;
        setFormState(prev => prev ? ({ 
            ...prev, 
            mode,
            partner_name: mode === AppMode.INDIVIDUAL ? '' : prev.partner_name
        }) : null);
    };

    const handleThemeChange = (theme: 'dark' | 'light') => {
        if (!formState) return;
        setFormState(prev => prev ? ({ ...prev, theme }) : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formState) {
            updateProfile(formState);
        }
    };
    
    if (!formState) {
        return <div>Carregando perfil...</div>
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto pb-16 md:pb-0">
            <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Configurações de Perfil</h1>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="user_name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Seu Nome</label>
                        <input
                            type="text"
                            id="user_name"
                            name="user_name"
                            value={formState.user_name}
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
                            <label htmlFor="partner_name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Cônjuge</label>
                            <input
                                type="text"
                                id="partner_name"
                                name="partner_name"
                                value={formState.partner_name || ''}
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
                        <Button type="submit" size="lg" className="w-full" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;


import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const AccessDenied: React.FC = () => {
    const { signOut } = useAuth();
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-primary p-4">
            <div className="w-full max-w-md text-center">
                 <div className="bg-white dark:bg-dark-secondary shadow-2xl rounded-2xl p-8 space-y-6">
                    <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">
                        Acesso Não Liberado
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sua conta está aguardando liberação de acesso. Se você já efetuou o pagamento, por favor aguarde ou entre em contato com o suporte.
                    </p>
                    <Button onClick={signOut} size="lg">
                        Sair
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;

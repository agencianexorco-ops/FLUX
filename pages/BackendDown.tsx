import React from 'react';
import Icon from '../components/ui/Icon';

const BackendDown: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-primary p-4">
            <div className="w-full max-w-lg text-center">
                 <div className="bg-white dark:bg-dark-secondary shadow-2xl rounded-2xl p-8 space-y-6">
                    <Icon name="x" className="w-12 h-12 mx-auto text-red-500 bg-red-500/10 p-2 rounded-full" />
                    <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">
                        Falha na Conexão com o Backend
                    </h1>
                    <div className="text-gray-600 dark:text-gray-400 space-y-2">
                        <p>
                            O aplicativo não conseguiu se conectar ao serviço Supabase.
                        </p>
                        <p>
                           Isso pode ter ocorrido porque o projeto foi excluído ou as credenciais de acesso estão incorretas.
                        </p>
                         <p className="font-semibold text-gray-800 dark:text-gray-200 pt-4">
                            Ação Necessária:
                        </p>
                        <p>
                            Por favor, verifique o arquivo <code className="bg-gray-200 dark:bg-dark-tertiary px-1 py-0.5 rounded-md text-sm">supabase/client.ts</code> e certifique-se de que a URL e a chave anônima pública (anon key) estão corretas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackendDown;

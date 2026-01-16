
import React, { useState } from 'react';
import { supabase } from '../supabase/client';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSignupSuccess(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // A chave 'data' em options preenche o campo raw_user_meta_data no Supabase.
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_name: userName,
            }
          }
        });
        if (signUpError) throw signUpError;
        // UX Improvement: Show a success message asking user to confirm their email.
        setSignupSuccess(true);
      }
    } catch (err: any) {
        console.error('Falha na autenticação:', err);
        
        let errorMessage = 'Ocorreu um erro desconhecido.';
        // Garante que estamos extraindo uma string da mensagem de erro.
        if (err && typeof err.message === 'string') {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        }
      
        // Exibe mensagens mais amigáveis para erros comuns.
        if (errorMessage.includes('Invalid login credentials')) {
          setError('Email ou senha inválidos.');
        } else if (errorMessage.includes('Email not confirmed')) {
          setError('Por favor, confirme seu e-mail antes de fazer login.');
        } else {
          setError(errorMessage);
        }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSignupSuccess(false);
    
    // FIX: Explicitly clear all form fields to their initial empty state.
    // This prevents stale data from persisting when switching between login and signup modes.
    setUserName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-tech-blue to-finance-green">
              Flux
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Controle suas finanças com clareza.</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary shadow-2xl rounded-2xl p-8 space-y-6">
          
          {signupSuccess ? (
             <div className="text-center space-y-4">
                <Icon name="check" className="w-12 h-12 mx-auto text-finance-green bg-finance-green/10 p-2 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conta Criada!</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.
                </p>
                <Button onClick={toggleMode} className="w-full" size="lg">
                    Voltar para Login
                </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <Input 
                    label="Seu Nome"
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                )}
                <Input 
                  label="Email"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div>
                  <Input 
                    label="Senha"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {!isLogin && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A senha deve ter no mínimo 6 caracteres.</p>}
                </div>
                {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading} size="lg">
                  {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta')}
                </Button>
              </form>
              <div className="text-center">
                <button onClick={toggleMode} className="text-sm text-tech-blue hover:underline">
                  {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;

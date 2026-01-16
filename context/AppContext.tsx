
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Transaction, CreditCard, Goal, Category, TransactionType, Notification, TransactionStatus, Profile } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { supabase } from '../supabase/client';
import { useAuth } from './AuthContext';

const defaultCategories: Omit<Category, 'id' | 'user_id' | 'created_at'>[] = [
    { name: 'Alimentação', type: TransactionType.EXPENSE },
    { name: 'Moradia', type: TransactionType.EXPENSE },
    { name: 'Transporte', type: TransactionType.EXPENSE },
    { name: 'Lazer', type: TransactionType.EXPENSE },
    { name: 'Assinatura', type: TransactionType.EXPENSE },
    { name: 'Pagamento de Fatura', type: TransactionType.EXPENSE },
    { name: 'Salário', type: TransactionType.INCOME },
    { name: 'Freelancer', type: TransactionType.INCOME },
    { name: 'Investimento', type: TransactionType.INCOME },
];

interface AppState {
  transactions: Transaction[];
  monthlyTransactions: Transaction[];
  cards: CreditCard[];
  goals: Goal[];
  categories: Category[];
  profile: Profile | null;
  selectedDate: Date;
  notifications: Notification[];
  setSelectedDate: (date: Date) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addMultipleTransactions: (transactions: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[]) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCard: (card: Omit<CreditCard, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateCard: (card: CreditCard) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'currentAmount'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// FIX: Explicitly typed AppProvider as a React.FC to resolve a type inference issue.
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('flux_notifications', []);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (profile?.theme === 'light') {
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
    }
  }, [profile?.theme]);

  // Fetch all user data
  useEffect(() => {
    const fetchData = async () => {
        if (!user) return;

        const [
            transactionsRes,
            cardsRes,
            goalsRes,
            categoriesRes
        ] = await Promise.all([
            supabase.from('transactions').select('*').eq('user_id', user.id),
            supabase.from('cards').select('*').eq('user_id', user.id),
            supabase.from('goals').select('*').eq('user_id', user.id),
            supabase.from('categories').select('*').eq('user_id', user.id)
        ]);
        
        if (transactionsRes.data) setTransactions(transactionsRes.data);
        if (cardsRes.data) setCards(cardsRes.data);
        if (goalsRes.data) setGoals(goalsRes.data);
        
        if (categoriesRes.data && categoriesRes.data.length > 0) {
            setCategories(categoriesRes.data);
        } else {
             // Seed default categories for new user
            const categoriesToSeed = defaultCategories.map(c => ({...c, user_id: user.id}));
            const { data: newCategories } = await supabase.from('categories').insert(categoriesToSeed).select();
            if(newCategories) setCategories(newCategories);
        }
    };
    
    if (user && !loading) {
        fetchData();
    }
  }, [user, loading]);

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(`${t.date}T12:00:00`);
      return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedYear, selectedMonth]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
        id: crypto.randomUUID(),
        message,
        date: new Date().toISOString(),
        read: false,
        type: type,
    };
    setNotifications(prev => [newNotif, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setNotifications]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, [setNotifications]);

 const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('transactions').insert({ ...transaction, user_id: user.id }).select().single();
    if (error) throw error;
    setTransactions(prev => [...prev, data]);
    const typeText = data.type === 'income' ? 'Receita' : 'Despesa';
    addNotification(`${typeText} "${data.description}" criada.`);
  };
  
  const addMultipleTransactions = async (transactionsToAdd: Omit<Transaction, 'id' | 'user_id' | 'created_at'>[]) => {
    if (!user) return;
    const newTransactions = transactionsToAdd.map(t => ({ ...t, user_id: user.id }));
    const { data, error } = await supabase.from('transactions').insert(newTransactions).select();
    if (error) throw error;
    setTransactions(prev => [...prev, ...data]);
    const first = data[0];
    const totalValue = data.reduce((sum, t) => sum + t.amount, 0);
    const typeText = first.type === 'income' ? 'Receita' : 'Despesa';
    addNotification(`${typeText} parcelada "${first.description.split(' (')[0]}" (${data.length}x) no valor total de ${totalValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} criada.`);
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!user) return;
    const { id, created_at, user_id, ...updateData } = updatedTransaction;
    const { data, error } = await supabase.from('transactions').update(updateData).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error;
    setTransactions(prev => prev.map(t => t.id === id ? data : t));
    addNotification(`Lançamento "${data.description}" atualizado.`);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    const parentId = transactionToDelete.installments?.parentId;
    if (parentId) {
      // It's an installment transaction, delete all related
      const transactionsToDelete = transactions.filter(t => t.installments?.parentId === parentId);
      const idsToDelete = transactionsToDelete.map(t => t.id);
      
      if (idsToDelete.length > 0) {
        const { error } = await supabase.from('transactions').delete().in('id', idsToDelete);
        if (error) {
          addNotification(`Erro ao excluir parcelamento: ${error.message}`, 'overdue');
          throw error;
        }
        setTransactions(prev => prev.filter(t => t.installments?.parentId !== parentId));
        addNotification(`Parcelamento "${transactionToDelete.description.split(' (')[0]}" excluído.`);
      }
    } else {
      // It's a single transaction
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) {
        addNotification(`Erro ao excluir lançamento: ${error.message}`, 'overdue');
        throw error;
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
      addNotification(`Lançamento "${transactionToDelete.description}" excluído.`);
    }
  };

  const addCard = async (card: Omit<CreditCard, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('cards').insert({ ...card, user_id: user.id }).select().single();
    if (error) throw error;
    setCards(prev => [...prev, data]);
    addNotification(`Cartão "${data.bankName}" adicionado.`);
  };

  const updateCard = async (updatedCard: CreditCard) => {
    if (!user) return;
    const { id, created_at, user_id, ...updateData } = updatedCard;
    const { data, error } = await supabase.from('cards').update(updateData).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error;
    setCards(prev => prev.map(c => c.id === id ? data : c));
    addNotification(`Cartão "${data.bankName}" atualizado.`);
  };

  const deleteCard = async (id: string) => {
    if (!user) return;
    const cardToDelete = cards.find(c => c.id === id);
    if(cardToDelete) {
        const { error } = await supabase.from('cards').delete().eq('id', id).eq('user_id', user.id);
        if (error) throw error;
        setCards(prev => prev.filter(c => c.id !== id));
        addNotification(`Cartão "${cardToDelete.bankName}" excluído.`);
    }
  };
  
  const addGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'currentAmount'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('goals').insert({ ...goal, currentAmount: goal.initialAmount, user_id: user.id }).select().single();
    if (error) throw error;
    setGoals(prev => [...prev, data]);
    addNotification(`Meta "${data.name}" criada.`);
  };

  const updateGoal = async (updatedGoal: Goal) => {
    if (!user) return;
    const { id, created_at, user_id, ...updateData } = updatedGoal;
    const { data, error } = await supabase.from('goals').update(updateData).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error;
    setGoals(prev => prev.map(g => g.id === id ? data : g));
    addNotification(`Meta "${data.name}" atualizada.`);
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    const goalToDelete = goals.find(g => g.id === id);
    if(goalToDelete) {
        const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
        if (error) throw error;
        setGoals(prev => prev.filter(g => g.id !== id));
        addNotification(`Meta "${goalToDelete.name}" excluída.`);
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('categories').insert({ ...category, user_id: user.id }).select().single();
    if (error) throw error;
    setCategories(prev => [...prev, data]);
    addNotification(`Categoria "${data.name}" criada.`);
  };
  
  const updateCategory = async (updatedCategory: Category) => {
    if (!user) return;
    const { id, created_at, user_id, ...updateData } = updatedCategory;
    const { data, error } = await supabase.from('categories').update(updateData).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error;
    setCategories(prev => prev.map(c => c.id === id ? data : c));
    addNotification(`Categoria "${data.name}" atualizada.`);
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    const catToDelete = categories.find(c => c.id === id);
    if(catToDelete) {
        const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id);
        if (error) throw error;
        setCategories(prev => prev.filter(c => c.id !== id));
        addNotification(`Categoria "${catToDelete.name}" excluída.`);
    }
  };

  return (
    <AppContext.Provider value={{
      transactions, monthlyTransactions, cards, goals, categories, profile, selectedDate, notifications, setSelectedDate,
      addTransaction, addMultipleTransactions, updateTransaction, deleteTransaction,
      addCard, updateCard, deleteCard,
      addGoal, updateGoal, deleteGoal,
      addCategory, updateCategory, deleteCategory,
      markNotificationAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

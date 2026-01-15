
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Transaction, CreditCard, Goal, Category, Settings, AppMode, TransactionType, Notification, TransactionStatus } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

const initialSettings: Settings = {
  userName: 'Usuário',
  mode: AppMode.INDIVIDUAL,
  partnerName: '',
  theme: 'dark',
};

const defaultCategories: Category[] = [
    { id: 'cat-1', name: 'Alimentação', type: TransactionType.EXPENSE },
    { id: 'cat-2', name: 'Moradia', type: TransactionType.EXPENSE },
    { id: 'cat-3', name: 'Transporte', type: TransactionType.EXPENSE },
    { id: 'cat-4', name: 'Lazer', type: TransactionType.EXPENSE },
    { id: 'cat-5', name: 'Assinatura', type: TransactionType.EXPENSE },
    { id: 'cat-6', name: 'Pagamento de Fatura', type: TransactionType.EXPENSE },
    { id: 'cat-7', name: 'Salário', type: TransactionType.INCOME },
    { id: 'cat-8', name: 'Freelancer', type: TransactionType.INCOME },
    { id: 'cat-9', name: 'Investimento', type: TransactionType.INCOME },
];

interface AppState {
  transactions: Transaction[];
  monthlyTransactions: Transaction[];
  cards: CreditCard[];
  goals: Goal[];
  categories: Category[];
  settings: Settings;
  selectedDate: Date;
  notifications: Notification[];
  setSelectedDate: (date: Date) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addMultipleTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCard: (card: Omit<CreditCard, 'id'>) => void;
  updateCard: (card: CreditCard) => void;
  deleteCard: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (settings: Settings) => void;
  markNotificationAsRead: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('flux_transactions', []);
  const [cards, setCards] = useLocalStorage<CreditCard[]>('flux_cards', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('flux_goals', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('flux_categories', defaultCategories);
  const [settings, setSettings] = useLocalStorage<Settings>('flux_settings', initialSettings);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('flux_notifications', []);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const body = document.body;
    if (settings.theme === 'light') {
      body.classList.remove('dark');
    } else {
      body.classList.add('dark');
    }
  }, [settings.theme]);

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

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueAndOverdueNotifications = transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.PLANNED)
      .map(t => {
          const dueDate = new Date(t.date);
          const dueDateUTC = new Date(Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()));
          const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
          const timeDiff = dueDateUTC.getTime() - todayUTC.getTime();
          const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (dayDiff < 0) {
              return {
                  id: `noti-${t.id}-overdue`, message: `Conta "${t.description}" está vencida!`, date: new Date().toISOString(), read: false, type: 'overdue', link: t.id
              } as Notification;
          } else if (dayDiff <= 7) {
              const message = dayDiff === 0 ? `Conta "${t.description}" vence hoje.` : `Conta "${t.description}" vence em ${dayDiff} ${dayDiff === 1 ? 'dia' : 'dias'}.`;
              return {
                  id: `noti-${t.id}-due`, message, date: new Date().toISOString(), read: false, type: 'due', link: t.id
              } as Notification;
          }
          return null;
      }).filter(Boolean) as Notification[];
      
      setNotifications(prev => [...prev.filter(n => n.type !== 'due' && n.type !== 'overdue'), ...dueAndOverdueNotifications]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, selectedDate]); // Rerun when transactions change or month changes


  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, [setNotifications]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const transactionDate = new Date(`${transaction.date}T12:00:00`);
    if (transactionDate.getFullYear() !== selectedYear || transactionDate.getMonth() !== selectedMonth) {
      throw new Error("Erro: A data do lançamento não corresponde ao mês atualmente selecionado.");
    }
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [...prev, newTransaction]);
    const typeText = newTransaction.type === 'income' ? 'Receita' : 'Despesa';
    addNotification(`${typeText} "${newTransaction.description}" criada.`);
  }, [setTransactions, selectedYear, selectedMonth, addNotification]);
  
  const addMultipleTransactions = useCallback((transactionsToAdd: Omit<Transaction, 'id'>[]) => {
    const newTransactions = transactionsToAdd.map(t => ({ ...t, id: crypto.randomUUID() }));
    setTransactions(prev => [...prev, ...newTransactions]);
    
    const first = newTransactions[0];
    const totalValue = newTransactions.reduce((sum, t) => sum + t.amount, 0);
    const typeText = first.type === 'income' ? 'Receita' : 'Despesa';
    addNotification(`${typeText} parcelada "${first.description.split(' (')[0]}" (${newTransactions.length}x) no valor total de ${totalValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} criada.`);
  }, [setTransactions, addNotification]);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    const transactionDate = new Date(`${updatedTransaction.date}T12:00:00`);
    if (transactionDate.getFullYear() !== selectedYear || transactionDate.getMonth() !== selectedMonth) {
      throw new Error("Erro: A data do lançamento editado não corresponde ao mês atualmente selecionado.");
    }
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    addNotification(`Lançamento "${updatedTransaction.description}" atualizado.`);
  }, [setTransactions, selectedYear, selectedMonth, addNotification]);

  const deleteTransaction = useCallback((id: string) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    const parentId = transactionToDelete.installments?.parentId;
    if (parentId) {
        setTransactions(prev => prev.filter(t => t.installments?.parentId !== parentId));
        addNotification(`Parcelamento "${transactionToDelete.description.split(' (')[0]}" e todas as suas parcelas foram excluídos.`);
    } else {
        setTransactions(prev => prev.filter(t => t.id !== id));
        addNotification(`Lançamento "${transactionToDelete.description}" excluído.`);
    }
  }, [transactions, setTransactions, addNotification]);

  const addCard = useCallback((card: Omit<CreditCard, 'id'>) => {
    setCards(prev => [...prev, { ...card, id: crypto.randomUUID() }]);
    addNotification(`Cartão "${card.bankName}" adicionado.`);
  }, [setCards, addNotification]);

  const updateCard = useCallback((updatedCard: CreditCard) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    addNotification(`Cartão "${updatedCard.bankName}" atualizado.`);
  }, [setCards, addNotification]);

  const deleteCard = useCallback((id: string) => {
    const cardToDelete = cards.find(c => c.id === id);
    if(cardToDelete) {
        setCards(prev => prev.filter(c => c.id !== id));
        addNotification(`Cartão "${cardToDelete.bankName}" excluído.`);
    }
  }, [cards, setCards, addNotification]);
  
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    setGoals(prev => [...prev, { ...goal, id: crypto.randomUUID(), currentAmount: goal.initialAmount }]);
    addNotification(`Meta "${goal.name}" criada.`);
  }, [setGoals, addNotification]);

  const updateGoal = useCallback((updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    addNotification(`Meta "${updatedGoal.name}" atualizada.`);
  }, [setGoals, addNotification]);

  const deleteGoal = useCallback((id: string) => {
    const goalToDelete = goals.find(g => g.id === id);
    if(goalToDelete) {
        setGoals(prev => prev.filter(g => g.id !== id));
        addNotification(`Meta "${goalToDelete.name}" excluída.`);
    }
  }, [goals, setGoals, addNotification]);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: crypto.randomUUID() }]);
    addNotification(`Categoria "${category.name}" criada.`);
  }, [setCategories, addNotification]);
  
  const updateCategory = useCallback((updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    addNotification(`Categoria "${updatedCategory.name}" atualizada.`);
  }, [setCategories, addNotification]);

  const deleteCategory = useCallback((id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    if(catToDelete) {
        setCategories(prev => prev.filter(c => c.id !== id));
        addNotification(`Categoria "${catToDelete.name}" excluída.`);
    }
  }, [categories, setCategories, addNotification]);

  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    addNotification('Configurações salvas.');
  }, [setSettings, addNotification]);

  return (
    <AppContext.Provider value={{
      transactions, monthlyTransactions, cards, goals, categories, settings, selectedDate, notifications, setSelectedDate,
      addTransaction, addMultipleTransactions, updateTransaction, deleteTransaction,
      addCard, updateCard, deleteCard,
      addGoal, updateGoal, deleteGoal,
      addCategory, updateCategory, deleteCategory,
      updateSettings, markNotificationAsRead
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

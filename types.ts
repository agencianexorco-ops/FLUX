
export type Page = 'dashboard' | 'transactions' | 'cards' | 'goals' | 'categories' | 'settings';

export enum AppMode {
  INDIVIDUAL = 'individual',
  COUPLE = 'couple',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionStatus {
  PLANNED = 'previsto',
  COMPLETED = 'realizado',
}

export enum Recurrence {
  NONE = 'nenhuma',
  MONTHLY = 'mensal',
  YEARLY = 'anual',
}

export enum PaymentMethod {
  PIX = 'pix',
  CREDIT = 'crédito',
  DEBIT = 'débito',
  CASH = 'dinheiro',
  OTHER = 'outro',
}

// Base type for Supabase tables
interface DbRecord {
  id: string;
  created_at: string;
  user_id: string;
}

export interface Transaction extends DbRecord {
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  payer: string;
  category: string;
  status: TransactionStatus;
  recurrence: Recurrence;
  paymentMethod: PaymentMethod;
  paymentDetails?: string;
  installments?: {
    current: number;
    total: number;
    parentId: string;
  };
  cardId?: string;
}

export interface CreditCard extends DbRecord {
  bankName: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  holderName: string;
}

export interface Goal extends DbRecord {
  name: string;
  targetAmount: number;
  initialAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
}

export interface Category extends DbRecord {
  name: string;
  type: TransactionType;
}

export interface Profile {
  id: string; // Corresponds to Supabase auth.users.id
  user_name: string;
  partner_name?: string;
  mode: AppMode;
  theme: 'dark' | 'light';
  has_access: boolean;
  plan: 'free' | 'pro' | 'premium';
}


export interface Notification {
  id:string;
  message: string;
  date: string;
  read: boolean;
  type: 'due' | 'overdue' | 'info';
  link?: string;
}

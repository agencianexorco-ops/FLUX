
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

export interface Transaction {
  id: string;
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

export interface CreditCard {
  id: string;
  bankName: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  holderName: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  initialAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Settings {
  userName: string;
  partnerName?: string;
  mode: AppMode;
  theme: 'dark' | 'light';
}

export interface Notification {
  id:string;
  message: string;
  date: string;
  read: boolean;
  type: 'due' | 'overdue' | 'info';
  link?: string;
}

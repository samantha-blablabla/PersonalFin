
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: TransactionType;
  note: string;
}

export interface Investment {
  id: string;
  symbol: string;
  type: 'STOCK' | 'FUND';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: 'SHORT' | 'LONG';
}

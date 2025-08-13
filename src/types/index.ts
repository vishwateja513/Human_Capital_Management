export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string;
  particulars: string;
  amount: number;
  place: string;
  remarks: string;
}

export interface Batch {
  id: string;
  name: string;
  openingBalance: number;
  startDate: string;
  endDate: string;
  transactions: Transaction[];
  totalExpense: number;
  closingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  user: User | null;
  batches: Batch[];
  currentBatch: Batch | null;
  isLoading: boolean;
}
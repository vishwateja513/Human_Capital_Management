import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Batch, Transaction } from '../types';

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_BATCHES'; payload: Batch[] }
  | { type: 'ADD_BATCH'; payload: Batch }
  | { type: 'UPDATE_BATCH'; payload: Batch }
  | { type: 'DELETE_BATCH'; payload: string }
  | { type: 'SET_CURRENT_BATCH'; payload: Batch | null }
  | { type: 'ADD_TRANSACTION'; payload: { batchId: string; transaction: Transaction } }
  | { type: 'UPDATE_TRANSACTION'; payload: { batchId: string; transaction: Transaction } }
  | { type: 'DELETE_TRANSACTION'; payload: { batchId: string; transactionId: string } }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  user: null,
  batches: [],
  currentBatch: null,
  isLoading: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => {} });

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_BATCHES':
      return { ...state, batches: action.payload };
    case 'ADD_BATCH':
      return { ...state, batches: [...state.batches, action.payload] };
    case 'UPDATE_BATCH':
      return {
        ...state,
        batches: state.batches.map(batch =>
          batch.id === action.payload.id ? action.payload : batch
        ),
        currentBatch: state.currentBatch?.id === action.payload.id ? action.payload : state.currentBatch,
      };
    case 'DELETE_BATCH':
      return {
        ...state,
        batches: state.batches.filter(batch => batch.id !== action.payload),
        currentBatch: state.currentBatch?.id === action.payload ? null : state.currentBatch,
      };
    case 'SET_CURRENT_BATCH':
      return { ...state, currentBatch: action.payload };
    case 'ADD_TRANSACTION': {
      const updatedBatches = state.batches.map(batch => {
        if (batch.id === action.payload.batchId) {
          const newTransactions = [...batch.transactions, action.payload.transaction];
          const totalExpense = newTransactions.reduce((sum, t) => sum + t.amount, 0);
          const updatedBatch = {
            ...batch,
            transactions: newTransactions,
            totalExpense,
            closingBalance: batch.openingBalance - totalExpense,
            updatedAt: new Date().toISOString(),
          };
          return updatedBatch;
        }
        return batch;
      });
      return {
        ...state,
        batches: updatedBatches,
        currentBatch: state.currentBatch?.id === action.payload.batchId 
          ? updatedBatches.find(b => b.id === action.payload.batchId) || null
          : state.currentBatch,
      };
    }
    case 'UPDATE_TRANSACTION': {
      const updatedBatches = state.batches.map(batch => {
        if (batch.id === action.payload.batchId) {
          const newTransactions = batch.transactions.map(t =>
            t.id === action.payload.transaction.id ? action.payload.transaction : t
          );
          const totalExpense = newTransactions.reduce((sum, t) => sum + t.amount, 0);
          const updatedBatch = {
            ...batch,
            transactions: newTransactions,
            totalExpense,
            closingBalance: batch.openingBalance - totalExpense,
            updatedAt: new Date().toISOString(),
          };
          return updatedBatch;
        }
        return batch;
      });
      return {
        ...state,
        batches: updatedBatches,
        currentBatch: state.currentBatch?.id === action.payload.batchId 
          ? updatedBatches.find(b => b.id === action.payload.batchId) || null
          : state.currentBatch,
      };
    }
    case 'DELETE_TRANSACTION': {
      const updatedBatches = state.batches.map(batch => {
        if (batch.id === action.payload.batchId) {
          const newTransactions = batch.transactions.filter(t => t.id !== action.payload.transactionId);
          const totalExpense = newTransactions.reduce((sum, t) => sum + t.amount, 0);
          const updatedBatch = {
            ...batch,
            transactions: newTransactions,
            totalExpense,
            closingBalance: batch.openingBalance - totalExpense,
            updatedAt: new Date().toISOString(),
          };
          return updatedBatch;
        }
        return batch;
      });
      return {
        ...state,
        batches: updatedBatches,
        currentBatch: state.currentBatch?.id === action.payload.batchId 
          ? updatedBatches.find(b => b.id === action.payload.batchId) || null
          : state.currentBatch,
      };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedUser = localStorage.getItem('expense-app-user');
    const savedBatches = localStorage.getItem('expense-app-batches');
    
    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }
    if (savedBatches) {
      dispatch({ type: 'SET_BATCHES', payload: JSON.parse(savedBatches) });
    }
  }, []);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('expense-app-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('expense-app-user');
    }
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem('expense-app-batches', JSON.stringify(state.batches));
  }, [state.batches]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
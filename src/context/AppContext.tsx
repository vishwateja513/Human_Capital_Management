import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Batch, Transaction } from '../types';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

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
  loadBatches: () => Promise<void>;
  createBatch: (batch: Omit<Batch, 'id' | 'user_id' | 'transactions' | 'totalExpense' | 'closingBalance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBatch: (batch: Batch) => Promise<void>;
  deleteBatch: (batchId: string) => Promise<void>;
  addTransaction: (batchId: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (batchId: string, transaction: Transaction) => Promise<void>;
  deleteTransaction: (batchId: string, transactionId: string) => Promise<void>;
}>({ 
  state: initialState, 
  dispatch: () => {},
  loadBatches: async () => {},
  createBatch: async () => {},
  updateBatch: async () => {},
  deleteBatch: async () => {},
  addTransaction: async () => {},
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
});

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

  // Load user session on app start
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch({ 
          type: 'SET_USER', 
          payload: { 
            id: session.user.id, 
            email: session.user.email || '' 
          } 
        });
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          dispatch({ 
            type: 'SET_USER', 
            payload: { 
              id: session.user.id, 
              email: session.user.email || '' 
            } 
          });
        } else {
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_BATCHES', payload: [] });
          dispatch({ type: 'SET_CURRENT_BATCH', payload: null });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load batches when user changes
  useEffect(() => {
    if (state.user) {
      loadBatches();
    }
  }, [state.user]);

  const loadBatches = async () => {
    if (!state.user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Load batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('*')
        .eq('user_id', state.user.id)
        .order('created_at', { ascending: false });

      if (batchesError) throw batchesError;

      // Load transactions for all batches
      const batchIds = batchesData?.map(b => b.id) || [];
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .in('batch_id', batchIds)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Combine batches with their transactions
      const batchesWithTransactions: Batch[] = (batchesData || []).map(batch => ({
        id: batch.id,
        user_id: batch.user_id,
        name: batch.name,
        openingBalance: batch.opening_balance,
        startDate: batch.start_date,
        endDate: batch.end_date,
        totalExpense: batch.total_expense,
        closingBalance: batch.closing_balance,
        createdAt: batch.created_at,
        updatedAt: batch.updated_at,
        transactions: (transactionsData || [])
          .filter(t => t.batch_id === batch.id)
          .map(t => ({
            id: t.id,
            date: t.date,
            particulars: t.particulars,
            amount: t.amount,
            place: t.place,
            remarks: t.remarks || '',
          }))
      }));

      dispatch({ type: 'SET_BATCHES', payload: batchesWithTransactions });
    } catch (error) {
      console.error('Error loading batches:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createBatch = async (batchData: Omit<Batch, 'id' | 'user_id' | 'transactions' | 'totalExpense' | 'closingBalance' | 'createdAt' | 'updatedAt'>) => {
    if (!state.user) return;

    try {
      const { data, error } = await supabase
        .from('batches')
        .insert({
          user_id: state.user.id,
          name: batchData.name,
          opening_balance: batchData.openingBalance,
          start_date: batchData.startDate,
          end_date: batchData.endDate,
        })
        .select()
        .single();

      if (error) throw error;

      const newBatch: Batch = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        openingBalance: data.opening_balance,
        startDate: data.start_date,
        endDate: data.end_date,
        totalExpense: data.total_expense,
        closingBalance: data.closing_balance,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        transactions: [],
      };

      dispatch({ type: 'ADD_BATCH', payload: newBatch });
      dispatch({ type: 'SET_CURRENT_BATCH', payload: newBatch });
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const updateBatch = async (batch: Batch) => {
    try {
      const { error } = await supabase
        .from('batches')
        .update({
          name: batch.name,
          opening_balance: batch.openingBalance,
          start_date: batch.startDate,
          end_date: batch.endDate,
        })
        .eq('id', batch.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_BATCH', payload: batch });
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  };

  const deleteBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;

      dispatch({ type: 'DELETE_BATCH', payload: batchId });
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const addTransaction = async (batchId: string, transactionData: Omit<Transaction, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          batch_id: batchId,
          date: transactionData.date,
          particulars: transactionData.particulars,
          amount: transactionData.amount,
          place: transactionData.place,
          remarks: transactionData.remarks || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        date: data.date,
        particulars: data.particulars,
        amount: data.amount,
        place: data.place,
        remarks: data.remarks || '',
      };

      dispatch({ type: 'ADD_TRANSACTION', payload: { batchId, transaction: newTransaction } });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = async (batchId: string, transaction: Transaction) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          date: transaction.date,
          particulars: transaction.particulars,
          amount: transaction.amount,
          place: transaction.place,
          remarks: transaction.remarks || null,
        })
        .eq('id', transaction.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_TRANSACTION', payload: { batchId, transaction } });
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (batchId: string, transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      dispatch({ type: 'DELETE_TRANSACTION', payload: { batchId, transactionId } });
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch,
      loadBatches,
      createBatch,
      updateBatch,
      deleteBatch,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    }}>
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
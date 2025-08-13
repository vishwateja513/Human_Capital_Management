import React from 'react';
import { Plus, TrendingUp, TrendingDown, FileText, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

interface DashboardProps {
  onCreateBatch: () => void;
}

export function Dashboard({ onCreateBatch }: DashboardProps) {
  const { state, dispatch } = useApp();

  const totalBatches = state.batches.length;
  const totalTransactions = state.batches.reduce((sum, batch) => sum + batch.transactions.length, 0);
  const totalExpense = state.batches.reduce((sum, batch) => sum + batch.totalExpense, 0);
  const totalBalance = state.batches.reduce((sum, batch) => sum + batch.closingBalance, 0);

  const recentBatches = state.batches
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const handleBatchClick = (batch: any) => {
    dispatch({ type: 'SET_CURRENT_BATCH', payload: batch });
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your expense batches and track spending</p>
          </div>
          <button
            onClick={onCreateBatch}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Batch
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalBatches}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Batches</h3>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalTransactions}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">₹{totalExpense.toLocaleString()}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">₹{totalBalance.toLocaleString()}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Balance</h3>
          </div>
        </div>

        {/* Recent Batches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Batches</h2>
          </div>
          <div className="p-6">
            {recentBatches.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
                <p className="text-gray-600 mb-6">Create your first batch to start tracking expenses</p>
                <button
                  onClick={onCreateBatch}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Create Your First Batch
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recentBatches.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => handleBatchClick(batch)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">{batch.name}</h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(batch.updatedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Opening Balance:</span>
                        <span className="font-medium">₹{batch.openingBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Expenses:</span>
                        <span className="font-medium text-red-600">₹{batch.totalExpense.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Closing Balance:</span>
                        <span className="font-medium text-green-600">₹{batch.closingBalance.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {batch.transactions.length} transactions
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
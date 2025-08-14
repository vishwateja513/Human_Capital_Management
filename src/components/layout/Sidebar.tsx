import React, { useState } from 'react';
import { Plus, FileText, Search, LogOut, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { BatchForm } from '../batch/BatchForm';
import { format } from 'date-fns';

interface SidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function Sidebar({ searchTerm, onSearchChange }: SidebarProps) {
  const { state, dispatch } = useApp();
  const [showBatchForm, setShowBatchForm] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_BATCHES', payload: [] });
    dispatch({ type: 'SET_CURRENT_BATCH', payload: null });
  };

  const handleBatchClick = (batch: any) => {
    dispatch({ type: 'SET_CURRENT_BATCH', payload: batch });
  };

  const filteredBatches = state.batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Expense Manager</h1>
        <p className="text-sm text-gray-600">Welcome, {state.user?.email.split('@')[0]}</p>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Create New Batch */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowBatchForm(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          Create New Batch
        </button>
      </div>

      {/* Batch List */}
      <div className="flex-1 overflow-y-auto px-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Batch History</h3>
        <div className="space-y-2">
          {filteredBatches.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No batches found</p>
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => handleBatchClick(batch)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  state.currentBatch?.id === batch.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-medium text-gray-900 mb-2">{batch.name}</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(batch.startDate), 'MMM d')} - {format(new Date(batch.endDate), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <DollarSign className="w-3 h-3" />
                    Balance: ₹{batch.closingBalance.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {batch.transactions.length} transactions
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Batch Form Modal */}
      {showBatchForm && (
        <BatchForm onClose={() => setShowBatchForm(false)} />
      )}
    </div>
  );
}
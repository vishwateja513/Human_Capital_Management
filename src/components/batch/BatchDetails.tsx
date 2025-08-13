import React, { useState } from 'react';
import { Edit, Trash2, Download, Plus, ArrowLeft, FileSpreadsheet, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TransactionForm } from '../transaction/TransactionForm';
import { TransactionList } from '../transaction/TransactionList';
import { BatchForm } from './BatchForm';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { format } from 'date-fns';

export function BatchDetails() {
  const { state, dispatch } = useApp();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const batch = state.currentBatch;

  if (!batch) {
    return null;
  }

  const handleDeleteBatch = () => {
    dispatch({ type: 'DELETE_BATCH', payload: batch.id });
    dispatch({ type: 'SET_CURRENT_BATCH', payload: null });
    setShowDeleteConfirm(false);
  };

  const handleExportExcel = () => {
    exportToExcel(batch);
  };

  const handleExportPDF = () => {
    exportToPDF(batch);
  };

  const handleBackToDashboard = () => {
    dispatch({ type: 'SET_CURRENT_BATCH', payload: null });
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToDashboard}
            className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{batch.name}</h1>
            <p className="text-gray-600">
              {format(new Date(batch.startDate), 'MMM d, yyyy')} - {format(new Date(batch.endDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBatchForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Opening Balance</h3>
            <p className="text-2xl font-bold text-green-600">₹{batch.openingBalance.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">₹{batch.totalExpense.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Closing Balance</h3>
            <p className="text-2xl font-bold text-blue-600">₹{batch.closingBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={() => setShowTransactionForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Transactions */}
        <TransactionList batchId={batch.id} />

        {/* Modals */}
        {showTransactionForm && (
          <TransactionForm
            batchId={batch.id}
            onClose={() => setShowTransactionForm(false)}
          />
        )}

        {showBatchForm && (
          <BatchForm
            batch={batch}
            onClose={() => setShowBatchForm(false)}
          />
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Batch</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{batch.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBatch}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
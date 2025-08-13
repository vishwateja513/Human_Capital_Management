import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, FileText, MapPin, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Transaction } from '../../types';

interface TransactionFormProps {
  batchId: string;
  transaction?: Transaction;
  onClose: () => void;
}

export function TransactionForm({ batchId, transaction, onClose }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    particulars: '',
    amount: '',
    place: '',
    remarks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { dispatch } = useApp();

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        particulars: transaction.particulars,
        amount: transaction.amount.toString(),
        place: transaction.place,
        remarks: transaction.remarks,
      });
    } else {
      setFormData(prev => ({
        ...prev,
        date: format(new Date(), 'yyyy-MM-dd'),
      }));
    }
  }, [transaction]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.particulars.trim()) {
      newErrors.particulars = 'Particulars is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.place.trim()) {
      newErrors.place = 'Place is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const transactionData: Transaction = {
      id: transaction?.id || uuidv4(),
      date: formData.date,
      particulars: formData.particulars.trim(),
      amount: parseFloat(formData.amount),
      place: formData.place.trim(),
      remarks: formData.remarks.trim(),
    };

    if (transaction) {
      dispatch({
        type: 'UPDATE_TRANSACTION',
        payload: { batchId, transaction: transactionData },
      });
    } else {
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: { batchId, transaction: transactionData },
      });
    }

    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Particulars
            </label>
            <input
              type="text"
              value={formData.particulars}
              onChange={(e) => handleInputChange('particulars', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.particulars ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter transaction details"
            />
            {errors.particulars && <p className="text-red-500 text-sm mt-1">{errors.particulars}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Amount
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter amount"
              step="0.01"
              min="0.01"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Place
            </label>
            <input
              type="text"
              value={formData.place}
              onChange={(e) => handleInputChange('place', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.place ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter location"
            />
            {errors.place && <p className="text-red-500 text-sm mt-1">{errors.place}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <Save className="w-4 h-4" />
              {transaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
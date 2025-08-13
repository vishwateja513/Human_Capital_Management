import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Batch } from '../../types';

interface BatchFormProps {
  batch?: Batch;
  onClose: () => void;
}

export function BatchForm({ batch, onClose }: BatchFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    openingBalance: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { dispatch } = useApp();

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name,
        openingBalance: batch.openingBalance.toString(),
        startDate: batch.startDate,
        endDate: batch.endDate,
      });
    } else {
      const today = format(new Date(), 'yyyy-MM-dd');
      setFormData(prev => ({
        ...prev,
        startDate: today,
        endDate: today,
      }));
    }
  }, [batch]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    }

    if (!formData.openingBalance || parseFloat(formData.openingBalance) < 0) {
      newErrors.openingBalance = 'Valid opening balance is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const openingBalance = parseFloat(formData.openingBalance);
    const now = new Date().toISOString();

    if (batch) {
      const updatedBatch: Batch = {
        ...batch,
        name: formData.name.trim(),
        openingBalance,
        startDate: formData.startDate,
        endDate: formData.endDate,
        closingBalance: openingBalance - batch.totalExpense,
        updatedAt: now,
      };
      dispatch({ type: 'UPDATE_BATCH', payload: updatedBatch });
    } else {
      const newBatch: Batch = {
        id: uuidv4(),
        name: formData.name.trim(),
        openingBalance,
        startDate: formData.startDate,
        endDate: formData.endDate,
        transactions: [],
        totalExpense: 0,
        closingBalance: openingBalance,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_BATCH', payload: newBatch });
      dispatch({ type: 'SET_CURRENT_BATCH', payload: newBatch });
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
            {batch ? 'Edit Batch' : 'Create New Batch'}
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
              <FileText className="w-4 h-4 inline mr-2" />
              Batch Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter batch name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Opening Balance
            </label>
            <input
              type="number"
              value={formData.openingBalance}
              onChange={(e) => handleInputChange('openingBalance', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.openingBalance ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter opening balance"
              step="0.01"
              min="0"
            />
            {errors.openingBalance && <p className="text-red-500 text-sm mt-1">{errors.openingBalance}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
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
              {batch ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
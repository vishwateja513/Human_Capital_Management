import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { BatchDetails } from './components/batch/BatchDetails';
import { BatchForm } from './components/batch/BatchForm';

function AppContent() {
  const { state } = useApp();
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!state.user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        onCreateBatch={() => setShowBatchForm(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      {state.currentBatch ? (
        <BatchDetails />
      ) : (
        <Dashboard onCreateBatch={() => setShowBatchForm(true)} />
      )}

      {showBatchForm && (
        <BatchForm onClose={() => setShowBatchForm(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
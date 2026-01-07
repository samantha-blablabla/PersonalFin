
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import { Transaction, Investment, Goal, TransactionType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [transactions] = useState<Transaction[]>([
    { id: '1', date: '2023-10-20', category: 'Salary', amount: 25000000, type: TransactionType.INCOME, note: 'Oct Salary' },
  ]);

  const [investments] = useState<Investment[]>([
    { id: '1', symbol: 'HPG', type: 'STOCK', quantity: 1000, avgPrice: 24500, currentPrice: 27150 },
  ]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} investments={investments} />;
      default:
        return <div className="text-center py-20 text-gray-500">Coming Soon: {activeTab.toUpperCase()} View</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;

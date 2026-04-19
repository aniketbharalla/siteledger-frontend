import React from 'react';
import ExpenseTable from '../components/ExpenseTable';

export default function ExpensesPage({ stats }) {
  const { filteredExpenses } = stats;

  return (
    <div>
      <ExpenseTable expenses={filteredExpenses} compact={false} />
    </div>
  );
}

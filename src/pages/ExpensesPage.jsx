import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ExpenseTable from '../components/ExpenseTable';
import EditExpenseModal from '../components/EditExpenseModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { deleteExpense } from '../api';

export default function ExpensesPage({ stats }) {
  const { filteredExpenses } = stats;
  const qc = useQueryClient();
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleSaved() {
    qc.invalidateQueries({ queryKey: ['expenses'] });
    qc.invalidateQueries({ queryKey: ['sites'] });
  }

  return (
    <div>
      <ExpenseTable
        expenses={filteredExpenses}
        compact={false}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
      />

      {editTarget && (
        <EditExpenseModal
          expense={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Expense"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={() => deleteExpense(deleteTarget._id).then(handleSaved)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

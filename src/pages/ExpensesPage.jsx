import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ExpenseTable from '../components/ExpenseTable';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { deleteExpense } from '../api';

export default function ExpensesPage({ stats, sites = [] }) {
  const { filteredExpenses } = stats;
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleSaved() {
    qc.invalidateQueries({ queryKey: ['expenses'] });
    qc.invalidateQueries({ queryKey: ['sites'] });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => setShowAdd(true)}>
          + Add Expense
        </button>
      </div>

      <ExpenseTable
        expenses={filteredExpenses}
        compact={false}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
      />

      {showAdd && (
        <AddExpenseModal
          sites={sites}
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
        />
      )}

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

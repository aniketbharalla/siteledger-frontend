import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMembers, addMember, deleteMember } from '../api';
import { IconX, IconCheck, IconTrash } from '../components/icons';
import { fmtDate } from '../utils/format';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
  color: 'white',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

function AddMemberModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.email.trim()) { setError('Email is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await addMember({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Add Member</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Member can only view and add expenses</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-3)', cursor: 'pointer', padding: '6px', display: 'flex' }}>
            <IconX size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(227,26,26,0.1)', border: '1px solid rgba(227,26,26,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#E31A1A', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
            <input className="input-dark" placeholder="e.g. Ravi Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input className="input-dark" type="email" placeholder="ravi@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <input className="input-dark" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
            <span style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, display: 'block' }}>Share this password with the member so they can log in.</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '10px', opacity: loading ? 0.6 : 1 }}>
              <IconCheck size={14} />
              {loading ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers,
    staleTime: 30_000,
  });

  function handleSaved() {
    qc.invalidateQueries({ queryKey: ['members'] });
  }

  async function handleDelete(member) {
    setDeleting(true);
    try {
      await deleteMember(member.id || member._id);
      qc.invalidateQueries({ queryKey: ['members'] });
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    } finally {
      setDeleting(false);
    }
  }

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const COLORS = ['#0075FF', '#FF0080', '#01B574', '#FFB547', '#582CFF', '#01B5EC'];

  return (
    <div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Team Members</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>({members.length})</span>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => setShowAdd(true)}>
            + Add Member
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Loading…</div>
        ) : members.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>No members yet</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>Add team members so they can log expenses.</div>
            <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add first member</button>
          </div>
        ) : (
          <div>
            {members.map((m, i) => (
              <div
                key={m._id || m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: i < members.length - 1 ? '1px solid var(--line)' : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 38, height: 38, borderRadius: 11, background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {initials(m.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{m.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span className="chip chip-green" style={{ fontSize: 10 }}>member</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Added {fmtDate(m.createdAt)}</span>
                  <button
                    className="btn-ghost"
                    style={{ padding: '6px 8px', color: '#E31A1A' }}
                    onClick={() => setDeleteTarget(m)}
                    title="Remove member"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onSaved={handleSaved} />}

      {/* Confirm delete */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Remove Member</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 24 }}>
              Remove <strong>{deleteTarget.name}</strong> from your organisation? They will lose access immediately.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Cancel</button>
              <button
                className="btn-primary"
                disabled={deleting}
                onClick={() => handleDelete(deleteTarget)}
                style={{ flex: 1, justifyContent: 'center', padding: '10px', background: 'linear-gradient(135deg,#E31A1A,#FF6B6B)', opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

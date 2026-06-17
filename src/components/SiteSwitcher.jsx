import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconCheck, IconX } from './icons';

const SITE_COLORS = [
  'var(--grad-primary)',
  'var(--grad-pink)',
  'var(--grad-green)',
  'var(--grad-amber)',
  'linear-gradient(135deg,#01B5EC 0%,#582CFF 100%)',
  'linear-gradient(135deg,#FFB547 0%,#01B574 100%)',
];

function siteColor(idx) {
  return SITE_COLORS[idx % SITE_COLORS.length];
}

export default function SiteSwitcher({ sites = [], selectedIds, setSelectedIds }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => selectedIds || []);
  const ref = useRef(null);

  // Sync draft from outside
  useEffect(() => {
    if (!open) setDraft(selectedIds || []);
  }, [selectedIds, open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const allSelected = draft.length === sites.length || draft.length === 0;
  const label = allSelected ? 'All Sites' : `${draft.length} site${draft.length > 1 ? 's' : ''}`;

  function toggle(id) {
    setDraft(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function apply() {
    setSelectedIds(draft.length === sites.length ? [] : draft);
    setOpen(false);
  }

  function selectAll() { setDraft([]); }
  function clearAll()  { setDraft([]); }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="btn-ghost"
        style={{ gap: 8, minWidth: 140 }}
      >
        {/* Site avatars */}
        <div style={{ display: 'flex', gap: -4 }}>
          {sites.slice(0, 3).map((s, i) => (
            <div
              key={s._id}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: siteColor(i),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 800,
                border: '2px solid var(--bg-2)',
                marginLeft: i > 0 ? -6 : 0,
                flexShrink: 0,
              }}
            >
              {s.code?.slice(0, 2)}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        {selectedIds?.length > 0 && (
          <span
            style={{
              background: 'var(--grad-primary)',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 7px',
            }}
          >
            {selectedIds.length}
          </span>
        )}
        <IconChevronDown size={14} />
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 300,
            minWidth: 300,
            padding: '8px 0',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '8px 14px 10px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>Select Sites</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={selectAll} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>All</button>
              <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Clear</button>
            </div>
          </div>

          {/* Site list */}
          <div style={{ maxHeight: 260, overflowY: 'auto', padding: '4px 0' }}>
            {sites.map((s, i) => {
              const checked = draft.length === 0 || draft.includes(s._id);
              const selected = draft.includes(s._id);
              return (
                <div
                  key={s._id}
                  onClick={() => toggle(s._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 14px',
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                    background: selected ? 'rgba(0,117,255,0.06)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = selected ? 'rgba(0,117,255,0.06)' : 'transparent'; }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: selected ? 'none' : '1px solid var(--line-2)',
                      background: selected ? 'var(--grad-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {selected && <IconCheck size={10} />}
                  </div>

                  {/* Avatar */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: siteColor(i),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {s.code?.slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.location}</div>
                  </div>

                  {/* Code + Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                    <span className="chip chip-blue" style={{ fontSize: 10 }}>{s.code}</span>
                    <span className={`chip ${s.status === 'active' ? 'chip-green' : 'chip-gray'}`} style={{ fontSize: 10 }}>
                      {s.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 14px 8px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn-ghost" style={{ padding: '6px 14px' }} onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" style={{ padding: '6px 16px' }} onClick={apply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { IconSettings, IconX } from './icons';

export default function TweaksPanel({ tweaks, setTweaks, onClose }) {
  function toggle(key) {
    setTweaks(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div
      className="card"
      style={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        width: 240,
        padding: '16px',
        zIndex: 500,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconSettings size={15} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Tweaks</span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>
          <IconX size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { key: 'hideSidebar', label: 'Hide Sidebar' },
          { key: 'compactCards', label: 'Compact Cards' },
          { key: 'monoMode', label: 'Mono Numbers' },
        ].map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{item.label}</span>
            <button
              onClick={() => toggle(item.key)}
              style={{
                width: 36,
                height: 20,
                borderRadius: 999,
                background: tweaks[item.key] ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: tweaks[item.key] ? 19 : 3,
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

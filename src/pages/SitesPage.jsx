import React from 'react';
import { fmtINR } from '../utils/format';
import { IconExternalLink } from '../components/icons';

const SITE_COLORS = [
  'var(--grad-primary)',
  'var(--grad-pink)',
  'var(--grad-green)',
  'var(--grad-amber)',
  'linear-gradient(135deg,#01B5EC 0%,#582CFF 100%)',
  'linear-gradient(135deg,#FFB547 0%,#01B574 100%)',
];

function SiteCard({ site, colorIdx, onToggle, isSelected }) {
  const burnColor = site.burnRate > 90 ? '#E31A1A' : site.burnRate > 70 ? '#FFB547' : '#01B574';

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        opacity: isSelected ? 1 : 0.55,
        transition: 'opacity 0.2s, transform 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      {/* Site header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: SITE_COLORS[colorIdx % SITE_COLORS.length],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {site.code?.slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {site.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{site.location}</div>
          <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
            <span className="chip chip-blue" style={{ fontSize: 10 }}>{site.code}</span>
            <span className={`chip ${site.status === 'active' ? 'chip-green' : 'chip-gray'}`} style={{ fontSize: 10 }}>
              {site.status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px' }}>
        {[
          { label: 'Budget', value: fmtINR(site.totalBudget), color: 'var(--ink)' },
          { label: 'Spent', value: fmtINR(site.spent), color: 'var(--ink)' },
          { label: 'Profit', value: fmtINR(site.profit), color: site.profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div className="num" style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Burn rate */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Burn Rate</span>
          <span className="num" style={{ fontSize: 11, fontWeight: 700, color: burnColor }}>
            {site.burnRate.toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, site.burnRate)}%`, background: burnColor }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-ghost"
          style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
          onClick={onToggle}
        >
          {isSelected ? 'Exclude' : 'Include'}
        </button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px' }}>
          <IconExternalLink size={12} />
          Open
        </button>
      </div>
    </div>
  );
}

export default function SitesPage({ stats, selectedIds, setSelectedIds }) {
  const { siteMetrics } = stats;

  function toggle(id) {
    setSelectedIds(prev => {
      if (!prev || prev.length === 0) return [id];
      if (prev.includes(id)) {
        const next = prev.filter(x => x !== id);
        return next.length === 0 ? [] : next;
      }
      return [...prev, id];
    });
  }

  const isSelected = (id) => !selectedIds || selectedIds.length === 0 || selectedIds.includes(id);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 2 }}>{siteMetrics.length} sites total</div>
        </div>
        <button
          className="btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setSelectedIds([])}
        >
          Show All
        </button>
      </div>

      {siteMetrics.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)' }}>
          No sites found. Add some sites first.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {siteMetrics.map((site, i) => (
            <SiteCard
              key={site._id}
              site={site}
              colorIdx={i}
              onToggle={() => toggle(site._id)}
              isSelected={isSelected(site._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

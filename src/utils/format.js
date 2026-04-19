/**
 * Compact INR formatter
 * ≥ 1 Cr → ₹X.XX Cr
 * ≥ 1 L  → ₹X.XX L
 * ≥ 1000 → ₹Xk
 * else   → ₹X
 */
export function fmtINR(value) {
  if (value == null || isNaN(value)) return '₹0';
  const n = Number(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    return sign + '₹' + (abs / 1_00_00_000).toFixed(2) + ' Cr';
  }
  if (abs >= 1_00_000) {
    return sign + '₹' + (abs / 1_00_000).toFixed(2) + ' L';
  }
  if (abs >= 1_000) {
    return sign + '₹' + (abs / 1_000).toFixed(1) + 'k';
  }
  return sign + '₹' + abs.toFixed(0);
}

/**
 * Full INR formatter with Indian grouping
 * e.g. ₹1,23,45,678
 */
export function fmtINRFull(value) {
  if (value == null || isNaN(value)) return '₹0';
  const n = Math.round(Number(value));
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const str = abs.toString();

  if (str.length <= 3) return sign + '₹' + str;

  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return sign + '₹' + grouped + ',' + last3;
}

/**
 * Format date as "DD Mon" e.g. "02 Apr"
 */
export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const mon = d.toLocaleString('en-IN', { month: 'short' });
  return `${day} ${mon}`;
}

/**
 * Format date as "DD Mon YYYY"
 */
export function fmtDateFull(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const mon = d.toLocaleString('en-IN', { month: 'short' });
  return `${day} ${mon} ${d.getFullYear()}`;
}

/**
 * Percentage delta display
 */
export function fmtDelta(pct) {
  if (pct == null || isNaN(pct)) return { text: '0.0%', up: true };
  return {
    text: Math.abs(pct).toFixed(1) + '%',
    up: pct >= 0,
  };
}

/**
 * Generate initials from a name
 */
export function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

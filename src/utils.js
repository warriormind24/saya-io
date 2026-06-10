export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function safeText(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

export function formatDateISO(d) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function toLocalDateInputValue(iso) {
  // iso expected like YYYY-MM-DD
  return String(iso).slice(0, 10);
}

export function formatHumanDate(iso) {
  try {
    const dt = new Date(iso);
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return iso;
  }
}


const KEY = 'saya_io_state_v1';

export function loadState() {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return normalize(parsed);
    } catch {
      // fall through
    }
  }

  return {
    version: 1,
    settings: {
      farmName: ''
    },
    fields: [],
    records: [],
    tasks: []
  };
}

function normalize(state) {
  return {
    version: 1,
    settings: state.settings && typeof state.settings === 'object' ? state.settings : { farmName: '' },
    fields: Array.isArray(state.fields) ? state.fields : [],
    records: Array.isArray(state.records) ? state.records : [],
    tasks: Array.isArray(state.tasks) ? state.tasks : []
  };
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportState() {
  return JSON.stringify(loadState(), null, 2);
}


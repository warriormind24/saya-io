const KEY_LOCAL = 'saya_io_state_v1';
const KEY_SESSION = 'saya_io_state_session_v1';

const STORAGE_MODE_KEY = 'saya_io_storage_mode_v1';
const DEFAULT_MODE = 'local'; // localStorage

export function getStorageMode() {
  return localStorage.getItem(STORAGE_MODE_KEY) || DEFAULT_MODE;
}

export function setStorageMode(mode) {
  localStorage.setItem(STORAGE_MODE_KEY, mode);
}

export function loadState() {
  const mode = getStorageMode();
  const key = mode === 'session' ? KEY_SESSION : KEY_LOCAL;

  const raw = (mode === 'session') ? sessionStorage.getItem(key) : localStorage.getItem(key);
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
  const mode = getStorageMode();
  const key = mode === 'session' ? KEY_SESSION : KEY_LOCAL;
  const raw = JSON.stringify(state);

  if (mode === 'session') sessionStorage.setItem(key, raw);
  else localStorage.setItem(key, raw);
}

export function exportState() {
  // Export from the active storage mode
  return JSON.stringify(loadState(), null, 2);
}

export function clearData() {
  // Clear both so "Reset all data" truly resets.
  localStorage.removeItem(KEY_LOCAL);
  sessionStorage.removeItem(KEY_SESSION);
}


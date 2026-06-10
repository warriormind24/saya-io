import { loadState, saveState } from './storage.js';
import { uid, formatDateISO, toLocalDateInputValue, safeText } from './utils.js';
import { renderDashboard, renderRecords, renderFields, renderTasks, bindCommonNav } from './views.js';


const els = {
  toast: document.getElementById('toast'),
  toastMsg: document.getElementById('toastMsg'),

  viewTitle: document.getElementById('viewTitle'),
  viewSubtitle: document.getElementById('viewSubtitle'),

  kpiFields: document.getElementById('kpiFields'),
  kpiCrops: document.getElementById('kpiCrops'),
  kpiRecords: document.getElementById('kpiRecords'),
  kpiTasks: document.getElementById('kpiTasks'),
  farmPill: document.getElementById('farmPill'),
  recentList: document.getElementById('recentList'),

  recordFieldId: document.getElementById('recordFieldId'),
  recordType: document.getElementById('recordType'),
  recordDate: document.getElementById('recordDate'),
  recordNotes: document.getElementById('recordNotes'),
  recordSaveBtn: document.getElementById('recordSaveBtn'),
  recordResetBtn: document.getElementById('recordResetBtn'),
  recordList: document.getElementById('recordList'),
  btnAddRecord: document.getElementById('btnAddRecord'),

  fieldName: document.getElementById('fieldName'),
  fieldCrop: document.getElementById('fieldCrop'),
  fieldSeason: document.getElementById('fieldSeason'),
  fieldSaveBtn: document.getElementById('fieldSaveBtn'),
  fieldResetBtn: document.getElementById('fieldResetBtn'),
  fieldList: document.getElementById('fieldList'),
  btnAddField: document.getElementById('btnAddField'),

  taskFieldId: document.getElementById('taskFieldId'),
  taskType: document.getElementById('taskType'),
  taskDueDate: document.getElementById('taskDueDate'),
  taskPriority: document.getElementById('taskPriority'),
  taskNotes: document.getElementById('taskNotes'),
  taskSaveBtn: document.getElementById('taskSaveBtn'),
  taskResetBtn: document.getElementById('taskResetBtn'),
  taskList: document.getElementById('taskList'),
  btnAddTaskInline: document.getElementById('btnAddTaskInline'),

  farmName: document.getElementById('farmName'),
  farmSaveBtn: document.getElementById('farmSaveBtn'),
  dataResetBtn: document.getElementById('dataResetBtn'),

  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
  btnAddTask: document.getElementById('btnAddTask'),
  goFields: document.getElementById('goFields'),
  goRecords: document.getElementById('goRecords'),
  goTasks: document.getElementById('goTasks')
};

const state = loadState();
let currentView = 'dashboard';

function toast(msg) {
  els.toastMsg.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove('show'), 2400);
}

function setActiveView(view) {
  currentView = view;
  // Hide all
  for (const v of ['dashboard', 'records', 'fields', 'tasks', 'settings']) {
    const node = document.getElementById(`view-${v}`);
    if (node) node.style.display = (v === view) ? '' : 'none';
  }

  const titleMap = {
    dashboard: ['Dashboard', 'Quick summary and next actions'],
    records: ['Records', 'Log events for fields: planting, spraying, harvesting, notes.'],
    fields: ['Fields', 'Create fields and assign crop information.'],
    tasks: ['Tasks', 'Track farming work items and completion.'],
    settings: ['Settings', 'Local-only demo: data is stored in your browser (localStorage).']
  };

  els.viewTitle.textContent = titleMap[view][0];
  els.viewSubtitle.textContent = titleMap[view][1];

  renderAll();
}

function renderAll() {
  // settings inputs
  els.farmName.value = state.settings.farmName || '';

  if (currentView === 'dashboard') {
    renderDashboard({ state, els });
  } else if (currentView === 'records') {
    renderRecords({ state, els });
  } else if (currentView === 'fields') {
    renderFields({ state, els });
  } else if (currentView === 'tasks') {
    renderTasks({ state, els });
  } else if (currentView === 'settings') {
    // nothing else to render
  }
}

function hydrateFormDefaults() {
  const today = formatDateISO(new Date());
  if (!els.recordDate.value) els.recordDate.value = toLocalDateInputValue(today);
  if (!els.taskDueDate.value) els.taskDueDate.value = toLocalDateInputValue(today);
}

// NAV + quick actions
bindCommonNav({
  els,
  state,
  onSelect: (view) => setActiveView(view)
});

els.btnAddField.addEventListener('click', () => setActiveView('fields'));
els.btnAddRecord?.addEventListener('click', () => setActiveView('records'));
els.btnAddTaskInline?.addEventListener('click', () => setActiveView('tasks'));
els.btnAddTask?.addEventListener('click', () => setActiveView('tasks'));
els.goFields?.addEventListener('click', () => setActiveView('fields'));
els.goRecords?.addEventListener('click', () => setActiveView('records'));
els.goTasks?.addEventListener('click', () => setActiveView('tasks'));

// Create Field
els.fieldSaveBtn.addEventListener('click', () => {
  const name = safeText(els.fieldName.value);
  const crop = safeText(els.fieldCrop.value);
  const season = safeText(els.fieldSeason.value);

  if (!name || !crop || !season) return toast('Fill field name, crop, and season');

  state.fields.unshift({ id: uid('field'), name, crop, season, createdAt: new Date().toISOString() });
  els.fieldName.value = '';
  els.fieldCrop.value = '';
  els.fieldSeason.value = '';
  saveState(state);
  toast('Field saved');
  setActiveView('fields');
});

els.fieldResetBtn.addEventListener('click', () => {
  els.fieldName.value = '';
  els.fieldCrop.value = '';
  els.fieldSeason.value = '';
});

// Create Record
function ensureRecordFieldOptions() {
  if (!state.fields.length) {
    toast('Add a field first');
    setActiveView('fields');
    return false;
  }
  return true;
}

els.recordSaveBtn.addEventListener('click', () => {
  if (!ensureRecordFieldOptions()) return;

  const fieldId = els.recordFieldId.value;
  const type = els.recordType.value;
  const date = els.recordDate.value ? new Date(els.recordDate.value).toISOString() : new Date().toISOString();
  const notes = safeText(els.recordNotes.value);

  state.records.unshift({
    id: uid('rec'),
    fieldId,
    type,
    dateISO: date,
    notes,
    createdAt: new Date().toISOString()
  });

  els.recordNotes.value = '';
  saveState(state);
  toast('Record saved');
  setActiveView('records');
});

els.recordResetBtn.addEventListener('click', () => {
  els.recordType.value = 'planting';
  hydrateFormDefaults();
  els.recordNotes.value = '';
});

// Create Task
els.taskSaveBtn.addEventListener('click', () => {
  if (!ensureRecordFieldOptions()) return;

  const fieldId = els.taskFieldId.value;
  const type = els.taskType.value;
  const dueISO = els.taskDueDate.value ? new Date(els.taskDueDate.value).toISOString() : new Date().toISOString();
  const priority = els.taskPriority.value;
  const notes = safeText(els.taskNotes.value);

  state.tasks.unshift({
    id: uid('task'),
    fieldId,
    type,
    dueISO,
    priority,
    notes,
    done: false,
    createdAt: new Date().toISOString()
  });

  els.taskNotes.value = '';
  saveState(state);
  toast('Task saved');
  setActiveView('tasks');
});

els.taskResetBtn.addEventListener('click', () => {
  els.taskType.value = 'weed';
  hydrateFormDefaults();
  els.taskPriority.value = 'medium';
  els.taskNotes.value = '';
});

// Settings
els.farmSaveBtn.addEventListener('click', () => {
  state.settings.farmName = safeText(els.farmName.value);
  saveState(state);
  toast('Settings saved');
  setActiveView('dashboard');
});

els.dataResetBtn.addEventListener('click', () => {
  const ok = confirm('Reset all data stored in this browser?');
  if (!ok) return;
  localStorage.removeItem('saya_io_state_v1');
  location.reload();
});

els.exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'saya-io-export.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

els.importBtn.addEventListener('click', () => els.importFile.click());

els.importFile.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const imported = JSON.parse(text);
    if (!imported || typeof imported !== 'object') throw new Error('Invalid JSON');
    state.fields = Array.isArray(imported.fields) ? imported.fields : [];
    state.records = Array.isArray(imported.records) ? imported.records : [];
    state.tasks = Array.isArray(imported.tasks) ? imported.tasks : [];
    state.settings = imported.settings && typeof imported.settings === 'object' ? imported.settings : { farmName: '' };
    saveState(state);
    toast('Import successful');
    setActiveView('dashboard');
  } catch {
    toast('Import failed: invalid JSON');
  } finally {
    els.importFile.value = '';
  }
});

// Init
hydrateFormDefaults();
setActiveView('dashboard');
renderAll();

// Task completion toggles + record delete are handled inside views via event delegation


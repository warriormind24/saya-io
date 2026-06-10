import { formatHumanDate } from './utils.js';
import { saveState } from './storage.js';

function fieldById(state, id) {
  return state.fields.find(f => f.id === id);
}

function recordLabel(type) {
  const map = {
    planting: 'Planting',
    irrigation: 'Irrigation',
    spraying: 'Spraying',
    fertilizing: 'Fertilizing',
    harvesting: 'Harvesting',
    other: 'Other'
  };
  return map[type] || type;
}

function taskLabel(type) {
  const map = {
    weed: 'Weeding',
    spray: 'Spray chemicals',
    fertilize: 'Fertilize',
    irrigate: 'Irrigate',
    inspect: 'Inspection',
    harvest: 'Harvest',
    other: 'Other'
  };
  return map[type] || type;
}

export function bindCommonNav({ els, onSelect }) {
  const tabs = Array.from(document.querySelectorAll('nav .tab[data-view]'));

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      onSelect(tab.dataset.view);
    });

    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });

  // Global delegation for delete + toggle done
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (!els.state) return;

    // Record delete
    const delRec = t.closest('[data-action="delete-record"]');
    if (delRec) {
      const id = delRec.getAttribute('data-id');
      if (!id) return;
      const ok = confirm('Delete this record?');
      if (!ok) return;
      els.state.records = els.state.records.filter(r => r.id !== id);
      saveState(els.state);
      if (document.getElementById('view-records')?.style.display !== 'none') {
        renderRecords({ state: els.state, els });
      }
      renderDashboard({ state: els.state, els });
      return;
    }

    // Task toggle
    const togTask = t.closest('[data-action="toggle-task"]');
    if (togTask) {
      const id = togTask.getAttribute('data-id');
      const task = els.state.tasks.find(x => x.id === id);
      if (!task) return;
      task.done = !task.done;
      saveState(els.state);
      if (document.getElementById('view-tasks')?.style.display !== 'none') {
        renderTasks({ state: els.state, els });
      }
      renderDashboard({ state: els.state, els });
      return;
    }

    // Task delete
    const delTask = t.closest('[data-action="delete-task"]');
    if (delTask) {
      const id = delTask.getAttribute('data-id');
      const ok = confirm('Delete this task?');
      if (!ok) return;
      els.state.tasks = els.state.tasks.filter(r => r.id !== id);
      saveState(els.state);
      if (document.getElementById('view-tasks')?.style.display !== 'none') {
        renderTasks({ state: els.state, els });
      }
      renderDashboard({ state: els.state, els });
    }
  });
}

export function renderDashboard({ state, els }) {
  els.state = state;

  const fieldsCount = state.fields.length;
  const cropsCount = new Set(state.fields.map(f => f.crop)).size;
  const recordsCount = state.records.length;
  const openTasks = state.tasks.filter(t => !t.done).length;

  els.kpiFields.textContent = String(fieldsCount);
  els.kpiCrops.textContent = String(cropsCount);
  els.kpiRecords.textContent = String(recordsCount);
  els.kpiTasks.textContent = String(openTasks);

  const farmName = state.settings?.farmName?.trim();
  els.farmPill.textContent = farmName ? farmName : 'No farm yet';

  const recItems = state.records
    .slice()
    .sort((a, b) => (b.dateISO || b.createdAt).localeCompare(a.dateISO || a.createdAt))
    .slice(0, 4)
    .map(r => {
      const f = fieldById(state, r.fieldId);
      return {
        title: `${recordLabel(r.type)} • ${f ? f.name : 'Unknown field'}`,
        meta: `${formatHumanDate(r.dateISO || r.createdAt)} — ${r.notes ? r.notes.slice(0, 90) : 'No notes'}`
      };
    });

  const taskItems = state.tasks
    .slice()
    .sort((a, b) => (b.dueISO || b.createdAt).localeCompare(a.dueISO || a.createdAt))
    .slice(0, 3)
    .map(t => {
      const f = fieldById(state, t.fieldId);
      return {
        title: `${taskLabel(t.type)} • ${f ? f.name : 'Unknown field'}`,
        meta: `Due: ${formatHumanDate(t.dueISO)} • Priority: ${t.priority || 'medium'}${t.done ? ' • Done' : ''}`
      };
    });

  const merged = [...recItems, ...taskItems].slice(0, 6);

  if (!merged.length) {
    els.recentList.innerHTML = `
      <div class="item">
        <h3>Nothing yet</h3>
        <div class="meta">Create your first field, record, or task to see activity here.</div>
      </div>
    `;
    return;
  }

  els.recentList.innerHTML = merged
    .map(x => `
      <div class="item">
        <h3>${escapeHtml(x.title)}</h3>
        <div class="meta">${escapeHtml(x.meta)}</div>
      </div>
    `)
    .join('');
}

export function renderRecords({ state, els }) {
  els.state = state;

  const fieldOptions = state.fields
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(f => `<option value="${f.id}">${escapeHtml(f.name)} • ${escapeHtml(f.crop)} • ${escapeHtml(f.season)}</option>`)
    .join('');

  els.recordFieldId.innerHTML = fieldOptions;

  if (!state.fields.length) {
    els.recordList.innerHTML = `
      <div class="item">
        <h3>No fields found</h3>
        <div class="meta">Add a field first so records can be attached to it.</div>
      </div>
    `;
    return;
  }

  if (!els.recordFieldId.value) els.recordFieldId.value = state.fields[0].id;

  const list = state.records
    .slice()
    .sort((a, b) => (b.dateISO || b.createdAt).localeCompare(a.dateISO || a.createdAt));

  if (!list.length) {
    els.recordList.innerHTML = `
      <div class="item">
        <h3>No records yet</h3>
        <div class="meta">Log events like planting, spraying, irrigating, fertilizing, or harvesting.</div>
      </div>
    `;
    return;
  }

  els.recordList.innerHTML = list
    .map(r => {
      const f = fieldById(state, r.fieldId);
      return `
        <div class="item">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <div>
              <h3>${escapeHtml(recordLabel(r.type))} • ${escapeHtml(f ? f.name : 'Unknown field')}</h3>
              <div class="meta">${escapeHtml(formatHumanDate(r.dateISO || r.createdAt))} — ${escapeHtml(r.notes || '') || 'No notes'}</div>
            </div>
            <button type="button" data-action="delete-record" data-id="${r.id}" class="danger" style="padding:8px 10px">Delete</button>
          </div>
        </div>
      `;
    })
    .join('');
}

export function renderFields({ state, els }) {
  els.state = state;

  const list = state.fields
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (!list.length) {
    els.fieldList.innerHTML = `
      <div class="item">
        <h3>No fields yet</h3>
        <div class="meta">Add your first field to start recording farming activities.</div>
      </div>
    `;
    return;
  }

  els.fieldList.innerHTML = list
    .map(f => {
      const recCount = state.records.filter(r => r.fieldId === f.id).length;
      const taskOpen = state.tasks.filter(t => t.fieldId === f.id && !t.done).length;
      return `
        <div class="item">
          <h3>${escapeHtml(f.name)} • ${escapeHtml(f.crop)}</h3>
          <div class="meta">
            Season: ${escapeHtml(f.season)}<br/>
            Records: ${recCount}<br/>
            Open tasks: ${taskOpen}
          </div>
        </div>
      `;
    })
    .join('');
}

export function renderTasks({ state, els }) {
  els.state = state;

  // populate task field select
  const fieldOptions = state.fields
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(f => `<option value="${f.id}">${escapeHtml(f.name)} • ${escapeHtml(f.crop)} • ${escapeHtml(f.season)}</option>`)
    .join('');

  els.taskFieldId.innerHTML = fieldOptions;
  if (state.fields.length && !els.taskFieldId.value) els.taskFieldId.value = state.fields[0].id;

  const list = state.tasks
    .slice()
    .sort((a, b) => (a.done === b.done ? (b.dueISO || b.createdAt).localeCompare(a.dueISO || a.createdAt) : a.done ? 1 : -1));

  if (!state.fields.length) {
    els.taskList.innerHTML = `
      <div class="item">
        <h3>No fields found</h3>
        <div class="meta">Add a field first so tasks can be attached to it.</div>
      </div>
    `;
    return;
  }

  if (!list.length) {
    els.taskList.innerHTML = `
      <div class="item">
        <h3>No tasks yet</h3>
        <div class="meta">Use tasks to plan work: weeding, spraying, irrigation, fertilizing, inspections, harvesting.</div>
      </div>
    `;
    return;
  }

  els.taskList.innerHTML = list
    .map(t => {
      const f = fieldById(state, t.fieldId);
      const done = !!t.done;
      return `
        <div class="item" style="opacity:${done ? 0.75 : 1}">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <div>
              <h3>${escapeHtml(taskLabel(t.type))} • ${escapeHtml(f ? f.name : 'Unknown field')}</h3>
              <div class="meta">
                Due: ${escapeHtml(formatHumanDate(t.dueISO))}<br/>
                Priority: ${escapeHtml(t.priority || 'medium')}<br/>
                ${t.notes ? escapeHtml(t.notes) : 'No notes'}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
              <button type="button" data-action="toggle-task" data-id="${t.id}" style="padding:8px 10px">
                ${done ? 'Mark open' : 'Mark done'}
              </button>
              <button type="button" data-action="delete-task" data-id="${t.id}" class="danger" style="padding:8px 10px">Delete</button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}


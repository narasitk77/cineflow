// ===== CINEFLOW PROJECT.JS — All Module Logic =====

let projectId = null;
let currentModule = 'overview';
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

// ---- DATA ----
function getProjects() { return JSON.parse(localStorage.getItem('cf_projects') || '[]'); }
function saveProjects(p) { localStorage.setItem('cf_projects', JSON.stringify(p)); }
function getProject() { return getProjects().find(p => p.id === projectId) || null; }
window.getProject = getProject;
window.getProjects = getProjects;
window.saveProjects = saveProjects;
function updateProject(updater) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === projectId);
  if (idx === -1) return;
  updater(projects[idx]);
  saveProjects(projects);
}
window.updateProject = updateProject;

// ---- MODAL ----
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ---- STATUS LABELS ----
const statusLabels = { development:'Development', active:'Pre-Production', production:'Production', post:'Post-Production', completed:'Completed' };

// ---- MODULE SWITCHER ----
function switchModule(mod) {
  currentModule = mod;
  document.querySelectorAll('.module-view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mobile-drawer-item').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + mod)?.classList.remove('hidden');
  document.getElementById('mod-' + mod)?.classList.add('active');
  document.getElementById('tab-' + mod)?.classList.add('active');
  document.getElementById('drawer-' + mod)?.classList.add('active');
  renderModule(mod);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchModule = switchModule;

function renderModule(mod) {
  switch(mod) {
    case 'overview':   renderOverview(); break;
    case 'script':     renderScript(); break;
    case 'breakdown':  renderBreakdown(); break;
    case 'shotlist':   renderShotList(); break;
    case 'callsheet':  renderCallSheet(); break;
    case 'calendar':   renderCalendar(); break;
    case 'contacts':   renderContacts(); break;
    case 'tasks':      renderTasks(); break;
    case 'moodboard':  renderMoodboard(); break;
    case 'stripboard': if (typeof renderStripboard === 'function') renderStripboard(); break;
    case 'storyboard': if (typeof renderStoryboard === 'function') renderStoryboard(); break;
    case 'media':      if (typeof renderMediaLibrary === 'function') renderMediaLibrary(); break;
    case 'reports':    if (typeof renderReports === 'function') renderReports(); break;
  }
}

// ============================================================
// OVERVIEW MODULE
// ============================================================
function renderOverview() {
  const p = getProject();
  if (!p) return;
  const el = document.getElementById('view-overview');
  const totalTasks = (p.tasks?.todo?.length||0)+(p.tasks?.inProgress?.length||0)+(p.tasks?.done?.length||0);
  const doneTasks = p.tasks?.done?.length||0;
  const progress = totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0;
  el.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT: details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Project Info Card -->
        <div class="bg-dark-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div class="h-2" style="background:${p.color}"></div>
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">${p.type}</div>
                <h1 class="text-2xl font-bold">${p.title}</h1>
                ${p.director ? `<p class="text-gray-400 text-sm mt-1">Directed by <span class="text-gray-300 font-medium">${p.director}</span></p>` : ''}
              </div>
              <span class="status-badge status-${p.status}">${statusLabels[p.status]||p.status}</span>
            </div>
            ${(p.startDate||p.endDate) ? `
            <div class="mt-4 flex items-center gap-4 text-sm text-gray-400">
              ${p.startDate ? `<span>📅 Start: <span class="text-gray-300">${formatDate(p.startDate)}</span></span>` : ''}
              ${p.endDate ? `<span>🏁 End: <span class="text-gray-300">${formatDate(p.endDate)}</span></span>` : ''}
            </div>` : ''}
          </div>
        </div>
        <!-- Google Workspace Quick Actions -->
        ${isGwsConfigured() ? `
        <div class="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg>
              <h3 class="font-semibold text-sm">Google Workspace Quick Actions</h3>
            </div>
            <span class="text-xs text-gray-500">${isGwsConnected() ? '● Connected' : 'Click to sign in'}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onclick="gwsExportProjectToDrive(getProject())" class="bg-dark-900 hover:bg-dark-800 border border-gray-800 hover:border-gray-700 rounded-lg p-3 text-left transition-colors">
              <div class="text-base mb-1">📁</div>
              <div class="text-xs font-semibold text-gray-300">Drive</div>
              <div class="text-xs text-gray-600">Export bundle</div>
            </button>
            <button onclick="gwsSyncCalendarToGoogle(getProject())" class="bg-dark-900 hover:bg-dark-800 border border-gray-800 hover:border-gray-700 rounded-lg p-3 text-left transition-colors">
              <div class="text-base mb-1">📅</div>
              <div class="text-xs font-semibold text-gray-300">Calendar</div>
              <div class="text-xs text-gray-600">Sync events</div>
            </button>
            <button onclick="gwsEmailCallSheet(getProject())" class="bg-dark-900 hover:bg-dark-800 border border-gray-800 hover:border-gray-700 rounded-lg p-3 text-left transition-colors">
              <div class="text-base mb-1">📧</div>
              <div class="text-xs font-semibold text-gray-300">Gmail</div>
              <div class="text-xs text-gray-600">Send call sheet</div>
            </button>
            <button onclick="gwsExportScriptToDoc(getProject())" class="bg-dark-900 hover:bg-dark-800 border border-gray-800 hover:border-gray-700 rounded-lg p-3 text-left transition-colors">
              <div class="text-base mb-1">📝</div>
              <div class="text-xs font-semibold text-gray-300">Docs</div>
              <div class="text-xs text-gray-600">Export script</div>
            </button>
          </div>
        </div>` : `
        <div class="bg-dark-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div class="text-2xl">🔗</div>
          <div class="flex-1">
            <div class="font-semibold text-sm">Connect Google Workspace</div>
            <div class="text-xs text-gray-500">Enable Drive, Calendar, Gmail & Docs integration</div>
          </div>
          <button onclick="showSettingsModal()" class="btn btn-secondary btn-sm">Connect</button>
        </div>`}

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${quickStat('✍️','Script Pages', p.script?.filter(l=>l.type==='action'||l.type==='dialogue').length||0, 'lines', '#0ea5e9', 'script')}
          ${quickStat('🎬','Shots', p.shotList?.length||0, 'shots', '#8b5cf6', 'shotlist')}
          ${quickStat('👥','Contacts', p.contacts?.length||0, 'people', '#10b981', 'contacts')}
          ${quickStat('✅','Tasks', doneTasks+'/'+totalTasks, 'done', '#f59e0b', 'tasks')}
        </div>
        <!-- Progress -->
        <div class="bg-dark-900 border border-gray-800 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold">Production Progress</h3>
            <span class="text-sm text-brand-400 font-bold">${progress}%</span>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-2.5">
            <div class="h-2.5 rounded-full transition-all duration-700" style="width:${progress}%;background:${p.color}"></div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
            <div class="bg-dark-800 rounded-lg p-2"><div class="text-yellow-400 font-bold text-sm">${p.tasks?.todo?.length||0}</div>To Do</div>
            <div class="bg-dark-800 rounded-lg p-2"><div class="text-blue-400 font-bold text-sm">${p.tasks?.inProgress?.length||0}</div>In Progress</div>
            <div class="bg-dark-800 rounded-lg p-2"><div class="text-green-400 font-bold text-sm">${doneTasks}</div>Done</div>
          </div>
        </div>
        <!-- Recent Tasks -->
        ${renderOverviewTasks(p)}
      </div>
      <!-- RIGHT: quick access + calendar events -->
      <div class="space-y-4">
        <!-- Quick Access -->
        <div class="bg-dark-900 border border-gray-800 rounded-2xl p-4">
          <h3 class="font-semibold text-sm mb-3 text-gray-400 uppercase tracking-wider">Quick Access</h3>
          <div class="space-y-2">
            ${moduleLink('✍️','Script Writer','Write & format your screenplay','script')}
            ${moduleLink('📋','Script Breakdown','Tag props, cast, costumes','breakdown')}
            ${moduleLink('🎬','Shot List','Plan your shots','shotlist')}
            ${moduleLink('📄','Call Sheet','Build call sheets','callsheet')}
            ${moduleLink('📅','Calendar','Production timeline','calendar')}
            ${moduleLink('👥','Contacts','Cast & crew contacts','contacts')}
            ${moduleLink('✅','Task Board','Kanban task management','tasks')}
            ${moduleLink('🎨','Moodboard','Visual inspiration','moodboard')}
          </div>
        </div>
        <!-- Upcoming Events -->
        ${renderUpcomingEvents(p)}
      </div>
    </div>
  `;
}

function quickStat(icon, label, val, unit, color, mod) {
  return `<div onclick="switchModule('${mod}')" class="bg-dark-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-colors">
    <div class="text-xl mb-1">${icon}</div>
    <div class="text-2xl font-bold" style="color:${color}">${val}</div>
    <div class="text-xs text-gray-500 mt-0.5">${unit}</div>
    <div class="text-xs text-gray-600 mt-1">${label}</div>
  </div>`;
}

function moduleLink(icon, title, desc, mod) {
  return `<button onclick="switchModule('${mod}')" class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-dark-800 text-left transition-colors group">
    <span class="text-lg w-7">${icon}</span>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium group-hover:text-white transition-colors">${title}</div>
      <div class="text-xs text-gray-600">${desc}</div>
    </div>
    <svg class="w-3 h-3 text-gray-700 group-hover:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
  </button>`;
}

function renderOverviewTasks(p) {
  const pending = [...(p.tasks?.todo||[]),...(p.tasks?.inProgress||[])].slice(0,4);
  if (!pending.length) return '';
  return `<div class="bg-dark-900 border border-gray-800 rounded-2xl p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Pending Tasks</h3>
      <button onclick="switchModule('tasks')" class="text-xs text-brand-400 hover:text-brand-300">View all →</button>
    </div>
    <div class="space-y-2">
      ${pending.map(t=>`<div class="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
        <div class="w-2 h-2 rounded-full ${t.priority==='high'?'bg-red-400':t.priority==='medium'?'bg-yellow-400':'bg-gray-600'}"></div>
        <span class="text-sm flex-1">${t.title}</span>
        ${t.due?`<span class="text-xs text-gray-600">${formatDate(t.due)}</span>`:''}
      </div>`).join('')}
    </div>
  </div>`;
}

function renderUpcomingEvents(p) {
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = (p.calendar||[]).filter(e=>new Date(e.date+'T00:00:00')>=today).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,5);
  return `<div class="bg-dark-900 border border-gray-800 rounded-2xl p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-sm">Upcoming Events</h3>
      <button onclick="switchModule('calendar')" class="text-xs text-brand-400">View →</button>
    </div>
    ${upcoming.length===0?`<p class="text-xs text-gray-600 py-2">No upcoming events. <button onclick="switchModule('calendar')" class="text-brand-400 hover:underline">Add one →</button></p>`:
    upcoming.map(e=>`<div class="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style="background:${calEventColor(e.type)}22;color:${calEventColor(e.type)}">${new Date(e.date+'T00:00:00').getDate()}</div>
      <div><div class="text-xs font-medium text-gray-300">${e.title}</div><div class="text-xs text-gray-600">${formatDate(e.date)}</div></div>
    </div>`).join('')}
  </div>`;
}

// ============================================================
// SCRIPT WRITER MODULE
// ============================================================
function renderScript() {
  const p = getProject();
  if (!p) return;
  const el = document.getElementById('view-script');
  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold">Script Writer</h2>
        <p class="text-xs text-gray-500 mt-0.5">Industry-standard screenplay formatting</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-600" id="scriptWordCount">0 lines</span>
        <div class="flex gap-1 bg-dark-900 border border-gray-700 rounded-lg p-1">
          <button onclick="addScriptLine('scene')" class="px-2 py-1 text-xs rounded font-mono text-blue-400 hover:bg-dark-800" title="Scene Heading">INT/EXT</button>
          <button onclick="addScriptLine('action')" class="px-2 py-1 text-xs rounded text-gray-300 hover:bg-dark-800" title="Action">Action</button>
          <button onclick="addScriptLine('character')" class="px-2 py-1 text-xs rounded text-yellow-400 hover:bg-dark-800" title="Character">Char.</button>
          <button onclick="addScriptLine('dialogue')" class="px-2 py-1 text-xs rounded text-green-400 hover:bg-dark-800" title="Dialogue">Dialog</button>
          <button onclick="addScriptLine('parenthetical')" class="px-2 py-1 text-xs rounded text-purple-400 hover:bg-dark-800" title="Parenthetical">Paren.</button>
          <button onclick="addScriptLine('transition')" class="px-2 py-1 text-xs rounded text-red-400 hover:bg-dark-800" title="Transition">Trans.</button>
        </div>
      </div>
    </div>
    <!-- Script Paper -->
    <div class="bg-dark-900 border border-gray-700 rounded-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-dark-950">
        <span class="text-xs text-gray-600 font-mono">${p.title.toUpperCase()}</span>
        <div class="flex gap-2">
          <button onclick="exportScript()" class="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export TXT
          </button>
          <button onclick="showImportDialog('script')" class="text-xs text-gray-500 hover:text-brand-400 flex items-center gap-1" title="Import from Google Docs">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Import Doc
          </button>
          <button onclick="gwsExportScriptToDoc(getProject())" class="text-xs text-gray-500 hover:text-brand-400 flex items-center gap-1" title="Export to Google Docs">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export to Docs
          </button>
        </div>
      </div>
      <div id="scriptBody" class="p-6 md:p-10 min-h-screen max-w-3xl mx-auto space-y-0.5" style="background:#111827">
        ${renderScriptLines(p.script)}
      </div>
    </div>
    <div class="text-center mt-4">
      <button onclick="addScriptLine('scene')" class="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 mx-auto">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add line
      </button>
    </div>
  `;
  updateScriptWordCount();
}

function renderScriptLines(lines) {
  if (!lines || lines.length === 0) {
    return `<div class="text-center py-12 text-gray-600">
      <p class="mb-2 text-sm">Your script is empty.</p>
      <p class="text-xs">Use the buttons above to add scenes, action, and dialogue.</p>
    </div>`;
  }
  return lines.map((line, i) => renderScriptLine(line, i)).join('');
}

function renderScriptLine(line, i) {
  const typeConfig = {
    scene: { class: 'scene-heading', label: 'Scene', color: '#60a5fa', mt: 'mt-6' },
    action: { class: 'action', label: 'Action', color: '#9ca3af', mt: 'mt-2' },
    character: { class: 'character', label: 'Char.', color: '#fbbf24', mt: 'mt-4' },
    dialogue: { class: 'dialogue', label: 'Dialog', color: '#86efac', mt: 'mt-1' },
    parenthetical: { class: 'parenthetical', label: 'Paren.', color: '#c084fc', mt: 'mt-0' },
    transition: { class: 'transition', label: 'Trans.', color: '#f87171', mt: 'mt-6' }
  };
  const cfg = typeConfig[line.type] || typeConfig.action;
  const isDialogue = line.type === 'dialogue';
  const isCharacter = line.type === 'character';
  const isParenthetical = line.type === 'parenthetical';
  const isScene = line.type === 'scene';
  const isTransition = line.type === 'transition';
  const indent = isDialogue || isCharacter || isParenthetical ? '200px' : '0';
  const maxW = isDialogue ? '320px' : isParenthetical ? '260px' : isCharacter ? '100%' : '100%';
  const textAlign = isCharacter || isTransition ? 'center' : isTransition ? 'right' : 'left';
  const textTransform = isScene || isCharacter || isTransition ? 'uppercase' : 'none';
  const fontWeight = isScene || isCharacter ? 'bold' : 'normal';
  return `
    <div class="script-line group ${cfg.mt}" data-index="${i}" data-type="${line.type}">
      <div class="flex items-start gap-2">
        <div class="flex-shrink-0 w-8 text-right pt-1.5">
          <span class="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity" style="color:${cfg.color}">${i+1}</span>
        </div>
        <div class="flex-1" style="padding-left:${indent}">
          <textarea
            onblur="saveScriptLine(${i}, this.value)"
            onkeydown="scriptKeyDown(event, ${i})"
            oninput="autoResizeTextarea(this)"
            class="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
            style="color:${cfg.color};font-family:'Courier New',monospace;font-weight:${fontWeight};text-transform:${textTransform};text-align:${textAlign};max-width:${maxW};min-height:24px;overflow:hidden"
            rows="1"
          >${escapeHtml(line.text)}</textarea>
        </div>
        <div class="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
          <button onclick="changeLineType(${i})" class="text-xs px-1.5 py-0.5 rounded text-gray-600 hover:text-gray-300 hover:bg-dark-800" title="Change type" style="font-size:10px">${cfg.label}</button>
          <button onclick="deleteScriptLine(${i})" class="text-red-600 hover:text-red-400 p-0.5 rounded" title="Delete">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>`;
}

function addScriptLine(type) {
  const p = getProject();
  if (!p) return;
  updateProject(proj => {
    if (!proj.script) proj.script = [];
    const defaultText = {
      scene: 'INT. LOCATION - DAY',
      action: '',
      character: 'CHARACTER NAME',
      dialogue: '',
      parenthetical: '(beat)',
      transition: 'CUT TO:'
    };
    proj.script.push({ type, text: defaultText[type] || '' });
  });
  renderScript();
  // focus last textarea
  setTimeout(() => {
    const textareas = document.querySelectorAll('#scriptBody textarea');
    const last = textareas[textareas.length-1];
    if (last) { last.focus(); last.select(); autoResizeTextarea(last); }
  }, 50);
}

function saveScriptLine(i, val) {
  updateProject(p => {
    if (p.script && p.script[i] !== undefined) p.script[i].text = val;
  });
  updateScriptWordCount();
}

function deleteScriptLine(i) {
  updateProject(p => { if (p.script) p.script.splice(i, 1); });
  renderScript();
}

function changeLineType(i) {
  const types = ['scene','action','character','dialogue','parenthetical','transition'];
  const p = getProject();
  if (!p || !p.script[i]) return;
  const cur = types.indexOf(p.script[i].type);
  const next = types[(cur+1)%types.length];
  updateProject(proj => { proj.script[i].type = next; });
  renderScript();
}

function scriptKeyDown(e, i) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const p = getProject();
    const curType = p?.script?.[i]?.type || 'action';
    const nextType = curType === 'scene' ? 'action' : curType === 'character' ? 'dialogue' : curType === 'dialogue' ? 'character' : 'action';
    updateProject(proj => {
      if (!proj.script) proj.script = [];
      proj.script.splice(i+1, 0, { type: nextType, text: '' });
    });
    renderScript();
    setTimeout(() => {
      const textareas = document.querySelectorAll('#scriptBody textarea');
      if (textareas[i+1]) { textareas[i+1].focus(); autoResizeTextarea(textareas[i+1]); }
    }, 50);
  }
}

function autoResizeTextarea(ta) {
  ta.style.height = 'auto';
  ta.style.height = (ta.scrollHeight) + 'px';
}

function updateScriptWordCount() {
  const p = getProject();
  const count = p?.script?.length || 0;
  const el = document.getElementById('scriptWordCount');
  if (el) el.textContent = count + ' lines';
}

function exportScript() {
  const p = getProject();
  if (!p) return;
  const lines = (p.script||[]).map(l => {
    const prefix = l.type === 'scene' ? '\n\n' : l.type === 'character' ? '\n\n          ' : l.type === 'dialogue' ? '          ' : l.type === 'parenthetical' ? '     ' : l.type === 'transition' ? '\n                    ' : '';
    return prefix + (l.text||'');
  }).join('\n');
  const blob = new Blob([p.title.toUpperCase() + '\n\n' + lines], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = p.title.replace(/\s+/g,'-') + '.txt';
  a.click();
}

// ============================================================
// BREAKDOWN MODULE
// ============================================================
const BREAKDOWN_CATEGORIES = [
  { key:'cast', label:'Cast', color:'#ef4444', bg:'rgba(239,68,68,0.15)' },
  { key:'extras', label:'Extras/BG', color:'#f97316', bg:'rgba(249,115,22,0.15)' },
  { key:'props', label:'Props', color:'#eab308', bg:'rgba(234,179,8,0.15)' },
  { key:'costume', label:'Costume', color:'#8b5cf6', bg:'rgba(139,92,246,0.15)' },
  { key:'makeup', label:'Make-Up', color:'#ec4899', bg:'rgba(236,72,153,0.15)' },
  { key:'vfx', label:'VFX', color:'#0ea5e9', bg:'rgba(14,165,233,0.15)' },
  { key:'sfx', label:'SFX', color:'#06b6d4', bg:'rgba(6,182,212,0.15)' },
  { key:'locations', label:'Locations', color:'#10b981', bg:'rgba(16,185,129,0.15)' },
  { key:'vehicles', label:'Vehicles', color:'#6366f1', bg:'rgba(99,102,241,0.15)' },
  { key:'animals', label:'Animals', color:'#84cc16', bg:'rgba(132,204,22,0.15)' },
  { key:'set_dressing', label:'Set Dressing', color:'#f59e0b', bg:'rgba(245,158,11,0.15)' },
  { key:'camera', label:'Camera', color:'#64748b', bg:'rgba(100,116,139,0.15)' }
];
window.BREAKDOWN_CATEGORIES = BREAKDOWN_CATEGORIES;

function renderBreakdown() {
  const p = getProject();
  if (!p) return;
  const el = document.getElementById('view-breakdown');
  // Scenes from script
  const scenes = (p.script||[]).filter(l=>l.type==='scene');
  // Breakdown data
  const bd = p.breakdown || { scenes: [] };

  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold">Script Breakdown</h2>
        <p class="text-xs text-gray-500 mt-0.5">Tag elements by category for each scene</p>
      </div>
      <div class="flex gap-2">
        <button onclick="addBreakdownScene()" class="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Scene
        </button>
      </div>
    </div>
    <!-- Category Legend -->
    <div class="flex flex-wrap gap-2 mb-4">
      ${BREAKDOWN_CATEGORIES.map(c=>`<span class="breakdown-tag" style="background:${c.bg};color:${c.color}">${c.label}</span>`).join('')}
    </div>
    <!-- Scenes -->
    <div id="breakdownList" class="space-y-3">
      ${(bd.scenes||[]).length===0 ? `<div class="text-center py-12 text-gray-600">
        <p class="mb-2">No scenes yet.</p>
        <p class="text-xs">Add scenes from script or manually, then tag elements.</p>
      </div>` : (bd.scenes||[]).map((s,i)=>renderBreakdownScene(s,i)).join('')}
    </div>
  `;
}

function renderBreakdownScene(scene, i) {
  const elems = scene.elements || {};
  const allTags = BREAKDOWN_CATEGORIES.flatMap(c => (elems[c.key]||[]).map(t=>({cat:c,tag:t})));
  return `
    <div class="bg-dark-900 border border-gray-800 rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-gray-800">
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">SC ${scene.num||i+1}</span>
          <span class="font-medium text-sm">${escapeHtml(scene.heading||'Untitled Scene')}</span>
          <span class="text-xs text-gray-600">${scene.int_ext||''} · ${scene.time||''}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="deleteBreakdownScene(${i})" class="text-red-600 hover:text-red-400 p-1 text-xs">Delete</button>
        </div>
      </div>
      <div class="p-4">
        ${scene.synopsis ? `<p class="text-xs text-gray-500 mb-3">${escapeHtml(scene.synopsis)}</p>` : ''}
        <!-- Tags -->
        <div class="flex flex-wrap gap-1.5 mb-3 min-h-6">
          ${allTags.map(({cat,tag})=>`<span class="breakdown-tag" style="background:${cat.bg};color:${cat.color}" onclick="removeBreakdownTag(${i},'${cat.key}','${escapeHtml(tag)}')" title="Click to remove">${escapeHtml(tag)} ×</span>`).join('')}
          ${allTags.length===0?`<span class="text-xs text-gray-600">No elements tagged yet</span>`:''}
        </div>
        <!-- Add Tag -->
        <div class="flex gap-2 mt-2">
          <select id="bdCat-${i}" class="input-field text-xs py-1" style="width:130px">
            ${BREAKDOWN_CATEGORIES.map(c=>`<option value="${c.key}">${c.label}</option>`).join('')}
          </select>
          <input type="text" id="bdTag-${i}" class="input-field text-xs py-1 flex-1" placeholder="Element name, press Enter"
            onkeydown="if(event.key==='Enter')addBreakdownTag(${i})">
          <button onclick="addBreakdownTag(${i})" class="bg-dark-800 border border-gray-700 hover:border-gray-600 text-gray-300 px-2 py-1 rounded-lg text-xs">Add</button>
        </div>
      </div>
    </div>`;
}

function addBreakdownScene() {
  const p = getProject();
  const num = (p?.breakdown?.scenes?.length||0)+1;
  const heading = prompt('Scene heading (e.g. INT. COFFEE SHOP - DAY):', 'INT. LOCATION - DAY');
  if (!heading) return;
  updateProject(proj => {
    if (!proj.breakdown) proj.breakdown = { scenes: [] };
    proj.breakdown.scenes.push({ num, heading, int_ext:'INT', time:'DAY', synopsis:'', elements:{} });
  });
  renderBreakdown();
}

function addBreakdownTag(sceneIdx) {
  const catEl = document.getElementById('bdCat-'+sceneIdx);
  const tagEl = document.getElementById('bdTag-'+sceneIdx);
  if (!catEl || !tagEl) return;
  const cat = catEl.value;
  const tag = tagEl.value.trim();
  if (!tag) return;
  updateProject(proj => {
    if (!proj.breakdown?.scenes?.[sceneIdx]) return;
    const s = proj.breakdown.scenes[sceneIdx];
    if (!s.elements) s.elements = {};
    if (!s.elements[cat]) s.elements[cat] = [];
    if (!s.elements[cat].includes(tag)) s.elements[cat].push(tag);
  });
  tagEl.value = '';
  renderBreakdown();
}

function removeBreakdownTag(sceneIdx, cat, tag) {
  updateProject(proj => {
    const s = proj.breakdown?.scenes?.[sceneIdx];
    if (!s?.elements?.[cat]) return;
    s.elements[cat] = s.elements[cat].filter(t => t !== tag);
  });
  renderBreakdown();
}

function deleteBreakdownScene(i) {
  if (!confirm('Delete this scene breakdown?')) return;
  updateProject(proj => { proj.breakdown?.scenes?.splice(i, 1); });
  renderBreakdown();
}

// ============================================================
// SHOT LIST MODULE
// ============================================================
function renderShotList() {
  const p = getProject();
  if (!p) return;
  const el = document.getElementById('view-shotlist');
  const shots = p.shotList || [];
  const grouped = {};
  shots.forEach(s => {
    const k = 'Scene ' + (s.scene || '?');
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(s);
  });
  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold">Shot List</h2>
        <p class="text-xs text-gray-500 mt-0.5">${shots.length} shots total</p>
      </div>
      <div class="flex gap-2">
        <button onclick="showImportDialog('shotlist')" class="btn btn-secondary btn-sm" title="Import from Google Sheets">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Import
        </button>
        <button onclick="gwsExportShotListToSheets(getProject())" class="btn btn-secondary btn-sm" title="Export to Google Sheets">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export
        </button>
        <button onclick="openShotModal()" class="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Shot
        </button>
      </div>
    </div>
    ${shots.length === 0 ? `<div class="text-center py-16 text-gray-600">
      <div class="text-4xl mb-3">🎬</div>
      <p class="mb-2">No shots yet.</p>
      <button onclick="openShotModal()" class="text-brand-400 hover:text-brand-300 text-sm">Add your first shot →</button>
    </div>` : Object.entries(grouped).map(([scene, scs])=>`
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm font-semibold text-gray-400 uppercase tracking-wider">${scene}</span>
          <span class="text-xs text-gray-600">(${scs.length} shots)</span>
        </div>
        <!-- Header -->
        <div class="shot-row text-xs text-gray-500 font-medium uppercase tracking-wider mb-1" style="background:transparent;border-color:transparent">
          <div>#</div><div>Description</div><div class="hide-mobile">Type</div><div class="hide-mobile">Angle</div><div class="hide-mobile">Movement</div><div>Lens</div><div></div>
        </div>
        ${scs.map(s=>renderShotRow(s)).join('')}
      </div>
    `).join('')}
  `;
}

function renderShotRow(s) {
  return `
    <div class="shot-row mb-1.5">
      <div class="font-mono font-bold text-sm text-brand-400">${escapeHtml(s.scene||'')}<span class="text-gray-500">${escapeHtml(s.shot||'')}</span></div>
      <div class="text-sm text-gray-300 truncate">${escapeHtml(s.desc||'')}</div>
      <div class="text-xs text-gray-500 hide-mobile">${escapeHtml(s.type||'')}</div>
      <div class="text-xs text-gray-500 hide-mobile">${escapeHtml(s.angle||'')}</div>
      <div class="text-xs text-gray-500 hide-mobile">${escapeHtml(s.movement||'')}</div>
      <div class="text-xs text-gray-600 font-mono">${escapeHtml(s.lens||'')}</div>
      <div class="flex gap-1">
        <button onclick="openShotModal('${s.id}')" class="text-gray-600 hover:text-gray-300 p-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button onclick="deleteShot('${s.id}')" class="text-red-700 hover:text-red-400 p-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>`;
}

function openShotModal(id) {
  document.getElementById('shotEditId').value = id || '';
  document.getElementById('shotModalTitle').textContent = id ? 'Edit Shot' : 'Add Shot';
  if (id) {
    const p = getProject();
    const s = (p.shotList||[]).find(x=>x.id===id);
    if (s) {
      setVal('shotScene',s.scene||'');setVal('shotNum',s.shot||'');setVal('shotLens',s.lens||'');
      setVal('shotDesc',s.desc||'');setVal('shotType',s.type||'Wide Shot');
      setVal('shotAngle',s.angle||'Eye Level');setVal('shotMovement',s.movement||'Static');
      setVal('shotNotes',s.notes||'');
    }
  } else {
    ['shotScene','shotNum','shotLens','shotDesc','shotNotes'].forEach(id=>setVal(id,''));
    setVal('shotType','Wide Shot');setVal('shotAngle','Eye Level');setVal('shotMovement','Static');
  }
  openModal('shotModal');
}

function saveShot() {
  const id = document.getElementById('shotEditId').value;
  const shot = {
    id: id || 'shot_' + Date.now(),
    scene: getVal('shotScene'), shot: getVal('shotNum'), lens: getVal('shotLens'),
    desc: getVal('shotDesc'), type: getVal('shotType'), angle: getVal('shotAngle'),
    movement: getVal('shotMovement'), notes: getVal('shotNotes')
  };
  if (!shot.desc && !shot.scene) { alert('Please add a scene number or description'); return; }
  updateProject(p => {
    if (!p.shotList) p.shotList = [];
    if (id) { const i = p.shotList.findIndex(s=>s.id===id); if(i>=0) p.shotList[i]=shot; }
    else p.shotList.push(shot);
  });
  closeModal('shotModal');
  renderShotList();
}

function deleteShot(id) {
  if (!confirm('Delete this shot?')) return;
  updateProject(p => { p.shotList = (p.shotList||[]).filter(s=>s.id!==id); });
  renderShotList();
}

// ============================================================
// CALL SHEET MODULE
// ============================================================
// ============================================================
// CALL SHEET PRO — multi-sheet, departments, weather, distribution
// ============================================================
let csIndex = 0;  // currently-active call sheet

// Migrate old single-object format → array of full call-sheet objects
function ensureCallSheets(p) {
  if (!p.callSheets) p.callSheets = [];
  // Old format: callSheets[0] was a flat object without id
  p.callSheets = p.callSheets.map((cs, i) => {
    if (!cs.id) cs.id = 'cs_' + Date.now() + '_' + i;
    if (!cs.scenes) cs.scenes = [];
    if (!cs.deptCalls) cs.deptCalls = [];
    if (!cs.weather) cs.weather = {};
    if (!cs.distribution) cs.distribution = [];
    return cs;
  });
  if (p.callSheets.length === 0) {
    p.callSheets.push(newCallSheetObject(p, 1));
  }
  if (csIndex >= p.callSheets.length) csIndex = p.callSheets.length - 1;
  if (csIndex < 0) csIndex = 0;
}

function newCallSheetObject(p, dayNum) {
  return {
    id: 'cs_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
    title: p.title, date: '', day: String(dayNum || 1),
    director: p.director || '', producer: '', ad: '', ad2: '', upm: '',
    generalCall: '07:00', crewCall: '', shootCall: '', firstShot: '', lunch: '', wrap: '',
    location: '', address: '', mapLink: '', parking: '', basecamp: '',
    hospital: '', hospitalAddress: '', hospitalPhone: '',
    weather: { conditions: '', high: '', low: '', sunrise: '', sunset: '' },
    scenes: [], deptCalls: [], distribution: [],
    notes: '', safetyNotes: ''
  };
}

function getCS(p) {
  ensureCallSheets(p);
  return p.callSheets[csIndex];
}

function renderCallSheet() {
  const p = getProject();
  if (!p) return;
  updateProject(pp => ensureCallSheets(pp));  // migrate + persist
  const fresh = getProject();
  const contacts = fresh.contacts || [];
  const cs = fresh.callSheets[csIndex];
  const el = document.getElementById('view-callsheet');

  // Department grouping for crew call times
  const byDept = {};
  contacts.forEach(c => {
    const d = c.dept || 'Other';
    if (!byDept[d]) byDept[d] = [];
    byDept[d].push(c);
  });

  el.innerHTML = `
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div>
        <h2 class="text-xl font-bold">Call Sheet</h2>
        <p class="text-xs text-gray-500 mt-0.5">${fresh.callSheets.length} call sheet${fresh.callSheets.length===1?'':'s'} · build & distribute per shoot day</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button onclick="showTemplatePicker()" class="btn btn-secondary btn-sm" title="Load a saved template">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          <span class="hidden sm:inline">Templates</span>
        </button>
        <button onclick="gwsEmailCallSheet(getProject())" class="btn btn-secondary btn-sm" title="Send to crew via Gmail">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span class="hidden sm:inline">Email</span>
        </button>
        <button onclick="printCallSheet()" class="btn btn-secondary btn-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print
        </button>
      </div>
    </div>

    <!-- Day tabs -->
    <div class="flex items-center gap-1 mb-4 overflow-x-auto pb-1 border-b border-gray-800">
      ${fresh.callSheets.map((sheet,i)=>`
        <button onclick="switchCallSheet(${i})" class="cs-day-tab ${i===csIndex?'active':''}">
          Day ${escapeHtml(sheet.day||String(i+1))}${sheet.date?` · ${formatDateShort(sheet.date)}`:''}
        </button>`).join('')}
      <button onclick="addCallSheet()" class="cs-day-tab-add" title="Add another shoot day">+ Day</button>
    </div>

    <div id="callSheetBody">
      <!-- Production Header -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header flex w-full justify-between">
          <span>📄 Production Header</span>
          ${fresh.callSheets.length>1?`<button onclick="deleteCallSheet(${csIndex})" class="text-red-500 hover:text-red-400 text-xs font-normal">Delete this day</button>`:''}
        </div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          ${csField('Production Title','title',cs.title)}
          ${csField('Shoot Date','date',cs.date,'date')}
          ${csField('Day #','day',cs.day)}
          ${csField('Director','director',cs.director)}
          ${csField('Producer','producer',cs.producer)}
          ${csField('1st AD','ad',cs.ad)}
          ${csField('2nd AD','ad2',cs.ad2)}
          ${csField('UPM','upm',cs.upm)}
        </div>
      </div>

      <!-- Schedule Times -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header">⏰ Schedule</div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          ${csField('General Call','generalCall',cs.generalCall,'time')}
          ${csField('Crew Call','crewCall',cs.crewCall,'time')}
          ${csField('Shooting Call','shootCall',cs.shootCall,'time')}
          ${csField('First Shot','firstShot',cs.firstShot,'time')}
          ${csField('Lunch','lunch',cs.lunch,'time')}
          ${csField('Est. Wrap','wrap',cs.wrap,'time')}
        </div>
      </div>

      <!-- Location -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header">📍 Location</div>
        <div class="p-4 grid grid-cols-2 gap-3">
          ${csField('Location Name','location',cs.location)}
          ${csField('Address','address',cs.address)}
          <div>
            <label class="text-xs text-gray-500 mb-1 block">Google Maps Link</label>
            <div class="flex gap-1">
              <input type="text" value="${escapeHtml(cs.mapLink||'')}" oninput="updateCS('mapLink',this.value)" class="input-field w-full text-sm" placeholder="Paste Maps URL">
              ${cs.mapLink?`<a href="${escapeHtml(cs.mapLink)}" target="_blank" class="btn btn-secondary btn-sm flex-shrink-0">Open</a>`:''}
            </div>
          </div>
          ${csField('Parking / Basecamp','parking',cs.parking)}
        </div>
      </div>

      <!-- Weather -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header">🌤️ Weather</div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label class="text-xs text-gray-500 mb-1 block">Conditions</label>
            <select onchange="updateCSWeather('conditions',this.value)" class="input-field w-full text-sm">
              ${['','Sunny','Partly Cloudy','Cloudy','Overcast','Light Rain','Rain','Thunderstorm','Hazy','Hot'].map(o=>`<option ${(cs.weather?.conditions||'')===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>
          ${csWeatherField('High °C','high',cs.weather?.high)}
          ${csWeatherField('Low °C','low',cs.weather?.low)}
          ${csWeatherField('Sunrise','sunrise',cs.weather?.sunrise,'time')}
          ${csWeatherField('Sunset','sunset',cs.weather?.sunset,'time')}
        </div>
      </div>

      <!-- Emergency -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header">🚑 Emergency / Safety</div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          ${csField('Nearest Hospital','hospital',cs.hospital)}
          ${csField('Hospital Address','hospitalAddress',cs.hospitalAddress)}
          ${csField('Hospital Phone','hospitalPhone',cs.hospitalPhone)}
        </div>
        <div class="px-4 pb-4">
          <label class="text-xs text-gray-500 mb-1 block">Safety Notes</label>
          <textarea oninput="updateCS('safetyNotes',this.value)" class="input-field w-full text-sm resize-none" rows="2" placeholder="Stunts, hazards, COVID protocol, weather contingency...">${escapeHtml(cs.safetyNotes||'')}</textarea>
        </div>
      </div>

      <!-- Scene Schedule -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header justify-between flex w-full">
          <span>🎬 Scene Schedule</span>
          <button onclick="addCSScene()" class="text-brand-400 hover:text-brand-300 text-xs font-normal">+ Add Scene</button>
        </div>
        <div class="p-4">
          ${(cs.scenes||[]).length===0?'<p class="text-xs text-gray-600">No scenes scheduled. Click "+ Add Scene".</p>':`
          <div class="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium uppercase mb-1 px-1">
            <div class="col-span-1">SC#</div><div class="col-span-5">Scene Heading</div>
            <div class="col-span-2">D/N</div><div class="col-span-1">Pages</div>
            <div class="col-span-2">Cast</div><div class="col-span-1"></div>
          </div>
          ${(cs.scenes||[]).map((s,i)=>`
            <div class="grid grid-cols-12 gap-2 mb-2 items-center">
              <input value="${escapeHtml(s.num||'')}" class="input-field text-xs col-span-1" placeholder="1" oninput="updateCSScene(${i},'num',this.value)">
              <input value="${escapeHtml(s.heading||'')}" class="input-field text-xs col-span-5" placeholder="INT. LOCATION - DAY" oninput="updateCSScene(${i},'heading',this.value)">
              <select class="input-field text-xs col-span-2" onchange="updateCSScene(${i},'dn',this.value)">
                ${['Day','Night','Dawn','Dusk'].map(o=>`<option ${(s.dn||'Day')===o?'selected':''}>${o}</option>`).join('')}
              </select>
              <input value="${escapeHtml(s.pages||'')}" class="input-field text-xs col-span-1" placeholder="1/8" oninput="updateCSScene(${i},'pages',this.value)">
              <input value="${escapeHtml(s.cast||'')}" class="input-field text-xs col-span-2" placeholder="Cast IDs" oninput="updateCSScene(${i},'cast',this.value)">
              <button onclick="removeCSScene(${i})" class="text-red-600 hover:text-red-400 col-span-1 flex justify-center"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>`).join('')}`}
        </div>
      </div>

      <!-- Department Call Times -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header justify-between flex w-full">
          <span>🏢 Department Call Times</span>
          <button onclick="addDeptCall()" class="text-brand-400 hover:text-brand-300 text-xs font-normal">+ Add Department</button>
        </div>
        <div class="p-4">
          ${(cs.deptCalls||[]).length===0?'<p class="text-xs text-gray-600">Set call times per department (e.g. Camera @ 06:00, Art @ 05:30).</p>':`
          ${(cs.deptCalls||[]).map((d,i)=>`
            <div class="flex items-center gap-2 mb-2">
              <select class="input-field text-xs flex-1" onchange="updateDeptCall(${i},'dept',this.value)">
                ${['Directing','Camera','Sound','Lighting/Grip','Art Department','Costume','Make-Up','Cast / Talent','Production','Post-Production','Catering','Transport','Other'].map(o=>`<option ${(d.dept||'')===o?'selected':''}>${o}</option>`).join('')}
              </select>
              <input type="time" value="${d.time||'07:00'}" class="input-field text-xs w-28" onchange="updateDeptCall(${i},'time',this.value)">
              <input value="${escapeHtml(d.notes||'')}" class="input-field text-xs flex-1" placeholder="Notes (location, etc.)" oninput="updateDeptCall(${i},'notes',this.value)">
              <button onclick="removeDeptCall(${i})" class="text-red-600 hover:text-red-400"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>`).join('')}`}
        </div>
      </div>

      <!-- Individual Crew Call Times (grouped by dept) -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header">👥 Individual Call Times</div>
        <div class="p-4">
          ${contacts.length===0?`<p class="text-xs text-gray-600">Add contacts in the Contacts module first.</p>`:
          Object.keys(byDept).sort().map(dept=>`
            <div class="mb-3">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">${escapeHtml(dept)}</div>
              ${byDept[dept].map(c=>`
                <div class="flex items-center gap-3 py-1.5 border-b border-gray-800 last:border-0">
                  <div class="contact-avatar w-7 h-7 text-xs" style="background:${avatarColor(c.name)}">${initials(c.name)}</div>
                  <div class="flex-1 min-w-0"><div class="text-sm font-medium truncate">${escapeHtml(c.name)}</div><div class="text-xs text-gray-500 truncate">${escapeHtml(c.role||'')}</div></div>
                  <input type="time" value="${c.callTime||'07:00'}" onchange="updateContactCallTime('${c.id}',this.value)" class="input-field text-xs py-1 w-24">
                </div>`).join('')}
            </div>`).join('')}
        </div>
      </div>

      <!-- Distribution Tracking -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header justify-between flex w-full">
          <span>📤 Distribution & Confirmation</span>
          <button onclick="addAllToDistribution()" class="text-brand-400 hover:text-brand-300 text-xs font-normal">+ Add all contacts</button>
        </div>
        <div class="p-4">
          ${(cs.distribution||[]).length===0?'<p class="text-xs text-gray-600">Track who received the call sheet and who confirmed. Click "+ Add all contacts".</p>':`
          <div class="space-y-1.5">
            ${(cs.distribution||[]).map((d,i)=>{
              const c = contacts.find(x=>x.id===d.contactId);
              const name = c?c.name:(d.name||'Unknown');
              return `<div class="flex items-center gap-3 py-1.5 border-b border-gray-800 last:border-0">
                <div class="contact-avatar w-6 h-6 text-xs" style="background:${avatarColor(name)}">${initials(name)}</div>
                <span class="text-sm flex-1 truncate">${escapeHtml(name)}</span>
                <div class="flex gap-1">
                  ${['pending','sent','viewed','confirmed'].map(st=>`
                    <button onclick="setDistStatus(${i},'${st}')" class="cs-dist-status ${d.status===st?'active-'+st:''}" title="${st}">${st==='pending'?'○':st==='sent'?'→':st==='viewed'?'👁':'✓'}</button>
                  `).join('')}
                </div>
                <button onclick="removeDistribution(${i})" class="text-red-700 hover:text-red-400"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>`;
            }).join('')}
          </div>
          <div class="mt-3 flex gap-3 text-xs text-gray-500">
            <span>○ Pending: ${cs.distribution.filter(d=>!d.status||d.status==='pending').length}</span>
            <span>→ Sent: ${cs.distribution.filter(d=>d.status==='sent').length}</span>
            <span>👁 Viewed: ${cs.distribution.filter(d=>d.status==='viewed').length}</span>
            <span class="text-green-400">✓ Confirmed: ${cs.distribution.filter(d=>d.status==='confirmed').length}</span>
          </div>`}
        </div>
      </div>

      <!-- Notes -->
      <div class="call-sheet-block mb-4">
        <div class="call-sheet-block-header">📝 General Notes</div>
        <div class="p-4">
          <textarea oninput="updateCS('notes',this.value)" class="input-field w-full h-24 resize-none text-sm" placeholder="Catering, walkie channels, special instructions...">${escapeHtml(cs.notes||'')}</textarea>
        </div>
      </div>

      <div class="flex justify-end">
        <button onclick="saveCallSheetTemplate()" class="btn btn-secondary btn-sm">💾 Save as Template</button>
      </div>
    </div>
  `;
}

// ---- Call Sheet field helpers ----
function csField(label, field, val, type) {
  return `<div>
    <label class="text-xs text-gray-500 mb-1 block">${label}</label>
    <input type="${type||'text'}" value="${escapeHtml(val||'')}" oninput="updateCS('${field}',this.value)" class="input-field w-full text-sm">
  </div>`;
}
function csWeatherField(label, field, val, type) {
  return `<div>
    <label class="text-xs text-gray-500 mb-1 block">${label}</label>
    <input type="${type||'text'}" value="${escapeHtml(val||'')}" oninput="updateCSWeather('${field}',this.value)" class="input-field w-full text-sm">
  </div>`;
}

// ---- Multi-sheet management ----
function switchCallSheet(i) { csIndex = i; renderCallSheet(); }
function addCallSheet() {
  updateProject(p => {
    ensureCallSheets(p);
    p.callSheets.push(newCallSheetObject(p, p.callSheets.length + 1));
  });
  const fresh = getProject();
  csIndex = fresh.callSheets.length - 1;
  renderCallSheet();
  showToast('New call sheet day added', 'success');
}
function deleteCallSheet(i) {
  const fresh = getProject();
  if (fresh.callSheets.length <= 1) { showToast('Cannot delete the only call sheet', 'warning'); return; }
  if (!confirm('Delete this call sheet day?')) return;
  updateProject(p => { p.callSheets.splice(i, 1); });
  csIndex = Math.max(0, csIndex - 1);
  renderCallSheet();
}

// ---- Field updates ----
function updateCS(field, val) {
  updateProject(p => { getCS(p)[field] = val; });
}
function updateCSWeather(field, val) {
  updateProject(p => { const cs = getCS(p); if(!cs.weather) cs.weather={}; cs.weather[field] = val; });
}
function addCSScene() {
  updateProject(p => { getCS(p).scenes.push({ num:'', heading:'', dn:'Day', pages:'', cast:'' }); });
  renderCallSheet();
}
function removeCSScene(i) {
  updateProject(p => { getCS(p).scenes.splice(i, 1); });
  renderCallSheet();
}
function updateCSScene(i, field, val) {
  updateProject(p => { const s = getCS(p).scenes[i]; if(s) s[field] = val; });
}
function addDeptCall() {
  updateProject(p => { getCS(p).deptCalls.push({ dept:'Camera', time:'07:00', notes:'' }); });
  renderCallSheet();
}
function removeDeptCall(i) {
  updateProject(p => { getCS(p).deptCalls.splice(i, 1); });
  renderCallSheet();
}
function updateDeptCall(i, field, val) {
  updateProject(p => { const d = getCS(p).deptCalls[i]; if(d) d[field] = val; });
}
function updateContactCallTime(id, val) {
  updateProject(p => { const c = p.contacts?.find(x=>x.id===id); if (c) c.callTime = val; });
}

// ---- Distribution tracking ----
function addAllToDistribution() {
  updateProject(p => {
    const cs = getCS(p);
    const existing = new Set(cs.distribution.map(d=>d.contactId));
    (p.contacts||[]).forEach(c => {
      if (!existing.has(c.id)) cs.distribution.push({ contactId:c.id, name:c.name, status:'pending', sentAt:null });
    });
  });
  renderCallSheet();
  showToast('Added all contacts to distribution list', 'success');
}
function setDistStatus(i, status) {
  updateProject(p => {
    const d = getCS(p).distribution[i];
    if (d) { d.status = status; if(status==='sent'&&!d.sentAt) d.sentAt = new Date().toISOString(); }
  });
  renderCallSheet();
}
function removeDistribution(i) {
  updateProject(p => { getCS(p).distribution.splice(i, 1); });
  renderCallSheet();
}

// ---- Templates ----
function getCSTemplates() { return JSON.parse(localStorage.getItem('cf_cs_templates') || '[]'); }
function saveCSTemplates(t) { localStorage.setItem('cf_cs_templates', JSON.stringify(t)); }
function saveCallSheetTemplate() {
  const name = prompt('Template name:', 'Standard Day');
  if (!name) return;
  const fresh = getProject();
  const cs = JSON.parse(JSON.stringify(fresh.callSheets[csIndex]));
  // strip day-specific data
  delete cs.id; cs.date=''; cs.scenes=[]; cs.distribution=[];
  const templates = getCSTemplates();
  templates.push({ id:'tpl_'+Date.now(), name, data:cs });
  saveCSTemplates(templates);
  showToast(`Template "${name}" saved`, 'success');
}
function showTemplatePicker() {
  const templates = getCSTemplates();
  if (!templates.length) { showToast('No templates saved yet. Use "Save as Template" first.', 'info'); return; }
  const modal = document.createElement('div');
  modal.id = 'csTemplateModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-dark-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
      <div class="p-5 border-b border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-bold">Call Sheet Templates</h2>
        <button onclick="document.getElementById('csTemplateModal').remove()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="p-5 space-y-2 max-h-80 overflow-y-auto">
        ${templates.map(t=>`
          <div class="flex items-center gap-2 bg-dark-900 border border-gray-700 rounded-lg p-3">
            <span class="text-sm flex-1">${escapeHtml(t.name)}</span>
            <button onclick="applyCSTemplate('${t.id}')" class="btn btn-primary btn-sm">Apply</button>
            <button onclick="deleteCSTemplate('${t.id}')" class="text-red-500 hover:text-red-400 text-xs">Delete</button>
          </div>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e=>{ if(e.target===modal) modal.remove(); });
}
function applyCSTemplate(id) {
  const t = getCSTemplates().find(x=>x.id===id);
  if (!t) return;
  updateProject(p => {
    const cs = getCS(p);
    Object.keys(t.data).forEach(k => { if(k!=='id') cs[k] = JSON.parse(JSON.stringify(t.data[k])); });
  });
  document.getElementById('csTemplateModal')?.remove();
  renderCallSheet();
  showToast(`Template "${t.name}" applied`, 'success');
}
function deleteCSTemplate(id) {
  saveCSTemplates(getCSTemplates().filter(t=>t.id!==id));
  document.getElementById('csTemplateModal')?.remove();
  showTemplatePicker();
}

function printCallSheet() {
  window.print();
}

// Expose Call Sheet Pro functions
['switchCallSheet','addCallSheet','deleteCallSheet','updateCS','updateCSWeather','addCSScene',
 'removeCSScene','updateCSScene','addDeptCall','removeDeptCall','updateDeptCall','updateContactCallTime',
 'addAllToDistribution','setDistStatus','removeDistribution','saveCallSheetTemplate','showTemplatePicker',
 'applyCSTemplate','deleteCSTemplate','printCallSheet'].forEach(fn => { window[fn] = eval(fn); });

// ============================================================
// CALENDAR MODULE
// ============================================================
const calEventColors = { shoot:'#ef4444', prep:'#0ea5e9', scout:'#10b981', audition:'#8b5cf6', meeting:'#f59e0b', post:'#6366f1', deadline:'#f97316', other:'#9ca3af' };
function calEventColor(t) { return calEventColors[t] || '#9ca3af'; }

function renderCalendar() {
  const p = getProject();
  if (!p) return;
  const el = document.getElementById('view-calendar');
  const now = new Date(calYear, calMonth, 1);
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = now.getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];
  const events = p.calendar || [];

  let days = '';
  let dayNum = 1;
  for (let week = 0; week < 6; week++) {
    for (let dow = 0; dow < 7; dow++) {
      const cellIdx = week*7 + dow;
      if (cellIdx < firstDay || dayNum > daysInMonth) {
        days += `<div class="cal-day other-month"><span class="text-xs text-gray-700">${cellIdx < firstDay ? '' : dayNum++}</span></div>`;
      } else {
        const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = dateStr === todayStr;
        days += `
          <div class="cal-day${isToday?' today':''}" onclick="openCalModal('${dateStr}')">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium ${isToday?'bg-brand-500 text-white w-5 h-5 rounded-full flex items-center justify-center':'text-gray-400'}">${dayNum}</span>
            </div>
            ${dayEvents.map(e=>`<div class="cal-event" style="background:${calEventColor(e.type)}22;color:${calEventColor(e.type)}" onclick="event.stopPropagation();openCalModal('${dateStr}','${e.id}')" title="${escapeHtml(e.title)}">${escapeHtml(e.title)}</div>`).join('')}
          </div>`;
        dayNum++;
      }
    }
    if (dayNum > daysInMonth) break;
  }

  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold">Production Calendar</h2>
        <p class="text-xs text-gray-500 mt-0.5">Plan your shoot days and key milestones</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button onclick="gwsSyncCalendarToGoogle(getProject())" class="btn btn-secondary btn-sm" title="Sync to Google Calendar">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span class="hidden sm:inline">Sync to Google</span><span class="sm:hidden">Sync</span>
        </button>
        <button onclick="openCalModal()" class="btn btn-primary btn-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Event
        </button>
      </div>
    </div>
    <!-- Legend -->
    <div class="flex flex-wrap gap-2 mb-3">
      ${Object.entries(calEventColors).map(([type,color])=>`<span class="text-xs px-2 py-0.5 rounded" style="background:${color}22;color:${color}">${type.charAt(0).toUpperCase()+type.slice(1)}</span>`).join('')}
    </div>
    <!-- Month Nav -->
    <div class="flex items-center justify-between mb-3">
      <button onclick="calNav(-1)" class="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h3 class="font-semibold">${monthName}</h3>
      <button onclick="calNav(1)" class="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
    <!-- Grid -->
    <div class="grid grid-cols-7 gap-1 mb-1">
      ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="text-center text-xs text-gray-600 font-medium py-1">${d}</div>`).join('')}
    </div>
    <div class="grid grid-cols-7 gap-1">${days}</div>
    <!-- Event List -->
    <div class="mt-6">
      <h3 class="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">All Events (${events.length})</h3>
      <div class="space-y-1.5">
        ${events.length===0?`<p class="text-xs text-gray-600">No events. Click a day or use the button above to add events.</p>`:
          events.sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`
            <div class="flex items-center gap-3 py-2 px-3 rounded-lg bg-dark-900 border border-gray-800">
              <div class="w-2 h-2 rounded-full flex-shrink-0" style="background:${calEventColor(e.type)}"></div>
              <span class="text-xs font-mono text-gray-500 w-20 flex-shrink-0">${formatDate(e.date)}</span>
              <span class="text-sm flex-1">${escapeHtml(e.title)}</span>
              <span class="text-xs" style="color:${calEventColor(e.type)}">${e.type}</span>
              <button onclick="deleteCalEvent('${e.id}')" class="text-red-700 hover:text-red-400 p-0.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>`).join('')}
      </div>
    </div>
  `;
}

function calNav(dir) {
  calMonth += dir;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
}

function openCalModal(date, id) {
  const p = getProject();
  document.getElementById('calEditId').value = id || '';
  if (id) {
    const ev = (p.calendar||[]).find(e=>e.id===id);
    if (ev) { setVal('calTitle',ev.title); setVal('calDate',ev.date); setVal('calType',ev.type); setVal('calNotes',ev.notes||''); }
  } else {
    setVal('calTitle',''); setVal('calDate',date||''); setVal('calType','shoot'); setVal('calNotes','');
  }
  openModal('calModal');
}

function saveCalEvent() {
  const title = getVal('calTitle').trim();
  if (!title) { alert('Please enter an event title'); return; }
  const id = document.getElementById('calEditId').value;
  const ev = { id: id||'ev_'+Date.now(), title, date: getVal('calDate'), type: getVal('calType'), notes: getVal('calNotes') };
  updateProject(p => {
    if (!p.calendar) p.calendar = [];
    if (id) { const i=p.calendar.findIndex(e=>e.id===id); if(i>=0) p.calendar[i]=ev; else p.calendar.push(ev); }
    else p.calendar.push(ev);
  });
  closeModal('calModal');
  renderCalendar();
}

function deleteCalEvent(id) {
  if (!confirm('Delete this event?')) return;
  updateProject(p => { p.calendar = (p.calendar||[]).filter(e=>e.id!==id); });
  renderCalendar();
}

// ============================================================
// CONTACTS MODULE
// ============================================================
// AVATAR_COLORS, avatarColor(), initials() are now defined in ui-utils.js

function renderContacts() {
  const p = getProject();
  if (!p) return;
  const el = document.getElementById('view-contacts');
  const contacts = p.contacts || [];
  const depts = [...new Set(contacts.map(c=>c.dept||'Other'))].sort();

  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold">Contacts</h2>
        <p class="text-xs text-gray-500 mt-0.5">${contacts.length} cast & crew members</p>
      </div>
      <div class="flex gap-2">
      <button onclick="showImportDialog('contacts')" class="btn btn-secondary btn-sm" title="Import from Google Sheets">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        Import
      </button>
      <button onclick="openContactModal()" class="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Contact
      </button>
      </div>
    </div>
    ${contacts.length===0?`<div class="text-center py-16 text-gray-600">
      <div class="text-4xl mb-3">👥</div>
      <p class="mb-2">No contacts yet.</p>
      <button onclick="openContactModal()" class="text-brand-400 hover:text-brand-300 text-sm">Add your first contact →</button>
    </div>`:
    depts.map(dept=>`
      <div class="mb-6">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">${dept} <span class="text-gray-700">(${contacts.filter(c=>(c.dept||'Other')===dept).length})</span></h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          ${contacts.filter(c=>(c.dept||'Other')===dept).map(c=>`
            <div class="contact-card">
              <div class="flex items-start gap-3">
                <div class="contact-avatar" style="background:${avatarColor(c.name)}">${initials(c.name)}</div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm">${escapeHtml(c.name)}</div>
                  <div class="text-xs text-gray-400">${escapeHtml(c.role||'')}</div>
                  ${c.callTime?`<div class="text-xs text-brand-400 mt-1">📞 Call: ${c.callTime}</div>`:''}
                </div>
                <div class="flex gap-1">
                  <button onclick="openContactModal('${c.id}')" class="text-gray-600 hover:text-gray-300 p-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                  <button onclick="deleteContact('${c.id}')" class="text-red-700 hover:text-red-400 p-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-800 flex flex-wrap gap-2">
                ${c.email?`<a href="mailto:${c.email}" class="text-xs text-gray-500 hover:text-brand-400 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>${escapeHtml(c.email)}</a>`:''}
                ${c.phone?`<a href="tel:${c.phone}" class="text-xs text-gray-500 hover:text-brand-400 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>${escapeHtml(c.phone)}</a>`:''}
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('')}
  `;
}

function openContactModal(id) {
  document.getElementById('contactEditId').value = id || '';
  document.getElementById('contactModalTitle').textContent = id ? 'Edit Contact' : 'Add Contact';
  if (id) {
    const p = getProject();
    const c = (p.contacts||[]).find(x=>x.id===id);
    if (c) {
      setVal('contactName',c.name||''); setVal('contactRole',c.role||''); setVal('contactDept',c.dept||'Other');
      setVal('contactEmail',c.email||''); setVal('contactPhone',c.phone||''); setVal('contactCallTime',c.callTime||'07:00');
    }
  } else {
    ['contactName','contactRole','contactEmail','contactPhone'].forEach(f=>setVal(f,''));
    setVal('contactDept','Camera'); setVal('contactCallTime','07:00');
  }
  openModal('contactModal');
}

function saveContact() {
  const name = getVal('contactName').trim();
  if (!name) { alert('Please enter a name'); return; }
  const id = document.getElementById('contactEditId').value;
  const c = { id:id||'c_'+Date.now(), name, role:getVal('contactRole'), dept:getVal('contactDept'), email:getVal('contactEmail'), phone:getVal('contactPhone'), callTime:getVal('contactCallTime') };
  updateProject(p => {
    if (!p.contacts) p.contacts = [];
    if (id) { const i=p.contacts.findIndex(x=>x.id===id); if(i>=0) p.contacts[i]=c; else p.contacts.push(c); }
    else p.contacts.push(c);
  });
  closeModal('contactModal');
  renderContacts();
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  updateProject(p => { p.contacts=(p.contacts||[]).filter(c=>c.id!==id); });
  renderContacts();
}

// ============================================================
// TASKS (KANBAN) MODULE
// ============================================================
const TASK_COLS = [
  { key:'todo', label:'To Do', color:'#f59e0b', icon:'📋' },
  { key:'inProgress', label:'In Progress', color:'#0ea5e9', icon:'⚡' },
  { key:'done', label:'Done', color:'#10b981', icon:'✅' }
];

function renderTasks() {
  const p = getProject();
  if (!p) return;
  const el = document.getElementById('view-tasks');
  const tasks = p.tasks || { todo:[], inProgress:[], done:[] };
  const total = TASK_COLS.reduce((s,c)=>s+(tasks[c.key]||[]).length,0);

  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold">Task Board</h2>
        <p class="text-xs text-gray-500 mt-0.5">${total} tasks total</p>
      </div>
      <button onclick="openTaskModal()" class="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Task
      </button>
    </div>
    <div class="flex gap-4 overflow-x-auto pb-4">
      ${TASK_COLS.map(col=>`
        <div class="kanban-col" id="kcol-${col.key}" ondragover="taskDragOver(event)" ondrop="taskDrop(event,'${col.key}')">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span>${col.icon}</span>
              <span class="font-semibold text-sm" style="color:${col.color}">${col.label}</span>
              <span class="text-xs bg-dark-950 text-gray-500 px-1.5 rounded font-mono">${(tasks[col.key]||[]).length}</span>
            </div>
            <button onclick="openTaskModal(null,'${col.key}')" class="text-gray-600 hover:text-gray-300 p-0.5" title="Add task to this column">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
          <div id="kbody-${col.key}">
            ${(tasks[col.key]||[]).map(t=>renderKanbanCard(t,col.key)).join('')}
          </div>
          ${(tasks[col.key]||[]).length===0?`<div class="text-center py-4 text-xs text-gray-700">Drop tasks here</div>`:''}
        </div>`).join('')}
    </div>
  `;
}

function renderKanbanCard(t, col) {
  const priorityColor = { high:'#ef4444', medium:'#f59e0b', low:'#6b7280' };
  const pc = priorityColor[t.priority] || '#6b7280';
  return `
    <div class="kanban-card" draggable="true" id="kcard-${t.id}" ondragstart="taskDragStart(event,'${t.id}','${col}')">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div class="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style="background:${pc}"></div>
          <span class="text-sm font-medium leading-tight">${escapeHtml(t.title)}</span>
        </div>
        <div class="flex gap-0.5 flex-shrink-0">
          <button onclick="openTaskModal('${t.id}','${col}')" class="text-gray-600 hover:text-gray-300 p-0.5"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
          <button onclick="deleteTask('${t.id}','${col}')" class="text-red-800 hover:text-red-400 p-0.5"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
      </div>
      ${t.desc?`<p class="text-xs text-gray-600 mt-1.5 ml-3.5">${escapeHtml(t.desc)}</p>`:''}
      <div class="flex items-center justify-between mt-2 ml-3.5">
        <span class="text-xs px-1.5 py-0.5 rounded font-medium" style="background:${pc}22;color:${pc}">${t.priority||'low'}</span>
        ${t.due?`<span class="text-xs text-gray-600">${formatDate(t.due)}</span>`:''}
      </div>
    </div>`;
}

let dragTaskId = null;
let dragFromCol = null;
function taskDragStart(e, id, col) { dragTaskId=id; dragFromCol=col; e.dataTransfer.effectAllowed='move'; }
function taskDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect='move'; }
function taskDrop(e, toCol) {
  e.preventDefault();
  if (!dragTaskId || dragFromCol===toCol) return;
  updateProject(p => {
    const fromArr = p.tasks[dragFromCol];
    const taskIdx = fromArr.findIndex(t=>t.id===dragTaskId);
    if (taskIdx===-1) return;
    const [task] = fromArr.splice(taskIdx, 1);
    if (!p.tasks[toCol]) p.tasks[toCol]=[];
    p.tasks[toCol].push(task);
  });
  dragTaskId=null; dragFromCol=null;
  renderTasks();
}

function openTaskModal(id, col) {
  const p = getProject();
  document.getElementById('taskEditId').value = id || '';
  document.getElementById('taskEditCol').value = col || 'todo';
  document.getElementById('taskModalTitle').textContent = id ? 'Edit Task' : 'Add Task';
  if (id) {
    const allTasks = [...(p.tasks?.todo||[]),...(p.tasks?.inProgress||[]),...(p.tasks?.done||[])];
    const t = allTasks.find(x=>x.id===id);
    if (t) {
      setVal('taskTitle',t.title||''); setVal('taskDesc',t.desc||''); setVal('taskPriority',t.priority||'medium');
      setVal('taskDue',t.due||''); setVal('taskCol',col||'todo');
    }
  } else {
    setVal('taskTitle',''); setVal('taskDesc',''); setVal('taskPriority','medium'); setVal('taskDue',''); setVal('taskCol',col||'todo');
  }
  openModal('taskModal');
}

function saveTask() {
  const title = getVal('taskTitle').trim();
  if (!title) { alert('Please enter a task title'); return; }
  const id = document.getElementById('taskEditId').value;
  const oldCol = document.getElementById('taskEditCol').value;
  const newCol = getVal('taskCol');
  const t = { id:id||'t_'+Date.now(), title, desc:getVal('taskDesc'), priority:getVal('taskPriority'), due:getVal('taskDue') };
  updateProject(p => {
    if (!p.tasks) p.tasks={todo:[],inProgress:[],done:[]};
    if (id) {
      // remove from old col
      ['todo','inProgress','done'].forEach(c=>{ p.tasks[c]=(p.tasks[c]||[]).filter(x=>x.id!==id); });
    }
    if (!p.tasks[newCol]) p.tasks[newCol]=[];
    p.tasks[newCol].push(t);
  });
  closeModal('taskModal');
  renderTasks();
}

function deleteTask(id, col) {
  if (!confirm('Delete this task?')) return;
  updateProject(p => { if(p.tasks?.[col]) p.tasks[col]=p.tasks[col].filter(t=>t.id!==id); });
  renderTasks();
}

// ============================================================
// MOODBOARD MODULE
// ============================================================
function renderMoodboard() {
  const p = getProject();
  if (!p) return;
  const el = document.getElementById('view-moodboard');
  const items = p.moodboard || [];

  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold">Moodboard</h2>
        <p class="text-xs text-gray-500 mt-0.5">Collect visual references and inspiration</p>
      </div>
      <div class="flex gap-2">
        <button onclick="addMoodboardUrl()" class="border border-gray-700 hover:border-gray-500 text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          Add Image URL
        </button>
        <label class="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Upload Image
          <input type="file" class="hidden" accept="image/*" multiple onchange="uploadMoodboardImages(this)">
        </label>
      </div>
    </div>
    ${items.length===0?`<div class="text-center py-20 text-gray-600">
      <div class="text-5xl mb-4">🎨</div>
      <p class="mb-2">Your moodboard is empty.</p>
      <p class="text-xs">Upload images or add image URLs to build your visual reference board.</p>
    </div>`:`
    <div class="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
      ${items.map((item,i)=>`
        <div class="break-inside-avoid relative group rounded-xl overflow-hidden border border-gray-800 bg-dark-900">
          <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.caption||'')}" class="w-full h-auto object-cover" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22><rect fill=%22%23374151%22 width=%22100%25%22 height=%22100%25%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%236b7280%22>Image error</text></svg>'">
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <div class="flex-1">
              <input type="text" value="${escapeHtml(item.caption||'')}" placeholder="Caption..." class="bg-transparent border-b border-white/30 text-white text-xs w-full outline-none" oninput="updateMoodboardCaption(${i},this.value)">
            </div>
            <button onclick="deleteMoodboardItem(${i})" class="text-red-400 hover:text-red-300 ml-2 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
        </div>`).join('')}
    </div>`}
  `;
}

function addMoodboardUrl() {
  const url = prompt('Enter image URL:');
  if (!url) return;
  updateProject(p => {
    if (!p.moodboard) p.moodboard = [];
    p.moodboard.push({ url, caption:'' });
  });
  renderMoodboard();
}

function uploadMoodboardImages(input) {
  const files = Array.from(input.files);
  let done = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateProject(p => {
        if (!p.moodboard) p.moodboard = [];
        p.moodboard.push({ url: e.target.result, caption: file.name.replace(/\.[^.]+$/,'') });
      });
      done++;
      if (done === files.length) renderMoodboard();
    };
    reader.readAsDataURL(file);
  });
}

function updateMoodboardCaption(i, val) {
  updateProject(p => { if(p.moodboard?.[i]) p.moodboard[i].caption = val; });
}

function deleteMoodboardItem(i) {
  if (!confirm('Remove this image?')) return;
  updateProject(p => { p.moodboard?.splice(i,1); });
  renderMoodboard();
}

// ============================================================
// EDIT PROJECT MODAL
// ============================================================
function openEditModal() {
  const p = getProject();
  if (!p) return;
  setVal('editTitle',p.title||''); setVal('editType',p.type||'Feature Film'); setVal('editStatus',p.status||'development');
  setVal('editDirector',p.director||''); setVal('editStart',p.startDate||''); setVal('editEnd',p.endDate||'');
  openModal('editProjectModal');
}

function saveProjectEdit() {
  updateProject(p => {
    p.title = getVal('editTitle')||p.title;
    p.type = getVal('editType');
    p.status = getVal('editStatus');
    p.director = getVal('editDirector');
    p.startDate = getVal('editStart');
    p.endDate = getVal('editEnd');
  });
  closeModal('editProjectModal');
  loadProjectHeader();
  renderModule(currentModule);
}

// ============================================================
// UTILS
// ============================================================
function getVal(id) { const el=document.getElementById(id); return el?el.value:''; }
function setVal(id, val) { const el=document.getElementById(id); if(el) el.value=val||''; }
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================================
// HEADER LOADER
// ============================================================
function loadProjectHeader() {
  const params = new URLSearchParams(window.location.search);
  projectId = params.get('id');
  if (!projectId) { window.location.href = 'index.html'; return; }
  const p = getProject();
  if (!p) { window.location.href = 'index.html'; return; }
  document.title = `CineFlow — ${p.title}`;
  document.getElementById('navProjectTitle').textContent = p.title;
  document.getElementById('projectColorBar').style.background = p.color || '#0ea5e9';
  const statusEl = document.getElementById('navStatus');
  if (statusEl) {
    const statusLabels = { development:'Development', active:'Pre-Production', production:'Production', post:'Post-Production', completed:'Completed' };
    statusEl.className = 'status-badge status-' + p.status;
    statusEl.textContent = statusLabels[p.status] || p.status;
  }
}

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  loadProjectHeader();
  renderModule('overview');
  // Modal overlay close
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); });
  });
});

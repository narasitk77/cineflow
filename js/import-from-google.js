// ============================================================
// CINEFLOW — IMPORT FROM GOOGLE (v1.4)
// ============================================================
// UI helpers for importing content from Google Docs/Sheets/Drive
// into Script Writer, Shot List, Contacts, etc.
// ============================================================

// ---- GENERIC IMPORT DIALOG ----
function showImportDialog(type) {
  const configs = {
    script: {
      title: 'Import Script from Google Docs',
      hint: 'Paste a Google Doc URL — lines will be auto-detected as scene/action/character/dialogue',
      placeholder: 'https://docs.google.com/document/d/...',
      icon: '📝',
      action: importScriptHandler,
      buttonText: 'Import Script'
    },
    shotlist: {
      title: 'Import Shot List from Google Sheets',
      hint: 'Sheet should have headers like: Scene, Shot, Description, Type, Angle, Movement, Lens',
      placeholder: 'https://docs.google.com/spreadsheets/d/...',
      icon: '🎬',
      action: importShotListHandler,
      buttonText: 'Import Shots'
    },
    contacts: {
      title: 'Import Contacts from Google Sheets',
      hint: 'Sheet should have headers like: Name, Role, Department, Email, Phone, Call Time',
      placeholder: 'https://docs.google.com/spreadsheets/d/...',
      icon: '👥',
      action: importContactsHandler,
      buttonText: 'Import Contacts'
    }
  };
  const cfg = configs[type];
  if (!cfg) return;

  // Build modal
  const modal = document.createElement('div');
  modal.id = 'importModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-dark-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
      <div class="p-5 border-b border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-bold flex items-center gap-2">
          <span class="text-2xl">${cfg.icon}</span>
          ${cfg.title}
        </h2>
        <button onclick="closeImportDialog()" class="text-gray-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-5 space-y-4">
        <div class="bg-dark-900 border border-gray-700 rounded-lg p-3 text-xs text-gray-400 flex items-start gap-2">
          <svg class="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>${cfg.hint}</div>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Google ${type === 'script' ? 'Doc' : 'Sheet'} URL or ID</label>
          <input type="text" id="importUrl" placeholder="${cfg.placeholder}" class="input-field w-full text-sm" autofocus>
        </div>
        <div id="importPreview" class="hidden bg-dark-900 border border-gray-700 rounded-lg p-3 max-h-64 overflow-y-auto"></div>
        <div id="importStatus" class="text-xs text-gray-500"></div>
      </div>
      <div class="p-5 border-t border-gray-700 flex justify-end gap-3">
        <button onclick="closeImportDialog()" class="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
        <button onclick="${cfg.action.name}()" id="importBtn" class="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          ${cfg.buttonText}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close on overlay click
  modal.addEventListener('click', e => { if (e.target === modal) closeImportDialog(); });
}
window.showImportDialog = showImportDialog;

function closeImportDialog() {
  document.getElementById('importModal')?.remove();
}
window.closeImportDialog = closeImportDialog;

function setImportStatus(msg, type='info') {
  const el = document.getElementById('importStatus');
  if (!el) return;
  const colors = { info:'text-blue-400', success:'text-green-400', warning:'text-yellow-400', error:'text-red-400' };
  el.className = 'text-xs ' + (colors[type] || 'text-gray-500');
  el.textContent = msg;
}

function setImportBtnLoading(loading) {
  const btn = document.getElementById('importBtn');
  if (!btn) return;
  btn.disabled = loading;
  btn.style.opacity = loading ? '0.6' : '1';
  btn.innerHTML = loading
    ? '<span class="auth-loading"></span> Importing...'
    : btn.dataset.originalText || btn.innerHTML;
}

// ============================================================
// HANDLERS
// ============================================================

async function importScriptHandler() {
  const url = document.getElementById('importUrl')?.value?.trim();
  if (!url) { setImportStatus('Please paste a Google Doc URL', 'warning'); return; }
  setImportBtnLoading(true);
  setImportStatus('Reading document...', 'info');
  try {
    const result = await gwsImportScriptFromDoc(url);
    if (!result.lines.length) {
      setImportStatus('Document is empty', 'warning');
      setImportBtnLoading(false);
      return;
    }
    // Show preview
    const preview = document.getElementById('importPreview');
    preview.classList.remove('hidden');
    preview.innerHTML = `
      <div class="text-xs text-gray-400 mb-2">📄 "${escapeHtml(result.title)}" — ${result.lines.length} lines detected</div>
      <div class="space-y-0.5 font-mono text-xs">
        ${result.lines.slice(0, 15).map(l => {
          const colors = { scene:'#60a5fa', action:'#9ca3af', character:'#fbbf24', dialogue:'#86efac', parenthetical:'#c084fc', transition:'#f87171' };
          return `<div style="color:${colors[l.type]||'#9ca3af'}"><span class="text-gray-700 mr-1">[${l.type}]</span>${escapeHtml(l.text.slice(0,60))}${l.text.length>60?'…':''}</div>`;
        }).join('')}
        ${result.lines.length > 15 ? `<div class="text-gray-600 mt-1">... and ${result.lines.length - 15} more lines</div>` : ''}
      </div>
    `;
    setImportStatus('Ready to import — click "Import Script" to confirm', 'success');

    // Change button to confirm
    const btn = document.getElementById('importBtn');
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Confirm Import (${result.lines.length} lines)`;
    btn.onclick = () => {
      const append = confirm('Append to current script? Click OK to APPEND, Cancel to REPLACE.');
      updateProject(p => {
        if (!p.script) p.script = [];
        if (append) p.script.push(...result.lines);
        else p.script = result.lines;
      });
      closeImportDialog();
      switchModule('script');
      showToast(`Imported ${result.lines.length} script lines`, 'success');
    };
    setImportBtnLoading(false);
  } catch (err) {
    console.error(err);
    setImportStatus('Error: ' + err.message, 'error');
    setImportBtnLoading(false);
  }
}
window.importScriptHandler = importScriptHandler;

async function importShotListHandler() {
  const url = document.getElementById('importUrl')?.value?.trim();
  if (!url) { setImportStatus('Please paste a Google Sheet URL', 'warning'); return; }
  setImportBtnLoading(true);
  setImportStatus('Reading sheet...', 'info');
  try {
    const result = await gwsImportShotListFromSheet(url);
    if (!result.shots.length) {
      setImportStatus('No shots found in sheet', 'warning');
      setImportBtnLoading(false);
      return;
    }
    const preview = document.getElementById('importPreview');
    preview.classList.remove('hidden');
    preview.innerHTML = `
      <div class="text-xs text-gray-400 mb-2">📊 Headers: ${result.headers.map(h => `<code class="bg-dark-800 px-1 rounded">${escapeHtml(h)}</code>`).join(' · ')}</div>
      <div class="text-xs text-gray-400 mb-2">${result.shots.length} shots ready to import</div>
      <table class="text-xs w-full">
        <thead><tr class="text-gray-500"><th class="text-left p-1">Sc</th><th class="text-left p-1">Sh</th><th class="text-left p-1">Description</th><th class="text-left p-1">Type</th></tr></thead>
        <tbody>
          ${result.shots.slice(0,8).map(s => `<tr class="text-gray-300"><td class="p-1 font-mono">${escapeHtml(s.scene)}</td><td class="p-1 font-mono">${escapeHtml(s.shot)}</td><td class="p-1 truncate" style="max-width:200px">${escapeHtml(s.desc)}</td><td class="p-1 text-gray-500">${escapeHtml(s.type)}</td></tr>`).join('')}
        </tbody>
      </table>
      ${result.shots.length > 8 ? `<div class="text-gray-600 mt-1 text-xs">... and ${result.shots.length - 8} more rows</div>` : ''}
    `;
    setImportStatus('Ready to import', 'success');

    const btn = document.getElementById('importBtn');
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Confirm Import (${result.shots.length} shots)`;
    btn.onclick = () => {
      const append = confirm(`Append ${result.shots.length} shots to current list? OK = APPEND, Cancel = REPLACE.`);
      updateProject(p => {
        if (!p.shotList) p.shotList = [];
        if (append) p.shotList.push(...result.shots);
        else p.shotList = result.shots;
      });
      closeImportDialog();
      switchModule('shotlist');
      showToast(`Imported ${result.shots.length} shots`, 'success');
    };
    setImportBtnLoading(false);
  } catch (err) {
    console.error(err);
    setImportStatus('Error: ' + err.message, 'error');
    setImportBtnLoading(false);
  }
}
window.importShotListHandler = importShotListHandler;

async function importContactsHandler() {
  const url = document.getElementById('importUrl')?.value?.trim();
  if (!url) { setImportStatus('Please paste a Google Sheet URL', 'warning'); return; }
  setImportBtnLoading(true);
  setImportStatus('Reading sheet...', 'info');
  try {
    const result = await gwsImportContactsFromSheet(url);
    if (!result.contacts.length) {
      setImportStatus('No contacts found in sheet', 'warning');
      setImportBtnLoading(false);
      return;
    }
    const preview = document.getElementById('importPreview');
    preview.classList.remove('hidden');
    preview.innerHTML = `
      <div class="text-xs text-gray-400 mb-2">${result.contacts.length} contacts ready to import</div>
      <table class="text-xs w-full">
        <thead><tr class="text-gray-500"><th class="text-left p-1">Name</th><th class="text-left p-1">Role</th><th class="text-left p-1">Dept</th><th class="text-left p-1">Email</th></tr></thead>
        <tbody>
          ${result.contacts.slice(0,8).map(c => `<tr class="text-gray-300"><td class="p-1">${escapeHtml(c.name)}</td><td class="p-1 text-gray-500">${escapeHtml(c.role)}</td><td class="p-1 text-gray-500">${escapeHtml(c.dept)}</td><td class="p-1 text-gray-500 truncate" style="max-width:140px">${escapeHtml(c.email)}</td></tr>`).join('')}
        </tbody>
      </table>
      ${result.contacts.length > 8 ? `<div class="text-gray-600 mt-1 text-xs">... and ${result.contacts.length - 8} more</div>` : ''}
    `;
    setImportStatus('Ready to import', 'success');

    const btn = document.getElementById('importBtn');
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Confirm Import (${result.contacts.length})`;
    btn.onclick = () => {
      const append = confirm(`Append ${result.contacts.length} contacts? OK = APPEND, Cancel = REPLACE.`);
      updateProject(p => {
        if (!p.contacts) p.contacts = [];
        if (append) p.contacts.push(...result.contacts);
        else p.contacts = result.contacts;
      });
      closeImportDialog();
      switchModule('contacts');
      showToast(`Imported ${result.contacts.length} contacts`, 'success');
    };
    setImportBtnLoading(false);
  } catch (err) {
    console.error(err);
    setImportStatus('Error: ' + err.message, 'error');
    setImportBtnLoading(false);
  }
}
window.importContactsHandler = importContactsHandler;

// ============================================================
// CONNECTION DIAGNOSTICS
// ============================================================
async function showConnectionDiagnostics() {
  const modal = document.createElement('div');
  modal.id = 'diagModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-dark-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
      <div class="p-5 border-b border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-bold flex items-center gap-2">
          <span>🩺</span> Google Workspace Health Check
        </h2>
        <button onclick="document.getElementById('diagModal')?.remove()" class="text-gray-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-5 space-y-2 text-sm" id="diagResults">
        <div class="text-gray-500">Running tests...</div>
      </div>
      <div class="p-5 border-t border-gray-700 flex justify-between items-center">
        <a href="https://console.cloud.google.com/apis/library" target="_blank" class="text-xs text-brand-400 hover:text-brand-300">Open Cloud Console ↗</a>
        <button onclick="document.getElementById('diagModal')?.remove()" class="btn btn-secondary btn-sm">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  const results = await gwsHealthCheck();
  const html = Object.entries(results).map(([name, status]) => {
    const isOk = status.startsWith('✅');
    const color = isOk ? 'text-green-400' : status.includes('⚠️') ? 'text-yellow-400' : 'text-red-400';
    return `<div class="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"><span class="font-medium">${name}</span><span class="${color} text-xs">${status}</span></div>`;
  }).join('');
  document.getElementById('diagResults').innerHTML = html || '<div class="text-red-400">Not signed in.</div>';
}
window.showConnectionDiagnostics = showConnectionDiagnostics;

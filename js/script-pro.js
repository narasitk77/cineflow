// ============================================================
// CINEFLOW — SCRIPT PRO (v1.6)
//   • Title page editor
//   • Revision tracking with industry colored pages
//   • Page-count / eighths estimation
//   • Script sides generator
// ============================================================

// Industry-standard revision color sequence
const REVISION_COLORS = [
  { name: 'White',     hex: '#f3f4f6' },
  { name: 'Blue',      hex: '#60a5fa' },
  { name: 'Pink',      hex: '#f472b6' },
  { name: 'Yellow',    hex: '#fbbf24' },
  { name: 'Green',     hex: '#34d399' },
  { name: 'Goldenrod', hex: '#d4a017' },
  { name: 'Buff',      hex: '#e8d5a3' },
  { name: 'Salmon',    hex: '#fa8072' },
  { name: 'Cherry',    hex: '#b91c1c' }
];

// ---- SUBTITLE / STATUS ----
function scriptProSubtitle(p) {
  const revCount = (p.scriptRevisions || []).length;
  const cur = currentRevisionName(p);
  return `Industry-standard formatting · ${cur} revision${revCount ? ` · ${revCount} saved` : ''}`;
}
window.scriptProSubtitle = scriptProSubtitle;

function currentRevisionName(p) {
  const idx = p.currentRevision ?? 0;
  return REVISION_COLORS[idx % REVISION_COLORS.length].name;
}
function currentRevisionColor(p) {
  const idx = p.currentRevision ?? 0;
  return REVISION_COLORS[idx % REVISION_COLORS.length].hex;
}
window.currentRevisionColor = currentRevisionColor;

// ---- PAGE COUNT ESTIMATION ----
// Film scripts: ~1 page = 1 minute. A page holds 8 "eighths".
function estimatePageCount(script) {
  if (!script || !script.length) return 0;
  let lines = 0;
  for (const l of script) {
    const text = l.text || '';
    switch (l.type) {
      case 'scene':         lines += 2; break;                          // blank + heading
      case 'action':        lines += Math.max(1, Math.ceil(text.length / 60)) + 0.3; break;
      case 'character':     lines += 1.3; break;                        // spacing above
      case 'dialogue':      lines += Math.max(1, Math.ceil(text.length / 35)); break;
      case 'parenthetical': lines += 1; break;
      case 'transition':    lines += 2; break;
      default:              lines += 1;
    }
  }
  // ~55 typeset lines per US Letter screenplay page
  return Math.max(1, Math.round((lines / 55) * 10) / 10);
}
window.estimatePageCount = estimatePageCount;

// Convert a page fraction to eighths notation (e.g. 1.375 → "1 3/8")
function pagesToEighths(pages) {
  const whole = Math.floor(pages);
  const frac = Math.round((pages - whole) * 8);
  if (frac === 0) return whole === 0 ? '—' : `${whole}`;
  if (frac === 8) return `${whole + 1}`;
  return whole === 0 ? `${frac}/8` : `${whole} ${frac}/8`;
}
window.pagesToEighths = pagesToEighths;

// ============================================================
// TITLE PAGE EDITOR
// ============================================================
function openTitlePageModal() {
  const p = getProject();
  const tp = p.titlePage || {};
  const modal = document.createElement('div');
  modal.id = 'titlePageModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-dark-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
      <div class="p-5 border-b border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-bold">📄 Title Page</h2>
        <button onclick="document.getElementById('titlePageModal').remove()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
        <div><label class="text-xs text-gray-400 mb-1 block">Title</label><input id="tp_title" class="input-field w-full text-sm" value="${escapeHtml(tp.title || p.title || '')}"></div>
        <div><label class="text-xs text-gray-400 mb-1 block">Written by</label><input id="tp_writtenBy" class="input-field w-full text-sm" value="${escapeHtml(tp.writtenBy || p.director || '')}" placeholder="Writer name"></div>
        <div><label class="text-xs text-gray-400 mb-1 block">Based on</label><input id="tp_basedOn" class="input-field w-full text-sm" value="${escapeHtml(tp.basedOn || '')}" placeholder="(optional) source material"></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs text-gray-400 mb-1 block">Draft</label><input id="tp_draft" class="input-field w-full text-sm" value="${escapeHtml(tp.draft || 'First Draft')}"></div>
          <div><label class="text-xs text-gray-400 mb-1 block">Date</label><input type="date" id="tp_date" class="input-field w-full text-sm" value="${tp.date || ''}"></div>
        </div>
        <div><label class="text-xs text-gray-400 mb-1 block">Contact</label><textarea id="tp_contact" class="input-field w-full text-sm resize-none" rows="2" placeholder="Production company, phone, email">${escapeHtml(tp.contact || '')}</textarea></div>
        <div><label class="text-xs text-gray-400 mb-1 block">Copyright / Notice</label><input id="tp_copyright" class="input-field w-full text-sm" value="${escapeHtml(tp.copyright || '© ' + new Date().getFullYear())}"></div>
      </div>
      <div class="p-5 border-t border-gray-700 flex justify-end gap-3">
        <button onclick="document.getElementById('titlePageModal').remove()" class="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
        <button onclick="saveTitlePage()" class="btn btn-primary btn-sm">Save Title Page</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
window.openTitlePageModal = openTitlePageModal;

function saveTitlePage() {
  const tp = {
    title:     document.getElementById('tp_title').value,
    writtenBy: document.getElementById('tp_writtenBy').value,
    basedOn:   document.getElementById('tp_basedOn').value,
    draft:     document.getElementById('tp_draft').value,
    date:      document.getElementById('tp_date').value,
    contact:   document.getElementById('tp_contact').value,
    copyright: document.getElementById('tp_copyright').value
  };
  updateProject(p => { p.titlePage = tp; });
  document.getElementById('titlePageModal')?.remove();
  showToast('Title page saved', 'success');
  renderScript();
}
window.saveTitlePage = saveTitlePage;

// ============================================================
// REVISION TRACKING
// ============================================================
function showRevisionsPanel() {
  const p = getProject();
  const revs = p.scriptRevisions || [];
  const curIdx = p.currentRevision ?? 0;
  const modal = document.createElement('div');
  modal.id = 'revisionsModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-dark-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
      <div class="p-5 border-b border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-bold">🎨 Script Revisions</h2>
        <button onclick="document.getElementById('revisionsModal').remove()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="p-5">
        <div class="bg-dark-900 border border-gray-700 rounded-lg p-3 mb-4 flex items-center gap-3">
          <span class="revision-dot" style="background:${currentRevisionColor(p)}"></span>
          <div class="flex-1">
            <div class="text-sm font-medium">Current: ${currentRevisionName(p)} revision</div>
            <div class="text-xs text-gray-500">${(p.script||[]).length} lines · ~${estimatePageCount(p.script)} pages</div>
          </div>
          <button onclick="saveScriptRevision()" class="btn btn-primary btn-sm">📸 Snapshot &amp; Advance</button>
        </div>
        <div class="text-xs text-gray-500 mb-2">Revision history (newest first)</div>
        <div class="space-y-2 max-h-72 overflow-y-auto">
          ${revs.length === 0 ? '<p class="text-xs text-gray-600">No revisions saved yet. Click "Snapshot &amp; Advance" to lock the current draft and move to the next revision color.</p>' :
            revs.slice().reverse().map((r) => {
              const realIdx = revs.indexOf(r);
              return `<div class="flex items-center gap-3 bg-dark-900 border border-gray-700 rounded-lg p-3">
                <span class="revision-dot" style="background:${r.hex}"></span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium">${escapeHtml(r.colorName)} — ${escapeHtml(r.label || 'Revision')}</div>
                  <div class="text-xs text-gray-500">${formatDate(r.date)} · ${r.script.length} lines</div>
                </div>
                <button onclick="restoreScriptRevision(${realIdx})" class="btn btn-secondary btn-sm">Restore</button>
              </div>`;
            }).join('')}
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
window.showRevisionsPanel = showRevisionsPanel;

function saveScriptRevision() {
  const p = getProject();
  const curIdx = p.currentRevision ?? 0;
  const color = REVISION_COLORS[curIdx % REVISION_COLORS.length];
  const label = prompt(`Label for this ${color.name} revision:`, color.name + ' Draft');
  if (label === null) return;
  updateProject(pp => {
    if (!pp.scriptRevisions) pp.scriptRevisions = [];
    pp.scriptRevisions.push({
      id: 'rev_' + Date.now(),
      colorName: color.name,
      hex: color.hex,
      label: label || color.name + ' Draft',
      date: new Date().toISOString().split('T')[0],
      script: JSON.parse(JSON.stringify(pp.script || []))
    });
    pp.currentRevision = (curIdx + 1) % REVISION_COLORS.length;
  });
  document.getElementById('revisionsModal')?.remove();
  showToast(`${color.name} revision locked — now on ${REVISION_COLORS[(curIdx+1)%REVISION_COLORS.length].name}`, 'success');
  renderScript();
}
window.saveScriptRevision = saveScriptRevision;

function restoreScriptRevision(idx) {
  const p = getProject();
  const rev = p.scriptRevisions?.[idx];
  if (!rev) return;
  if (!confirm(`Restore the "${rev.colorName} — ${rev.label}" revision? Your current script will be replaced (snapshot it first if needed).`)) return;
  updateProject(pp => { pp.script = JSON.parse(JSON.stringify(rev.script)); });
  document.getElementById('revisionsModal')?.remove();
  showToast(`Restored ${rev.colorName} revision`, 'success');
  renderScript();
}
window.restoreScriptRevision = restoreScriptRevision;

// ============================================================
// SCRIPT SIDES GENERATOR
// ============================================================
function openSidesGenerator() {
  const p = getProject();
  const script = p.script || [];
  // Find scene headings + their line ranges
  const scenes = [];
  script.forEach((l, i) => {
    if (l.type === 'scene') scenes.push({ index: i, heading: l.text || 'Untitled scene' });
  });
  if (!scenes.length) { showToast('No scenes found — add scene headings first', 'warning'); return; }

  const modal = document.createElement('div');
  modal.id = 'sidesModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-dark-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
      <div class="p-5 border-b border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-bold">📑 Generate Script Sides</h2>
        <button onclick="document.getElementById('sidesModal').remove()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="p-5">
        <p class="text-xs text-gray-400 mb-3">Select the scenes to include. Sides are a trimmed copy of the script for a specific shoot day or actor.</p>
        <div class="flex gap-2 mb-2">
          <button onclick="document.querySelectorAll('.side-scene-cb').forEach(c=>c.checked=true)" class="text-xs text-brand-400 hover:text-brand-300">Select all</button>
          <button onclick="document.querySelectorAll('.side-scene-cb').forEach(c=>c.checked=false)" class="text-xs text-gray-500 hover:text-gray-300">Clear</button>
        </div>
        <div class="space-y-1 max-h-72 overflow-y-auto bg-dark-900 border border-gray-700 rounded-lg p-2">
          ${scenes.map(s => `
            <label class="flex items-center gap-2 p-1.5 rounded hover:bg-dark-800 cursor-pointer">
              <input type="checkbox" class="side-scene-cb" value="${s.index}">
              <span class="text-sm font-mono text-blue-400 truncate">${escapeHtml(s.heading)}</span>
            </label>`).join('')}
        </div>
      </div>
      <div class="p-5 border-t border-gray-700 flex justify-end gap-3">
        <button onclick="document.getElementById('sidesModal').remove()" class="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
        <button onclick="generateSides()" class="btn btn-primary btn-sm">Download Sides (.txt)</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
window.openSidesGenerator = openSidesGenerator;

function generateSides() {
  const p = getProject();
  const script = p.script || [];
  const selected = [...document.querySelectorAll('.side-scene-cb:checked')].map(c => parseInt(c.value));
  if (!selected.length) { showToast('Select at least one scene', 'warning'); return; }

  // For each selected scene heading index, grab lines until the next scene heading
  let out = `${(p.titlePage?.title || p.title || 'UNTITLED').toUpperCase()} — SIDES\n`;
  out += `${currentRevisionName(p)} revision · ${new Date().toLocaleDateString()}\n`;
  out += '='.repeat(50) + '\n\n';

  selected.sort((a, b) => a - b).forEach(startIdx => {
    for (let i = startIdx; i < script.length; i++) {
      if (i > startIdx && script[i].type === 'scene') break;
      const l = script[i];
      const prefix = l.type === 'scene' ? '\n' : l.type === 'character' ? '\n\t\t\t' :
                     l.type === 'dialogue' ? '\t\t' : l.type === 'parenthetical' ? '\t\t\t' :
                     l.type === 'transition' ? '\n\t\t\t\t\t' : '';
      out += prefix + (l.text || '') + '\n';
    }
    out += '\n';
  });

  const blob = new Blob([out], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (p.title || 'script').replace(/\s+/g, '-') + '-sides.txt';
  a.click();
  URL.revokeObjectURL(a.href);

  document.getElementById('sidesModal')?.remove();
  showToast(`Generated sides for ${selected.length} scene(s)`, 'success');
}
window.generateSides = generateSides;

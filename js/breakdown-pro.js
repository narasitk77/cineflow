// ============================================================
// CINEFLOW — BREAKDOWN PRO (v1.7)
//   • Element Database panel — every element, where it's used
//   • DOOD report — Day Out of Days (cast × shoot days)
// ============================================================

// ============================================================
// ELEMENT DATABASE PANEL
// ============================================================
function showElementDatabase() {
  const p = getProject();
  const bd = p.breakdown || { scenes: [] };
  const db = buildElementDB(bd);
  const totalElements = Object.values(db).reduce((s, arr) => s + arr.length, 0);

  const modal = document.createElement('div');
  modal.id = 'elementDBModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-dark-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
      <div class="p-5 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold">📚 Element Database</h2>
          <p class="text-xs text-gray-500">${totalElements} unique elements across ${(bd.scenes||[]).length} scenes</p>
        </div>
        <button onclick="document.getElementById('elementDBModal').remove()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="p-5 max-h-[70vh] overflow-y-auto">
        ${totalElements === 0 ? '<p class="text-sm text-gray-500 text-center py-8">No elements tagged yet. Tag elements in the scene breakdowns below.</p>' :
          BREAKDOWN_CATEGORIES.map(cat => {
            const items = db[cat.key] || [];
            if (!items.length) return '';
            return `
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="breakdown-tag" style="background:${cat.bg};color:${cat.color}">${cat.label}</span>
                <span class="text-xs text-gray-600">${items.length}</span>
              </div>
              <div class="space-y-1">
                ${items.sort((a,b)=>b.scenes.length-a.scenes.length).map(e => `
                  <div class="flex items-center justify-between gap-2 bg-dark-900 border border-gray-800 rounded-lg px-3 py-1.5">
                    <span class="text-sm truncate">${escapeHtml(e.name)}</span>
                    <div class="flex gap-1 flex-wrap justify-end">
                      ${e.scenes.slice(0,8).map(n=>`<span class="text-xs bg-dark-950 text-gray-400 px-1.5 py-0.5 rounded font-mono">SC ${escapeHtml(String(n))}</span>`).join('')}
                      ${e.scenes.length>8?`<span class="text-xs text-gray-600">+${e.scenes.length-8}</span>`:''}
                    </div>
                  </div>`).join('')}
              </div>
            </div>`;
          }).join('')}
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
window.showElementDatabase = showElementDatabase;

// ============================================================
// DOOD — DAY OUT OF DAYS REPORT
// ============================================================
// Cast × shoot days grid. Codes: S=Start, W=Work, H=Hold, F=Finish
// (combined: SW, WF, SWF). Requires stripboard days + cast tags.
function showDOODReport() {
  const p = getProject();
  const bd = p.breakdown || { scenes: [] };
  const scenes = bd.scenes || [];

  // Ensure each breakdown scene has an id (same scheme as Stripboard)
  scenes.forEach((s, i) => { if (!s.id) s.id = 'sc_' + i; });

  const days = p.stripboard?.days || [];

  const modal = document.createElement('div');
  modal.id = 'doodModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';

  if (!days.length) {
    modal.innerHTML = doodShell(`
      <div class="text-center py-10 text-gray-500">
        <div class="text-3xl mb-3">🗓️</div>
        <p class="mb-2">DOOD needs a shooting schedule first.</p>
        <p class="text-xs">Go to the <strong>Stripboard</strong> module and assign scenes to shoot days,
        then come back here.</p>
        <button onclick="document.getElementById('doodModal').remove();switchModule('stripboard')" class="btn btn-primary btn-sm mt-4">Open Stripboard</button>
      </div>`);
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    return;
  }

  // cast member → set of day indices they work
  const castWork = {};   // name → Set(dayIndex)
  scenes.forEach(scene => {
    const cast = scene.elements?.cast || [];
    // which day index is this scene on?
    let dayIdx = -1;
    days.forEach((d, di) => { if ((d.sceneIds || []).includes(scene.id)) dayIdx = di; });
    if (dayIdx === -1) return;
    cast.forEach(name => {
      if (!castWork[name]) castWork[name] = new Set();
      castWork[name].add(dayIdx);
    });
  });

  const castNames = Object.keys(castWork).sort();

  if (!castNames.length) {
    modal.innerHTML = doodShell(`
      <div class="text-center py-10 text-gray-500">
        <div class="text-3xl mb-3">🎭</div>
        <p class="mb-2">No cast tagged on scheduled scenes.</p>
        <p class="text-xs">Tag <strong>Cast</strong> elements in the breakdown for scenes that are
        assigned to shoot days.</p>
      </div>`);
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    return;
  }

  // Build the grid
  const headerCells = days.map((d, i) =>
    `<th class="dood-cell dood-head" title="${escapeHtml(d.label||'')} ${d.date||''}">D${i+1}</th>`
  ).join('');

  const rows = castNames.map(name => {
    const work = castWork[name];
    const sorted = [...work].sort((a,b)=>a-b);
    const first = sorted[0], last = sorted[sorted.length-1];
    let totalWork = 0, totalHold = 0;
    const cells = days.map((d, di) => {
      if (di < first || di > last) return `<td class="dood-cell"></td>`;
      let code;
      if (di === first && di === last) code = 'SWF';
      else if (di === first) code = 'SW';
      else if (di === last) code = 'WF';
      else if (work.has(di)) code = 'W';
      else code = 'H';
      if (code.includes('W')) totalWork++;
      if (code === 'H') totalHold++;
      return `<td class="dood-cell dood-${code.includes('H')&&code==='H'?'hold':'work'}" title="${doodCodeLabel(code)}">${code}</td>`;
    }).join('');
    return `<tr>
      <td class="dood-cell dood-name">${escapeHtml(name)}</td>
      ${cells}
      <td class="dood-cell dood-total">${totalWork}</td>
      <td class="dood-cell dood-total" style="color:#fbbf24">${totalHold}</td>
    </tr>`;
  }).join('');

  modal.innerHTML = doodShell(`
    <div class="mb-3 flex flex-wrap gap-2 text-xs">
      <span class="dood-legend dood-work">SW</span><span class="text-gray-500">Start+Work</span>
      <span class="dood-legend dood-work">W</span><span class="text-gray-500">Work</span>
      <span class="dood-legend dood-hold">H</span><span class="text-gray-500">Hold</span>
      <span class="dood-legend dood-work">WF</span><span class="text-gray-500">Work+Finish</span>
    </div>
    <div class="overflow-x-auto">
      <table class="dood-table">
        <thead><tr>
          <th class="dood-cell dood-head dood-name">Cast</th>
          ${headerCells}
          <th class="dood-cell dood-head" title="Total work days">∑W</th>
          <th class="dood-cell dood-head" title="Total hold days">∑H</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="text-xs text-gray-600 mt-3">${castNames.length} cast members across ${days.length} shoot days.
    Hold days = days a cast member is between their first and last shoot day but not working (still on payroll).</p>
    <div class="flex justify-end mt-3">
      <button onclick="printDOOD()" class="btn btn-secondary btn-sm">🖨️ Print DOOD</button>
    </div>
  `, true);
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
window.showDOODReport = showDOODReport;

function doodShell(inner, wide) {
  return `
    <div class="bg-dark-800 rounded-2xl w-full ${wide?'max-w-4xl':'max-w-md'} border border-gray-700 shadow-2xl">
      <div class="p-5 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold">📅 Day Out of Days (DOOD)</h2>
          <p class="text-xs text-gray-500">Cast scheduling report</p>
        </div>
        <button onclick="document.getElementById('doodModal').remove()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="p-5" id="doodContent">${inner}</div>
    </div>`;
}

function doodCodeLabel(code) {
  return { S:'Start', W:'Work', H:'Hold', F:'Finish', SW:'Start + Work', WF:'Work + Finish', SWF:'Start + Work + Finish' }[code] || code;
}

function printDOOD() {
  const content = document.getElementById('doodContent')?.innerHTML;
  if (!content) return;
  const w = window.open('', '_blank');
  const p = getProject();
  w.document.write(`<!DOCTYPE html><html><head><title>DOOD — ${escapeHtml(p.title||'')}</title>
    <style>
      body{font-family:sans-serif;padding:24px;color:#111}
      h1{font-size:18px;margin-bottom:4px}
      .dood-table{border-collapse:collapse;width:100%;font-size:12px}
      .dood-cell{border:1px solid #ccc;padding:4px 8px;text-align:center}
      .dood-name{text-align:left;font-weight:600}
      .dood-head{background:#f0f0f0;font-weight:700}
      .dood-work{background:#d1fae5}
      .dood-hold{background:#fef3c7}
      .dood-legend{display:inline-block;padding:1px 6px;border:1px solid #ccc;border-radius:3px;margin-right:2px}
    </style></head><body>
    <h1>${escapeHtml(p.title||'Production')} — Day Out of Days</h1>
    <p style="color:#666;font-size:12px;margin-bottom:16px">Generated ${new Date().toLocaleDateString()}</p>
    ${content}
    </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 250);
}
window.printDOOD = printDOOD;

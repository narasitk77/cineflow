// ============================================================
// CINEFLOW — COLLABORATION (v1.8)
//   • Comments — leave notes on any module, with author + resolve
//   • Activity log — auto-tracked history of project changes
//   • Project templates — start projects pre-populated
// ============================================================

// ---- USER IDENTITY ----
function getUserName() {
  return localStorage.getItem('cf_user_name') || 'Me';
}
function setUserName(n) {
  localStorage.setItem('cf_user_name', n || 'Me');
}
window.getUserName = getUserName;
window.setUserName = setUserName;

// ---- ACTIVITY LOG ----
function logActivity(action, detail) {
  try {
    updateProject(p => {
      if (!p.activity) p.activity = [];
      p.activity.unshift({
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
        action, detail: detail || '',
        ts: new Date().toISOString(),
        user: getUserName()
      });
      if (p.activity.length > 200) p.activity.length = 200;  // cap history
    });
  } catch(_) { /* updateProject may be unavailable on dashboard */ }
}
window.logActivity = logActivity;

// ---- COMMENTS ----
function addComment(text, target) {
  if (!text || !text.trim()) return;
  updateProject(p => {
    if (!p.comments) p.comments = [];
    p.comments.unshift({
      id: 'cm_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      text: text.trim(),
      target: target || currentModule || 'general',
      author: getUserName(),
      ts: new Date().toISOString(),
      resolved: false
    });
  });
  logActivity('comment', `commented on ${target || currentModule}`);
}
function resolveComment(id) {
  updateProject(p => {
    const c = p.comments?.find(x => x.id === id);
    if (c) c.resolved = !c.resolved;
  });
  showCollabPanel('comments');
}
function deleteComment(id) {
  updateProject(p => { p.comments = (p.comments || []).filter(c => c.id !== id); });
  showCollabPanel('comments');
}
window.resolveComment = resolveComment;
window.deleteComment = deleteComment;

// ---- COLLAB PANEL (Comments + Activity tabs) ----
let collabTab = 'comments';
function showCollabPanel(tab) {
  collabTab = tab || collabTab || 'comments';
  const p = getProject();
  if (!p) return;
  const comments = p.comments || [];
  const activity = p.activity || [];
  const openComments = comments.filter(c => !c.resolved);

  let modal = document.getElementById('collabModal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'collabModal';
  modal.className = 'modal-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-end';
  modal.innerHTML = `
    <div class="bg-dark-800 h-full w-full max-w-md border-l border-gray-700 shadow-2xl flex flex-col collab-panel">
      <div class="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-bold">Collaboration</h2>
        <button onclick="document.getElementById('collabModal').remove()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <div class="flex border-b border-gray-700">
        <button onclick="showCollabPanel('comments')" class="collab-tab ${collabTab==='comments'?'active':''}">
          💬 Comments ${openComments.length?`<span class="collab-badge">${openComments.length}</span>`:''}
        </button>
        <button onclick="showCollabPanel('activity')" class="collab-tab ${collabTab==='activity'?'active':''}">
          📋 Activity
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        ${collabTab === 'comments' ? renderCommentsTab(comments) : renderActivityTab(activity)}
      </div>
      ${collabTab === 'comments' ? `
      <div class="p-4 border-t border-gray-700">
        <div class="flex gap-2">
          <input id="newCommentInput" class="input-field text-sm flex-1" placeholder="Add a comment on ${escapeHtml(currentModule||'this project')}…"
            onkeydown="if(event.key==='Enter')submitComment()">
          <button onclick="submitComment()" class="btn btn-primary btn-sm">Post</button>
        </div>
        <p class="text-xs text-gray-600 mt-2">Posting as <strong>${escapeHtml(getUserName())}</strong> · <button onclick="changeUserName()" class="text-brand-400 hover:underline">change</button></p>
      </div>` : ''}
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  setTimeout(() => document.getElementById('newCommentInput')?.focus(), 50);
}
window.showCollabPanel = showCollabPanel;

function renderCommentsTab(comments) {
  if (!comments.length) {
    return `<div class="text-center py-10 text-gray-600">
      <div class="text-3xl mb-2">💬</div>
      <p class="text-sm">No comments yet.</p>
      <p class="text-xs mt-1">Leave notes for your team — review feedback, reminders, questions.</p>
    </div>`;
  }
  const open = comments.filter(c => !c.resolved);
  const resolved = comments.filter(c => c.resolved);
  return `
    ${open.map(renderCommentCard).join('')}
    ${resolved.length ? `<div class="text-xs text-gray-600 uppercase tracking-wider mt-4 mb-2">Resolved (${resolved.length})</div>${resolved.map(renderCommentCard).join('')}` : ''}
  `;
}

function renderCommentCard(c) {
  return `
    <div class="bg-dark-900 border border-gray-800 rounded-lg p-3 mb-2 ${c.resolved?'opacity-50':''}">
      <div class="flex items-start gap-2">
        <div class="contact-avatar w-7 h-7 text-xs flex-shrink-0" style="background:${avatarColor(c.author)}">${initials(c.author)}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">${escapeHtml(c.author)}</span>
            <span class="text-xs text-gray-600">${timeAgo(c.ts)}</span>
            <span class="text-xs bg-dark-950 text-gray-500 px-1.5 rounded">${escapeHtml(c.target)}</span>
          </div>
          <p class="text-sm text-gray-300 mt-1 ${c.resolved?'line-through':''}">${escapeHtml(c.text)}</p>
          <div class="flex gap-3 mt-2">
            <button onclick="resolveComment('${c.id}')" class="text-xs ${c.resolved?'text-gray-500':'text-green-400'} hover:underline">${c.resolved?'Reopen':'✓ Resolve'}</button>
            <button onclick="deleteComment('${c.id}')" class="text-xs text-red-500 hover:underline">Delete</button>
          </div>
        </div>
      </div>
    </div>`;
}

function renderActivityTab(activity) {
  if (!activity.length) {
    return `<div class="text-center py-10 text-gray-600">
      <div class="text-3xl mb-2">📋</div>
      <p class="text-sm">No activity recorded yet.</p>
      <p class="text-xs mt-1">Project changes will appear here automatically.</p>
    </div>`;
  }
  const icons = { comment:'💬', edit:'✏️', create:'➕', delete:'🗑️', revision:'🎨', callsheet:'📄', export:'📤', import:'📥', milestone:'🚩' };
  return activity.map(a => `
    <div class="flex items-start gap-2 py-2 border-b border-gray-800 last:border-0">
      <span class="text-base flex-shrink-0">${icons[a.action] || '•'}</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-300">${escapeHtml(a.detail || a.action)}</p>
        <p class="text-xs text-gray-600">${escapeHtml(a.user)} · ${timeAgo(a.ts)}</p>
      </div>
    </div>`).join('');
}

function submitComment() {
  const input = document.getElementById('newCommentInput');
  if (!input || !input.value.trim()) return;
  addComment(input.value, currentModule);
  input.value = '';
  showCollabPanel('comments');
}
window.submitComment = submitComment;

function changeUserName() {
  const name = prompt('Your name (shown on comments & activity):', getUserName());
  if (name) { setUserName(name); showCollabPanel(collabTab); showToast('Name updated', 'success'); }
}
window.changeUserName = changeUserName;

// Relative time helper
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  if (h < 24) return h + 'h ago';
  if (d < 30) return d + 'd ago';
  return new Date(iso).toLocaleDateString();
}
window.timeAgo = timeAgo;

// ============================================================
// PROJECT TEMPLATES
// ============================================================
const PROJECT_TEMPLATES = {
  blank: {
    label: 'Blank Project',
    desc: 'Empty project — start from scratch',
    apply: () => ({})
  },
  commercial: {
    label: 'Commercial / Ad',
    desc: 'Tasks + departments tuned for a commercial shoot',
    apply: () => ({
      tasks: {
        todo: [
          { id:'t_'+Date.now()+'_1', title:'Client briefing & approval', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_2', title:'Storyboard & treatment', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_3', title:'Location scout', priority:'medium', due:'' },
          { id:'t_'+Date.now()+'_4', title:'Talent casting', priority:'medium', due:'' },
          { id:'t_'+Date.now()+'_5', title:'Equipment & crew booking', priority:'medium', due:'' }
        ],
        inProgress: [], done: []
      },
      calendar: [
        { id:'ev_'+Date.now()+'_1', title:'Pre-Production Meeting', date:'', type:'meeting', notes:'' },
        { id:'ev_'+Date.now()+'_2', title:'Shoot Day', date:'', type:'shoot', notes:'' },
        { id:'ev_'+Date.now()+'_3', title:'Client Delivery', date:'', type:'deadline', notes:'' }
      ]
    })
  },
  musicVideo: {
    label: 'Music Video',
    desc: 'Shot-list-heavy template for music videos',
    apply: () => ({
      tasks: {
        todo: [
          { id:'t_'+Date.now()+'_1', title:'Concept & treatment', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_2', title:'Artist availability', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_3', title:'Performance vs narrative breakdown', priority:'medium', due:'' },
          { id:'t_'+Date.now()+'_4', title:'Wardrobe & looks', priority:'medium', due:'' }
        ],
        inProgress: [], done: []
      }
    })
  },
  shortFilm: {
    label: 'Short Film',
    desc: 'Full pipeline: script → breakdown → schedule → shoot',
    apply: () => ({
      tasks: {
        todo: [
          { id:'t_'+Date.now()+'_1', title:'Lock the script', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_2', title:'Script breakdown', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_3', title:'Shooting schedule', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_4', title:'Cast & crew', priority:'medium', due:'' },
          { id:'t_'+Date.now()+'_5', title:'Locations & permits', priority:'medium', due:'' },
          { id:'t_'+Date.now()+'_6', title:'Call sheets', priority:'low', due:'' }
        ],
        inProgress: [], done: []
      }
    })
  },
  documentary: {
    label: 'Documentary',
    desc: 'Interview & B-roll focused workflow',
    apply: () => ({
      tasks: {
        todo: [
          { id:'t_'+Date.now()+'_1', title:'Research & subject outreach', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_2', title:'Interview scheduling', priority:'high', due:'' },
          { id:'t_'+Date.now()+'_3', title:'B-roll shot list', priority:'medium', due:'' },
          { id:'t_'+Date.now()+'_4', title:'Release forms', priority:'medium', due:'' }
        ],
        inProgress: [], done: []
      }
    })
  }
};
window.PROJECT_TEMPLATES = PROJECT_TEMPLATES;

function applyProjectTemplate(key, project) {
  const tpl = PROJECT_TEMPLATES[key];
  if (!tpl) return project;
  const data = tpl.apply();
  Object.keys(data).forEach(k => { project[k] = data[k]; });
  return project;
}
window.applyProjectTemplate = applyProjectTemplate;

// ---- COLLAB BADGE (unresolved comment count in top nav) ----
function updateCollabBadge() {
  const badge = document.getElementById('collabBadge');
  if (!badge) return;
  const p = (typeof getProject === 'function') ? getProject() : null;
  const open = (p?.comments || []).filter(c => !c.resolved).length;
  if (open > 0) { badge.textContent = open; badge.style.display = ''; }
  else { badge.style.display = 'none'; }
}
window.updateCollabBadge = updateCollabBadge;

# Contributing to CineFlow

Thanks for your interest in CineFlow! This guide will get you set up and shipping in under 10 minutes.

## Quick Start

```bash
git clone https://github.com/narasitk77/cineflow.git
cd cineflow
./start.sh
# → opens http://localhost:8899 in your default browser
```

No `npm install`, no build step, no backend. It just works.

If `start.sh` doesn't run, try one of:
```bash
node serve.js                     # uses bundled tiny static server
python3 -m http.server 8899       # if you don't have Node.js
```

## Project Structure

```
cineflow/
├── index.html                    # Dashboard
├── project.html                  # Project workspace (all modules)
├── css/styles.css                # Mobile-first design system
├── js/
│   ├── ui-utils.js               # Shared helpers + changelog data
│   ├── google-integration.js     # OAuth + Drive/Calendar/Gmail/Docs/Sheets
│   ├── import-from-google.js     # Import dialogs (Docs/Sheets → CineFlow)
│   ├── settings.js               # Settings modal (OAuth + data mgmt)
│   ├── app.js                    # Dashboard logic (CRUD projects)
│   ├── project.js                # 9 core modules
│   ├── modules-v12.js            # Stripboard, Storyboard, Media, Reports
│   └── auth-gate.js              # Login overlay
├── serve.js, start.sh            # Local server + launcher
├── README.md                     # Full developer reference
└── CHANGELOG.md                  # Version history
```

## Architecture Cheat-Sheet

- **Zero runtime deps** — Tailwind via CDN, everything else vanilla JS
- **localStorage as DB** — key `cf_projects` holds the array of all projects
- **Single write path** — `updateProject(fn)` reads → mutates via your fn → writes back
- **Module switching** — `switchModule('moduleName')` hides all `.module-view` divs, shows `#view-{name}`, then calls `render{Name}()`

## Coding Conventions

### Adding a new module

1. **HTML** — add nav button + view container in `project.html`:
   ```html
   <button onclick="switchModule('mymod')" id="mod-mymod" class="module-btn">...</button>
   <div id="view-mymod" class="module-view hidden max-w-6xl mx-auto px-4 py-6"></div>
   ```

2. **JS** — add case in `renderModule()` switch in `project.js`, then write `renderMyMod()`:
   ```js
   function renderMyMod() {
     const p = getProject();
     document.getElementById('view-mymod').innerHTML = `...`;
   }
   window.renderMyMod = renderMyMod;
   ```

3. **State schema** — extend project object in `seedDemoData()` (`app.js`) and `createProject()` (`app.js`)

4. **Mobile drawer** — add an entry in the `<aside id="mobileDrawer">` in `project.html`

### Adding a Google Workspace feature

1. Add the function in `js/google-integration.js`:
   ```js
   async function gwsMyFeature(project) {
     await ensureConnected(['drive']);   // gate on required scope
     return gwsApiFetch('https://...', { method: 'POST', ... });
   }
   window.gwsMyFeature = gwsMyFeature;
   ```

2. Use `gwsApiFetch()` for HTTP calls — it auto-handles 401/403 errors and prompts re-auth
3. Wire it up in the relevant module's render function
4. Test with `showConnectionDiagnostics()` to verify the API is reachable

### Adding a changelog entry

When you ship a meaningful change, update **both**:

1. `js/ui-utils.js` — bump `APP_VERSION` and prepend a new entry to the `CHANGELOG` array
2. `CHANGELOG.md` — add the same content in human-readable form

The bell icon in the app will automatically show a red dot for users who haven't seen the new version.

## Pull Request Checklist

- [ ] Code runs in browser without errors (`Console` tab clean)
- [ ] No new runtime dependencies (Tailwind CDN is fine; npm packages need discussion)
- [ ] Existing schema is backwards-compatible (old projects still load)
- [ ] If adding a Google API call: handles `ensureConnected()` + uses `gwsApiFetch()` (auto error handling)
- [ ] Mobile view tested at `375px × 812px` (iPhone preset in DevTools)
- [ ] `README.md` + `CHANGELOG.md` updated if user-facing
- [ ] APP_VERSION bumped if shipping new feature/fix

## Reporting Bugs

Open an issue with:
- **Browser + version** (e.g. Chrome 140 on macOS)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Console errors** (F12 → Console tab)
- If Google Workspace related: paste output of **Settings → 🩺 Health Check**

## Feature Requests

Open a discussion or issue. We're especially interested in:
- StudioBinder feature parity gaps
- Thai film industry workflow improvements
- Mobile UX issues
- Performance with large projects (>500 scenes)

## Security

If you find a security vulnerability, **DO NOT** open a public issue. Email the maintainer privately.

OAuth tokens are kept in browser memory only. The OAuth Client ID is stored in localStorage but is not a secret (it's publicly exposed in any client-side OAuth app). Never commit `client_secret*.json` files.

## Code of Conduct

Be kind, be specific, be helpful. Assume good intent. Thai or English — both fine.

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE).

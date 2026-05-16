# Changelog

All notable changes to CineFlow will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
**This file is mirrored in-app at "What's New" → opened from the bell icon.**

---

## [1.7.0] — 2026-05-13

### 📋 Breakdown Pro — element database & DOOD report

The Script Breakdown module gains a reusable element database and a
Day Out of Days cast-scheduling report.

---

### ✨ Added

#### Element Database
- Every tagged element is collected into a project-wide database
- **Autocomplete** when tagging — the tag input suggests elements already
  used elsewhere in the project (shared `<datalist>`)
- Category legend shows a live count per category
- **Element DB panel** — browse every element grouped by category, each
  showing which scenes use it and how many times
- `buildElementDB()` helper aggregates `{ category: [{ name, scenes:[] }] }`

#### DOOD Report (Day Out of Days)
- Classic AD scheduling report: **cast × shoot-days** grid
- Industry status codes: **S**tart · **W**ork · **H**old · **F**inish,
  plus combined SW / WF / SWF
- Auto-computed from breakdown **cast** tags + **stripboard** day assignments
- **Hold-day tracking** — days a cast member sits between their first and
  last shoot day without working (still on payroll)
- Per-cast totals: total work-days (∑W) and hold-days (∑H)
- Print-friendly DOOD export (opens a clean print window)
- Graceful empty states (prompts to schedule the stripboard / tag cast first)

---

### 📁 New File

```
js/breakdown-pro.js   # ~230 lines — element DB panel + DOOD report
```

---

## [1.6.0] — 2026-05-13

### ✍️ Script Pro — title page, revisions, page count, sides

The Script Writer module gains the professional features needed for real
production: revision tracking, a title page, page estimates, and sides.

---

### ✨ Added

#### Title Page editor
- Modal editor: title, written by, based on, draft, date, contact, copyright
- Stored in `project.titlePage`

#### Revision tracking (industry colored pages)
- Industry-standard revision color sequence: White → Blue → Pink → Yellow →
  Green → Goldenrod → Buff → Salmon → Cherry
- **Snapshot & Advance** — locks the current draft as a revision and moves
  the working copy to the next revision color
- Full revision history with restore
- Current revision color shown as a dot in the toolbar
- Stored in `project.scriptRevisions[]` + `project.currentRevision`

#### Page count estimation
- Toolbar shows estimated page count (1 page ≈ 1 minute screen time)
- Weighted line model: scene headings, action wrapping (~60 chars/line),
  dialogue wrapping (~35 chars/line), ~55 lines per page
- `pagesToEighths()` helper converts fractions to industry "1 3/8" notation

#### Script Sides generator
- Pick any subset of scenes → download a trimmed `.txt` of just those scenes
- Sides header includes the current revision name + date
- Select-all / clear shortcuts

---

### 📁 New File

```
js/script-pro.js   # ~290 lines — title page, revisions, page count, sides
```

New schema fields (backwards compatible):
```jsonc
project.titlePage = { title, writtenBy, basedOn, draft, date, contact, copyright }
project.scriptRevisions = [{ id, colorName, hex, label, date, script:[...] }]
project.currentRevision = 0   // index into the revision color sequence
```

---

## [1.5.0] — 2026-05-13

### 🎬 Call Sheet Pro — full rewrite for production-day parity

The Call Sheet module was rebuilt from the ground up to match how StudioBinder
handles shoot-day logistics. The old single flat call-sheet object is now an
array of full call-sheet objects, one per shoot day.

---

### ✨ Added

#### Multi-day call sheets
- One **call sheet per shoot day** — switch with day tabs at the top
- **+ Day** button adds another shoot day
- Delete individual days (keeps at least one)
- Each day has its own complete data set

#### Department call times
- New **Department Call Times** block — set a call time per department
- 13 departments (Directing, Camera, Sound, Lighting/Grip, Art, Costume,
  Make-Up, Cast, Production, Post, Catering, Transport, Other)
- Per-department notes field

#### Weather block
- Conditions dropdown (Sunny, Cloudy, Rain, Thunderstorm, Hazy, Hot, …)
- High / Low temperature (°C)
- Sunrise / Sunset times

#### Schedule block
- General Call · Crew Call · Shooting Call · First Shot · Lunch · Est. Wrap

#### Emergency / Safety block
- Nearest hospital + address + phone
- Dedicated safety notes textarea (stunts, hazards, COVID, contingency)

#### Location upgrades
- Google Maps link field with one-click **Open** button
- Parking / Basecamp field

#### Scene schedule upgrades
- Each scene row now tracks **D/N** (Day/Night/Dawn/Dusk) and **Cast**
- 12-column grid layout

#### Distribution & confirmation tracking
- Track every recipient through 4 states: **Pending → Sent → Viewed → Confirmed**
- One-click **+ Add all contacts**
- Live counters: how many pending / sent / viewed / confirmed
- Per-recipient status buttons

#### Templates
- **Save as Template** — store a call sheet layout for reuse
- **Templates** picker — apply a saved template to any day
- Templates auto-strip day-specific data (date, scenes, distribution list)
- Stored in `localStorage` key `cf_cs_templates`

---

### 🔧 Data Migration

Old `callSheets[0]` flat object is auto-migrated on first open:
- Wrapped into the new array-of-objects format
- Gets an `id`, plus empty `weather`, `deptCalls`, `distribution` arrays
- **Backwards compatible** — existing call sheet data is preserved

New schema:
```jsonc
project.callSheets = [{
  id, title, date, day, director, producer, ad, ad2, upm,
  generalCall, crewCall, shootCall, firstShot, lunch, wrap,
  location, address, mapLink, parking,
  hospital, hospitalAddress, hospitalPhone,
  weather: { conditions, high, low, sunrise, sunset },
  scenes: [{ num, heading, dn, pages, cast }],
  deptCalls: [{ dept, time, notes }],
  distribution: [{ contactId, name, status, sentAt }],
  notes, safetyNotes
}]
localStorage['cf_cs_templates'] = [{ id, name, data }]
```

---

## [1.4.0] — 2026-05-13

### 🔄 Import from Google Docs & Sheets + Connection Diagnostics

Brings true two-way Google Workspace integration — not just export, now **import** too.
Includes a brand-new Health Check tool that pinpoints exactly which Google API needs to be enabled / which scope is missing.

---

### ✨ New: Import from Google

#### Script Writer
- **Import from Google Doc** button next to Export TXT / Export to Docs
- Paste a Google Doc URL → auto-fetches via Docs API
- **Auto-detects line type** for each paragraph:
  - `INT. / EXT. / ภายใน / ภายนอก` → scene heading
  - `CUT TO: / FADE IN: / SMASH CUT:` → transition
  - Short UPPERCASE lines → character name
  - `(in parens)` → parenthetical
  - Lines following character → dialogue
  - Everything else → action
- Preview first 15 lines before committing
- Append OR replace mode (confirm dialog)

#### Shot List
- **Import** button next to Add Shot
- Paste a Google Sheet URL → fetches via Sheets API
- **Smart column detection** by header name (English + Thai):
  - `Scene / Sc / ฉาก` → scene
  - `Shot #` / `Shot No` → shot letter
  - `Description / Desc / รายละเอียด` → description
  - `Type / Shot Type / Size` → shot type
  - `Angle`, `Movement`, `Lens`, `Notes` — auto-mapped
- Preview first 8 rows in a styled table
- Append OR replace

#### Contacts
- **Import** button next to Add Contact
- Same Sheets-based flow with Thai header support:
  - `Name / ชื่อ` → name
  - `Role / Position / ตำแหน่ง` → role
  - `Department / Dept / แผนก` → department
  - `Phone / Mobile / Tel / เบอร์` → phone
  - `Call Time / เรียก` → call time

---

### 🩺 Connection Diagnostics

- **Health Check button** in Settings → tests all 5 Google APIs simultaneously:
  - Drive · Calendar · Docs · Sheets · Gmail
- Reports per-API status:
  - ✅ OK
  - ⚠️ API not enabled in Cloud Console (with link to enable)
  - ⚠️ Insufficient scope (need to re-auth)
  - ❌ Token invalid
- Shows clear next steps for each problem

### 🔄 Re-auth Button

- New "Re-auth (clear scopes)" button in Settings
- Forces sign-out + immediately re-shows Login overlay
- Use when scopes have changed (e.g. after v1.4 added Sheets scope)
- Fixes the "Couldn't connect to Docs" issue from v1.3 sessions

---

### 🔧 Scope Updates

Added 2 new scopes to `DEFAULT_LOGIN_SCOPES`:
- `https://www.googleapis.com/auth/drive.readonly` — read any file you have access to
- `https://www.googleapis.com/auth/spreadsheets` — read + write Sheets

Full scope set is now: `drive` · `drive.readonly` · `calendar.events` · `gmail.send` · `documents` · `spreadsheets` · `openid email profile`

---

### 🛡️ Error Handling Improvements

`gwsApiFetch()` now auto-detects and handles:
- **401 Unauthorized** → clears token, prompts re-auth
- **403 with "insufficient permissions"** → clears token, prompts re-auth
- **403 with "API not enabled"** → shows toast with API name + console link
- **Other errors** → throw with status + message

---

### 📁 New / Updated Files

```
js/import-from-google.js   # NEW — 330 lines: import dialog + handlers + diagnostics UI
js/google-integration.js   # +150 lines: import functions, health check, error handling
js/ui-utils.js             # APP_VERSION → 1.4.0 + new changelog entry
js/settings.js             # Added Health Check + Re-auth buttons
js/project.js              # Added Import buttons to Script, ShotList, Contacts
index.html / project.html  # Wire new script tag
```

---

## [1.3.0] — 2026-05-12

### 🔐 Login-First Flow — Sign in with Google

Major UX shift: the app now opens with a **dedicated Login screen** before
anything else. Sign in once → all Google Workspace features unlocked
immediately. No more Settings detour.

---

### ✨ Added

#### Login Screen
- **Full-screen Login overlay** appears on every fresh visit
- Beautiful glassmorphism card with animated gradient backdrop
- Feature preview chips: Script · Breakdown · Shot List · Call Sheets · Stripboard · Storyboard · Drive · Calendar · Gmail · Docs
- **"Sign in with Google"** button — requests all 4 GWS scopes (Drive + Calendar + Gmail + Docs) + `openid email profile` in **one consent screen**
- **"Continue without signing in"** option for local-only mode (skipped flag stored in sessionStorage)
- Loading spinner on sign-in button during OAuth round-trip
- Version footer (`v1.3.0`)

#### User Identity
- Real Google profile (name, email, picture) fetched via `userinfo` endpoint
- **Avatar in top-right** shows user's actual profile picture
- Click avatar → **user menu** with: profile card, Settings, What's New, Sign out
- When not signed in: avatar shows "NK" placeholder with sign-in prompt
- "Signed in as {email}" toast on successful auth

#### Session Restore
- Token cached in `sessionStorage` (cleared on tab close per browser policy)
- Page refreshes within the same session **don't require re-auth**
- Token expiry checked with 60s buffer before considering valid
- `restoreGwsSession()` runs on every page load before showing login overlay

#### Default OAuth Client ID
- Pre-configured `DEFAULT_CLIENT_ID` in `js/google-integration.js` for `@thestandard.co` org
- Users can still override with their own in Settings → OAuth Configuration
- `getGwsConfig()` returns the default if nothing is saved

---

### 🎨 UX / Visual

- Animated background gradient (sky → violet) with two soft glow orbs
- Glassmorphism login card (backdrop-blur + transparent border)
- Smooth fade-in/fade-out (`@keyframes authFadeIn / authFadeOut`)
- Mobile-optimized login layout (`@media max-width: 480px`)
- User menu styles match the dark theme with hover states

---

### 🔧 Technical

#### New file: `js/auth-gate.js` (~330 lines)
- Self-injecting overlay (no HTML changes needed in `index.html` / `project.html`)
- Self-contained styles (no `styles.css` edits required)
- `runAuthGate()` runs on `DOMContentLoaded` — decides whether to show overlay
- Three states: **signed in** (hide) / **skipped** (hide for session) / **fresh** (show)
- Hooks `onGwsConnected` / `onGwsDisconnected` to update avatar reactively

#### `js/google-integration.js`
- New `DEFAULT_CLIENT_ID` constant
- New `DEFAULT_LOGIN_SCOPES` array (drive, calendar, gmail, docs, profile)
- New `restoreGwsSession()` — re-hydrate from sessionStorage
- New `gwsUserProfile()` getter
- `gwsConnect()` now fetches user profile from `oauth2/v3/userinfo`
- `gwsConnect()` now persists token + profile to sessionStorage
- `gwsDisconnect()` clears sessionStorage and profile
- Added `openid email profile` to scopes map

---

### 🔒 Security & Privacy

- Access tokens still **memory + sessionStorage only** (never localStorage, never sent to any 3rd-party server)
- sessionStorage is auto-cleared when the tab is closed (per browser policy)
- Sign-out revokes the token via `google.accounts.oauth2.revoke()` and clears all auth state
- "Continue without signing in" leaves no Google footprint
- OAuth Client ID is still public (not a secret)

---

### 📁 Updated Files

```
js/auth-gate.js          # NEW — 330 lines, login overlay + user menu + gate logic
js/google-integration.js # +50 lines — DEFAULT_CLIENT_ID, profile, sessionStorage
js/ui-utils.js           # APP_VERSION → 1.3.0 + new changelog entry
index.html               # +1 line — auth-gate.js script tag + [data-user-badge]
project.html             # +1 line — auth-gate.js script tag
```

---

## [1.2.0] — 2026-05-09

### 🎬 Full StudioBinder Parity — 4 New Modules

After a comprehensive audit comparing every CineFlow feature to StudioBinder.com,
this release adds the four missing modules to reach **full feature parity**.

CineFlow now covers all 5 StudioBinder categories: **Write · Breakdown · Visualize · Plan · Shoot** — plus Reports.

---

### ✨ Added — 4 New Modules

#### 🗂️ Stripboard
- Visual scene scheduler with **drag-and-drop** between shoot days
- Color-coded strips by time of day (DAY/NIGHT/DAWN/DUSK)
- INT/EXT indicator on each strip
- Add/remove shoot days with date and label fields
- "Unscheduled" column auto-populated from Breakdown scenes
- Scene count per day

#### 🖼️ Storyboard
- Per-shot **frame image uploads** (base64-encoded)
- Main frame display (first frame) + alt frames thumbnail strip
- Click any alt frame to make it the main
- Auto-syncs with Shot List (no separate data — just `shot.frames[]`)
- Hover-reveal upload button on each shot card
- Empty state prompts to add shots first

#### 📎 Media Library
- Centralized library of **file references and links**
- Add arbitrary URLs with custom names
- **Browse Google Drive** integration — imports recent Drive files
- Auto-detects file type (PDF, image, video, audio, doc, sheet, slides)
- Shows Drive thumbnails when available
- Per-item icons based on MIME type
- Direct "Open ↗" links to source

#### 📊 Reports
- **Production-wide breakdown summary** across all scenes
- Aggregate stats: total scenes, INT/EXT split, DAY/NIGHT split, total shots
- Per-category element reports (Cast, Props, Costumes, etc.)
- Each element shows which scenes it appears in (clickable scene tags)
- Sorted by frequency (most used first)
- Print-friendly layout

---

### 🔗 Google Workspace Enhancements

- **Drive browser** in Media Library — list 30 most-recent files with metadata
- **Google Sheets export** for shot lists (`gwsExportShotListToSheets`)
- Exposed `gwsApiFetch` and `ensureConnected` to window for custom integrations
- Drive folder navigation via `gwsDriveListRecentFiles(limit)`

---

### 🔧 Technical

- New file: `js/modules-v12.js` (450+ lines, 4 modules + helpers)
- Window exports added: `updateProject`, `getProjects`, `saveProjects`, `BREAKDOWN_CATEGORIES`
- Module nav extended to **13 modules** (was 9):
  - Overview, Write, Breakdown, Shot List, Call Sheet, Calendar, Contacts, Tasks, Moodboard
  - **+ Stripboard, Storyboard, Media, Reports** (new)
- Mobile drawer extended with all 4 new modules + emoji icons

---

### 🧪 Comprehensive Audit

Ran end-to-end test of all features:

| Module | Functions | Status |
|---|---|---|
| Script Writer | 7 functions | ✅ Pass |
| Breakdown | 4 functions | ✅ Pass |
| Shot List | 3 functions | ✅ Pass |
| Call Sheet | 4 functions | ✅ Pass |
| Calendar | 4 functions | ✅ Pass |
| Contacts | 3 functions | ✅ Pass |
| Tasks | 6 functions | ✅ Pass |
| Moodboard | 3 functions | ✅ Pass |
| Stripboard | 5 functions | ✅ Pass |
| Storyboard | 2 functions | ✅ Pass |
| Media Library | 3 functions | ✅ Pass |
| Reports | 1 function | ✅ Pass |
| GWS Integration | 12 functions | ✅ Pass |

**Total: 60+ functions verified working.**

---

### 📁 New Schema Fields

```jsonc
{
  // Per shot — for Storyboard module
  "shotList": [{ ..., "frames": [{ "url": "data:...", "caption": "..." }] }],

  // Stripboard scheduling
  "stripboard": {
    "days": [{ "date": "2026-05-12", "label": "Studio A", "sceneIds": ["sc_0", "sc_1"] }]
  },

  // Media Library
  "mediaLibrary": [{
    "id": "m_...", "type": "drive|link", "name": "...", "url": "...",
    "mimeType": "...", "thumbnailLink": "...", "addedAt": "ISO"
  }]
}
```

Schema is **backwards compatible** — old projects continue to work without these fields.

---

## [1.1.0] — 2026-05-09

### 🎨 UX Overhaul + Google Workspace Integration

A major release focused on three pillars:
1. **In-app changelog** — version history is now visible inside the app
2. **Universal responsive design** — works perfectly on phone, tablet, desktop
3. **Google Workspace integration** — Drive, Calendar, Gmail, Docs

---

### ✨ Added

#### In-App Changelog
- New "What's New" page accessible from bell icon in top nav
- Red dot badge appears when there's an unseen update
- Auto-shows on dashboard load after a version bump
- Beautiful timeline-style layout with categorized entries
- Marked latest version with a "Latest" badge

#### Mobile-First Responsive Design
- **Bottom tab bar on mobile** — universal navigation pattern (Overview, Script, Shots, Tasks, More)
- **Hamburger menu drawer** with full module navigation
- **Bottom-sheet modals** on mobile (slide up from bottom)
- **Larger tap targets** (44px+) per Apple HIG / Material Design guidelines
- **Safe-area inset support** for notched phones (iPhone X+)
- **Mobile-optimized layouts** for all 9 modules
- **Stacked grids** on small screens
- **Horizontal scroll** for kanban on mobile
- **Compact calendar cells** on mobile

#### Google Workspace Integration
- **Settings page** with full OAuth configuration UI
- **Setup wizard** with step-by-step Google Cloud Console instructions
- **Google Identity Services (GIS)** for modern OAuth flow
- **Google Drive Export** — one-click export of full project bundle:
  - Project JSON (full backup)
  - Script as .txt
  - Shot list as .csv
  - Contacts as .csv
  - Call sheet as .html
- **Google Calendar Sync** — push all production events to user's calendar with color coding by event type
- **Gmail Send** — email call sheet to all crew with email addresses
- **Google Docs Export** — script exported as a formatted Google Doc with proper screenplay styling (bold scene headings, centered character names, right-aligned transitions)
- **Quick Actions card** in Overview for one-click GWS operations
- **Connect/Disconnect controls** with status indicator

#### UI Polish
- **Toast notifications** for action feedback (success, error, info, warning)
- **Improved button system** with primary/secondary/ghost/danger variants
- **Auto-scroll to top** when switching modules
- **Active state highlighting** across mobile drawer + bottom tabs + module nav (synchronized)
- **Smooth fade-in animations** on cards
- **Dropdown action menus** on project cards (no more hover-only menus on mobile)
- **Backdrop blur** on modal overlays

#### Data Management (Settings Page)
- **Export All Data** — download full backup as JSON
- **Import Data** — restore from backup file
- **Clear All Data** — wipe localStorage with double confirmation
- **Storage usage indicator**
- **Browser detection display**

---

### 🔧 Changed

- Reorganized JS architecture: shared utilities extracted to `js/ui-utils.js`
- All modal handling now centralized in `ui-utils.js`
- All toast/escape/format helpers now globally available
- `switchModule()` now also updates mobile drawer/tab bar active states
- Project cards: action menu replaced with click-to-toggle dropdown (better mobile UX)
- Status badges hidden on small screens (room for project title)
- Settings + Changelog buttons hidden on tiny mobile (accessible via hamburger)

---

### 🐛 Fixed

- Removed conflicting `const AVATAR_COLORS` declaration that prevented `project.js` from loading after `ui-utils.js`
- Fixed module nav not collapsing on mobile (was overflowing)
- Fixed modal overflow issues on small viewports

---

### 🔒 Security & Privacy

- OAuth access tokens kept in **memory only** — never written to localStorage or sent to any server
- OAuth scopes requested **on-demand** based on which feature is being used (least privilege)
- OAuth Client ID stored in localStorage (it's not a secret — it's exposed in any client-side OAuth app)
- Setup guide explicitly explains the privacy model
- Clear disconnect option that revokes the access token

---

### 📁 New Files

```
js/ui-utils.js              # 240 lines  — shared utilities, toasts, changelog data
js/google-integration.js    # 360 lines  — full Google Workspace integration
js/settings.js              # 200 lines  — settings modal + data management
```

### 📦 Updated Files

```
css/styles.css              # rewritten with mobile-first responsive system
index.html                  # mobile drawer, bottom tab bar, changelog button, settings button
project.html                # mobile drawer, bottom tab bar, GWS-aware buttons
js/app.js                   # uses shared utilities, toast feedback
js/project.js               # GWS export buttons in script/calendar/callsheet, overview GWS card
```

---

## [1.0.0] — 2026-05-08

### 🎉 Initial Release

Complete StudioBinder-inspired production management platform built as a static web app.

### Added

#### Infrastructure
- Pure HTML/CSS/JavaScript SPA — zero npm, zero build tools
- Tailwind CSS v3 via CDN for styling
- `localStorage` as the persistence layer (key: `cf_projects`)
- `serve.js` — tiny Node.js HTTP server for local preview
- Demo data seeded on first load (3 sample projects)

#### Dashboard (`index.html`)
- Projects grid (3-column responsive layout)
- Stats bar: Total / Active / Development / Completed counts
- Filter buttons: All / Active / Development / Completed
- Live search by project title or director name
- Project cards with color accent, type badge, status badge, module counters
- New Project modal with all metadata fields + 6-color theme picker
- Duplicate/Delete project actions

#### 9 Production Modules (`project.html`)

1. **Overview** — Project info, quick stats, progress bar, pending tasks, upcoming events
2. **Script Writer** — 6 line types (Scene/Action/Character/Dialogue/Parenthetical/Transition) with per-type formatting, auto-advance on Enter, cycle types via badge click, export to .txt
3. **Script Breakdown** — 12 element categories, color-coded tags per scene
4. **Shot List** — 11 shot types, 6 angles, 11 camera movements, lens & notes, grouped by scene
5. **Call Sheet** — Full builder (header, location, schedule, call times, notes), print-ready
6. **Production Calendar** — Monthly grid, 8 event types, today highlight, click-to-add
7. **Contacts** — Cast & crew grouped by 11 departments, color avatars, mailto/tel links
8. **Task Board** — Kanban (To Do/In Progress/Done) with drag & drop, priorities, due dates
9. **Moodboard** — Image upload (base64) + URL, masonry grid, hover captions

---

[1.1.0]: #110--2026-05-09
[1.0.0]: #100--2026-05-08

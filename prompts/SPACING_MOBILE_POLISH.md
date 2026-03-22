# Spacing, Polish & Mobile Fixes

Read this entire document before starting. There are four phases.

---

## PHASE 1: Create and close GitHub issues

Use `curl` with the `$GH_TOKEN` environment variable. These will be Issues #43 and #44.

### ISSUE 43

**Title:** Polish fixes — bullet spacing, capitalization, legal note, annotation overflow
**Label:** bug
**Body:**

Five polish fixes:
1. Scope of Work: standardize bullet spacing across all item types (default, two-line, track items)
2. Systematic formatting audit of supplementary_content.json: fix ALL CAPS emphasis, remaining DP references, field paths, inconsistent quotes
3. Add legal/usage disclaimer to landing page footer (integrated into existing footer line)
4. Flow annotation: allow text wrapping instead of truncation in the top banner
5. Version bump

**Close comment:** Fixed — all polish fixes applied.

### ISSUE 44

**Title:** Mobile responsive layout
**Label:** enhancement
**Body:**

Make the app usable on mobile devices. Key changes:
- Sidebar becomes a collapsible drawer
- Vertical nav becomes a dropdown or hidden behind a menu button
- Step detail panel goes full-width on mobile
- Timeline nodes compact for smaller screens
- Top banner stacks vertically on mobile
- Touch-friendly tap targets

**Close comment:** Fixed — mobile responsive layout applied.

---

## PHASE 2: Polish fixes (Issue #43)

### Fix 1: Standardize Scope of Work bullet spacing

In StepCard.jsx, for the Scope of Work section, wrap ALL items (both single-line and two-line block types) in a parent container with consistent spacing:

```jsx
// For the default (non-track, non-play) Scope of Work rendering:
<ul className="space-y-4">
  {stepContent.owns.map((item, i) => {
    const text = typeof item === 'string' ? item : null
    if (!text) return null // skip non-string items (handled by track/play renderers)
    
    return text.includes(':') ? (
      <li key={i} className="flex items-start gap-2">
        <span className="text-slate-500 mt-1 flex-shrink-0">•</span>
        <div>
          <div className="text-sm font-semibold text-slate-200">{text.split(':')[0]}</div>
          <div className="text-sm text-slate-400 mt-0.5">
            {text.split(':').slice(1).join(':').trim().replace(/^./, c => c.toUpperCase())}
          </div>
        </div>
      </li>
    ) : (
      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
        <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
        <span>{text}</span>
      </li>
    )
  })}
</ul>
```

Key: use `space-y-4` on the `<ul>` and remove ALL individual `mb-*` classes from `<li>` elements. The container spacing handles everything uniformly.

For Step 4 track items and Step 9 play items, apply the same pattern inside each track/play card:
```jsx
<ul className="space-y-3">
  {track.items.map((item, j) => (
    // Same colon-split rendering, no individual mb-* classes
  ))}
</ul>
```

### Fix 2: Systematic formatting audit of supplementary_content.json

Open `app/public/supplementary_content.json`. Run these checks programmatically using grep or a script, and fix ALL matches:

**Check 1: ALL CAPS emphasis words.** Run:
```bash
grep -n '[A-Z]\{4,\}' supplementary_content.json | grep -v '"[A-Z_]*":' | grep -v -E '\b(SLA|CRM|PRM|API|SRE|CS|GTM|QBR|MDF|IP|LMS|RACI|KPI|OKR|NDA|SOC|ISO|SSO|SAML|SDK|CLI|JSON|URL|PDF|CSV|HTML|CSS|GDPR|CCPA|HIPAA|SOX|PII|PHI|RBAC|IAM|VPN|DNS|CDN|AWS|GCP|REST|CRUD|FIFO)\b'
```
For each match, if the ALL CAPS word is emphasis (like REMOVED, FULLY, ACTIVATED, SIGNIFICANTLY, REDUCED, ABSENT, NOT, REQUIRED, MANDATORY, PRESENT), replace with normal casing. Leave legitimate acronyms and key names unchanged.

**Check 2: Remaining DP references.** Run:
```bash
grep -n '".*DP[1-4].*"' supplementary_content.json | grep -v '"[A-Za-z_]*DP[1-4]' | grep -v 'when_DP' | grep -v 'active_when'
```
For each match in a user-facing text value, replace DP1→integration direction, DP2→commercial motions, DP3→certification requirement, DP4→regulated industries.

**Check 3: Field path references.** Run:
```bash
grep -n '[a-z_]*\.[a-z_]*' supplementary_content.json | grep -E '(partner_record|partner_profile|integration_plan|approval_record|certification_record|launch_readiness|operational_handoff|operations_record|growth_plan|lifecycle_decision)\.'
```
For each match in a user-facing text value, replace with plain language (e.g., "partner_profile.entitlements" → "the partner profile").

**Check 4: Inconsistent quote styles.** Run:
```bash
grep -n "'as applicable'" supplementary_content.json
grep -n '"as applicable"' supplementary_content.json
```
Normalize to consistent straight quotes or remove unnecessary quoting.

**Check 5: Lowercase sentence starts.** Spot-check that text values following colons or at the start of sentences begin with a capital letter. This is a visual scan, not a grep — just review a sample of 10-15 entries across different steps.

### Fix 3: Add legal/usage disclaimer to landing page footer

In `app/src/components/LandingPage.jsx`, find the existing footer area that contains "Static site — no data leaves your browser" and the builder attribution. Add the disclaimer as additional phrases in the SAME line, separated by a dot separator:

The footer text should read:
```
Static site — no data leaves your browser · Portfolio demonstration · Generic framework, not professional advice
```

Do NOT add a new paragraph or a separate block. Integrate the new phrases into the existing footer text using the same `text-xs text-slate-500` styling and `·` (middle dot) separators. The result should be a single line of small text at the bottom that includes both the existing technical note and the new disclaimer.

### Fix 4: Flow annotation text wrapping

In `app/src/components/OutputView.jsx`, find the top banner where the flow annotation text is rendered. Currently it may have `truncate`, `overflow-hidden`, `text-ellipsis`, `whitespace-nowrap`, or a fixed height that causes overflow.

Change it to allow wrapping:
```jsx
<div className="text-sm text-slate-300 flex-1 mx-4">
  {generateFlowAnnotation(config, spec)}
</div>
```

Remove any `truncate`, `whitespace-nowrap`, `overflow-hidden`, or `text-ellipsis` classes. The text should wrap naturally to a second line if needed. If the container has a fixed height, change it to `min-h-[40px]` or remove the height constraint.

Also ensure the top banner is `flex-wrap` or uses a layout that accommodates multi-line text without pushing other elements off-screen.

---

## PHASE 3: Mobile responsive layout (Issue #44)

### 3A: OutputView.jsx — responsive layout

**Top banner:** Stack vertically on mobile.
```jsx
// Change the top banner flex container:
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 border-b border-slate-800">
  <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-200 flex-shrink-0">
    ← Home
  </button>
  <div className="text-sm text-slate-300 flex-1">
    {generateFlowAnnotation(config, spec)}
  </div>
  <div className="flex items-center gap-3 flex-shrink-0">
    {/* attribution and share link */}
  </div>
</div>
```

**Sidebar:** Hidden on mobile, shown as a slide-out drawer.
```jsx
// Add state for mobile sidebar
const [sidebarOpen, setSidebarOpen] = useState(false)

// Mobile toggle button (visible only on small screens)
<button
  onClick={() => setSidebarOpen(o => !o)}
  className="sm:hidden fixed bottom-4 right-4 z-50 bg-cyan-500 text-white p-3 rounded-full shadow-lg"
>
  {/* Gear/settings icon */}
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
</button>

// Sidebar container
<div className={`
  fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800 transform transition-transform duration-200
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  sm:relative sm:translate-x-0 sm:w-auto sm:border-r-0
`}>
  {/* Close button for mobile */}
  <button onClick={() => setSidebarOpen(false)} className="sm:hidden absolute top-3 right-3 text-slate-400">✕</button>
  <Sidebar {...sidebarProps} />
</div>

// Overlay when sidebar is open on mobile
{sidebarOpen && (
  <div className="fixed inset-0 bg-black/50 z-30 sm:hidden" onClick={() => setSidebarOpen(false)} />
)}
```

**Main content area:** Full width on mobile.
```jsx
<div className="flex-1 overflow-y-auto w-full">
  {/* content */}
</div>
```

**VIEW 3 (Step Detail) — vertical nav and panel:**
On mobile, hide the vertical nav and show only the detail panel full-width. Add a "Steps" button that opens the nav as a dropdown:

```jsx
// Mobile: hide nav, show panel full-width
<div className="flex flex-col sm:flex-row">
  {/* Mobile step selector */}
  <div className="sm:hidden px-4 py-2 border-b border-slate-800">
    <select
      value={selectedStepKey}
      onChange={(e) => setSelectedStepKey(e.target.value)}
      className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-700"
    >
      {Object.keys(spec.workflow_steps).map(key => (
        <option key={key} value={key} disabled={!isStepActive(key, config)}>
          {key.replace('step_', '')} — {SHORT_STEP_NAMES[key]}
        </option>
      ))}
    </select>
  </div>
  
  {/* Desktop: vertical nav (hidden on mobile) */}
  <div className="hidden sm:block w-48 flex-shrink-0 border-r border-slate-800 overflow-y-auto max-h-[calc(100vh-120px)]">
    <StepMap variant="vertical" ... />
  </div>
  
  {/* Detail panel: full width on mobile, flex-1 on desktop */}
  <div className="flex-1 overflow-y-auto max-h-[calc(100vh-120px)]">
    {/* header and StepCard */}
  </div>
</div>
```

**Detail panel header:** Stack prev/next below the step name on mobile:
```jsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 sticky top-0 bg-slate-950 z-10 gap-2">
  <div className="text-center sm:text-left flex-1">
    <div className="text-sm font-semibold text-slate-200">{stepData.step_name}</div>
    <div className="text-xs text-slate-400">{cleanOwnerText(stepData.primary_owner)}</div>
  </div>
  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
    <button onClick={() => setSelectedStepKey(adj.prev)} disabled={!adj.prev}
      className={`text-sm ${adj.prev ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 cursor-default'}`}>
      {adj.prev ? `← ${getShortStepName(adj.prev)}` : ''}
    </button>
    <button onClick={() => setSelectedStepKey(adj.next)} disabled={!adj.next}
      className={`text-sm ${adj.next ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 cursor-default'}`}>
      {adj.next ? `${getShortStepName(adj.next)} →` : ''}
    </button>
    <button onClick={() => setSelectedStepKey(null)} className="text-slate-500 hover:text-slate-200">✕</button>
  </div>
</div>
```

### 3B: StepMap.jsx — responsive timeline

The vertical timeline nodes should be narrower on mobile:
```jsx
// Change node width from max-w-xs to responsive:
<div className="max-w-[280px] sm:max-w-xs w-full mx-auto border border-slate-700 bg-slate-800/60 hover:border-cyan-500/50 cursor-pointer rounded-xl p-3 sm:p-4">
  <div className="text-xs text-slate-500">Step {stepNum}</div>
  <div className="text-xs sm:text-sm font-semibold text-slate-200">{stepName}</div>
  <div className="text-xs text-slate-400">{owner}</div>
</div>
```

### 3C: LandingPage.jsx — responsive

The archetype cards should wrap on smaller screens:
```jsx
// Change the archetype grid from fixed 5 columns to responsive:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
  {/* archetype cards */}
</div>
```

### 3D: Sidebar.jsx — responsive internal layout

If the sidebar has fixed widths, make them responsive:
```jsx
// Change any fixed w-[280px] or similar to:
<div className="w-full sm:w-[280px]">
```

### 3E: StepCard.jsx — responsive grids

The Relevant Tools grid and any other two-column grids should stack on mobile:
```jsx
// Already uses sm:grid-cols-2 which is correct — verify this is the case.
// The grid should be: grid-cols-1 sm:grid-cols-2
```

The Decision Rights table layout should stack on mobile:
```jsx
// Change the flex layout to stack on mobile:
<div key={i} className={`flex flex-col sm:flex-row gap-1 sm:gap-3 ${isInactive ? 'opacity-40' : ''}`}>
  <div className="text-sm font-medium text-slate-300 sm:w-36 flex-shrink-0">{item.authority}</div>
  <div className="text-sm text-slate-400 flex-1">
    {cleanText(item.scope)}
  </div>
</div>
```

### 3F: QuestionFlow.jsx — responsive

Ensure question cards are full-width on mobile and the DP2 multi-select checkboxes stack properly.

---

## PHASE 4: Update version and commit

Update the version from `v1.6.4` to `v1.7.0` (mobile responsive is a feature-level change).

Make TWO commits:
1. `Polish fixes — bullet spacing, caps, legal note, annotation wrap (Fixes #43)`
2. `Mobile responsive layout (Fixes #44)`

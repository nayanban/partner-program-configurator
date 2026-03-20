# UI Component Rewrite — Clean Implementation (Corrected)

Read this ENTIRE document before writing any code. This is a targeted rewrite of three component files and cleanup of two deprecated files. Everything else in the codebase stays untouched.

---

## PHASE 0: Pre-flight checks

Before writing ANY code, do these checks:

1. **Read engine.js.** Confirm these functions and exports exist:
   - `isStepActive(stepKey, config)`
   - `getActiveWorkflowModifications(stepKey, stepData, spec, config)`
   - `computeHasFinancialMotion(config)`
   - `generateFlowAnnotation(config, spec)`
   - `encodeConfig(config)`
   - `TOOL_RECOMMENDATIONS` (array of objects with `category`, `tools`, `activeWhen` fields)
   
   If `TOOL_RECOMMENDATIONS` is not exported from engine.js (it may have been moved to ToolRecommendations.jsx during a previous refactor), find where it is defined and re-export it from engine.js. Also verify the actual property names on each object — Section 5 of StepCard uses `t.category` and `t.tools`. If the properties are named differently (e.g., `examples` instead of `tools`, `name` instead of `category`), use the actual property names in Section 5.

   Also verify that `getActiveWorkflowModifications` collects ALL matching variants using independent `if` statements, NOT `if/else if` chains. If it still uses `if/else if`, fix it: change each `else if` to a standalone `if` so that multiple matching variants from different decision points are all collected. This is critical — without this fix, the "How Your Configuration Affects This Step" section will show incomplete information.

   Also check what `getActiveWorkflowModifications` RETURNS. The code in StepCard Section 12 expects each returned object to have `label` (string) and `text` (string) properties. If the function returns objects with different property names (e.g., `description` instead of `text`, `name` instead of `label`), note the actual property names and use them in Section 12 instead of `mod.label` and `mod.text`.

2. **Read App.jsx.** Confirm the props passed to OutputView: `config, onConfigChange, onBack, activeArchetype, spec, content`. Do not change App.jsx.

3. **Read Sidebar.jsx.** Confirm what props it receives and how it renders. Do not change Sidebar.jsx. Note the sidebar width for layout calculations. IMPORTANT: Note every prop that Sidebar expects — some may be computed values (like active step counts or active track counts) that the current OutputView calculates before passing. The new OutputView must compute and pass the same values. Read the CURRENT OutputView.jsx before deleting it to see exactly how Sidebar is invoked.

4. **Read supplementary_content.json.** Check the structure of steps.step_0, steps.step_4, and steps.step_9 specifically. Note which keys exist at the step level. The keys are: `step_name`, `purpose`, `inputs`, `owns`, `tie_breaker_escalation`, `tie_breaker_escalation_note` (Step 0 only), `outputs`, `explicitly_does_not_do`, `handoff`, `handoff_note` (Step 10 only), `failure_exception_paths`, `loop_back_triggers`, `configuration_notes`, `entry_triggers` (Step 9 only), `minimum_to_unblock_criteria` (Step 4 only), `go_live_criteria` (Step 4 only). Not all of these are displayable sections — the rendering code must use only the explicit section list defined below, NOT iterate over all keys.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #38.

### ISSUE 38

**Title:** Clean rewrite of OutputView, StepMap, and StepCard components
**Label:** enhancement
**Body:**

Seven rounds of incremental UI changes have accumulated cruft, dead code paths, and contradictory rendering logic in the three main output components. This rewrite replaces OutputView.jsx, StepMap.jsx, and StepCard.jsx with clean implementations matching the final design specification. StepPanel.jsx and ToolRecommendations.jsx are removed (functionality merged into the rewritten files).

**What changes:**
- `app/src/components/OutputView.jsx` — rewritten
- `app/src/components/StepMap.jsx` — rewritten
- `app/src/components/StepCard.jsx` — rewritten
- `app/src/components/StepPanel.jsx` — deleted
- `app/src/components/ToolRecommendations.jsx` — deleted (if not imported elsewhere)
- `app/src/engine.js` — minor fix to getActiveWorkflowModifications if needed

**What does NOT change:**
- `app/src/App.jsx`
- `app/src/components/Sidebar.jsx`
- `app/src/components/LandingPage.jsx`
- `app/src/components/QuestionFlow.jsx`
- `app/src/components/DataModelView.jsx`
- `structured_specification.json`
- `supplementary_content.json`

**Close comment:** Fixed — clean rewrite of OutputView, StepMap, and StepCard. All accumulated cruft removed. Deprecated StepPanel and ToolRecommendations removed.

---

## PHASE 2: Implement the rewrite

### Step 1: Delete deprecated files
Delete `app/src/components/StepPanel.jsx` if it exists.
Delete `app/src/components/ToolRecommendations.jsx` if it exists AND is not imported by any file other than OutputView (which is being rewritten).

### Step 2: Fix engine.js if needed
If `getActiveWorkflowModifications` uses `if/else if` chains, fix it to use independent `if` statements.
If `TOOL_RECOMMENDATIONS` is not exported, add the export.

### Step 3: Rewrite the three files per the specs below.

### Step 4: Update the version string to `v1.6.0`. Search for any occurrence of `v1.0`, `v1.1`, `v1.2`, `v1.3`, `v1.4`, or `v1.5` across all files in `app/src/` to find where the version is rendered or defined. Update it to `v1.6.0`.

### Step 5: Commit everything.

Commit message: `Clean rewrite of OutputView, StepMap, and StepCard components (Fixes #38)`

---

## GLOBAL RULES — Apply to ALL files

### Text contrast (no exceptions)
- Primary body text (descriptions, paragraph content): `text-slate-200`
- Secondary text (list items, owners, helpers): `text-slate-300` or `text-slate-400`
- Tertiary text (labels, metadata, step numbers): `text-slate-500`
- **NEVER use text-slate-600 or darker on any text element.**
- Links and interactive text: `text-slate-400 hover:text-slate-200`
- Error/boundary indicators: `text-red-400` (not text-red-700)
- Accent indicators: `text-cyan-400` (not text-cyan-600)

### Import pattern for engine.js
```javascript
import {
  isStepActive,
  getActiveWorkflowModifications,
  computeHasFinancialMotion,
  generateFlowAnnotation,
  encodeConfig,
  TOOL_RECOMMENDATIONS,
  countActiveSteps,
  countActiveApprovalTracks,
} from '../engine'
```

---

## FILE 1: OutputView.jsx

### Props (from App.jsx — do not change)
```
config, onConfigChange, onBack, activeArchetype, spec, content
```

### State
```javascript
const [selectedStepKey, setSelectedStepKey] = useState(null)
const [showFullDataModel, setShowFullDataModel] = useState(false)
```

### Effect: close panel if selected step becomes inactive
```javascript
useEffect(() => {
  if (selectedStepKey && !isStepActive(selectedStepKey, config)) {
    setSelectedStepKey(null)
  }
}, [config, selectedStepKey])
```

### Navigation helper
```javascript
function getAdjacentSteps(stepKey) {
  const activeSteps = Object.keys(spec.workflow_steps).filter(k => isStepActive(k, config))
  const idx = activeSteps.indexOf(stepKey)
  return {
    prev: idx > 0 ? activeSteps[idx - 1] : null,
    next: idx < activeSteps.length - 1 ? activeSteps[idx + 1] : null,
  }
}
```

### Share Link handler
```javascript
function handleShareLink() {
  navigator.clipboard.writeText(window.location.href)
  // Show brief "Copied!" feedback — use a temporary state or a toast
}
```

### Layout

The overall layout is a flex row: Sidebar on the left (fixed width, use existing Sidebar component), main content area on the right (`flex-1 overflow-y-auto`). Pass Sidebar exactly the same props the current OutputView passes — you noted these during Phase 0 check #3. Replicate any computed values (like step counts or track counts) that the current OutputView calculates for Sidebar.

**Top bar** (inside the main content area, above everything else):
- Left: "← Home" button (`onBack`)
- Centre: flow annotation text — `generateFlowAnnotation(config, spec)` — `text-sm text-slate-300`
- Right: "Share Link" button, and builder attribution "Built by Nayan Banerjee" with links to [LinkedIn](https://www.linkedin.com/in/banerjee-nayan/) and [GitHub](https://github.com/nayanban). Attribution: `text-xs text-slate-500` with hover state. Use inline SVG icons for LinkedIn and GitHub (small, 14-16px).

**Below the top bar, three possible views:**

**VIEW 1: Full Data Model** (`showFullDataModel === true`)
Render the existing DataModelView component (import it) with a "← Back to workflow" button that sets `showFullDataModel` to false.

**VIEW 2: Workflow Map** (`selectedStepKey === null && !showFullDataModel`)
```
  Instruction text: "Select a step to view its details, configuration impact, and relevant tools."
  
  <StepMap variant="timeline" config={config} spec={spec} onStepClick={setSelectedStepKey} activeStepKey={null} />
  
  Legend (only if any steps are skipped): "Active step" and "Skipped step" indicators
  
  "View the complete data schema →" link → sets showFullDataModel to true
```

**VIEW 3: Step Detail** (`selectedStepKey !== null`)
```
  ┌──────────────────┐ ┌────────────────────────────────────────────────┐
  │ Vertical Nav     │ │ Detail Panel                                   │
  │ (StepMap,        │ │                                                │
  │  variant=        │ │ Header: ← prev | Step N: Full Name | next → ✕ │
  │  "vertical")     │ │ Owner text                                     │
  │                  │ │                                                │
  │ 180px wide       │ │ <StepCard ... />                               │
  │ border-r         │ │                                                │
  │ border-slate-800 │ │ (scrollable: overflow-y-auto                   │
  │                  │ │  max-h-[calc(100vh-120px)])                    │
  └──────────────────┘ └────────────────────────────────────────────────┘
```

The vertical nav and detail panel are in a flex row. The nav is `w-48 flex-shrink-0 border-r border-slate-800 overflow-y-auto max-h-[calc(100vh-120px)]`. The detail panel is `flex-1 overflow-y-auto` with `max-h-[calc(100vh-120px)]` (adjust the offset to account for the top bar height).

**Rendering StepCard inside the detail panel — exact prop mapping:**
```jsx
<StepCard
  key={selectedStepKey}
  stepKey={selectedStepKey}
  stepData={spec.workflow_steps[selectedStepKey]}
  contentData={content}
  config={config}
  spec={spec}
/>
```
Note: The `key={selectedStepKey}` is critical — it forces React to remount StepCard when the user navigates to a different step, which resets all accordion states to their defaults (Purpose open, everything else collapsed). Without this key, accordion states persist from the previous step.

Note: OutputView receives the supplementary content as `content` (from App.jsx). StepCard expects it as `contentData`. The mapping `contentData={content}` is critical — do not pass it as `content={content}`.

**Detail panel header:**

Compute these variables before rendering:
```javascript
const stepData = spec.workflow_steps[selectedStepKey]
const adj = getAdjacentSteps(selectedStepKey)
```

Then render:
```jsx
<div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-950 z-10">
  <button onClick={() => setSelectedStepKey(adj.prev)} disabled={!adj.prev}
    className={`text-sm ${adj.prev ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 cursor-default'}`}>
    {adj.prev ? `← ${getShortStepName(adj.prev)}` : ''}
  </button>
  <div className="text-center">
    <div className="text-sm font-semibold text-slate-200">
      {stepData.step_name}
    </div>
    <div className="text-xs text-slate-400">{cleanOwnerText(stepData.primary_owner)}</div>
  </div>
  <div className="flex items-center gap-3">
    <button onClick={() => setSelectedStepKey(adj.next)} disabled={!adj.next}
      className={`text-sm ${adj.next ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 cursor-default'}`}>
      {adj.next ? `${getShortStepName(adj.next)} →` : ''}
    </button>
    <button onClick={() => setSelectedStepKey(null)} className="text-slate-500 hover:text-slate-200 ml-2">✕</button>
  </div>
</div>
```

Note: The disabled prev/next buttons use `text-slate-700` intentionally — this is a deliberate exception to the contrast rule. Disabled buttons should look disabled, not clickable.

Short step name helper (for prev/next buttons and vertical nav — space constrained):
```javascript
const SHORT_STEP_NAMES = {
  step_0: 'Definition & Maintenance',
  step_1: 'Intake & Routing',
  step_2: 'Placement & Tiering',
  step_3: 'Scoping & Commitment',
  step_4: 'Approvals Gate',
  step_5: 'Implementation',
  step_6: 'Launch Readiness',
  step_7: 'Go-live & Stabilization',
  step_8: 'Operations & Support',
  step_9: 'Growth Motions',
  step_10: 'Review & Renewal',
}
function getShortStepName(key) { return SHORT_STEP_NAMES[key] || key }
```

Owner cleanup helper:
```javascript
function cleanOwnerText(owner) {
  if (!owner) return ''
  let text = owner.split('—')[0].split('/')[0].trim()
  if (text.includes('(') && !text.includes(')')) {
    text = text.substring(0, text.indexOf('(')).trim()
  }
  return text
}
```

---

## FILE 2: StepMap.jsx

### Props
```
config, spec, onStepClick, activeStepKey, variant
```
- `variant`: `"timeline"` (default — full vertical timeline) or `"vertical"` (compact nav list)

### Imports and setup
```javascript
import { isStepActive } from '../engine'

// At the top of the component function:
const stepKeys = Object.keys(spec.workflow_steps)
```

### Variant: "timeline"

A vertical timeline centered in the available space. All 11 steps flow top to bottom, connected by vertical lines.

Each node:
- Width: `max-w-xs w-full` (up to 320px, shrinks on narrow screens)
- Centered: `mx-auto`
- Step number: "Step N" — `text-xs text-slate-500`
- Full step name: `spec.workflow_steps[stepKey].step_name` — `text-sm font-semibold text-slate-200`
- Owner: `cleanOwnerText(stepData.primary_owner)` — `text-xs text-slate-400`
- Active: `border border-slate-700 bg-slate-800/60 hover:border-cyan-500/50 cursor-pointer rounded-xl p-4`
- Selected (if activeStepKey matches): `border-cyan-500 bg-cyan-500/10`
- Skipped (Steps 3/5 when dp1=no_integration): `opacity-30 cursor-default` with "Skipped" badge

Connector between nodes: a centered vertical line, 24-32px tall, `w-px bg-slate-700`. For skipped steps, connector is `bg-slate-800/50`.

**IMPORTANT: Use the FULL step_name from `spec.workflow_steps[stepKey].step_name`.** Not abbreviated names. For example, "Partner Operating System: Definition & Maintenance", "Partner Intake, Minimum Qualification, Routing", etc.

**No configuration-affected dots. No amber indicators. No "Affected by your configuration" legend.**

Legend (below the timeline): Show only if any steps are skipped in the current config. Two items: a solid bordered square + "Active step", a faded bordered square + "Skipped step".

```jsx
function cleanOwnerText(owner) {
  if (!owner) return ''
  let text = owner.split('—')[0].split('/')[0].trim()
  if (text.includes('(') && !text.includes(')')) {
    text = text.substring(0, text.indexOf('(')).trim()
  }
  return text
}
```

### Variant: "vertical"

Compact nav list, approximately 180px wide. Used when a step is selected (MODE B).

```jsx
{variant === 'vertical' && (
  <div className="flex flex-col gap-1">
    {stepKeys.map(stepKey => {
      const active = isStepActive(stepKey, config)
      const isSelected = activeStepKey === stepKey
      const stepNum = stepKey.replace('step_', '')

      return (
        <button
          key={stepKey}
          onClick={() => active && onStepClick(stepKey)}
          disabled={!active}
          className={`text-left px-3 py-2.5 rounded-lg transition-all ${
            !active ? 'opacity-30 cursor-default' :
            isSelected ? 'bg-cyan-500/10 border border-cyan-500/50' :
            'hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-5 flex-shrink-0">{stepNum}</span>
            <span className={`text-sm ${isSelected ? 'text-cyan-200 font-semibold' : active ? 'text-slate-300' : 'text-slate-500'}`}>
              {SHORT_STEP_NAMES[stepKey]}
            </span>
          </div>
        </button>
      )
    })}
  </div>
)}
```

Define SHORT_STEP_NAMES directly inside StepMap.jsx. Do NOT import it from OutputView — that would create a circular dependency. Copy the same map from above into this file.

---

## FILE 3: StepCard.jsx

Renders the content for ONE selected step. Always expanded (no collapsed state).

### Props
```
stepKey, stepData, contentData, config, spec
```

### Guard
```javascript
const stepContent = contentData?.steps?.[stepKey]
if (!stepContent) {
  return <div className="p-6 text-slate-400">No content available for this step.</div>
}
```

### Imports from engine.js
```javascript
import { getActiveWorkflowModifications, computeHasFinancialMotion, isStepActive, TOOL_RECOMMENDATIONS } from '../engine'
```

### Accordion Component
```jsx
import { useState } from 'react'

function AccordionSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  if (!children) return null

  return (
    <div className="border-t border-slate-800/50">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-2.5 py-3.5 text-left group"
      >
        <svg
          className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition-colors">
          {title}
        </span>
      </button>
      {isOpen && <div className="pb-4 pl-6">{children}</div>}
    </div>
  )
}
```

### TOOL DATA

```javascript
const STEP_TOOL_MAP = {
  step_0: ['CRM / Partner Management'],
  step_1: ['CRM / Partner Management'],
  step_2: ['CRM / Partner Management', 'Certification / LMS'],
  step_3: ['Integration Management'],
  step_4: ['Security & Compliance Review', 'Contract & Legal', 'Attribution & Revenue Ops'],
  step_5: ['Integration Management', 'Security & Compliance Review'],
  step_6: ['Co-marketing & Campaigns'],
  step_7: ['Security & Compliance Review'],
  step_8: ['CRM / Partner Management', 'Security & Compliance Review'],
  step_9: ['Attribution & Revenue Ops', 'Marketplace Management', 'Co-marketing & Campaigns', 'Deal Registration & Co-sell', 'Certification / LMS'],
  step_10: ['CRM / Partner Management', 'Contract & Legal'],
}

function getToolsForStep(stepKey, config) {
  const categories = STEP_TOOL_MAP[stepKey] || []
  return TOOL_RECOMMENDATIONS.filter(t =>
    categories.includes(t.category) && t.activeWhen(config)
  )
}
```

### CONFIGURATION NOTES HELPERS

```javascript
const CONFIG_NOTE_LABELS = {
  'DP1_no_integration': 'No technical integration',
  'DP1_has_integration': 'Technical integration active',
  'DP1_direction': 'Integration direction',
  'DP2': 'Commercial motions',
  'DP2_motions': 'Commercial motions',
  'DP2_financial_motion': 'Financial motion active',
  'DP2_no_financial_motion': 'No financial motion',
  'DP2_co_sell_direction': 'Co-sell direction',
  'DP2_co_marketing': 'Co-marketing',
  'DP2_marketplace': 'Marketplace motion',
  'DP2_referral_direction': 'Referral direction',
  'DP3_neither': 'No certification',
  'DP3_partner_cert': 'Partner certification',
  'DP3_integration_cert': 'Certification requirement',
  'DP4_yes': 'Regulated industries',
  'DP4_no': 'No regulatory requirement',
}

function getApplicableConfigNotes(notes, config) {
  if (!notes || typeof notes !== 'object') return []
  return Object.entries(notes).filter(([key, text]) => {
    if (typeof text !== 'string') return false
    if (text.includes('structured_specification') || text.includes('workflow_modification_rules')) return false
    if (key.includes('DP1_no_integration') && config.dp1 !== 'no_integration') return false
    if (key.includes('DP1_has_integration') && config.dp1 === 'no_integration') return false
    if (key.includes('DP1_direction') && config.dp1 === 'no_integration') return false
    if (key.includes('DP2_financial_motion') && !computeHasFinancialMotion(config)) return false
    if (key.includes('DP2_no_financial_motion') && computeHasFinancialMotion(config)) return false
    if (key.includes('DP2_co_sell_direction') && !config.dp2.motions.includes('co_sell')) return false
    if (key.includes('DP2_co_marketing') && !config.dp2.motions.includes('co_marketing')) return false
    if (key.includes('DP2_marketplace') && !config.dp2.motions.some(m => m.startsWith('marketplace_'))) return false
    if (key.includes('DP2_referral_direction') && !(config.dp2.motions.includes('referral_inbound') && config.dp2.motions.includes('referral_outbound'))) return false
    if (key.includes('DP3_partner_cert') && !['partner_cert_only', 'both'].includes(config.dp3)) return false
    if (key.includes('DP3_integration_cert') && !['integration_cert_only', 'both'].includes(config.dp3)) return false
    if (key.includes('DP3_neither') && config.dp3 !== 'neither') return false
    if (key.includes('DP4_yes') && config.dp4 !== 'yes') return false
    if (key.includes('DP4_no') && config.dp4 !== 'no') return false
    return true
  }).map(([key, text]) => ({
    label: CONFIG_NOTE_LABELS[key] || key.replace(/_/g, ' '),
    text,
  }))
}
```

### SECTIONS — Exact list, exact order, exact rendering

The component renders EXACTLY these sections in EXACTLY this order. This is a hardcoded list. Do NOT iterate over JSON keys. Do NOT render any key not in this list (ignore `step_name`, `tie_breaker_escalation_note`, `configuration_notes`, and any other metadata keys).

---

**Section 1: Purpose** — always present, open by default
```jsx
<AccordionSection title="Purpose" defaultOpen={true}>
  <p className="text-sm text-slate-200 leading-relaxed">{stepContent.purpose}</p>
</AccordionSection>
```

---

**Section 2: Inputs** — render if `stepContent.inputs` exists and has items
```jsx
{stepContent.inputs && stepContent.inputs.length > 0 && (
  <AccordionSection title="Inputs">
    <ul className="space-y-1.5">
      {(Array.isArray(stepContent.inputs) ? stepContent.inputs : [stepContent.inputs]).map((input, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <span className="text-slate-500 mt-0.5">•</span>
          <span>{typeof input === 'string' ? input : JSON.stringify(input)}</span>
        </li>
      ))}
    </ul>
  </AccordionSection>
)}
```

---

**Section 3: Scope of Work** — render if `stepContent.owns` exists

**Default rendering** (most steps): bullet list, same pattern as Inputs.

**Step 4 special:** `stepContent.owns` is an array of track objects with `{ track, items, always_active, configuration_note }`. Render each as a labeled sub-section. HIDE if:
- Track name includes "Compliance" AND `config.dp4 !== 'yes'`
- Track name includes "Commercial" AND `computeHasFinancialMotion(config) === false` AND `!config.dp2.motions.includes('co_marketing')`

```jsx
// Step 4 track rendering
{track.track && (
  <div className="border border-slate-800 rounded-lg p-3">
    <div className="text-sm font-semibold text-slate-300 mb-2">{track.track}</div>
    {track.items && (
      <ul className="space-y-1">
        {track.items.map((item, j) => (
          <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
            <span className="text-slate-500 mt-0.5">•</span><span>{item}</span>
          </li>
        ))}
      </ul>
    )}
    {track.configuration_note && (
      <p className="text-xs text-slate-500 mt-2 italic">{track.configuration_note}</p>
    )}
  </div>
)}
```

**Step 9 special:** `stepContent.owns` is an array of play objects with `{ play, items, active_when, configuration_dependent, configuration_note }`. Use this function to evaluate play visibility:

```javascript
function isPlayActive(play, config) {
  const aw = (play.active_when || '').toLowerCase()
  if (!aw || aw === 'always') return true
  if (aw.includes('co_sell') && !config.dp2.motions.includes('co_sell')) return false
  if (aw.includes('co_marketing') && !config.dp2.motions.includes('co_marketing')) return false
  if (aw.includes('marketplace') && !config.dp2.motions.some(m => m.startsWith('marketplace_'))) return false
  if (aw.includes('financial') && !computeHasFinancialMotion(config)) return false
  return true // default show — covers Expansion play and any unrecognized conditions
}
```

For each play, first check `isPlayActive(play, config)`. If false, skip the play entirely. If true, render it. Additionally, for the Expansion play, filter out items containing "Deeper integration depth" when `config.dp1 === 'no_integration'`:

```javascript
const filteredItems = (play.items || []).filter(item => {
  if (config.dp1 === 'no_integration' && typeof item === 'string' && item.toLowerCase().includes('deeper integration')) return false
  return true
})
```

Render each play as:
```jsx
<div className="border border-slate-800 rounded-lg p-3">
  <div className="text-sm font-semibold text-slate-300 mb-2">{play.play}</div>
  <ul className="space-y-1">
    {filteredItems.map((item, j) => (
      <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
        <span className="text-slate-500 mt-0.5">•</span><span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
      </li>
    ))}
  </ul>
</div>
```

---

**Section 4: Outputs** — render if `stepContent.outputs` exists
```jsx
{stepContent.outputs && stepContent.outputs.length > 0 && (
  <AccordionSection title="Outputs">
    <ul className="space-y-1.5">
      {stepContent.outputs.map((output, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <span className="text-cyan-400 mt-0.5">→</span>
          <span>{typeof output === 'string' ? output : JSON.stringify(output)}</span>
        </li>
      ))}
    </ul>
  </AccordionSection>
)}
```

---

**Section 5: Relevant Tools** — computed. Render only if `getToolsForStep(stepKey, config)` returns at least one tool.
```jsx
{(() => {
  const tools = getToolsForStep(stepKey, config)
  if (tools.length === 0) return null
  return (
    <AccordionSection title="Relevant Tools">
      <p className="text-xs text-slate-400 mb-3">Representative tools, not recommendations. Your choice depends on existing stack, budget, and scale.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tools.map((t, i) => (
          <div key={i} className="border border-slate-800 rounded-lg p-3">
            <div className="text-sm font-semibold text-slate-300">{t.category}</div>
            <div className="text-xs text-slate-400 mt-1">{t.tools}</div>
          </div>
        ))}
      </div>
    </AccordionSection>
  )
})()}
```

---

**Section 6: Out of Scope** — render if `stepContent.explicitly_does_not_do` exists
```jsx
{stepContent.explicitly_does_not_do && stepContent.explicitly_does_not_do.length > 0 && (
  <AccordionSection title="Out of Scope">
    <ul className="space-y-1.5 bg-slate-950/50 border border-slate-800 rounded-lg p-3">
      {stepContent.explicitly_does_not_do.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
          <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span><span>{item}</span>
        </li>
      ))}
    </ul>
  </AccordionSection>
)}
```

---

**Section 7: Completion Criteria** — from `spec.workflow_steps[stepKey].completion_criteria`. Show ONLY human-readable labels. NO raw JSON. NO field checks.

```jsx
{(() => {
  const cc = stepData.completion_criteria
  if (!cc) return null

  // Step 4: dual labels
  if (cc.done_label_for_step5_start) {
    return (
      <AccordionSection title="Completion Criteria">
        <div className="space-y-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">To unlock implementation (Step 5)</div>
            <p className="text-sm text-slate-200">{cc.done_label_for_step5_start}</p>
          </div>
          {cc.done_label_for_step6_start && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">To unlock launch (Step 6/7)</div>
              <p className="text-sm text-slate-200">{cc.done_label_for_step6_start}</p>
            </div>
          )}
        </div>
      </AccordionSection>
    )
  }

  // Default: done_label
  const label = cc.done_label || cc.note || null
  if (!label) return null
  return (
    <AccordionSection title="Completion Criteria">
      <p className="text-sm text-slate-200 font-medium">{label}</p>
    </AccordionSection>
  )
})()}
```

---

**Section 8: Entry Triggers** — Step 9 ONLY. From `stepContent.entry_triggers`.
```jsx
{stepKey === 'step_9' && stepContent.entry_triggers && (
  <AccordionSection title="Entry Triggers">
    {stepContent.entry_triggers.description && (
      <p className="text-sm text-slate-300 mb-3">{stepContent.entry_triggers.description}</p>
    )}
    {stepContent.entry_triggers.gates && (
      <ul className="space-y-1.5">
        {stepContent.entry_triggers.gates.map((gate, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-cyan-400 mt-0.5">✓</span><span>{gate}</span>
          </li>
        ))}
      </ul>
    )}
    {stepContent.entry_triggers.governance_note && (
      <p className="text-xs text-slate-400 mt-3">{stepContent.entry_triggers.governance_note}</p>
    )}
  </AccordionSection>
)}
```

---

**Section 9: Minimum to Unblock** — Step 4 ONLY. From `stepContent.minimum_to_unblock_criteria`. Render as READABLE text, NOT raw JSON.
```jsx
{stepKey === 'step_4' && stepContent.minimum_to_unblock_criteria && (
  <AccordionSection title="Minimum to Unblock">
    {stepContent.minimum_to_unblock_criteria.description && (
      <p className="text-sm text-slate-300 mb-3">{stepContent.minimum_to_unblock_criteria.description}</p>
    )}
    {stepContent.minimum_to_unblock_criteria.conditions && (
      <ul className="space-y-1.5">
        {stepContent.minimum_to_unblock_criteria.conditions.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-cyan-400 mt-0.5">☐</span><span>{c}</span>
          </li>
        ))}
      </ul>
    )}
    {config.dp4 === 'yes' && stepContent.minimum_to_unblock_criteria.when_DP4_yes && (
      <p className="text-sm text-amber-400/80 mt-3">{stepContent.minimum_to_unblock_criteria.when_DP4_yes}</p>
    )}
    {config.dp1 === 'no_integration' && stepContent.minimum_to_unblock_criteria.when_DP1_no_integration && (
      <p className="text-sm text-slate-400 mt-3">{stepContent.minimum_to_unblock_criteria.when_DP1_no_integration}</p>
    )}
  </AccordionSection>
)}
```

---

**Section 10: Go-live Criteria** — Step 4 ONLY. From `stepContent.go_live_criteria`. Same pattern as Minimum to Unblock.
```jsx
{stepKey === 'step_4' && stepContent.go_live_criteria && (
  <AccordionSection title="Go-live Criteria">
    {stepContent.go_live_criteria.description && (
      <p className="text-sm text-slate-300 mb-3">{stepContent.go_live_criteria.description}</p>
    )}
    {stepContent.go_live_criteria.conditions && (
      <ul className="space-y-1.5">
        {stepContent.go_live_criteria.conditions.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-cyan-400 mt-0.5">☐</span><span>{c}</span>
          </li>
        ))}
      </ul>
    )}
    {config.dp4 === 'yes' && stepContent.go_live_criteria.when_DP4_yes && (
      <p className="text-sm text-amber-400/80 mt-3">{stepContent.go_live_criteria.when_DP4_yes}</p>
    )}
    {config.dp4 === 'no' && stepContent.go_live_criteria.when_DP4_no && (
      <p className="text-sm text-slate-400 mt-3">{stepContent.go_live_criteria.when_DP4_no}</p>
    )}
  </AccordionSection>
)}
```

---

**Section 11: Handoff** — render if `stepContent.handoff` exists (string or null — Step 10 has `handoff: null` but has `handoff_note`)
```jsx
{(stepContent.handoff || stepContent.handoff_note) && (
  <AccordionSection title="Handoff">
    {stepContent.handoff && <p className="text-sm text-slate-300 leading-relaxed">{stepContent.handoff}</p>}
    {stepContent.handoff_note && <p className="text-sm text-slate-400 italic mt-2">{stepContent.handoff_note}</p>}
  </AccordionSection>
)}
```

---

**Section 12: How Your Configuration Affects This Step** — computed. ONLY render if there are modifications.

```jsx
{(() => {
  const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
  const configNotes = getApplicableConfigNotes(stepContent.configuration_notes, config)
  if (mods.length === 0 && configNotes.length === 0) return null

  return (
    <AccordionSection title="How Your Configuration Affects This Step">
      <div className="space-y-2">
        {mods.map((mod, i) => (
          <div key={`mod-${i}`} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
            <div className="text-xs font-medium text-amber-400 mb-1">{mod.label}</div>
            <p className="text-sm text-slate-300">{mod.text}</p>
          </div>
        ))}
        {configNotes.map((note, i) => (
          <div key={`note-${i}`} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
            <div className="text-xs font-medium text-slate-400 mb-1">{note.label}</div>
            <p className="text-sm text-slate-400">{note.text}</p>
          </div>
        ))}
      </div>
    </AccordionSection>
  )
})()}
```

---

**Section 13: Decision Rights & Escalation** — render if `stepContent.tie_breaker_escalation` exists AND is an array with items. (Step 0 has this as null — do not render.)

```jsx
{stepContent.tie_breaker_escalation && Array.isArray(stepContent.tie_breaker_escalation) && stepContent.tie_breaker_escalation.length > 0 && (
  <AccordionSection title="Decision Rights & Escalation">
    <div className="space-y-3">
      {stepContent.tie_breaker_escalation.map((item, i) => {
        const isInactive = item.configuration_dependent &&
          item.active_when && item.active_when.includes("'yes'") && config.dp4 !== 'yes'

        return (
          <div key={i} className={`flex gap-3 ${isInactive ? 'opacity-40' : ''}`}>
            <div className="text-sm font-medium text-slate-300 w-36 flex-shrink-0">
              {item.authority}
            </div>
            <div className="text-sm text-slate-400 flex-1">
              {item.scope}
              {isInactive && item.when_inactive && (
                <span className="text-slate-500 italic ml-1">({item.when_inactive})</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  </AccordionSection>
)}
```

---

**Section 14: Exception Handling** — render if `stepContent.failure_exception_paths` exists and has items.
```jsx
{stepContent.failure_exception_paths && stepContent.failure_exception_paths.length > 0 && (
  <AccordionSection title="Exception Handling">
    <div className="space-y-2">
      {stepContent.failure_exception_paths.map((path, i) => (
        <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
          <div className="text-sm font-medium text-red-400/80 mb-1">{path.condition}</div>
          <p className="text-sm text-slate-400">{path.response}</p>
        </div>
      ))}
    </div>
  </AccordionSection>
)}
```

---

**Section 15: Loop-back Triggers** — render if `stepContent.loop_back_triggers` exists and has items.
```jsx
{stepContent.loop_back_triggers && stepContent.loop_back_triggers.length > 0 && (
  <AccordionSection title="Loop-back Triggers">
    <div className="space-y-2">
      {stepContent.loop_back_triggers.map((trigger, i) => (
        <div key={i} className="flex gap-3">
          <div className="text-sm text-amber-400/80 w-28 flex-shrink-0">
            → {trigger.target || trigger.target_step || trigger.source || 'Unknown'}
          </div>
          <p className="text-sm text-slate-400">{trigger.trigger}</p>
        </div>
      ))}
    </div>
  </AccordionSection>
)}
```

---

**Section 16: Data Schema for This Step** — computed from `stepData.objects_produced_or_updated` and `spec.objects`.

```jsx
{(() => {
  const objKeys = stepData.objects_produced_or_updated || []
  if (objKeys.length === 0) return null

  return (
    <AccordionSection title="Data Schema for This Step">
      <p className="text-xs text-slate-400 mb-3">
        Data objects created or updated in this step. Use this as the schema when configuring your system of record for this workflow stage.
      </p>
      <div className="space-y-3">
        {objKeys.map(objKey => {
          const obj = spec.objects[objKey]
          if (!obj) return null
          const fields = obj.fields || []
          const activeCount = fields.filter(f => !f.conditional || isFieldActive(f, config)).length
          return (
            <ObjectDetail key={objKey} obj={obj} objKey={objKey} fields={fields} activeCount={activeCount} totalCount={fields.length} config={config} />
          )
        })}
      </div>
    </AccordionSection>
  )
})()}
```

The `ObjectDetail` sub-component renders an expandable object with field table:
```jsx
function ObjectDetail({ obj, objKey, fields, activeCount, totalCount, config }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-slate-800 rounded-lg">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between px-3 py-2 text-left">
        <div>
          <div className="text-sm font-medium text-slate-300">{obj.object_name}</div>
          <div className="text-xs text-slate-500">{obj.created_at_step}</div>
        </div>
        <div className="text-xs text-slate-500">{activeCount}/{totalCount} fields</div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-800">
          <table className="w-full text-xs mt-2">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-1 font-medium">Field</th>
                <th className="text-left py-1 font-medium">Type</th>
                <th className="text-center py-1 font-medium">Active</th>
                <th className="text-left py-1 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => {
                const active = !f.conditional || isFieldActive(f, config)
                return (
                  <tr key={i} className={active ? '' : 'opacity-40'}>
                    <td className="py-1 text-slate-300 font-mono">{f.name}</td>
                    <td className="py-1 text-slate-400">{f.type}</td>
                    <td className="py-1 text-center">{active ? <span className="text-cyan-400">✓</span> : <span className="text-slate-500">✗</span>}</td>
                    <td className="py-1 text-slate-500">{f.notes || ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function isFieldActive(field, config) {
  // Simple heuristic: if the field's conditional_on mentions DP4 and dp4 is no, it's inactive
  // For a more precise evaluation, check field_activation_rules, but this covers the common cases
  if (!field.conditional) return true
  const notes = (field.notes || '').toLowerCase()
  if (notes.includes('dp4') || notes.includes('compliance') || notes.includes('regulated')) {
    return config.dp4 === 'yes'
  }
  if (notes.includes('dp1') || notes.includes('integration')) {
    return config.dp1 !== 'no_integration'
  }
  if (notes.includes('dp3') || notes.includes('certification') || notes.includes('cert')) {
    return config.dp3 !== 'neither'
  }
  if (notes.includes('dp2') || notes.includes('financial') || notes.includes('marketplace') || notes.includes('co_sell') || notes.includes('co-sell')) {
    return computeHasFinancialMotion(config)
  }
  return true // default to active if we can't determine
}
```

---

## END OF SPECIFICATION

After writing all three files, search for any occurrence of `v1.0`, `v1.1`, `v1.2`, `v1.3`, `v1.4`, or `v1.5` across all files in `app/src/` and update to `v1.6.0`. Then commit everything as a single commit:

`Clean rewrite of OutputView, StepMap, and StepCard components (Fixes #38)`

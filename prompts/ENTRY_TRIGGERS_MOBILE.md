# Entry Triggers Relocation, Content Fixes & Mobile Portrait

Read this entire document before starting. There are five phases.

---

## PHASE 1: Create and close GitHub issues

Use `curl` with the `$GH_TOKEN` environment variable. These will be Issues #45 and #46.

### ISSUE 45

**Title:** Relocate entry triggers to consuming steps, fix configuration-aware handoffs, clean field paths
**Label:** enhancement
**Body:**

Content and logic fixes:
1. Move Minimum to Unblock from Step 4 to Step 5 as Entry Triggers
2. Move Go-live Criteria from Step 4 to Step 6 as Entry Triggers
3. Remove Minimum to Unblock and Go-live Criteria as Step 4 special sections
4. Configuration-aware handoff text: rewrite "Step N" references when target step is inactive
5. Clean remaining field path references (co_marketing_eligible=true etc.)
6. Add "delayed" to handoff blocking condition keywords
7. Add config impact notes for skipped step redirections

**Close comment:** Fixed — entry triggers relocated, handoffs configuration-aware, field paths cleaned.

### ISSUE 46

**Title:** Mobile portrait layout fixes
**Label:** bug
**Body:**

Mobile portrait fixes (landscape view must not be affected):
1. Step detail: change flex breakpoint from sm to md so detail panel is full-width on portrait phones
2. Step selector dropdown: fix dark/invisible arrow styling
3. Data schema: scroll to top when opened
4. Data schema field table: horizontal scroll on narrow screens

**Close comment:** Fixed — mobile portrait layout issues resolved without affecting landscape.

---

## PHASE 2: Update supplementary_content.json

### 2A: Add Entry Triggers to Step 5

Add a new `entry_triggers` key to `step_5` in supplementary_content.json:

```json
"entry_triggers": {
  "description": "Conditions required before implementation may begin (set during Step 4 approvals).",
  "gates": [
    "Security/Privacy provides preliminary approval for non-production work (e.g., sandbox/dev) or explicitly states acceptable scope for implementation work to proceed",
    "Legal provides an approved agreement path (e.g., template selected + redline boundaries / fallback positions agreed)",
    "Any hard 'no-go' risks have been resolved (e.g., prohibited data use, unacceptable control gaps)"
  ],
  "when_DP4_yes": "If Compliance/Risk is required for the use case, include either preliminary approval or a defined set of constraints that implementation can proceed under.",
  "when_DP1_no_integration": "Step 5 is skipped entirely when no technical integration is selected — these conditions apply to proceeding to Step 6 instead."
}
```

### 2B: Add Entry Triggers to Step 6

Add a new `entry_triggers` key to `step_6` in supplementary_content.json:

```json
"entry_triggers": {
  "description": "Conditions required before production go-live and launch packaging may begin (set during Step 4 approvals).",
  "gates": [
    "Final Security/Privacy sign-off (production scope) and required evidence completed",
    "Executed legal agreement(s) (or documented executive exception per Step 0 policy)",
    "Confirmed commercial/finance mechanics (including attribution/payout setup if relevant)"
  ],
  "when_DP4_yes": "Final Compliance/Risk sign-off is also required.",
  "when_DP4_no": "Compliance/Risk sign-off is absent from go-live criteria."
}
```

### 2C: Remove minimum_to_unblock_criteria and go_live_criteria from Step 4

In step_4, delete the `minimum_to_unblock_criteria` and `go_live_criteria` keys entirely. They are now represented as Entry Triggers in Steps 5 and 6 respectively.

### 2D: Fix field path references in configuration impact text

Search ALL string values in supplementary_content.json for these patterns and fix:

- `the partner profile.co_marketing_eligible = true` → `Co-marketing eligibility is set in the partner profile`
- `the partner profile.co_marketing_eligible=true` → `Co-marketing eligibility is set in the partner profile`
- `partner profile.co_marketing_eligible` → `co-marketing eligibility in the partner profile`
- Any remaining `object.field_name` or `object.field = value` patterns → replace with plain language

Also search the structured specification JSON for the same patterns in workflow_modification text values and fix there too.

### 2E: Add configuration-aware handoff notes

For steps whose handoff text references a potentially-skipped step, add a `handoff_when_no_integration` variant or a `configuration_notes` entry. Specifically:

In step_2's `configuration_notes`, add (if not already present):
```json
"DP1_no_integration_handoff": "When no technical integration is selected, Step 3 (Scoping & Commitment) is skipped. Step 2 hands off directly to Step 4 (Approvals Gate)."
```

In step_4's `configuration_notes`, add (if not already present):
```json
"DP1_no_integration_handoff": "When no technical integration is selected, Step 5 (Implementation) is skipped. Step 4 hands off directly to Step 6 (Launch Readiness). The minimum-to-unblock / go-live distinction collapses — all approval conditions must be met before proceeding to launch."
```

---

## PHASE 3: Update StepCard.jsx rendering

### Change 1: Remove Step 4 special sections

Remove the `stepKey === 'step_4'` conditional blocks for Minimum to Unblock and Go-live Criteria from the section rendering. These were positions 4 and 11 in the previous order.

### Change 2: Update Entry Triggers to render for Steps 5 and 6

The Entry Triggers section currently renders only for `stepKey === 'step_9'`. Change it to render for any step that has `entry_triggers` in the supplementary content:

```jsx
{stepContent.entry_triggers && (
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
    {config.dp4 === 'yes' && stepContent.entry_triggers.when_DP4_yes && (
      <p className="text-sm text-amber-400/80 mt-3">{stepContent.entry_triggers.when_DP4_yes}</p>
    )}
    {config.dp4 === 'no' && stepContent.entry_triggers.when_DP4_no && (
      <p className="text-sm text-slate-400 mt-3">{stepContent.entry_triggers.when_DP4_no}</p>
    )}
    {config.dp1 === 'no_integration' && stepContent.entry_triggers.when_DP1_no_integration && (
      <p className="text-sm text-slate-400 mt-3">{stepContent.entry_triggers.when_DP1_no_integration}</p>
    )}
    {stepContent.entry_triggers.governance_note && (
      <p className="text-xs text-slate-400 mt-3">{stepContent.entry_triggers.governance_note}</p>
    )}
  </AccordionSection>
)}
```

Remove the `stepKey === 'step_9'` guard. The section renders for any step that has `entry_triggers` in its supplementary content — now Steps 5, 6, and 9.

Note: When Step 5 is inactive (dp1=no_integration), the step detail panel is never shown for Step 5, so its Entry Triggers are automatically hidden. No special logic needed.

### Change 3: Configuration-aware handoff text

In the Handoff section rendering, after splitting the text at semicolons, add a post-processing step that rewrites step references when the target step is inactive:

```javascript
function rewriteSkippedStepRefs(clause, config) {
  if (config.dp1 === 'no_integration') {
    // Step 3 is skipped → references to Step 3 should point to Step 4
    clause = clause.replace(/Step 3/g, 'Step 4 (Approvals Gate)')
    // Step 5 is skipped → references to Step 5 should point to Step 6
    clause = clause.replace(/Step 5/g, 'Step 6 (Launch Readiness)')
  }
  return clause
}

// Apply in the handoff rendering:
const clauses = stepContent.handoff
  .split(';')
  .map(c => capitalizeFirst(c.trim()))
  .filter(Boolean)
  .map(c => rewriteSkippedStepRefs(c, config))
```

Note: Only rewrite when the target step is actually skipped. The `Step 3` and `Step 5` patterns only need rewriting when dp1=no_integration. No other decision point combination skips entire steps.

### Change 4: Add "delayed" to blocking condition keywords

In the handoff blocking condition detection, add "delayed" and "may be delayed" to the keywords list:

```javascript
const blockingKeywords = [
  'blocked by', 'paused if', 'progression can be blocked',
  'cannot proceed', 'progression is paused', 'blocking',
  'may be delayed', 'delayed if'
]
```

### Change 5: Updated section order

With Minimum to Unblock and Go-live Criteria removed as special sections, the rendering order simplifies to:

```
1.  Purpose                                    — always, open by default
2.  Inputs                                     — if content exists
3.  Entry Triggers                             — Steps 5, 6, 9 (any step with entry_triggers)
4.  Roles & Responsibilities                   — if content exists
5.  Scope of Work                              — if content exists
6.  Decision Rights & Escalation               — if content exists
7.  Outputs                                    — if content exists
8.  Relevant Tools                             — computed
9.  Out of Scope                               — if content exists
10. Completion Criteria                        — from spec
11. Handoff                                    — if content exists
12. Exception Handling                         — if content exists
13. Loop-back Triggers                         — if content exists
14. How Your Configuration Affects This Step   — computed, only if modifications exist
15. Data Schema for This Step                  — computed
```

15 sections total, down from 17. No step-specific positional logic — Entry Triggers appears at position 3 for any step that has the data.

---

## PHASE 4: Mobile portrait fixes (Issue #46)

**CRITICAL: All mobile fixes must use `md:` breakpoint (768px) or explicit max-width media queries. Do NOT change any existing `sm:` breakpoint classes that affect landscape/tablet/desktop layouts. The goal is to fix portrait phone layout (< 768px width) without touching anything at 768px and above.**

### Fix 1: Step detail panel — full width on portrait phones

In OutputView.jsx, find the VIEW 3 (Step Detail) layout where the step selector and detail panel are arranged. Change the breakpoint so the side-by-side layout only activates at `md` (768px), not `sm` (640px):

```jsx
<div className="flex flex-col md:flex-row">
  {/* Mobile step selector — visible below md */}
  <div className="md:hidden px-4 py-2 border-b border-slate-800">
    <select ... className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-700 appearance-none" style={{backgroundImage: 'url("data:image/svg+xml,...chevron SVG...")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em'}}>
      ...
    </select>
  </div>

  {/* Desktop vertical nav — hidden below md */}
  <div className="hidden md:block w-48 flex-shrink-0 border-r border-slate-800 overflow-y-auto max-h-[calc(100vh-120px)]">
    <StepMap variant="vertical" ... />
  </div>

  {/* Detail panel — full width below md, flex-1 above */}
  <div className="flex-1 overflow-y-auto max-h-[calc(100vh-120px)]">
    ...
  </div>
</div>
```

Anywhere that currently uses `sm:flex-row`, `sm:block`, `hidden sm:block`, `sm:hidden` for the step detail layout — change `sm` to `md`.

The detail panel header should also stack on portrait:
```jsx
<div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-800 sticky top-0 bg-slate-950 z-10 gap-2">
```

### Fix 2: Step selector dropdown — fix invisible arrow

The native select dropdown arrow is invisible on dark backgrounds. Add custom arrow styling:

```jsx
<select
  value={selectedStepKey}
  onChange={(e) => setSelectedStepKey(e.target.value)}
  className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2.5 border border-slate-700 focus:border-cyan-500 focus:outline-none"
  style={{
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1rem',
  }}
>
```

### Fix 3: Data schema — scroll to top when opened

In OutputView.jsx, add a useEffect that scrolls to top when `showFullDataModel` changes to true:

```javascript
useEffect(() => {
  if (showFullDataModel) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}, [showFullDataModel])
```

Also, if the main content area is a scrollable div (not the window), scroll that div instead:
```javascript
const mainContentRef = useRef(null)

useEffect(() => {
  if (showFullDataModel && mainContentRef.current) {
    mainContentRef.current.scrollTop = 0
  }
}, [showFullDataModel])
```

Add `ref={mainContentRef}` to the main content container div.

### Fix 4: Data schema field table — horizontal scroll on narrow screens

In StepCard.jsx (for the per-step schema) and DataModelView.jsx (for the full schema), wrap the field table in a horizontally scrollable container:

```jsx
<div className="overflow-x-auto -mx-1">
  <table className="w-full text-xs mt-2 min-w-[400px]">
    {/* ... table content ... */}
  </table>
</div>
```

The `min-w-[400px]` ensures the table doesn't compress below a readable width. The `overflow-x-auto` on the container allows horizontal scrolling when the viewport is narrower than 400px.

Add a subtle scroll hint on mobile:
```jsx
<div className="relative overflow-x-auto -mx-1">
  <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />
  <table className="w-full text-xs mt-2 min-w-[400px]">
    {/* ... */}
  </table>
</div>
```

The gradient hint disappears on `md:` screens and above.

---

## PHASE 5: Update version and commit

Update the version from `v1.7.0` to `v1.7.1`.

Make TWO commits:
1. `Relocate entry triggers, fix handoffs, clean field paths (Fixes #45)`
2. `Mobile portrait layout fixes (Fixes #46)`

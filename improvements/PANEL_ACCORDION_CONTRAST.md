# Panel Layout, Accordion & Contrast Fixes — Issues and Fixes

Read this entire document before starting. There are two phases: first create 6 GitHub issues using the GitHub API, then implement the fixes.

---

## PHASE 1: Create and close GitHub issues

Use `curl` with the `$GH_TOKEN` environment variable. These will be Issues #27 through #32.

For each issue: create it, add the close comment, then close it.

---

### ISSUE 27

**Title:** Redesign step detail as a right-side panel with vertical map navigation on the left
**Label:** enhancement
**Body:**

The step detail panel currently appears below the map, which requires scrolling and disconnects the detail from the step selection. The preferred UX is:

**When no step is selected (default state):**
The workflow map is the hero — displayed as the current compact horizontal two-row layout, filling the main content area. The flow annotation and instruction text appear above it.

**When a step is selected:**
The layout transitions:
- The map transforms into a compact vertical navigation list on the LEFT side of the content area (not the sidebar — this is inside the main content area, to the right of the configuration sidebar). This vertical list shows all step nodes stacked vertically with the selected step highlighted. Each node is clickable. Nodes are compact — just step number, short name, and the configuration dot. No owner text needed in this compact form.
- The step detail panel occupies the RIGHT portion of the content area (approximately 60-65% width). It contains the step details, tools, and all content.
- The detail panel has a close button (X) that returns to the full horizontal map view.
- The detail panel has previous/next navigation in its header.

This gives the best of both layouts: the map is prominent by default, and when drilling into a step, the user retains full navigation context via the vertical list without anything being hidden.

**Affected files:**
- `app/src/components/OutputView.jsx` (layout orchestration)
- `app/src/components/StepMap.jsx` (add a compact vertical variant)
- `app/src/components/StepPanel.jsx` (panel positioning)

**Close comment:** Fixed — default view shows full horizontal map. Selecting a step transitions to vertical nav list on left with detail panel on right.

---

### ISSUE 28

**Title:** Step detail sections should be collapsible accordions, not all open
**Label:** enhancement
**Body:**

The step detail panel shows all content sections open simultaneously, creating an overwhelming wall of text. Each section heading should be a collapsible accordion.

**Expected behavior:**

Every section in the step detail panel becomes a collapsible accordion with a chevron:
- Purpose — **open by default** (so the user immediately sees something meaningful)
- Inputs — collapsed by default
- Scope of Work — collapsed by default
- Outputs — collapsed by default
- Relevant Tools — collapsed by default
- Out of Scope — collapsed by default
- Completion Criteria — collapsed by default
- Additional Detail — collapsed by default

Clicking a section header toggles it open/closed. Multiple sections can be open simultaneously (independent accordions, not mutually exclusive).

Each accordion header should show the section title on the left and a chevron on the LEFT side of the title (not the far right edge — see Issue #31). The header should be clearly clickable with a hover state.

**Affected file:** `app/src/components/StepCard.jsx` or `app/src/components/StepPanel.jsx`

**Close comment:** Fixed — all step detail sections are collapsible accordions. Purpose open by default, all others collapsed.

---

### ISSUE 29

**Title:** Text contrast is insufficient across the entire app — comprehensive fix required
**Label:** bug
**Body:**

Text contrast has been flagged repeatedly. Multiple elements across every view use text colors (text-slate-600, text-slate-700, text-slate-800) that are nearly invisible against the dark background (bg-slate-950, bg-slate-900).

This issue requires a comprehensive, aggressive fix across ALL components.

**Rules to apply globally:**

1. **Primary body text** (purpose descriptions, section content, tool descriptions, annotations): minimum `text-slate-200`
2. **Secondary text** (owner names, helper text, instructions, builder attribution): minimum `text-slate-400`
3. **Tertiary text** (labels like "Step 0", legends, metadata): minimum `text-slate-500`
4. **No text element anywhere in the app should use text-slate-600 or darker** on a dark background. If you find any, change them to at least text-slate-500.

**Specific elements that have been reported as unreadable:**
- "Built by Nayan Banerjee" text (top right or wherever attribution appears)
- Home button / back navigation
- Step descriptions/owner text in the workflow overview
- Flow annotation ("This is an 11-step workflow...")
- Instruction text ("Select a step...")
- Tool disclaimers
- "View the underlying data schema" link
- All content within step detail panels

**Approach:** Do a find-and-replace audit across ALL .jsx files in `app/src/components/`. Search for `text-slate-6`, `text-slate-7`, `text-slate-8` and replace with appropriate higher-contrast alternatives following the rules above. Also check for any hardcoded color values that may be too dark.

**Affected files:** ALL files in `app/src/components/`

**Close comment:** Fixed — comprehensive text contrast audit applied across all components. No text element uses text-slate-600 or darker.

---

### ISSUE 30

**Title:** Step owner text truncated with unclosed brackets in workflow map nodes
**Label:** bug
**Body:**

Several step nodes in the workflow map display owner text with unclosed brackets because the text is truncated by the node width. For example, Step 7 shows "Engineering (integration owner" instead of the full "Engineering (integration owner / SRE-on-point)".

**Expected behavior:**
Truncate owner text cleanly. Either:
- Show only the first part of the owner before the parenthetical: "Engineering" instead of "Engineering (integration owner"
- Or truncate with an ellipsis at a clean word boundary

The current approach of splitting on "/" and taking the first segment is partially working but leaves unclosed parentheses.

**Fix approach:**
In StepMap.jsx, where the owner text is rendered, apply additional cleanup: if the truncated text contains an opening "(" without a closing ")", strip everything from the "(" onward. This handles cases like "Engineering (integration owner / SRE-on-point)" → "Engineering" and "Partnerships (Partner Development / Partner Ops)" → "Partnerships".

**Affected file:** `app/src/components/StepMap.jsx`

**Close comment:** Fixed — owner text cleaned up to remove unclosed parenthetical fragments.

---

### ISSUE 31

**Title:** Additional Detail dropdown arrow is at the far right edge and label doesn't describe contents
**Label:** bug
**Body:**

The "Additional Detail" expandable section has its chevron arrow at the far right edge of the panel. On a wide panel, this makes the arrow invisible — it looks like standalone text rather than a clickable control. The label also doesn't explain what information is contained within.

**Expected behavior:**

1. Move the chevron to the LEFT side, immediately before the label text. The pattern should be: `▶ Additional Detail: Handoff, Decision Rights, Exceptions, Loop-backs` (chevron rotates down when expanded).

2. Change the label from "Additional Detail" to "Additional Detail: Handoff, Decision Rights, Exceptions, Loop-backs" so the user knows what they'll find without clicking.

3. Ensure the entire row is clearly clickable (full-width click target with hover state).

**Affected file:** `app/src/components/StepCard.jsx` or `app/src/components/StepPanel.jsx`

**Close comment:** Fixed — Additional Detail chevron moved to left side, label expanded to describe contents.

---

### ISSUE 32

**Title:** "View the underlying data schema" link appears twice
**Label:** bug
**Body:**

The "View the underlying data schema →" link appears both inside the step detail panel and outside it (below the map area). When a step is selected, both are visible.

**Expected behavior:**
Keep only the link inside the step detail panel (at the bottom, after the Additional Detail section). Remove the one in the main output view area outside the panel.

When no step is selected (default map view), the data schema link should still be accessible — add it below the instruction text or at the bottom of the map area. But when a step IS selected, only the one in the panel should be visible.

**Affected file:** `app/src/components/OutputView.jsx`

**Close comment:** Fixed — duplicate data schema link removed. Single link retained in the step detail panel.

---

## PHASE 2: Implement the fixes

After all issues are created and closed, implement the following code changes. Make a separate commit for each fix. Do them in this order: #29 first (contrast — affects all files, do it before other changes), then #30 (bracket fix), then #27 (layout redesign), then #28 (accordions), then #31 (Additional Detail label), then #32 (duplicate link).

### Fix for Issue #29 — Comprehensive text contrast fix

Audit EVERY .jsx file in `app/src/components/`. Search for these patterns and replace:

- `text-slate-600` → `text-slate-400` (for secondary text) or `text-slate-500` (for tertiary)
- `text-slate-700` → `text-slate-400` minimum
- `text-slate-800` → `text-slate-500` minimum
- Check `text-slate-500` instances — these are borderline. If they are body content (not decorative), upgrade to `text-slate-400`

Also check:
- Any `text-red-700` → `text-red-400` or `text-red-500`
- Any `text-cyan-600` → `text-cyan-400` or `text-cyan-500`
- Any `text-amber-500/70` → `text-amber-400`
- `text-slate-500` on interactive elements (links, buttons) → `text-slate-400` with `hover:text-slate-200`

The builder attribution "Built by Nayan Banerjee" must be clearly readable — at least `text-slate-400`.

Commit message: `Comprehensive text contrast fix across all components (Fixes #29)`

### Fix for Issue #30 — Clean up owner text truncation

In `StepMap.jsx`, find where the primary_owner text is rendered. Currently it does something like:
```javascript
stepData.primary_owner?.split('/')[0]?.trim()
```

Add an additional cleanup step to remove unclosed parentheses:
```javascript
function cleanOwnerText(owner) {
  if (!owner) return ''
  let text = owner.split('/')[0].trim()
  // Remove unclosed parenthetical
  if (text.includes('(') && !text.includes(')')) {
    text = text.substring(0, text.indexOf('(')).trim()
  }
  return text
}
```

Use `cleanOwnerText(stepData.primary_owner)` in the node rendering.

Commit message: `Fix owner text truncation to remove unclosed parenthetical fragments (Fixes #30)`

### Fix for Issue #27 — Side panel with vertical nav

This is the main layout change. The approach:

**StepMap.jsx — add a compact vertical variant:**

Add a `variant` prop to StepMap: `"horizontal"` (default, current two-row layout) or `"vertical"` (compact nav list).

The vertical variant renders as a narrow column (approximately 180-200px wide):
```jsx
{variant === 'vertical' && (
  <div className="flex flex-col gap-1.5">
    {stepKeys.map(stepKey => {
      const active = isStepActive(stepKey, config)
      const isSelected = activeStepKey === stepKey
      const hasModifications = getActiveWorkflowModifications(stepKey, spec.workflow_steps[stepKey], spec, config).length > 0
      return (
        <button
          key={stepKey}
          onClick={() => active && onStepClick(stepKey)}
          disabled={!active}
          className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
            !active ? 'opacity-30 cursor-default' :
            isSelected ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-200' :
            'hover:bg-slate-800 text-slate-300 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-4">{STEP_NUMBERS[stepKey]}</span>
            <span className="font-medium">{STEP_NAMES[stepKey]}</span>
            {active && hasModifications && (
              <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
            )}
          </div>
        </button>
      )
    })}
  </div>
)}
```

No connector arrows in the vertical variant — it's a navigation list, not a flowchart.

**OutputView.jsx — layout orchestration:**

When `selectedStepKey` is null:
```
[Sidebar] | [Flow annotation]
          | [Instruction text]
          | [Horizontal step map (full width)]
          | [Data schema link]
```

When `selectedStepKey` is set:
```
[Sidebar] | [Flow annotation]
          | [Vertical nav (180px)] | [Detail panel (remaining width)]
```

The transition between these states should be clean. The horizontal map disappears and is replaced by the vertical nav + panel layout. The flow annotation stays at the top in both states.

The detail panel has:
- Header: prev/next navigation + step name + close button (X)
- Scrollable content: all the step detail sections as accordions
- Footer: "View the underlying data schema →" link

**StepPanel.jsx adjustments:**

The panel is no longer a fixed overlay or a below-map section. It's a flex child that takes up the remaining width next to the vertical nav. Position it as:
```jsx
<div className="flex-1 border-l border-slate-800 overflow-y-auto max-h-[calc(100vh-200px)]">
  {/* panel content */}
</div>
```

The max-height with overflow ensures the panel is scrollable while the vertical nav and flow annotation remain visible.

Commit message: `Redesign layout: horizontal hero map with vertical nav + side panel on step select (Fixes #27)`

### Fix for Issue #28 — Accordion sections

In the step detail rendering, wrap each section in a collapsible accordion component:

```jsx
function AccordionSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-slate-800/50">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-2 py-3 text-left group"
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
      {isOpen && (
        <div className="pb-4 pl-5">
          {children}
        </div>
      )}
    </div>
  )
}
```

Apply to ALL sections:
- `<AccordionSection title="Purpose" defaultOpen={true}>` — open by default
- `<AccordionSection title="Inputs">`
- `<AccordionSection title="Scope of Work">`
- `<AccordionSection title="Outputs">`
- `<AccordionSection title="Relevant Tools">`
- `<AccordionSection title="Out of Scope">`
- `<AccordionSection title="Completion Criteria">`
- The "Additional Detail" section (see Issue #31 for its specific label)

Remove any previous expand/collapse logic that this replaces.

Commit message: `Convert step detail sections to collapsible accordions (Fixes #28)`

### Fix for Issue #31 — Additional Detail label and chevron

The Additional Detail accordion should use the same AccordionSection component from Issue #28 but with a descriptive title:

```jsx
<AccordionSection title="Additional Detail: Handoff, Decision Rights, Exceptions, Loop-backs">
  {/* handoff, config impact, decision rights, exception handling, loop-back triggers */}
</AccordionSection>
```

Since all sections now use the same AccordionSection component with left-aligned chevrons, this fix is largely handled by Issue #28. The key addition is the descriptive label.

Commit message: `Update Additional Detail label to describe contents (Fixes #31)`

### Fix for Issue #32 — Remove duplicate data schema link

In `OutputView.jsx`, remove the "View the underlying data schema →" link from the main output area (outside the panel). Keep only the one inside the step detail panel.

When no step is selected (default map view), add the data schema link below the instruction text or below the map legend, so it's still accessible from the default view. When a step IS selected, this link in the default area is hidden (since the entire default area is replaced by the vertical nav + panel layout).

Commit message: `Remove duplicate data schema link (Fixes #32)`

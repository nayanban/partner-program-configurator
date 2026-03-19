# Layout & Content Hierarchy Fixes — Issues and Fixes

Read this entire document before starting. There are two phases: first create 5 GitHub issues using the GitHub API, then implement the fixes.

---

## PHASE 1: Create and close GitHub issues

Use `curl` with the `$GH_TOKEN` environment variable. These will be Issues #22 through #26.

For each issue: create it, add the close comment, then close it.

---

### ISSUE 22

**Title:** Two-column vertical map layout creates dead space and hides steps behind panel
**Label:** bug
**Body:**

The vertical two-column step map (Steps 0-5 on left, Steps 6-10 on right) creates several problems:
- Large empty space in the layout
- When the slide-out panel opens, Steps 6-10 in the right column are hidden behind it and cannot be clicked
- The horizontal arrow connecting Step 5 to Step 6 across columns is visually confusing
- The map requires vertical scrolling to see all steps

**Expected behavior:**
Replace the two-column vertical layout with a compact horizontal layout where all 11 steps are visible simultaneously without scrolling, even when the slide-out panel is open. Use two horizontal rows if needed (Steps 0-5 on row 1, Steps 6-10 on row 2) with a clear visual connection between the rows. Nodes should be larger than the original tiny 88px cards but compact enough that all fit above the panel. Target approximately 120-130px wide nodes with text-sm for step names.

The map must remain fully visible and interactive when the panel is open. The panel should appear BELOW the map, not overlaying it.

**Affected files:** `app/src/components/StepMap.jsx`, `app/src/components/OutputView.jsx`, `app/src/components/StepPanel.jsx`

**Close comment:** Fixed — map layout changed to compact horizontal rows with all steps visible and clickable, including when the detail panel is open.

---

### ISSUE 23

**Title:** Instruction text to select a step is at the bottom and easily missed
**Label:** bug
**Body:**

The prompt "Select a step to view its details, configuration impact, and relevant tools" appears at the bottom of the view, below the map and the legend. Users scroll past the map and may miss it entirely.

**Expected behavior:**
Move the instruction text to appear between the flow annotation and the step map, where it serves as a natural transition: the user reads what the workflow is (annotation), then sees what to do next (instruction), then sees the map.

**Affected file:** `app/src/components/OutputView.jsx`

**Close comment:** Fixed — instruction text moved to between the flow annotation and step map.

---

### ISSUE 24

**Title:** Panel content hierarchy is flat and overwhelming — implement progressive disclosure
**Label:** enhancement
**Body:**

The step detail panel shows all content sections in a flat list: purpose, inputs, scope of work, outputs, out of scope, completion criteria, handoff, configuration impact, and then a "Show full detail" toggle for decision rights, exception handling, and loop-back triggers. The division between what is visible and what is hidden is not intuitive.

**Expected behavior:**
Reorganize into two tiers:

**Always visible (primary content):**
- Purpose
- Inputs
- Scope of Work
- Outputs
- Relevant Tools for This Step (moved up — see Issue #26)
- Out of Scope
- Completion Criteria

**Expandable section labeled "Additional Detail" (secondary content):**
- Handoff
- How Your Configuration Affects This Step
- Decision Rights & Escalation
- Exception Handling
- Loop-back Triggers

The "Additional Detail" section replaces the current "Show full detail" toggle. It should be a clearly labeled expandable section with a chevron, not a small text link.

**Affected file:** `app/src/components/StepCard.jsx` or `app/src/components/StepPanel.jsx`

**Close comment:** Fixed — panel content reorganized into primary visible content and expandable "Additional Detail" section.

---

### ISSUE 25

**Title:** Configuration impact labels are internal jargon and some reference JSON file paths
**Label:** bug
**Body:**

In the "How your configuration affects this step" section, modification labels use internal naming like "DP1 direction", "DP3 integration cert" that mean nothing to a viewer. Worse, some configuration_notes entries display developer references like "See structured_specification.json workflow_modification_rules.step5_implementation_ownership" — a file path that leaked into the UI.

**Expected behavior:**

1. Rename modification labels to human-readable text:
   - "DP1 direction" → "Integration direction"
   - "DP1 no integration" → "No technical integration"
   - "DP1 has integration" → "Technical integration active"
   - "DP3 integration cert" → "Certification requirement"
   - "DP3 partner cert" → "Partner certification"
   - "DP3 neither" → "No certification"
   - "DP4 yes" → "Regulated industries"
   - "DP4 no" → "No regulatory requirement"
   - "DP2" → "Commercial motions"
   - "DP2 financial motion" → "Financial motion active"
   - "DP2 no financial motion" → "No financial motion"
   - "DP2 co sell direction" → "Co-sell direction"
   - "DP2 co marketing" → "Co-marketing"
   - "DP2 marketplace" → "Marketplace motion"
   - "DP2 referral direction" → "Referral direction"

2. Filter out any configuration_notes entries whose text contains "See structured_specification.json" or "See structured_spec" or any JSON file path references. These are developer notes, not user-facing content.

**Affected files:** `app/src/components/StepCard.jsx` — the configuration_notes rendering block (the key-to-label mapping) and filtering logic

**Close comment:** Fixed — configuration impact labels renamed to human-readable text. Developer file path references filtered out.

---

### ISSUE 26

**Title:** Relevant Tools section is hidden at the bottom of the panel — move after Outputs
**Label:** enhancement
**Body:**

The "Relevant Tools for This Step" section is positioned at the very bottom of the step detail panel, below all content sections and the full detail toggle. Users must scroll past all step content to find it. Tools are a primary value of the configurator and should be prominent.

**Expected behavior:**
Move the Relevant Tools section to appear immediately after Outputs and before Out of Scope in the panel content hierarchy. This positions tools as part of the primary step information rather than an afterthought.

**Affected file:** `app/src/components/StepPanel.jsx` or wherever the panel content order is defined

**Close comment:** Fixed — Relevant Tools section moved to after Outputs in the panel content order.

---

## PHASE 2: Implement the fixes

After all issues are created and closed, implement the following code changes. Make a separate commit for each fix.

### Fix for Issue #22 — Compact horizontal map layout

Redesign `StepMap.jsx` to use a compact horizontal layout:

**Layout:** Two horizontal rows.
- Row 1: Steps 0, 1, 2, 3, 4, 5 — connected by horizontal arrows
- Row 2: Steps 6, 7, 8, 9, 10 — connected by horizontal arrows
- A connector (curved arrow or vertical line) connects the end of Row 1 to the beginning of Row 2

**Node size:** Approximately 120-130px wide. Step number as text-xs, step name as text-sm font-semibold, owner as text-xs text-slate-400. Configuration dot in the same position.

**Key requirement:** The entire map must be visible without scrolling and must remain fully visible and clickable when the detail panel is open below it. The panel should slide in BELOW the map area, not as a right-side overlay that covers map nodes.

In `OutputView.jsx` and `StepPanel.jsx`, change the panel from a fixed right-side overlay to a section that expands below the map. When a step is selected, the detail panel appears below the map (pushing the "View underlying data schema" link further down). When the panel is closed, the area collapses back. This ensures the map is always visible and all steps are always clickable.

The panel should still have the close button, prev/next navigation, and scrollable content — it's just positioned below the map instead of overlaying it.

Commit message: `Fix map to compact horizontal rows with panel below instead of overlay (Fixes #22)`

### Fix for Issue #23 — Move instruction text

In `OutputView.jsx`, move the "Select a step to view its details, configuration impact, and relevant tools" prompt from below the map to between the flow annotation and the map. It should appear only when no step is selected. When a step is selected and the panel is open, this text disappears (the panel replaces it as the content below the map).

Commit message: `Move instruction text to between flow annotation and step map (Fixes #23)`

### Fix for Issue #24 — Progressive disclosure in panel

In the step detail rendering (StepCard.jsx or StepPanel.jsx), reorganize the content:

**Always visible:**
1. Purpose
2. Inputs
3. Scope of Work
4. Outputs
5. Relevant Tools (will be positioned here after Issue #26)
6. Out of Scope
7. Completion Criteria

**Inside an expandable "Additional Detail" section:**
8. Handoff
9. How Your Configuration Affects This Step
10. Decision Rights & Escalation
11. Exception Handling
12. Loop-back Triggers

The expandable section should use a clear button/header:
```jsx
<button
  onClick={() => setShowAdditional(a => !a)}
  className="w-full flex items-center justify-between py-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
>
  <span>Additional Detail</span>
  <svg className={`w-4 h-4 transition-transform ${showAdditional ? 'rotate-180' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
</button>
```

Remove the old "Show full detail" toggle entirely. The new "Additional Detail" section replaces it, containing ALL secondary content (handoff, configuration impact, decision rights, exception handling, loop-back triggers).

Commit message: `Reorganize panel content with progressive disclosure (Fixes #24)`

### Fix for Issue #25 — Human-readable configuration impact labels

In `StepCard.jsx`, find where configuration_notes keys are rendered. Currently the key is displayed with underscores replaced by spaces (e.g., `key.replace(/_/g, ' ')`). Replace this with a proper label mapping:

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

function getConfigNoteLabel(key) {
  return CONFIG_NOTE_LABELS[key] || key.replace(/_/g, ' ')
}
```

Use `getConfigNoteLabel(key)` instead of `key.replace(/_/g, ' ')` when rendering the label.

Also, add a filter to exclude any configuration_notes entry whose text value contains "See structured_specification" or "See structured_spec" or "workflow_modification_rules":

```javascript
if (typeof text === 'string' && (
  text.includes('structured_specification') ||
  text.includes('structured_spec') ||
  text.includes('workflow_modification_rules')
)) return null
```

Add this filter inside the Object.entries map, before the return statement for each configuration note card.

Also apply the same label mapping to the workflow modification labels in engine.js. In `getActiveWorkflowModifications`, the labels like "Integration direction (partner → entity)" are already reasonable, but update any that use "DP" prefixes to use plain language equivalents.

Commit message: `Fix configuration impact labels to human-readable text and filter developer references (Fixes #25)`

### Fix for Issue #26 — Move Relevant Tools after Outputs

In the panel content rendering, move the Relevant Tools section from the bottom of the panel to immediately after Outputs and before Out of Scope. The order becomes:

1. Purpose
2. Inputs
3. Scope of Work
4. Outputs
5. **Relevant Tools for This Step** ← moved here
6. Out of Scope
7. Completion Criteria
8. Additional Detail (expandable)

Commit message: `Move Relevant Tools section to after Outputs in panel (Fixes #26)`

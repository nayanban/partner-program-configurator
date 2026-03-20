# Map, Accordion, Schema & Versioning — Issues and Fixes

Read this entire document before starting. There are two phases: first create 5 GitHub issues using the GitHub API, then implement the fixes.

---

## PHASE 1: Create and close GitHub issues

Use `curl` with the `$GH_TOKEN` environment variable. These will be Issues #33 through #37.

For each issue: create it, add the close comment, then close it.

---

### ISSUE 33

**Title:** Redesign workflow map as a circular/cyclical layout
**Label:** enhancement
**Body:**

The two-row horizontal step map has a connector arrow between Step 5 and Step 6 that appears below Step 0, making it look like Step 0 forks into two parallel paths. Previous attempts with vertical columns and two-row layouts have all had connector-flow problems.

A circular layout is conceptually appropriate — the partner lifecycle IS a cycle (Step 10 feeds back into Step 0). The steps should flow clockwise around a circle or oval.

**Expected behavior:**

The 11 step nodes are arranged in a clockwise circle/oval that fills the available width of the main content area (to the right of the configuration sidebar). Each node shows step number, name, and owner. Connector lines or arrows follow the circular path clockwise. Skipped steps (Steps 3 and 5 when dp1 = no_integration) appear grayed out but remain in position.

The flow annotation ("This is an 11-step workflow...") appears above the circle. The instruction text ("Select a step to view its details...") appears below it.

When a step is clicked, the existing behavior continues: the horizontal map is replaced by the vertical nav list on the left + detail panel on the right. The close button in the detail panel returns to the circular map.

Implementation approach: Use absolute positioning or CSS transforms to place nodes in a circle. Calculate positions using trigonometry: for each node i, x = centerX + radius * cos(angle), y = centerY + radius * sin(angle), where angle starts at the top (-90 degrees) and increments clockwise. Draw SVG connector lines between adjacent nodes along the circle arc, or use straight lines between nodes.

The circle should be responsive — sized to fit the available space without scrolling.

**Affected file:** `app/src/components/StepMap.jsx`

**Close comment:** Fixed — workflow map redesigned as a circular layout with clockwise flow.

---

### ISSUE 34

**Title:** Remove configuration-affected dots and legend from step map
**Label:** enhancement
**Body:**

The yellow "affected by your configuration" dots on step map nodes and the associated legend are confusing without context. The configuration impact information is available inside each step's detail panel, so the dots are redundant.

**Expected behavior:**
Remove the amber/yellow dots from all step nodes. Remove the legend row entirely (Active step / Skipped step / Affected by your configuration). If a simpler legend is needed, keep only "Active step" and "Skipped step" indicators.

**Affected files:** `app/src/components/StepMap.jsx`

**Close comment:** Fixed — configuration dots and legend removed from step map.

---

### ISSUE 35

**Title:** Dynamically render accordion sections from supplementary content JSON keys
**Label:** enhancement
**Body:**

Step detail accordion sections are currently defined as a hardcoded list in the component. This creates a maintenance risk — if the supplementary content JSON is updated with new sections, the UI won't pick them up.

**Expected behavior:**

The step detail panel should dynamically render accordion sections based on two sources:

**1. Supplementary content JSON (supplementary_content.json):** For each step, read all keys in that step's entry and render an accordion section for each key that contains displayable content. The JSON is the single source of truth for step content. If a key has content, it gets an accordion. If it doesn't exist or is null, no accordion appears.

Key-to-label mapping for display:
- `purpose` → "Purpose" (open by default, all others collapsed)
- `inputs` → "Inputs"
- `owns` → "Scope of Work"
- `outputs` → "Outputs"
- `explicitly_does_not_do` → "Out of Scope"
- `completion_criteria_label` → use the done_label from structured_specification.json completion_criteria
- `handoff` → "Handoff"
- `tie_breaker_escalation` → "Decision Rights & Escalation"
- `failure_exception_paths` → "Exception Handling"
- `loop_back_triggers` → "Loop-back Triggers"
- `entry_triggers` → "Entry Triggers" (Step 9 only — rendered if present)
- `minimum_to_unblock_criteria` → "Minimum to Unblock" (Step 4 only — rendered if present)
- `go_live_criteria` → "Go-live Criteria" (Step 4 only — rendered if present)

**2. Three computed sections** added programmatically:
- "Relevant Tools" — from the STEP_TOOL_MAP and TOOL_RECOMMENDATIONS, filtered by current config. Positioned after "Outputs".
- "How Your Configuration Affects This Step" — from the engine's getActiveWorkflowModifications plus filtered configuration_notes. Only shown when there are active modifications. If no modifications apply to the current step under the current configuration, either hide this section entirely or show it with the text "No configuration-specific changes for this step."
- Per-step data schema (see Issue #36).

**Rendering order:**
1. Purpose (open by default)
2. Inputs
3. Scope of Work
4. Outputs
5. Relevant Tools (computed)
6. Out of Scope
7. Completion Criteria
8. Entry Triggers (Step 9 only, if present in JSON)
9. Minimum to Unblock (Step 4 only, if present in JSON)
10. Go-live Criteria (Step 4 only, if present in JSON)
11. Handoff
12. How Your Configuration Affects This Step (computed, hidden if empty)
13. Decision Rights & Escalation (if present in JSON)
14. Exception Handling (if present in JSON)
15. Loop-back Triggers (if present in JSON)
16. Step Data Schema (computed — see Issue #36)

Any key in the supplementary content JSON that doesn't appear in the key-to-label mapping should still be rendered as an accordion, using the key itself (with underscores replaced by spaces and title-cased) as the label. This ensures future additions to the JSON are automatically surfaced.

**Affected files:** `app/src/components/StepCard.jsx` or `app/src/components/StepPanel.jsx`

**Close comment:** Fixed — accordion sections are now dynamically driven by supplementary content JSON keys plus computed sections. No hardcoded section list.

---

### ISSUE 36

**Title:** Replace full data schema link with per-step schema dropdown and overview-level link
**Label:** enhancement
**Body:**

The "View the underlying data schema →" link at the bottom of the step detail panel opens the full 11-object data model, which is not contextual to the step being viewed.

**Expected behavior:**

**In the step detail panel:**
Replace the link with an accordion section at the bottom titled "Data Schema for This Step". When expanded, it shows only the objects produced or updated in that step (sourced from structured_specification.json `workflow_steps[step].objects_produced_or_updated`). For each object, show its name, field count (active/total), and expandable field table — the same rendering currently used in DataModelView.jsx but scoped to the step's objects.

Add framing text at the top of the expanded section: "The data objects created or updated in this step. Use this as the schema when configuring your system of record for this workflow stage."

**On the workflow overview page (when no step is selected):**
Keep a "View the complete data schema →" link that opens the full DataModelView with all objects. This is the only place the full schema is accessible.

**Affected files:**
- `app/src/components/StepPanel.jsx` or `app/src/components/StepCard.jsx` (per-step schema accordion)
- `app/src/components/OutputView.jsx` (full schema link on overview)
- May reuse rendering logic from `app/src/components/DataModelView.jsx`

**Close comment:** Fixed — step detail shows per-step data schema as an accordion. Full schema accessible from workflow overview page.

---

### ISSUE 37

**Title:** Correct version to v1.6.0 reflecting all changes since initial build
**Label:** enhancement
**Body:**

The version currently displays v1.1.0 but multiple rounds of changes have been applied since:
- v1.0.0 — Initial build
- v1.0.1 — Issues #1–5 (bug fixes)
- v1.1.0 — Issues #6–13 (UI enhancements)
- v1.1.1 — Issues #14–16 (bug fixes)
- v1.2.0 — Issues #17–20 (drill-down redesign)
- v1.3.0 — Issue #21 (panel redesign)
- v1.4.0 — Issues #22–26 (layout and hierarchy)
- v1.5.0 — Issues #27–32 (vertical nav, accordions, contrast)
- v1.6.0 — Issues #33–37 (circular map, dynamic accordions, per-step schema)

Update to v1.6.0 to accurately reflect the current state. Going forward, every batch of changes should include a version bump as the final commit.

**Affected file:** `app/src/App.jsx` or wherever the version constant is defined

**Close comment:** Fixed — version corrected to v1.6.0.

---

## PHASE 2: Implement the fixes

After all issues are created and closed, implement the following code changes. Make a separate commit for each fix. Do them in this order: #34 first (remove dots — simple), then #33 (circular map — biggest visual change), then #35 (dynamic accordions), then #36 (per-step schema), then #37 (version bump — always last).

### Fix for Issue #34 — Remove configuration dots and legend

In `StepMap.jsx`:

1. Remove the amber dot rendering from step nodes. Find the block that renders the modification indicator dot and remove it entirely.

2. Remove the legend row at the bottom of the map, or simplify it to show only "Active step" and "Skipped step" (remove "Affected by your configuration").

3. In the vertical nav variant (used when a step is selected), also remove the dots next to step names.

Commit message: `Remove configuration-affected dots and legend from step map (Fixes #34)`

### Fix for Issue #33 — Circular map layout

In `StepMap.jsx`, replace the two-row horizontal layout with a circular layout.

**Implementation:**

Use a container with `position: relative` and calculated dimensions. Place each node using absolute positioning based on circular coordinates.

```javascript
const STEP_COUNT = stepKeys.length // 11
const RADIUS_X = 320 // horizontal radius (oval)
const RADIUS_Y = 220 // vertical radius (oval)
const CENTER_X = 380 // center point
const CENTER_Y = 260

// Place each step around the oval, starting from the top (-90°), clockwise
stepKeys.map((stepKey, idx) => {
  const angle = (-90 + (idx * 360 / STEP_COUNT)) * (Math.PI / 180)
  const x = CENTER_X + RADIUS_X * Math.cos(angle)
  const y = CENTER_Y + RADIUS_Y * Math.sin(angle)
  // Position node at (x, y)
})
```

Each node is absolutely positioned at the calculated coordinates. Node size: approximately 110-120px wide, with step number (text-xs), name (text-sm font-semibold), and owner (text-xs). The node style is the same as the current implementation (dark card with border, cyan highlight on selected, grayed out for skipped).

**Connector lines:** Draw SVG lines between adjacent nodes. Use a single SVG element behind the nodes (same container, lower z-index). For each pair of adjacent steps, draw a line from node center to node center. Add small arrowheads at the midpoint or end of each line to indicate clockwise direction.

Optionally, draw a subtle curved path (SVG arc) connecting Step 10 back to Step 0 with a different style (dashed or lighter color) to visually communicate the lifecycle loop.

**Sizing:** The circle container should be approximately 760px wide × 520px tall — fitting comfortably in the main content area. Make it responsive if possible (scale with available width).

**Skipped steps:** Steps 3 and 5 when dp1 = no_integration remain in their circular position but at opacity-30 with "Skipped" text. The connector lines to/from skipped steps are also dimmed. Optionally, draw a direct connector from Step 2 to Step 4 (and Step 4 to Step 6) that bypasses the skipped step, to show the actual flow path.

**Click behavior:** Same as current — clicking an active step triggers `onStepClick(stepKey)` which transitions to the vertical nav + detail panel view.

Commit message: `Redesign workflow map as circular layout (Fixes #33)`

### Fix for Issue #35 — Dynamic accordion sections

In the step detail rendering component, replace the hardcoded section list with a dynamic approach.

**Step 1: Define the rendering order and label mapping.**

```javascript
const SECTION_ORDER = [
  'purpose', 'inputs', 'owns', 'outputs',
  '_tools',  // computed — Relevant Tools
  'explicitly_does_not_do', 'completion_criteria',
  'entry_triggers', 'minimum_to_unblock_criteria', 'go_live_criteria',
  'handoff',
  '_config_impact',  // computed — How Your Configuration Affects This Step
  'tie_breaker_escalation', 'failure_exception_paths', 'loop_back_triggers',
  '_step_schema',  // computed — Per-Step Data Schema (Issue #36)
]

const SECTION_LABELS = {
  'purpose': 'Purpose',
  'inputs': 'Inputs',
  'owns': 'Scope of Work',
  'outputs': 'Outputs',
  'explicitly_does_not_do': 'Out of Scope',
  'handoff': 'Handoff',
  'tie_breaker_escalation': 'Decision Rights & Escalation',
  'failure_exception_paths': 'Exception Handling',
  'loop_back_triggers': 'Loop-back Triggers',
  'entry_triggers': 'Entry Triggers',
  'minimum_to_unblock_criteria': 'Minimum to Unblock',
  'go_live_criteria': 'Go-live Criteria',
  '_tools': 'Relevant Tools',
  '_config_impact': 'How Your Configuration Affects This Step',
  '_step_schema': 'Data Schema for This Step',
}
```

**Step 2: Iterate and render.**

For each key in SECTION_ORDER:
- If the key starts with `_`, it's a computed section — render using special logic (tools, config impact, or schema).
- Otherwise, look up the key in the step's supplementary content. If the value is non-null and non-empty, render an AccordionSection with the mapped label and the appropriate content renderer.
- If the key is not present in the step's supplementary content, skip it (no empty accordions).

**Step 3: Handle "How Your Configuration Affects This Step" visibility.**

Compute the active modifications using `getActiveWorkflowModifications`. Also get the filtered `configuration_notes` for the current config. If both are empty (no modifications AND no applicable configuration notes), either:
- Don't render the section at all, OR
- Render it with the text: "No configuration-specific changes for this step."

Preferred: don't render it at all when empty. This keeps the panel clean for steps that aren't affected by the current configuration.

**Step 4: Handle any JSON keys not in SECTION_ORDER.**

After rendering all keys in SECTION_ORDER, check for any remaining keys in the step's supplementary content that aren't in the mapping. For each, render an accordion with the key name as the label (underscores replaced with spaces, title-cased). This future-proofs against supplementary content additions.

**Step 5: Only Purpose is open by default.**

Pass `defaultOpen={true}` only for the Purpose accordion. All others are `defaultOpen={false}`.

Commit message: `Render accordion sections dynamically from supplementary content JSON (Fixes #35)`

### Fix for Issue #36 — Per-step data schema

**In the step detail panel:**

Add a computed section `_step_schema` (as defined in Issue #35's SECTION_ORDER). When this accordion is expanded, it:

1. Reads `spec.workflow_steps[selectedStepKey].objects_produced_or_updated` to get the list of object keys for this step.
2. For each object key, looks up the object in `spec.objects`.
3. Renders each object with its name, field count (active vs total based on current config), and an expandable field table — reuse or replicate the rendering logic from DataModelView.jsx.
4. Shows framing text at the top: "The data objects created or updated in this step. Use this as the schema when configuring your system of record for this workflow stage."

If the step has no objects (unlikely but possible), show "No data objects are produced in this step."

**On the workflow overview page (when no step is selected):**

Keep the "View the complete data schema →" link below the map. This opens the full DataModelView as before. Remove any "View the underlying data schema →" link from inside the step detail panel — it's replaced by the per-step accordion.

Commit message: `Add per-step data schema accordion and full schema link on overview (Fixes #36)`

### Fix for Issue #37 — Update version to v1.6.0

Find where the version string is defined. Change it to `v1.6.0`.

Commit message: `Update version to v1.6.0 (Fixes #37)`

# Workflow Map & Panel Redesign — Issue and Fix

Read this entire document before starting. There are two phases: first create the GitHub issue using the GitHub API, then implement the fix.

---

## PHASE 1: Create and close GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #21.

### ISSUE 21

**Title:** Redesign workflow view: large visual map as centrepiece with slide-out detail panel
**Label:** enhancement
**Body:**

The current output view uses the step map as a small navigation header with step details replacing content below it. The step map — the most visually impressive element — is subordinate to the detail content. The map should be the centrepiece of the experience.

**New interaction model:**

1. The workflow map is the primary view and fills most of the viewport. Steps are displayed in a vertical flow layout on the left portion of the screen — large, readable nodes flowing top-to-bottom with connecting lines between them, showing step number, name, primary owner, and the configuration-affected indicator dot. Skipped steps (Steps 3 and 5 when dp1 = no_integration) are visually grayed out in the flow.

2. The flow annotation ("This is an 11-step workflow...") appears at the top above the map, clearly readable.

3. When the user clicks a step in the map, a slide-out panel appears from the right side (like a drawer), covering roughly 50-60% of the viewport width. The map remains partially visible on the left behind/beside the panel, so the user retains spatial context of where they are in the workflow.

4. The slide-out panel contains:
   - Step name and primary owner at the top
   - All the step detail content (purpose, inputs, scope of work, outputs, out of scope, completion criteria, handoff)
   - Configuration impact section ("How your configuration affects this step")
   - The "Show full detail" toggle for Layer 3 content (tie-breakers, exception handling, loop-back triggers)
   - Relevant tools for this step (at the bottom of the panel)
   - The "View the underlying data schema" link (at the very bottom)

5. The panel has:
   - A close button (X) in the top-right corner that closes the panel and returns to the full map view
   - Previous/Next navigation arrows to move between steps without closing the panel. Previous/Next should skip over inactive steps (e.g., if Steps 3 and 5 are skipped, navigating from Step 2 goes to Step 4). The arrows should be labeled with the destination step name (e.g., "← Step 2: Placement & Tiering" and "Step 4: Approvals Gate →").
   - The panel content is scrollable independently of the map.

6. When no step is selected (initial state and after closing the panel), the full map is visible with the prompt: "Select a step to view its details, configuration impact, and relevant tools."

7. The selected step in the map is highlighted (e.g., cyan border or background) so the user can see which step they're viewing in the panel. This highlight moves as they navigate with next/previous.

8. When the sidebar configuration changes and the currently selected step becomes inactive (e.g., user switches dp1 to no_integration while viewing Step 3), the panel should close automatically and return to the full map view.

**Map layout specifics:**

The vertical flow should use nodes approximately 120-140px wide with step number, name, and owner visible. Connector lines or arrows flow downward between nodes. The flow can wrap into two columns if needed to avoid excessive vertical scrolling (e.g., Steps 0-5 in the left column, Steps 6-10 in the right column, with a connecting line between Step 5 and Step 6). Alternatively, a single vertical column works if the nodes are compact enough.

The map should be noticeably larger than the current horizontal implementation. Step names should be at least text-sm (14px), not text-[10px]. Owner text at least text-xs (12px).

**What is NOT changing:**
- The sidebar (configuration panel on the left) stays as-is
- StepCard content structure stays as-is (purpose, inputs, scope, outputs, etc.)
- The rendering engine (engine.js) stays as-is
- The configuration logic stays as-is

**Affected files:**
- `app/src/components/OutputView.jsx` (major restructure — implement the map + panel layout)
- `app/src/components/StepMap.jsx` (redesign from horizontal small nodes to vertical large nodes)
- `app/src/components/StepCard.jsx` (minor — ensure it works within the panel context, always expanded)
- New: consider a `StepPanel.jsx` component for the slide-out drawer if it keeps the code cleaner

**Close comment:** Fixed — workflow view redesigned with large vertical map as centrepiece and slide-out detail panel. Panel includes step details, configuration impact, relevant tools, and previous/next navigation.

---

## PHASE 2: Implement the fix

### Implementation approach

This is a significant front-end restructure. Here is the recommended approach:

**Step 1: Create the panel component**

Create `app/src/components/StepPanel.jsx` — a slide-out drawer component that:
- Accepts: isOpen, onClose, stepKey, stepData, contentData, config, spec, onNavigate (prev/next)
- Renders as a fixed-position panel on the right side of the screen
- Has a dark semi-transparent backdrop (optional) or simply overlays the right portion
- Is scrollable internally (overflow-y-auto)
- Has a header with step name, owner, close button, and prev/next navigation
- Contains the StepCard content (rendered always-expanded, no collapse toggle)
- Contains the relevant tools section at the bottom
- Contains the "View the underlying data schema" link at the very bottom
- Animates in/out with a CSS transition (translate-x transform)

Panel styling:
- Background: bg-slate-900 or bg-slate-950 with a left border (border-l border-slate-700)
- Width: w-[55%] or w-[600px] max — enough to read content comfortably
- Height: full viewport height (h-screen, fixed position)
- Position: fixed top-0 right-0
- Z-index: above the map content but below the sidebar

**Step 2: Redesign StepMap.jsx**

Replace the current horizontal flex-wrap layout with a vertical layout:

Option A — Two-column vertical flow:
```
Column 1:          Column 2:
Step 0              Step 6
  ↓                   ↓
Step 1              Step 7
  ↓                   ↓
Step 2              Step 8
  ↓                   ↓
Step 3              Step 9
  ↓                   ↓
Step 4              Step 10
  ↓
Step 5 ──────→ (connects to Step 6)
```

Option B — Single column with larger nodes (may require scrolling):
```
Step 0 → Step 1 → Step 2 → ... displayed vertically
```

Choose whichever produces the best visual result. The two-column approach avoids excessive height. Each node should be substantially larger than the current 88px-wide cards:
- Width: at least 150px
- Step number: text-base or text-lg (bold)
- Step name: text-sm font-semibold
- Owner: text-xs text-slate-400
- Configuration dot: same amber dot, positioned top-right
- Skipped steps: opacity-40 with "Skipped" label
- Selected step: cyan border/glow effect
- Hover effect on active steps: subtle border brightening

Connector lines between steps: visible, using SVG lines or CSS borders. For the two-column layout, add a horizontal connector between the last step in column 1 and the first step in column 2.

**Step 3: Restructure OutputView.jsx**

The output view layout becomes:
```
[Sidebar (left, ~280px)] [Main content area]

Main content area:
  - Flow annotation at top
  - Step map (large, fills main area when panel is closed)
  - "Select a step..." prompt when no step selected
  - "View the underlying data schema →" link at bottom

When a step is clicked:
  - StepPanel slides in from the right
  - Map is still partially visible on the left
```

State management in OutputView:
```javascript
const [selectedStepKey, setSelectedStepKey] = useState(null)
const [showDataModel, setShowDataModel] = useState(false)

// Close panel if selected step becomes inactive after config change
useEffect(() => {
  if (selectedStepKey && !isStepActive(selectedStepKey, config)) {
    setSelectedStepKey(null)
  }
}, [config, selectedStepKey])

// Navigation helper
function navigateStep(direction) {
  const activeSteps = Object.keys(spec.workflow_steps).filter(k => isStepActive(k, config))
  const currentIndex = activeSteps.indexOf(selectedStepKey)
  const nextIndex = currentIndex + direction
  if (nextIndex >= 0 && nextIndex < activeSteps.length) {
    setSelectedStepKey(activeSteps[nextIndex])
  }
}
```

**Step 4: Wire up the tools in the panel**

The STEP_TOOL_MAP and tool rendering from the previous implementation (Issue #18) should be moved into the StepPanel. Each step's panel shows relevant tools at the bottom. Use the same mapping:

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
```

Filter by both the step mapping AND the config-based activeWhen function.

**Step 5: Ensure the data model link works**

The "View the underlying data schema →" link at the bottom of the panel (and at the bottom of the map view when no step is selected) should set `showDataModel` to true, which replaces the main content with the DataModelView and a "← Back to workflow" link.

**StepCard adjustments:**

Since StepCard now always renders inside the panel (always expanded), remove the collapsed state. The component should render without the outer border/card wrapper (the panel provides the container). Remove the expand/collapse button. The content starts immediately with Purpose. Keep the Layer 3 "Show full detail" toggle as-is.

Commit message: `Redesign workflow view with large vertical map and slide-out detail panel (Fixes #21)`

# UI/UX Structural Changes — Issues and Fixes

Read this entire document before starting. There are two phases: first create 4 GitHub issues using the GitHub API, then implement the fixes.

---

## PHASE 1: Create and close GitHub issues

Use `curl` with the `$GH_TOKEN` environment variable to create issues via the GitHub API. Create them in order so they are assigned #17, #18, #19, #20.

For each issue: create it, add the close comment, then close it.

```bash
# Create
curl -X POST https://api.github.com/repos/nayanban/partner-program-configurator/issues \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"title": "...", "labels": ["..."], "body": "..."}'

# Comment
curl -X POST https://api.github.com/repos/nayanban/partner-program-configurator/issues/NUMBER/comments \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"body": "..."}'

# Close
curl -X PATCH https://api.github.com/repos/nayanban/partner-program-configurator/issues/NUMBER \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"state": "closed"}'
```

Create the "enhancement" label if it does not already exist.

---

### ISSUE 17

**Title:** Remove "Objects" from the impact counter in sidebar
**Label:** enhancement
**Body:**

The impact counter in the sidebar shows "11 of 11 Steps", "11 of 11 Objects", and "4 of 4 Tracks". The "Objects" count is meaningless to anyone who is not already thinking in data model terms. A hiring manager or partnerships professional has no frame of reference for what "objects" means in this context.

Steps and Tracks are understandable from the rest of the UI — steps are visible in the workflow map, and tracks correspond to the Approval Tracks listed in the sidebar. Objects does not have this contextual support.

**Expected behavior:**
Remove the Objects count from the impact counter. Show only Steps and Tracks.

**Affected file:** `app/src/components/Sidebar.jsx`

**Close comment:** Fixed — Objects count removed from impact counter. Sidebar now shows only Steps and Tracks.

---

### ISSUE 18

**Title:** Redesign output view as sequential drill-down from step map instead of listing all step cards
**Label:** enhancement
**Body:**

The current output view shows the step map at the top and then lists ALL active step cards below it (collapsed but all visible). This creates an overwhelming wall of content. The step details, tool recommendations, and data model are presented as three tabs below the map, with all steps listed simultaneously under Step Details.

**Expected interaction model:**

The step map should be the primary navigation interface. The interaction flow should be:

1. User sees the workflow overview (step map + flow annotation). No step details are visible yet.
2. User clicks a step node in the map (e.g., Step 4 — Approvals Gate).
3. That step's details appear below the map in a single detail panel, replacing whatever was there before. Only ONE step is shown at a time.
4. User clicks a different step node (e.g., Step 7). Step 7's details replace Step 4's details.
5. The currently selected step is visually highlighted in the map (already implemented — the cyan border).

**Tool recommendations should be contextual per step:**

Instead of a separate "Tools" tab showing all tool categories at once, each step's detail panel should include a "Relevant Tools" section at the bottom showing only the tool categories relevant to that specific step. The mapping is:

- Step 0 (Operating System): CRM / Partner Management
- Step 1 (Intake & Routing): CRM / Partner Management
- Step 2 (Placement & Tiering): CRM / Partner Management, Certification / LMS (when dp3 != neither)
- Step 3 (Scoping & Commitment): Integration Management (when dp1 != no_integration)
- Step 4 (Approvals Gate): Security & Compliance Review, Contract & Legal, Attribution & Revenue Ops (when has_financial_motion)
- Step 5 (Implementation): Integration Management (when dp1 != no_integration), Security & Compliance Review
- Step 6 (Launch Readiness): Co-marketing & Campaigns (when co_marketing selected)
- Step 7 (Go-live & Stabilization): Security & Compliance Review
- Step 8 (Operations & Support): CRM / Partner Management, Security & Compliance Review
- Step 9 (Growth Motions): Attribution & Revenue Ops (when has_financial_motion), Marketplace Management (when marketplace motion selected), Co-marketing & Campaigns (when co_marketing selected), Deal Registration & Co-sell (when co_sell or reseller selected), Certification / LMS (when dp3 != neither)
- Step 10 (Review & Renewal): CRM / Partner Management, Contract & Legal

Tool categories that are not active under the current configuration should not appear even if mapped to the step.

**Initial state when no step is selected:**

When the output view first loads (before the user clicks any step), show a prompt below the map: "Select a step above to view its details, configuration impact, and relevant tools." This sets the expectation that the map is interactive.

**Remove the three-tab layout (Step Details / Data Model / Tools):**

Step Details become the default content when a step is clicked. Tools are embedded within each step's detail. Data Model is demoted (see Issue #20). The tab bar is removed.

**Affected files:**
- `app/src/components/OutputView.jsx` (major restructure — remove tab layout, implement single-step drill-down)
- `app/src/components/StepMap.jsx` (already supports onStepClick and activeStepKey — may need minor adjustments)
- `app/src/components/StepCard.jsx` (no structural change — still renders one step's content, just now used for the selected step only)
- `app/src/components/ToolRecommendations.jsx` (refactor to accept a step key and show only tools mapped to that step)

**Close comment:** Fixed — output view redesigned as sequential drill-down. Clicking a step in the map shows that step's details, configuration impact, and relevant tools. Only one step visible at a time. Tab layout removed.

---

### ISSUE 19

**Title:** Simplify modification badges on step map to indicator dots
**Label:** enhancement
**Body:**

The step map currently shows orange badges with modification counts (e.g., "1", "2") on step nodes that are affected by the current configuration. The count number is not meaningful to a viewer — knowing that a step has "2 modifications" provides no useful information without expanding the step.

**Expected behavior:**
Replace the numbered badge with a simple indicator dot. The dot signals "this step is affected by your configuration" — present or absent, no count. The dot should use the same amber/orange color for consistency.

When the user clicks the step and views its details, they see the actual modifications in the "How your configuration affects this step" section.

**Affected file:** `app/src/components/StepMap.jsx`

**Close comment:** Fixed — modification badges simplified to indicator dots without counts.

---

### ISSUE 20

**Title:** Demote Data Model from top-level tab to secondary link
**Label:** enhancement
**Body:**

The Data Model view is the most technical surface in the app. It shows objects and field-level schema detail that is useful for practitioners building a PRM/CRM but is confusing for most viewers. Currently it occupies a top-level tab alongside Step Details and Tools, giving it equal prominence.

**Expected behavior:**
Remove the Data Model tab from the main tab bar. Instead, add a link at the bottom of the output view (below the step detail content) labeled something like "View the underlying data schema →". Clicking it opens the Data Model view (can be a full-page view, a modal, or an expandable section). This signals that it is supplementary depth, not a primary view.

The Data Model view itself does not need to change — it already has framing text and expandable objects. It just needs to be accessed differently.

**Affected files:**
- `app/src/components/OutputView.jsx` (remove Data Model tab, add link at bottom of step detail area)
- `app/src/components/DataModelView.jsx` (no change to the component itself)

**Close comment:** Fixed — Data Model demoted from top-level tab to secondary link at the bottom of the output view.

---

## PHASE 2: Implement the fixes

After all issues are created and closed, implement the following code changes. Make a separate commit for each fix.

### Fix for Issue #17 — Remove Objects from impact counter

In `app/src/components/Sidebar.jsx`, find the impact counter section that displays Steps, Objects, and Tracks. Remove the Objects count entirely. Keep only Steps and Tracks. Adjust the layout so the two remaining counters are visually balanced (e.g., two columns instead of three).

Commit message: `Remove Objects count from sidebar impact counter (Fixes #17)`

### Fix for Issue #18 — Redesign output view as sequential drill-down

This is the largest change. Here is the implementation approach:

**OutputView.jsx:**

1. Remove the three-tab layout (Step Details / Data Model / Tools).
2. The output view now has two sections: the workflow overview (step map + annotation) at the top, and a single detail panel below it.
3. Add a state variable `selectedStepKey` (default: null).
4. When `selectedStepKey` is null, show a prompt below the map: "Select a step above to view its details, configuration impact, and relevant tools." Style this as a centered, muted message — text-slate-500, with a subtle icon if desired.
5. When `selectedStepKey` is set, render a single StepCard for that step, plus a "Relevant Tools" section below it.
6. Pass `selectedStepKey` to StepMap as `activeStepKey` (this is already wired up).
7. When the user clicks a step in the map, set `selectedStepKey` to that step's key.
8. Only active steps are clickable. Skipped steps (3 and 5 when dp1=no_integration) cannot be selected.
9. When configuration changes in the sidebar and the selected step becomes inactive (e.g., user switches dp1 to no_integration while viewing Step 3), reset `selectedStepKey` to null.

**ToolRecommendations.jsx (or create a new StepTools component):**

Refactor to support a per-step mode. Create a mapping of step keys to tool category names:

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

When rendering tools for a specific step:
1. Get the tool category names from STEP_TOOL_MAP for the selected step.
2. Filter TOOL_RECOMMENDATIONS to only those categories.
3. Further filter by each category's `activeWhen` function (so a category mapped to a step still only shows if the configuration activates it).
4. If no tools remain after filtering, don't show the tools section for that step.

Render the relevant tools as a compact section below the step detail content, titled "Relevant Tools for This Step". Keep the disclaimer: "Representative tools, not recommendations. Your choice depends on existing stack, budget, and scale."

**StepCard.jsx:**

No structural change needed. It already renders a single step's content. It will now be used for the selected step only instead of being mapped over all active steps.

However, make one adjustment: since StepCard is now the sole detail panel, ensure it renders in its expanded state by default (remove the collapsed/expanded toggle — the card is always open when it's the selected step). Keep the Layer 3 "Show full detail" toggle as-is.

Commit message: `Redesign output view as sequential drill-down from step map (Fixes #18)`

### Fix for Issue #19 — Simplify modification badges to dots

In `app/src/components/StepMap.jsx`, find the modification badge rendering. Currently it shows:

```jsx
<div className="absolute -top-1.5 right-1 w-3 h-3 bg-amber-500 rounded-full border border-slate-900 flex items-center justify-center">
  <span className="text-[7px] text-slate-900 font-bold">{mods.length}</span>
</div>
```

Replace with a simple dot (no number):

```jsx
<div className="absolute -top-1.5 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-slate-900" />
```

Also update the legend at the bottom of the step map. Change from:

```jsx
<div className="w-3 h-3 bg-amber-500 rounded-full"></div>
<span className="text-xs text-slate-500">Has modifications</span>
```

To:

```jsx
<div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
<span className="text-xs text-slate-500">Affected by your configuration</span>
```

Commit message: `Simplify modification badges to indicator dots (Fixes #19)`

### Fix for Issue #20 — Demote Data Model to secondary link

In `app/src/components/OutputView.jsx`:

1. Remove the Data Model tab from the tab bar (which is being removed anyway in Issue #18).
2. At the bottom of the step detail area (below the StepCard and the Relevant Tools section), add a link:

```jsx
<div className="mt-8 pt-6 border-t border-slate-800">
  <button
    onClick={() => setShowDataModel(true)}
    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
  >
    View the underlying data schema →
  </button>
</div>
```

3. Add a state variable `showDataModel` (default: false).
4. When `showDataModel` is true, render the DataModelView component in place of (or below) the step detail content, with a "← Back to workflow" link to return.

The DataModelView component itself does not change.

Commit message: `Demote Data Model from tab to secondary link (Fixes #20)`

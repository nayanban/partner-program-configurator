# Step Detail Rendering Bugs — Issues and Fixes

Read this entire document before starting. There are two phases: first create 3 GitHub issues using the GitHub API, then implement the fixes.

---

## PHASE 1: Create and close GitHub issues

Use `curl` with the `$GH_TOKEN` environment variable to create issues via the GitHub API. Create them in order so they are assigned #14, #15, #16.

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

Create the "bug" label if it does not already exist.

---

### ISSUE 14

**Title:** Completion criteria renders raw JSON field checks in step cards
**Label:** bug
**Body:**

In the step detail cards, the Completion Criteria section renders raw JSON field-level checks below the human-readable done_label. For example, Step 0 shows the done_label "OS is current for execution" followed by a dump of objects like `{"field":"partner_operating_system.status","operator":"==","value":"current"}` that is completely unreadable.

These field-level checks are machine logic from the structured specification. They should never be displayed to a human in the step card.

**Expected behavior:**
The Completion Criteria section should show only the `done_label` (or `done_label_for_step5_start` / `done_label_for_step6_start` for Step 4). The raw `done_condition` field checks should be removed from the step card entirely. If they need to be accessible at all, they belong behind a clearly labeled technical toggle or in the Data Model view — not in the default step card content.

**Actual behavior:**
Raw JSON objects are rendered as text below the done_label, creating an unreadable wall of field/operator/value strings.

**Affected file:** `app/src/components/StepCard.jsx` — `CompletionCriteriaSection` and `CriteriaChecklist` components

**Close comment:** Fixed — completion criteria now shows only the human-readable done_label. Raw field-level checks removed from step card display.

---

### ISSUE 15

**Title:** Loop-back triggers show "Step ?" instead of actual step numbers
**Label:** bug
**Body:**

In Layer 3 (Full Detail) of the step cards, the loop-back triggers section renders "→ Step ?" for every trigger instead of the actual target step. For example, Step 0's loop-back triggers should show "→ Step 10", "→ Step 8", and "→ Step 9" but instead show "→ Step ?" for all three.

The issue is that the supplementary_content.json uses different key names across steps. Step 0 uses `source` (the step that sends the trigger), while other steps use `target` (the step to return to). The rendering code looks for `trigger.target` and falls through to "?" when it finds `source` instead.

**Expected behavior:**
Each loop-back trigger should display the actual step reference. The component should check for `trigger.target`, `trigger.source`, and `trigger.target_step`, and render whichever is present.

**Actual behavior:**
All loop-back triggers display "→ Step ?" regardless of the data in the JSON.

**Affected file:** `app/src/components/StepCard.jsx` — `FullDetailLayer` function, loop-back triggers rendering

**Close comment:** Fixed — loop-back triggers now correctly read target/source fields from supplementary content and display actual step references.

---

### ISSUE 16

**Title:** "Explicitly Does Not Do" label is unclear — rename to "Out of Scope"
**Label:** bug
**Body:**

The step card section labeled "EXPLICITLY DOES NOT DO" uses phrasing from the internal workflow document that is awkward as a UI label. It reads as jargon rather than clear communication.

**Expected behavior:**
Rename the section label from "Explicitly Does Not Do" to "Out of Scope" (or "Does Not Cover"). This communicates the same boundary information in plain language.

**Affected file:** `app/src/components/StepCard.jsx` — the Section title for the explicitly_does_not_do content

**Close comment:** Fixed — section renamed from "Explicitly Does Not Do" to "Out of Scope".

---

## PHASE 2: Implement the fixes

After all issues are created and closed, implement the following code changes. Make a separate commit for each fix.

### Fix for Issue #14 — Remove raw JSON from completion criteria

In `app/src/components/StepCard.jsx`, modify the `CompletionCriteriaSection` component:

**For the default case (non-Step-4 steps):**
Show only the `done_label` text. Remove the block that renders `CriteriaChecklist` with `cc.done_condition` below the done_label. The entire `CriteriaChecklist` component and its rendering of field checks should be removed from the step card.

**For Step 4:**
Show `done_label_for_step5_start` and `done_label_for_step6_start` as the two human-readable labels. Remove the `CriteriaChecklist` rendering of `done_condition_minimum_to_unblock` and `done_condition_go_live`. Keep the two label cards ("To unlock Step 5" and "To unlock Step 6") but remove the field-level checks below them.

**For Step 8:**
If there is a `done_condition_for_step9_activation` with sub-variants, show only the `done_label` text. Do not render the sub-variant field checks.

After making these changes, the `CriteriaChecklist` component will be unused. Remove it entirely to keep the code clean.

Commit message: `Remove raw JSON field checks from completion criteria display (Fixes #14)`

### Fix for Issue #15 — Fix loop-back trigger step references

In `app/src/components/StepCard.jsx`, in the `FullDetailLayer` function, find the loop-back triggers rendering block. Change the step reference rendering from:

```jsx
<div className="text-xs text-amber-500/70 w-20 flex-shrink-0">
  → Step {trigger.target || trigger.target_step || '?'}
</div>
```

To:

```jsx
<div className="text-xs text-amber-500/70 w-24 flex-shrink-0">
  → {trigger.target || trigger.source || trigger.target_step || 'Unknown'}
</div>
```

This checks `trigger.target` first (used by most steps), then `trigger.source` (used by Step 0's loop-back triggers which reference where the trigger comes from), then `trigger.target_step` as a fallback. Also remove the "Step" prefix since the values in the JSON already contain the full text like "Step 10" or "Step 0".

Commit message: `Fix loop-back triggers to display actual step references (Fixes #15)`

### Fix for Issue #16 — Rename "Explicitly Does Not Do" to "Out of Scope"

In `app/src/components/StepCard.jsx`, find the Section component that renders the explicitly_does_not_do content. Change the title from:

```jsx
<Section title="Explicitly Does Not Do">
```

To:

```jsx
<Section title="Out of Scope">
```

Commit message: `Rename "Explicitly Does Not Do" to "Out of Scope" (Fixes #16)`

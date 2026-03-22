# Completion Criteria, Entry Triggers & Cleanup Fixes

Read this entire document before starting. There are four phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #48.

### ISSUE 48

**Title:** Fix Step 4 default labels, expansion play note, RevOps misplacement, Step 6 input dedup
**Label:** bug
**Body:**

Five fixes:
1. Step 4 completion criteria: rewrite default labels to remove "minimum-to-unblock" and "go-live" terminology
2. Step 4 handoff: rewrite default text to remove "minimum-to-unblock" terminology
3. Step 9 expansion play config note: rewrite to plain language (previous fix didn't land)
4. Move RevOps/Finance payout readiness condition from Step 8 config impact to Step 9 Entry Triggers
5. Step 6 no-integration inputs: consolidate redundant bullets

**Close comment:** Fixed — all five fixes applied.

---

## PHASE 2: Update structured_specification.json

### Fix 1: Step 4 completion criteria default labels

Open `app/public/structured_specification.json`. Find `workflow_steps.step_4.completion_criteria`.

Change:
```json
"done_label_for_step5_start": "Minimum-to-unblock criteria met — implementation may begin"
```
To:
```json
"done_label_for_step5_start": "All preliminary approvals obtained — implementation may begin (Step 5)"
```

Change:
```json
"done_label_for_step6_start": "Go-live criteria met — production launch may proceed"
```
To:
```json
"done_label_for_step6_start": "All final approvals obtained — launch may proceed (Step 6/7)"
```

The `done_label_when_no_integration` added in Issue #47 stays as is: "All required approvals obtained and conditions met for launch".

---

## PHASE 3: Update supplementary_content.json

### Fix 2: Step 4 handoff default text

Find step_4's `handoff` value (the default, not the `_when_no_integration` variant). Replace the current text with:

```
"Step 4 is complete when all preliminary approvals are obtained and all remaining approval conditions are documented with owners and deadlines by Partnerships Deal Desk / Program Manager; Step 5 is accepted by Solutions Engineering / Partner Engineering for implementation; progression can be blocked by Security/Privacy, Legal, and (where applicable) Compliance/Risk until approval conditions are satisfied."
```

This removes the term "minimum-to-unblock criteria" from the default handoff.

### Fix 3: Step 9 expansion play config note

This fix needs to target the EXACT location of the text. Do BOTH of these:

**Location A:** In step_9's `configuration_notes`, search for any key/value pair where the value mentions "Deeper integration depth" or "Enablement Refresh" or "Enablement refresh". If found, replace the value with:
```
"The expansion play's integration-deepening activities are removed when no technical integration is selected. The enablement refresh activities include certification renewal when partner competency certification is required."
```

**Location B:** In step_9's `owns` array, find the Expansion play object (it will have `"play": "Expansion"` or similar). If it has a `configuration_note` field, replace its value with:
```
"The integration-deepening activities are removed when no technical integration is selected. The enablement refresh activities include certification renewal when partner competency certification is required."
```

**If you cannot find the text in either location**, search the ENTIRE supplementary_content.json for the string "Deeper integration depth" and replace wherever it appears.

### Fix 4: Move RevOps/Finance condition from Step 8 to Step 9

**Step 8:** In step_8's `configuration_notes`, find the key/value pair where the value mentions "RevOps/Finance must confirm attribution and payout mechanics". Delete this entire key/value pair from step_8.

Also check if this text appears in the structured_specification.json workflow_modification_rules for step_8. If so, remove it there too (or move it to step_9).

**Step 9:** In step_9's `entry_triggers.gates` array, add a new gate:
```
"RevOps/Finance confirms attribution and payout mechanics are ready (required when financial motions are selected)"
```

This gate should be conditional on financial motions being active. Add a conditional note:
```json
"when_no_financial_motion": "Attribution and payout readiness gate is not required when no financial motions are selected."
```

### Fix 5: Step 6 no-integration inputs consolidation

In step_6, find `inputs_when_no_integration`. Change from:
```json
[
  "Approved agreements and cleared gates (Step 4)",
  "Contractual/support obligations (Step 4)"
]
```
To:
```json
[
  "Approved agreements, cleared gates, and contractual/support obligations (Step 4)"
]
```

---

## PHASE 4: Update StepCard.jsx rendering

### Change 1: Step 9 Entry Triggers — handle financial motion conditional

In the Entry Triggers rendering, add handling for the `when_no_financial_motion` conditional (similar to existing `when_DP4_yes` and `when_DP1_no_integration` handling):

```jsx
{stepContent.entry_triggers.when_no_financial_motion && !computeHasFinancialMotion(config) && (
  <p className="text-sm text-slate-400 mt-3">{stepContent.entry_triggers.when_no_financial_motion}</p>
)}
```

Also ensure `computeHasFinancialMotion` is imported from engine.js in StepCard.jsx (it should already be imported from the clean rewrite).

---

## PHASE 5: Update version and commit

Update the version from `v1.7.2` to `v1.7.3`.

Commit message: `Fix Step 4 labels, expansion play note, RevOps placement, Step 6 inputs (Fixes #48)`

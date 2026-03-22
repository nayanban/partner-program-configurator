# Step 4 Single Label, Step 9 Dedup & Terminology Fixes

Read this entire document before starting. There are four phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #49.

### ISSUE 49

**Title:** Step 4 single completion label, Step 9 config impact dedup, terminology fixes
**Label:** bug
**Body:**

Four fixes:
1. Step 4 completion criteria: collapse dual labels to a single label (preliminary/final distinction now lives in Step 5/6 Entry Triggers)
2. Step 9 config impact: deduplicate "No technical integration" and "Expansion play" cards
3. Step 9 Entry Triggers: make RevOps/Finance gate conditional in rendering, fix "financial motion" → "commercial motion"
4. Global: replace "financial motion" with "commercial motion" in all user-facing text

**Close comment:** Fixed — Step 4 single label, Step 9 dedup, terminology corrected.

---

## PHASE 2: Update structured_specification.json

### Fix 1: Step 4 completion criteria — single label

Open `app/public/structured_specification.json`. Find `workflow_steps.step_4.completion_criteria`.

Replace `done_label_for_step5_start` and `done_label_for_step6_start` with a single `done_label`:

```json
"done_label": "All required approvals obtained and conditions documented with owners and deadlines"
```

Keep the `done_label_when_no_integration` (same text, but it's already correct).

Leave `done_condition_minimum_to_unblock` and `done_condition_go_live` in place — those are programmatic field-level checks used by the engine, not user-facing labels. Only the display labels change.

---

## PHASE 3: Update supplementary_content.json

### Fix 2: Remove duplicate expansion play modification source

In step_9's `configuration_notes`, find ALL keys whose values mention "Deeper integration depth" or "expansion play" or "integration-deepening activities". There will likely be two entries:

One from the original extraction (something like the key containing "DP1" with text about "Expansion plays: new use case activation...") — **DELETE this entry**.

One from our rewrite (with text about "The integration-deepening activities are removed...") — **KEEP this entry** but change its key to ensure CONFIG_NOTE_LABELS maps it correctly. If the key is something like `DP1_no_integration`, that's fine (it maps to "No technical integration").

After this change, there should be exactly ONE config note about expansion plays when no integration is selected.

Also check: in the `owns` array for step_9, if the Expansion play object has a `configuration_note` field, this is a THIRD source that feeds into "How your configuration affects this step" via the track note relocation (Issue #42). If this field contains similar text about integration-deepening being removed, **DELETE the configuration_note field from the Expansion play object** since the information is already covered by the config note above.

The goal: exactly ONE card about expansion play impact when no integration is selected, not two or three.

### Fix 3: Terminology — replace "financial motion" with "commercial motion"

Search ALL string values in supplementary_content.json for "financial motion" (case-insensitive) and replace with "commercial motion".

Also search structured_specification.json workflow_modification text values for "financial motion" and replace with "commercial motion". Do NOT change programmatic keys or function names like `computeHasFinancialMotion` — only user-facing text values.

### Fix 4: Step 9 Entry Triggers — remove conditional note

In step_9's `entry_triggers`, find and DELETE the key `when_no_financial_motion` and its value entirely. The RevOps/Finance gate will be hidden by rendering logic instead.

Also update the RevOps/Finance gate text in the `gates` array. Change:
```
"RevOps/Finance confirms attribution and payout mechanics are ready (required when financial motions are selected)"
```
To:
```
"RevOps/Finance confirms attribution and payout mechanics are ready"
```

Remove the parenthetical — the rendering layer will handle showing/hiding this gate based on configuration.

---

## PHASE 4: Update StepCard.jsx and engine.js

### Change 1: Step 4 completion criteria — render single label

In StepCard.jsx, the Completion Criteria rendering currently checks for `cc.done_label_for_step5_start` to decide between dual labels and single label. Since we've replaced the dual labels with a single `done_label`, the special dual-label path is no longer needed.

Update the logic:

```jsx
{(() => {
  const cc = stepData.completion_criteria
  if (!cc) return null

  // No-integration variant for Step 4
  if (stepKey === 'step_4' && config.dp1 === 'no_integration' && cc.done_label_when_no_integration) {
    return (
      <AccordionSection title="Completion Criteria">
        <p className="text-sm text-slate-200 font-medium">{cc.done_label_when_no_integration}</p>
      </AccordionSection>
    )
  }

  // Default: done_label (now used for all steps including Step 4)
  const label = cc.done_label || cc.note || null
  if (!label) return null
  return (
    <AccordionSection title="Completion Criteria">
      <p className="text-sm text-slate-200 font-medium">{label}</p>
    </AccordionSection>
  )
})()}
```

Remove the `cc.done_label_for_step5_start` branch entirely.

### Change 2: Step 9 Entry Triggers — conditionally show RevOps/Finance gate

In the Entry Triggers rendering, instead of showing all gates and adding a conditional note, filter the gates based on configuration:

```jsx
{stepContent.entry_triggers && (
  <AccordionSection title="Entry Triggers">
    {stepContent.entry_triggers.description && (
      <p className="text-sm text-slate-300 mb-3">{stepContent.entry_triggers.description}</p>
    )}
    {stepContent.entry_triggers.gates && (
      <ul className="space-y-1.5">
        {stepContent.entry_triggers.gates
          .filter(gate => {
            // Hide RevOps/Finance gate when no commercial motions involve financial payments
            if (gate.includes('RevOps/Finance') && gate.includes('attribution and payout') && !computeHasFinancialMotion(config)) {
              return false
            }
            return true
          })
          .map((gate, i) => (
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

### Change 3: Terminology in engine.js — "financial motion" → "commercial motion"

In engine.js, search for any user-facing strings (labels, texts in TOOL_RECOMMENDATIONS descriptions, modification labels) that say "financial motion" or "Financial motion" and replace with "commercial motion" / "Commercial motion".

Do NOT rename the function `computeHasFinancialMotion` — that's internal code. Only change strings that appear in the rendered UI.

Also in StepCard.jsx, update CONFIG_NOTE_LABELS:
- `'DP2_financial_motion'` → label should be `'Commercial motion active'` (was `'Financial motion active'`)
- `'DP2_no_financial_motion'` → label should be `'No commercial motion'` (was `'No financial motion'`)

And apply `cleanText()` to ensure any remaining "financial motion" in modification text is caught:

Add to `cleanDPReferences` or create a new cleanup:
```javascript
function cleanTerminology(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/\bfinancial motion/gi, 'commercial motion')
    .replace(/\bFinancial motion/g, 'Commercial motion')
}
```

Chain this with the existing `cleanText` function.

---

## PHASE 5: Update version and commit

Update the version from `v1.7.3` to `v1.7.4`.

Commit message: `Step 4 single label, Step 9 dedup, terminology fixes (Fixes #49)`

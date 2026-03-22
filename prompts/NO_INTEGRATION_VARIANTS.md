# No-Integration Content Variants & Cleanup

Read this entire document before starting. There are four phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #47.

### ISSUE 47

**Title:** Add no-integration content variants, fix step references, clean modification text
**Label:** enhancement
**Body:**

Systematic fix for content that assumes all 11 steps are present. When DP1=no_integration, Steps 3 and 5 are skipped. All static text referencing those steps needs configuration-aware variants.

Changes:
1. Add `_when_no_integration` variant fields to supplementary_content.json for Steps 4, 6, 7
2. Update StepCard.jsx to use variants when dp1=no_integration
3. Fix Step 4 completion criteria in structured_specification.json
4. Fix CONFIG_NOTE_LABELS for misleading keys
5. Clean modification rule text in structured_specification.json (field paths, duplicates)
6. Rewrite Step 9 expansion play config note to plain language
7. Fix Step 7 purpose regardless of configuration

**Close comment:** Fixed — no-integration content variants added, step references corrected, modification text cleaned.

---

## PHASE 2: Update supplementary_content.json

For each change below, find the step's entry in `app/public/supplementary_content.json` and add the new key or modify the existing value.

### Step 4 variants

Add these new keys to step_4:

```json
"purpose_when_no_integration": "Secure the required approvals and binding obligations by running reviews in parallel, defining what is needed before the partnership can go live.",

"inputs_when_no_integration": [
  "Partner profile (Step 2)",
  "Required gate flags (Step 2)"
],

"explicitly_does_not_do_when_no_integration": [
  "Allow indefinite 'conditional approvals' without owners and deadlines (conditions must be tracked and time-bound)"
],

"handoff_when_no_integration": "Step 4 is complete when all required approvals are obtained and conditions are documented with owners and deadlines by Partnerships Deal Desk / Program Manager; Step 6 is accepted by Partnerships (Partner Enablement / Partner Ops) for launch packaging; progression can be blocked by Security/Privacy and Legal until all approval conditions are met."
```

Also update step_4's `configuration_notes`. Find the key `DP1_no_integration_handoff` and change its value to:
```
"When no technical integration is selected, Step 5 (Implementation) is skipped. Step 4 hands off directly to Step 6 (Launch Readiness). All approval conditions must be met before proceeding to launch."
```

### Step 6 variants

Add these new keys to step_6:

```json
"purpose_when_no_integration": "Make the partnership operational for users and internal teams.",

"inputs_when_no_integration": [
  "Approved agreements and cleared gates (Step 4)",
  "Contractual/support obligations (Step 4)"
],

"explicitly_does_not_do_when_no_integration": [
  "Negotiate bespoke terms outside the approved agreements (those route back to Step 4)"
]
```

### Step 7 variants

Change the DEFAULT purpose (not a variant — this applies to all configurations):
```json
"purpose": "Execute production launch, stabilize, and confirm operational readiness."
```

Add these new keys to step_7:

```json
"inputs_when_no_integration": [
  "Launch package (Step 6)",
  "Approved agreements and confirmed commercial mechanics (Step 4)"
]
```

### Step 4 completion criteria fix

Open `app/public/structured_specification.json`. Find `workflow_steps.step_4.completion_criteria`.

Add a new key:
```json
"done_label_when_no_integration": "All required approvals obtained and conditions met for launch"
```

This replaces the dual labels (done_label_for_step5_start and done_label_for_step6_start) when dp1=no_integration.

### Fix CONFIG_NOTE_LABELS

In `app/src/components/StepCard.jsx` (or wherever CONFIG_NOTE_LABELS is defined), add these entries:

```javascript
'DP1_no_integration_handoff': 'No technical integration',
'DP1_no_integration': 'No technical integration',
```

These override the `cleanDPReferences` function which was turning "DP1_no_integration_handoff" into the nonsensical "integration direction no integration handoff".

### Clean workflow modification rule text in structured_specification.json

Find `conditional_logic.workflow_modification_rules.step4_legal_agreement_type` and rewrite the values:

```json
{
  "when_reseller_partner_selected": "Reseller agreement required — covers resale rights, territory, and pricing floors",
  "when_reseller_entity_selected": "Reverse reseller agreement required — covers entity's commission, order mechanics, and fulfillment",
  "when_marketplace_third_party_selected": "Additional marketplace platform agreement required (e.g. AWS Marketplace, Microsoft Publisher Agreement) in addition to the partner agreement",
  "when_no_reseller_or_third_party": "Standard partnership or integration agreement"
}
```

Find `conditional_logic.workflow_modification_rules.step2_entitlements_by_motion` and clean ALL values to remove field path references:

- Replace all occurrences of "recorded in partner_profile.entitlements" → "recorded in the partner profile"
- Replace "partner_profile.co_marketing_eligible = true" → "Co-marketing eligibility is set in the partner profile"
- Replace any other `object.field` patterns with plain language

### Step 9 expansion play config note

In step_9's `configuration_notes` (or in the owns array's Expansion play configuration_note), find the text about "Deeper integration depth" and "Enablement Refresh" and replace with:

```
"The expansion play's integration-deepening activities are removed when no technical integration is selected. The enablement refresh activities include certification renewal when partner competency certification is required."
```

### Step 8 "hard gate" language

In step_8's configuration notes or wherever the "hard gate" text appears, find:
```
"RevOps/Finance must confirm attribution and payout mechanics are ready before Step 9 activates. This is a hard gate."
```
Replace with:
```
"RevOps/Finance must confirm attribution and payout mechanics are ready before Step 9 activates."
```

---

## PHASE 3: Update StepCard.jsx rendering

### Change 1: Use variant fields when dp1=no_integration

Create a helper function at the top of StepCard:

```javascript
function getContent(stepContent, field, config) {
  if (config.dp1 === 'no_integration' && stepContent[field + '_when_no_integration']) {
    return stepContent[field + '_when_no_integration']
  }
  return stepContent[field]
}
```

Apply this function to ALL content fields that have variants:

**Purpose:**
```jsx
<AccordionSection title="Purpose" defaultOpen={true}>
  <p className="text-sm text-slate-200 leading-relaxed">
    {getContent(stepContent, 'purpose', config)}
  </p>
</AccordionSection>
```

**Inputs:**
```jsx
const inputs = getContent(stepContent, 'inputs', config)
{inputs && inputs.length > 0 && (
  <AccordionSection title="Inputs">
    {/* render inputs */}
  </AccordionSection>
)}
```

**Out of Scope:**
```jsx
const outOfScope = getContent(stepContent, 'explicitly_does_not_do', config)
{outOfScope && outOfScope.length > 0 && (
  <AccordionSection title="Out of Scope">
    {/* render outOfScope */}
  </AccordionSection>
)}
```

**Handoff:**
```jsx
const handoff = getContent(stepContent, 'handoff', config)
{(handoff || stepContent.handoff_note) && (
  <AccordionSection title="Handoff">
    {/* render handoff */}
  </AccordionSection>
)}
```

### Change 2: Step 4 completion criteria — use no-integration variant

In the Completion Criteria section rendering, add a check for the no-integration variant:

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

  // Step 4: dual labels (only when integration exists)
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

### Change 3: Ensure CONFIG_NOTE_LABELS overrides take priority

In StepCard.jsx, when looking up a label in CONFIG_NOTE_LABELS, check for exact match BEFORE applying cleanDPReferences. The current flow may be: clean the key first, then look up. It should be: look up first, if no match then clean:

```javascript
function getConfigNoteLabel(key) {
  // Exact match first
  if (CONFIG_NOTE_LABELS[key]) return CONFIG_NOTE_LABELS[key]
  // Fallback: clean and capitalize
  return key.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())
}
```

Ensure the fallback capitalizes the first letter (fixes "integration direction no integration handoff" starting lowercase).

---

## PHASE 4: Update version and commit

Update the version from `v1.7.1` to `v1.7.2`.

Commit message: `Add no-integration content variants, fix step references, clean modification text (Fixes #47)`

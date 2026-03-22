# Rendering Refinements: Readability, Ordering, Content Fixes

Read this entire document before starting. There are four phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #40.

### ISSUE 40

**Title:** Rendering refinements — section reorder, readability fixes, content cleanup
**Label:** enhancement
**Body:**

Eight rendering and content refinements:
1. Scope of Work: bold text before colons for visual hierarchy
2. Handoff: separate blocking conditions into a note box below transition bullets
3. Relevant Tools: add category descriptions
4. Section reorder: move Decision Rights after Roles, Entry Triggers/Minimum to Unblock/Go-live Criteria after Inputs, Configuration Impact to second-from-last
5. Likely owner text contrast fix
6. Clean field path references (partner_profile.entitlements etc.) from configuration impact text
7. Replace DP1/DP2/DP3/DP4 codes with plain language in all user-facing text

**Close comment:** Fixed — all eight rendering refinements applied.

---

## PHASE 2: Fix content in structured_specification.json and supplementary_content.json

### 2A: Clean DP codes from workflow modification text

Open the structured specification JSON (`app/public/structured_specification.json` or wherever it lives).

Search for ALL occurrences of these patterns in the `workflow_modifications` and `workflow_modification_rules` sections and replace with plain language:

- `DP1` → `integration direction`
- `DP2` → `commercial motions`
- `DP3` → `certification requirement`
- `DP4` → `regulated industries`

Also search the supplementary_content.json for these patterns in `configuration_notes` values and replace similarly.

Be careful: only replace in user-facing text values (strings), NOT in keys or programmatic identifiers. Keys like `DP1_direction`, `DP2_financial_motion` etc. must remain unchanged — those are used by the engine logic.

### 2B: Clean field path references from configuration impact text

In the structured specification JSON, search the `workflow_modifications` and `workflow_modification_rules` sections for any text values containing patterns like:
- `partner_profile.entitlements`
- `partner_record.`
- `integration_plan_spec.`
- `approval_record.`
- `certification_record.`
- `launch_readiness_package.`
- `operational_handoff_package.`
- `operations_record.`
- `growth_plan.`
- `lifecycle_decision_record.`

For each occurrence, replace the field path with plain language. Examples:
- "recorded in partner_profile.entitlements" → "recorded in the partner profile"
- "updates partner_record.lifecycle_status" → "updates the partner record status"
- "captured in approval_record.track_decisions" → "captured in the approval record"

If unsure how to translate a specific path, simplify by removing the field path entirely and keeping just the surrounding context.

Also do the same search-and-replace in supplementary_content.json's `configuration_notes` values.

### 2C: Add tool descriptions to engine.js

Open `app/src/engine.js` and find the `TOOL_RECOMMENDATIONS` array. Add a `description` field to each tool category object. The descriptions should explain what the tool category does in the context of a partner program:

```javascript
// Add these descriptions to each TOOL_RECOMMENDATIONS entry:
// CRM / Partner Management:
description: "System of record for partner data, tiers, entitlements, pipeline tracking, and relationship management"

// Integration Management:
description: "API management, integration orchestration, sandbox environments, and partner connectivity infrastructure"

// Security & Compliance Review:
description: "Automated evidence collection, compliance monitoring, security questionnaires, and trust center management"

// Contract & Legal:
description: "Contract lifecycle management, template libraries, redlining, e-signature, and obligation tracking"

// Attribution & Revenue Ops:
description: "Partner-sourced vs partner-influenced credit tracking, payout calculations, and revenue reconciliation"

// Marketplace Management:
description: "Cloud marketplace listing management, transaction processing, and co-sell deal registration"

// Certification / LMS:
description: "Partner training programs, competency assessments, certification tracking, and enablement content delivery"

// Co-marketing & Campaigns:
description: "Joint campaign execution, MDF/co-op fund management, lead distribution, and partner marketing automation"

// Deal Registration & Co-sell:
description: "Account mapping, deal registration, pipeline sharing, and co-sell opportunity management"
```

---

## PHASE 3: Update StepCard.jsx rendering

### Change 1: Reorder accordion sections

The new section rendering order is:

```
1.  Purpose                                    — always, open by default
2.  Inputs                                     — if content exists
3.  Entry Triggers                             — Step 9 ONLY
4.  Minimum to Unblock                         — Step 4 ONLY
5.  Go-live Criteria                           — Step 4 ONLY
6.  Roles & Responsibilities                   — if content exists
7.  Scope of Work                              — if content exists
8.  Decision Rights & Escalation               — if content exists
9.  Outputs                                    — if content exists
10. Relevant Tools                             — computed
11. Out of Scope                               — if content exists
12. Completion Criteria                        — from spec
13. Handoff                                    — if content exists
14. Exception Handling                         — if content exists
15. Loop-back Triggers                         — if content exists
16. How Your Configuration Affects This Step   — computed, only if modifications exist
17. Data Schema for This Step                  — computed
```

Move the JSX blocks for each section into this exact order.

### Change 2: Scope of Work — bold text before colons

In the Scope of Work rendering (for the default bullet list, not Step 4 tracks or Step 9 plays), split each item at the first colon. Bold the text before the colon, normal weight for text after:

```jsx
// For each item in the default Scope of Work bullet list:
{typeof item === 'string' && item.includes(':') ? (
  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
    <span className="text-slate-500 mt-0.5">•</span>
    <span>
      <span className="font-semibold text-slate-200">{item.split(':')[0]}:</span>
      <span>{item.split(':').slice(1).join(':')}</span>
    </span>
  </li>
) : (
  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
    <span className="text-slate-500 mt-0.5">•</span>
    <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
  </li>
)}
```

For Step 4 tracks and Step 9 plays, apply the same colon-split bolding to individual items within each track/play.

### Change 3: Handoff — separate blocking conditions into note box

Replace the current handoff rendering with logic that separates transition actions from blocking conditions:

```jsx
{(stepContent.handoff || stepContent.handoff_note) && (
  <AccordionSection title="Handoff">
    {stepContent.handoff && (() => {
      const clauses = stepContent.handoff.split(';').map(c => c.trim()).filter(Boolean)
      const blockingKeywords = ['blocked by', 'paused if', 'progression can be blocked', 'cannot proceed', 'progression is paused', 'blocking']
      const transitions = clauses.filter(c => !blockingKeywords.some(kw => c.toLowerCase().includes(kw)))
      const blockers = clauses.filter(c => blockingKeywords.some(kw => c.toLowerCase().includes(kw)))

      return (
        <>
          {transitions.length > 0 && (
            <ul className="space-y-1.5">
              {transitions.map((clause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 mt-0.5">→</span>
                  <span>{clause}</span>
                </li>
              ))}
            </ul>
          )}
          {blockers.length > 0 && (
            <div className="mt-3 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
              <div className="text-xs font-medium text-amber-400 mb-1">Blocking conditions</div>
              {blockers.map((clause, i) => (
                <p key={i} className="text-sm text-slate-400">{clause}</p>
              ))}
            </div>
          )}
        </>
      )
    })()}
    {stepContent.handoff_note && <p className="text-sm text-slate-400 italic mt-2">{stepContent.handoff_note}</p>}
  </AccordionSection>
)}
```

### Change 4: Relevant Tools — render description

In the Relevant Tools section, add the description below the category name:

```jsx
{tools.map((t, i) => (
  <div key={i} className="border border-slate-800 rounded-lg p-3">
    <div className="text-sm font-semibold text-slate-300">{t.category}</div>
    {t.description && (
      <div className="text-xs text-slate-400 mt-1">{t.description}</div>
    )}
    <div className="text-xs text-slate-500 mt-2">{t.tools}</div>
  </div>
))}
```

Note: `t.description` is the new field added in Phase 2C. `t.tools` (the example tool names) moves to a smaller, lighter style below the description.

### Change 5: Likely owner contrast fix

In the Exception Handling section, change the likely_owner rendering from `text-slate-500` to `text-slate-400`:

```jsx
{path.likely_owner && (
  <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
    <span className="text-slate-400">↳</span>
    <span className="font-medium text-slate-300">Likely owner:</span>
    <span>{path.likely_owner}</span>
  </div>
)}
```

### Change 6: Clean DP codes in rendering layer (fallback)

In engine.js, in the `getActiveWorkflowModifications` function (or wherever modification labels/text are assembled), add a post-processing step that replaces any remaining DP codes in the output text:

```javascript
function cleanDPReferences(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/\bDP1\b/gi, 'integration direction')
    .replace(/\bDP2\b/gi, 'commercial motions')
    .replace(/\bDP3\b/gi, 'certification requirement')
    .replace(/\bDP4\b/gi, 'regulated industries')
}
```

Apply this function to both `mod.label` and `mod.text` (or whatever the actual property names are) before rendering in Section 16 (How Your Configuration Affects This Step).

Also apply it to the output of `getApplicableConfigNotes` — apply `cleanDPReferences` to both `note.label` and `note.text`.

Additionally, add a similar function for field path cleanup:

```javascript
function cleanFieldPaths(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/\bpartner_profile\.(\w+)/g, 'the partner profile')
    .replace(/\bpartner_record\.(\w+)/g, 'the partner record')
    .replace(/\bintegration_plan_spec\.(\w+)/g, 'the integration plan')
    .replace(/\bapproval_record\.(\w+)/g, 'the approval record')
    .replace(/\bcertification_record\.(\w+)/g, 'the certification record')
    .replace(/\blaunch_readiness_package\.(\w+)/g, 'the launch readiness package')
    .replace(/\boperational_handoff_package\.(\w+)/g, 'the operational handoff package')
    .replace(/\boperations_record\.(\w+)/g, 'the operations record')
    .replace(/\bgrowth_plan\.(\w+)/g, 'the growth plan')
    .replace(/\blifecycle_decision_record\.(\w+)/g, 'the lifecycle decision record')
}
```

Apply `cleanFieldPaths` to the same modification and configuration note text, chained with `cleanDPReferences`:

```javascript
const cleanText = (text) => cleanFieldPaths(cleanDPReferences(text))
```

Use `cleanText()` on all user-facing modification labels and text in the rendering.

---

## PHASE 4: Update version and commit

Update the version from `v1.6.1` to `v1.6.2`.

Commit message: `Rendering refinements — section reorder, readability, content cleanup (Fixes #40)`

# Navigation, Orientation & Full Markdown Download

Read this entire document before starting. There are three phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #55.

### ISSUE 55

**Title:** Fix orientation banner persistence, add "Back to overview" navigation, expand markdown download to full manual
**Label:** enhancement
**Body:**

Three changes:
1. Orientation banner: stop auto-dismissing on step click, only dismiss on ✕
2. Replace ✕ close button with "← Overview" text button on left side of step detail header
3. Expand markdown download to include all 15 step detail sections and configuration share link

**Close comment:** Fixed — orientation persists, back navigation clear, full manual download.

---

## PHASE 2: Apply changes

### Change 1: Orientation banner — stop auto-dismissing

In `app/src/components/OutputView.jsx`, find the `handleStepSelect` function (or wherever `selectedStepKey` is set when a step is clicked).

Find and REMOVE the line:
```javascript
setShowOrientation(false)
```

The orientation banner already only shows when `showOrientation && !selectedStepKey`, so it naturally hides when a step is selected (because `selectedStepKey` becomes non-null) and reappears when the user returns to the overview (when `selectedStepKey` becomes null again). The ✕ button is the only way to permanently dismiss it.

---

### Change 2: Replace ✕ with "← Overview" navigation

In `app/src/components/OutputView.jsx`, find the step detail header — the sticky header at the top of the detail panel that contains the step name, prev/next buttons, and the ✕ close button.

**2A: Remove the existing ✕ button.** Find the button that calls `setSelectedStepKey(null)` and looks like:
```jsx
<button onClick={() => setSelectedStepKey(null)} className="...">✕</button>
```
DELETE this button.

**2B: Add "← Overview" on the LEFT side of the header.** The header layout should become:

```jsx
<div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-800 sticky top-0 bg-slate-950 z-10 gap-2">
  {/* Left: back button + step name */}
  <div className="flex items-center gap-3 flex-1 min-w-0">
    <button
      onClick={() => setSelectedStepKey(null)}
      className="text-sm text-cyan-400 hover:text-cyan-300 flex-shrink-0 transition-colors"
    >
      ← Overview
    </button>
    <div className="min-w-0">
      <div className="text-sm font-semibold text-slate-200 truncate">{stepData.step_name}</div>
      <div className="text-xs text-slate-400">{cleanOwnerText(stepData.primary_owner)}</div>
    </div>
  </div>

  {/* Right: prev/next navigation */}
  <div className="flex items-center gap-3 flex-shrink-0">
    {adj.prev && (
      <button onClick={() => handleStepSelect(adj.prev)} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
        ← {adj.prev.replace('step_', '')}. {getShortStepName(adj.prev)}
      </button>
    )}
    {adj.next && (
      <button onClick={() => handleStepSelect(adj.next)} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
        {adj.next.replace('step_', '')}. {getShortStepName(adj.next)} →
      </button>
    )}
  </div>
</div>
```

Key changes:
- "← Overview" is on the LEFT, in cyan, immediately visible
- Step name is next to it (not centered)
- Prev/next stays on the RIGHT
- ✕ button is gone
- On mobile, the layout stacks vertically: "← Overview" + step name on top, prev/next below

**2C: Also add "← Overview" on mobile above the step selector.**

In the mobile step selector area (the `md:hidden` div with the `<select>`), add the overview button above the dropdown:

```jsx
<div className="md:hidden border-b border-slate-800 px-4 py-2 bg-slate-950 flex-shrink-0">
  <button
    onClick={() => setSelectedStepKey(null)}
    className="text-sm text-cyan-400 hover:text-cyan-300 mb-2 transition-colors"
  >
    ← Overview
  </button>
  <label className="text-xs text-slate-500 mb-1 block">Navigate to step</label>
  <select ...>...</select>
</div>
```

---

### Change 3: Expand markdown download to full manual

Replace the contents of `app/src/generateMarkdown.js` with the following complete implementation:

```javascript
import { isStepActive, getActiveWorkflowModifications, TOOL_RECOMMENDATIONS, encodeConfig, computeHasFinancialMotion } from './engine'

const BASE_URL = 'https://nayanban.github.io/partner-program-configurator/'

export function generateMarkdownSummary(config, spec, content) {
  const lines = []
  const shareUrl = BASE_URL + '?' + encodeConfig(config)

  // Title
  lines.push('# Partner Program Workflow — Configuration Summary')
  lines.push('')
  lines.push(`Generated from the [Partner Program Configurator](${shareUrl})`)
  lines.push('')
  lines.push(`[Open this configuration in the app](${shareUrl})`)
  lines.push('')

  // Configuration
  lines.push('## Your Configuration')
  lines.push('')
  lines.push(`- **Integration direction:** ${formatDP1(config.dp1)}`)
  lines.push(`- **Commercial motions:** ${formatDP2(config)}`)
  lines.push(`- **Certification:** ${formatDP3(config.dp3)}`)
  lines.push(`- **Regulated industries:** ${config.dp4 === 'yes' ? 'Yes — Compliance/Risk track active' : 'No'}`)
  lines.push('')

  // Active steps
  const stepKeys = Object.keys(spec.workflow_steps)
  const activeSteps = stepKeys.filter(k => isStepActive(k, config))
  const inactiveSteps = stepKeys.filter(k => !isStepActive(k, config))

  lines.push(`## Workflow Overview (${activeSteps.length} of ${stepKeys.length} steps active)`)
  lines.push('')

  for (const key of activeSteps) {
    const stepData = spec.workflow_steps[key]
    const stepNum = key.replace('step_', '')
    const sc = content[key] || {}

    lines.push(`---`)
    lines.push('')
    lines.push(`### Step ${stepNum} — ${stepData.step_name}`)
    lines.push('')

    // 1. Purpose
    const purpose = getVariant(sc, 'purpose', config)
    if (purpose) {
      lines.push(`**Purpose:** ${purpose}`)
      lines.push('')
    }

    // 2. Inputs
    const inputs = getVariant(sc, 'inputs', config)
    if (inputs && inputs.length > 0) {
      lines.push('**Inputs:**')
      const inputList = Array.isArray(inputs) ? inputs : [inputs]
      for (const input of inputList) {
        lines.push(`- ${input}`)
      }
      lines.push('')
    }

    // 3. Entry Triggers
    if (sc.entry_triggers) {
      lines.push('**Entry Triggers:**')
      if (sc.entry_triggers.description) {
        lines.push(sc.entry_triggers.description)
      }
      if (sc.entry_triggers.gates) {
        for (const gate of sc.entry_triggers.gates) {
          // Skip RevOps/Finance gate if no commercial motion
          if (gate.includes('RevOps/Finance') && gate.includes('attribution and payout') && !computeHasFinancialMotion(config)) continue
          lines.push(`- ✓ ${gate}`)
        }
      }
      if (config.dp4 === 'yes' && sc.entry_triggers.when_DP4_yes) {
        lines.push(`- *${sc.entry_triggers.when_DP4_yes}*`)
      }
      lines.push('')
    }

    // 4. Roles & Responsibilities
    if (sc.roles_and_responsibilities) {
      const rr = sc.roles_and_responsibilities
      lines.push('**Roles & Responsibilities:**')
      lines.push('')
      if (rr.primary_owner) {
        lines.push(`**Primary Owner:** ${rr.primary_owner.role} — ${rr.primary_owner.responsibility}`)
        lines.push('')
      }
      if (rr.contributors && rr.contributors.length > 0) {
        lines.push('Key Contributors & Approvers:')
        lines.push('')
        lines.push('| Role | Responsibility |')
        lines.push('|------|---------------|')
        for (const c of rr.contributors) {
          lines.push(`| ${c.role} | ${c.responsibility} |`)
        }
        lines.push('')
      }
    }

    // 5. Scope of Work
    const owns = sc.owns
    if (owns && owns.length > 0) {
      lines.push('**Scope of Work:**')
      lines.push('')
      for (const item of owns) {
        if (typeof item === 'string') {
          lines.push(`- ${item}`)
        } else if (typeof item === 'object') {
          // Track (Step 4) or Play (Step 9)
          const name = item.track || item.play || 'Item'
          lines.push(`**${name}:**`)
          if (item.items) {
            for (const sub of item.items) {
              lines.push(`- ${sub}`)
            }
          }
          lines.push('')
        }
      }
      lines.push('')
    }

    // 6. Decision Rights & Escalation
    if (sc.tie_breaker_escalation && sc.tie_breaker_escalation.length > 0) {
      lines.push('**Decision Rights & Escalation:**')
      lines.push('')
      for (const item of sc.tie_breaker_escalation) {
        const authority = item.authority || item.role || 'N/A'
        const scope = item.scope || item.responsibility || ''
        lines.push(`- **${authority}:** ${scope}`)
      }
      lines.push('')
    }

    // 7. Outputs
    const outputs = sc.outputs
    if (outputs && outputs.length > 0) {
      lines.push('**Outputs:**')
      for (const output of outputs) {
        lines.push(`- ${typeof output === 'string' ? output : JSON.stringify(output)}`)
      }
      lines.push('')
    }

    // 8. (Relevant Tools rendered once at the end of the document, not per step)

    // 9. Out of Scope
    const outOfScope = getVariant(sc, 'explicitly_does_not_do', config)
    if (outOfScope && outOfScope.length > 0) {
      lines.push('**Out of Scope:**')
      const items = Array.isArray(outOfScope) ? outOfScope : [outOfScope]
      for (const item of items) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }

    // 10. Completion Criteria
    const cc = stepData.completion_criteria
    if (cc) {
      const label = (config.dp1 === 'no_integration' && cc.done_label_when_no_integration)
        ? cc.done_label_when_no_integration
        : (cc.done_label || cc.note || '')
      if (label) {
        lines.push(`**Completion Criteria:** ${label}`)
        lines.push('')
      }
    }

    // 11. Handoff
    const handoff = getVariant(sc, 'handoff', config)
    if (handoff) {
      lines.push('**Handoff:**')
      const clauses = handoff.split(';').map(c => c.trim()).filter(Boolean)
      for (const clause of clauses) {
        lines.push(`- ${clause.charAt(0).toUpperCase() + clause.slice(1)}`)
      }
      lines.push('')
    }

    // 12. Exception Handling
    if (sc.failure_exception_paths && sc.failure_exception_paths.length > 0) {
      lines.push('**Exception Handling:**')
      lines.push('')
      for (const path of sc.failure_exception_paths) {
        lines.push(`**If** ${path.condition}`)
        lines.push(`→ ${path.response}`)
        if (path.likely_owner) {
          lines.push(`*Likely owner: ${path.likely_owner}*`)
        }
        lines.push('')
      }
    }

    // 13. Loop-back Triggers
    if (sc.loop_back_triggers && sc.loop_back_triggers.length > 0) {
      lines.push('**Loop-back Triggers:**')
      for (const trigger of sc.loop_back_triggers) {
        const text = typeof trigger === 'string'
          ? trigger
          : (trigger.condition || trigger.trigger || JSON.stringify(trigger))
        lines.push(`- ${text}`)
      }
      lines.push('')
    }

    // 14. Configuration Impact
    const mods = getActiveWorkflowModifications(key, stepData, spec, config)
    if (mods.length > 0) {
      lines.push('**How Your Configuration Affects This Step:**')
      for (const mod of mods) {
        lines.push(`- **${mod.label}:** ${mod.text}`)
      }
      lines.push('')
    }
  }

  // Inactive steps
  if (inactiveSteps.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Inactive Steps')
    lines.push('')
    for (const key of inactiveSteps) {
      const stepData = spec.workflow_steps[key]
      const stepNum = key.replace('step_', '')
      lines.push(`- ~~Step ${stepNum} — ${stepData.step_name}~~ (skipped in this configuration)`)
    }
    lines.push('')
  }

  // Tool recommendations (once, at the end)
  const activeTools = TOOL_RECOMMENDATIONS.filter(t => t.activeWhen(config))
  if (activeTools.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Relevant Tools')
    lines.push('')
    lines.push('*Representative tools, not recommendations. Your choice depends on existing stack, budget, and scale.*')
    lines.push('')
    for (const tool of activeTools) {
      lines.push(`**${tool.category}**${tool.description ? ` — ${tool.description}` : ''}`)
      lines.push(`Examples: ${tool.tools}`)
      lines.push('')
    }
  }

  // Footer
  lines.push('---')
  lines.push('')
  lines.push(`Generated by the [Partner Program Configurator](${shareUrl})`)
  lines.push('')
  lines.push(`Built by [Nayan B.](https://www.linkedin.com/in/banerjee-nayan/)`)

  return lines.join('\n')
}

function getVariant(stepContent, field, config) {
  if (config.dp1 === 'no_integration' && stepContent[field + '_when_no_integration']) {
    return stepContent[field + '_when_no_integration']
  }
  return stepContent[field]
}

function formatDP1(value) {
  const labels = {
    no_integration: 'No technical integration — purely commercial relationship',
    entity_to_partner: "Entity integrates into partner's system",
    partner_to_entity: "Partner integrates into entity's system",
    bidirectional: 'Bidirectional integration',
  }
  return labels[value] || value
}

function formatDP2(config) {
  const motions = config.dp2?.motions || []
  if (motions.length === 0) return 'None selected'
  const labels = {
    referral_inbound: 'Referral (inbound)',
    referral_outbound: 'Referral (outbound)',
    reseller_partner: 'Reseller (partner)',
    reseller_entity: 'Reseller (entity)',
    marketplace_entity: 'Marketplace (entity)',
    marketplace_partner: 'Marketplace (partner)',
    marketplace_third_party: 'Marketplace (third-party)',
    co_sell: `Co-sell (${config.dp2?.co_sell_direction || 'N/A'})`,
    co_marketing: `Co-marketing (${config.dp2?.co_marketing_funding || 'N/A'})`,
  }
  return motions.map(m => labels[m] || m).join(', ')
}

function formatDP3(value) {
  const labels = {
    neither: 'No certification required',
    integration_cert_only: 'Integration/technical certification only',
    partner_cert_only: 'Partner competency certification only',
    both: 'Both types of certification required',
  }
  return labels[value] || value
}
```

**IMPORTANT:** The `encodeConfig` and `computeHasFinancialMotion` functions must be exported from `engine.js`. Check if they already are:
```bash
grep -n "export.*encodeConfig\|export.*computeHasFinancialMotion" app/src/engine.js
```

If either is not exported, add it to the exports.

---

## PHASE 3: Update version and commit

Update the version from `v1.8.1` to `v1.9.0` (full manual download is a significant feature).

Commit message: `Fix orientation persistence, add overview nav, full manual download (Fixes #55)`

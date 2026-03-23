# UX Polish: Links, Loading Animation, Sidebar Arrows, Markdown Download

Read this entire document before starting. There are three phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #54.

### ISSUE 54

**Title:** Homepage links, loading animation, sidebar arrows, markdown download
**Label:** enhancement
**Body:**

Five changes:
1. Homepage: make "Partner Lifecycle Framework" badge link to GitHub source document
2. Homepage: restate subtitle with attribution linking to LinkedIn
3. Output view: add 2-second loading animation before revealing workflow
4. Sidebar: fix invisible dropdown arrows on all select elements
5. Output view: add "Download Summary" button that generates a markdown file

**Close comment:** Fixed — all five changes applied.

---

## PHASE 2: Apply changes

### Change 1: "Partner Lifecycle Framework" badge link

In `app/src/components/LandingPage.jsx`, find the "Partner Lifecycle Framework" badge/pill element near the top of the page.

Wrap it in an anchor tag (or change the existing element to an anchor) WITHOUT changing its visual appearance:

```jsx
<a
  href="https://github.com/nayanban/partner-program-configurator/blob/main/partner_lifecycle_workflow.md"
  target="_blank"
  rel="noopener noreferrer"
  className="... existing badge classes ... cursor-pointer hover:opacity-80 transition-opacity"
>
  {/* existing badge content — keep all existing styling */}
  Partner Lifecycle Framework
</a>
```

The only visual change: cursor becomes pointer on hover, and a subtle opacity change. No other style changes.

---

### Change 2: Subtitle restatement with attribution

In `app/src/components/LandingPage.jsx`, find the text:
```
Built on an 11-step partner lifecycle framework from partner acquisition to renewal.
```

Replace with:
```jsx
<p className="... existing subtitle classes ...">
  Built on an 11-step partner lifecycle framework, covering acquisition through renewal, developed by{' '}
  <a
    href="https://www.linkedin.com/in/banerjee-nayan/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-300 hover:text-cyan-400 underline underline-offset-2 transition-colors"
  >
    Nayan B.
  </a>
</p>
```

The link should be subtle — underlined, slightly brighter than surrounding text, with a cyan hover state matching the app's accent color.

---

### Change 3: Loading animation before output view

In `app/src/components/OutputView.jsx`:

Replace the current simple fade-in with a multi-phase loading screen.

**3A: Add loading state**

```javascript
const [loadingPhase, setLoadingPhase] = useState(0) // 0=loading, 1=ready
const [loadingText, setLoadingText] = useState('Reading your configuration...')
const [progressWidth, setProgressWidth] = useState('0%')

useEffect(() => {
  const timers = [
    setTimeout(() => setProgressWidth('90%'), 50), // start animation after mount
    setTimeout(() => setLoadingText('Building your workflow...'), 700),
    setTimeout(() => setLoadingText('Ready'), 1400),
    setTimeout(() => setLoadingPhase(1), 2000),
  ]
  return () => timers.forEach(clearTimeout)
}, [])
```

**3B: Loading screen**

When `loadingPhase === 0`, show the loading screen instead of the output view content:

```jsx
if (loadingPhase === 0) {
  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
      {/* Progress bar */}
      <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-cyan-400 rounded-full transition-all duration-[2000ms] ease-out"
          style={{ width: progressWidth }}
        />
      </div>
      {/* Loading text */}
      <p className="text-sm text-slate-400 transition-opacity duration-300">
        {loadingText}
      </p>
    </div>
  )
}
```

The progress bar animates from 0% to 90% over 2 seconds (CSS transition). The text changes through three phases. After 2 seconds, the loading screen is replaced with the actual output view (which fades in).

**3C: Fade-in after loading**

Keep the existing fade-in wrapper but trigger it after loading completes:

```javascript
const [viewReady, setViewReady] = useState(false)

useEffect(() => {
  if (loadingPhase === 1) {
    const timer = setTimeout(() => setViewReady(true), 50)
    return () => clearTimeout(timer)
  }
}, [loadingPhase])
```

Wrap the output view content:
```jsx
<div className={`transition-opacity duration-500 ${viewReady ? 'opacity-100' : 'opacity-0'}`}>
  {/* ... all output view content ... */}
</div>
```

The flow is: 2 seconds of loading animation → loading screen disappears → output view fades in over 500ms.

---

### Change 4: Sidebar dropdown arrows

In `app/src/components/Sidebar.jsx`, find ALL `<select>` elements. These are the dropdowns for Integration Direction, Co-sell direction, Co-marketing funding, Certification, and Regulated Industries.

For EACH `<select>`, apply custom arrow styling:

```jsx
<select
  className="... existing classes ... pr-8"
  style={{
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1rem',
  }}
>
```

To avoid repeating the style object on every select, create a constant at the top of the component:

```javascript
const selectArrowStyle = {
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1rem',
}
```

Then apply `style={selectArrowStyle}` to every `<select>` in the sidebar.

Also ensure each select has `pr-8` (padding-right) in its className to prevent text from overlapping the arrow.

Run this to find all select elements:
```bash
grep -n "<select" app/src/components/Sidebar.jsx
```

Apply the style to every match.

---

### Change 5: Markdown download

**5A: Create the markdown generator function**

Create a new file `app/src/generateMarkdown.js`:

```javascript
import { isStepActive, getActiveWorkflowModifications, TOOL_RECOMMENDATIONS } from './engine'

export function generateMarkdownSummary(config, spec, content) {
  const lines = []

  // Title
  lines.push('# Partner Program Workflow — Configuration Summary')
  lines.push('')
  lines.push(`Generated from the Partner Program Configurator`)
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
    const stepContent = content[key] || {}

    lines.push(`### Step ${stepNum} — ${stepData.step_name}`)
    lines.push(`**Owner:** ${stepData.primary_owner || 'N/A'}`)
    lines.push('')

    // Purpose
    const purpose = (config.dp1 === 'no_integration' && stepContent.purpose_when_no_integration)
      ? stepContent.purpose_when_no_integration
      : stepContent.purpose
    if (purpose) {
      lines.push(`**Purpose:** ${purpose}`)
      lines.push('')
    }

    // Completion criteria
    const cc = stepData.completion_criteria
    if (cc) {
      const label = (config.dp1 === 'no_integration' && cc.done_label_when_no_integration)
        ? cc.done_label_when_no_integration
        : (cc.done_label || cc.note || '')
      if (label) {
        lines.push(`**Completion criteria:** ${label}`)
        lines.push('')
      }
    }

    // Configuration impact
    const mods = getActiveWorkflowModifications(key, stepData, spec, config)
    if (mods.length > 0) {
      lines.push('**How your configuration affects this step:**')
      for (const mod of mods) {
        lines.push(`- **${mod.label}:** ${mod.text}`)
      }
      lines.push('')
    }
  }

  // Inactive steps
  if (inactiveSteps.length > 0) {
    lines.push('## Inactive Steps')
    lines.push('')
    for (const key of inactiveSteps) {
      const stepData = spec.workflow_steps[key]
      const stepNum = key.replace('step_', '')
      lines.push(`- ~~Step ${stepNum} — ${stepData.step_name}~~ (skipped in this configuration)`)
    }
    lines.push('')
  }

  // Tool recommendations
  const activeTools = TOOL_RECOMMENDATIONS.filter(t => t.activeWhen(config))
  if (activeTools.length > 0) {
    lines.push('## Relevant Tools')
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
  lines.push('Generated by the [Partner Program Configurator](https://nayanban.github.io/partner-program-configurator/)')
  lines.push(`Built by [Nayan B.](https://www.linkedin.com/in/banerjee-nayan/)`)

  return lines.join('\n')
}

function formatDP1(value) {
  const labels = {
    no_integration: 'No technical integration — purely commercial relationship',
    entity_to_partner: 'Entity integrates into partner\'s system',
    partner_to_entity: 'Partner integrates into entity\'s system',
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

**5B: Add Download Summary button**

In `app/src/components/OutputView.jsx`, import the generator:

```javascript
import { generateMarkdownSummary } from '../generateMarkdown'
```

Add a download handler:

```javascript
const handleDownloadSummary = () => {
  const markdown = generateMarkdownSummary(config, spec, content)
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'partner-program-workflow-summary.md'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

Add a "Download Summary" button in the top bar, next to the existing "Share Link" button:

```jsx
<button
  onClick={handleDownloadSummary}
  className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
>
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
  Download
</button>
```

Place it BEFORE the "Share Link" button in the top bar's right-side group.

**5C: Verify the download**

Build and test. Click "Download Summary" on an output view. Confirm:
- A file named `partner-program-workflow-summary.md` downloads
- It contains the configuration answers, active steps with purpose and completion criteria, configuration impact notes, inactive steps, and tool recommendations
- The formatting renders correctly when opened in a markdown viewer

---

## PHASE 3: Update version and commit

Update the version from `v1.8.0` to `v1.8.1`.

Commit message: `Homepage links, loading animation, sidebar arrows, markdown download (Fixes #54)`

# UX Improvements: Onboarding, Navigation & Discoverability

Read this entire document before starting. There are three phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #53.

### ISSUE 53

**Title:** UX improvements — homepage copy, orientation banner, step discoverability, nav clarity
**Label:** enhancement
**Body:**

Five UX improvements based on user testing:
1. Homepage: change "intake" to "acquisition" in subtitle
2. Output view: add fade-in transition and one-time orientation banner
3. Workflow overview: make step nodes look interactive, improve instruction text
4. Mobile step selector: make dropdown look like a control, not a label
5. Prev/next navigation: add step numbers and progress indicator

**Close comment:** Fixed — all five UX improvements applied.

---

## PHASE 2: Apply changes

### Change 1: Homepage subtitle copy

In `app/src/components/LandingPage.jsx`, find the text:
```
Built on an 11-step partner lifecycle framework covering intake through renewal.
```

Replace with:
```
Built on an 11-step partner lifecycle framework from partner acquisition to renewal.
```

---

### Change 2: Output view — fade-in transition and orientation banner

In `app/src/components/OutputView.jsx`:

**2A: Fade-in transition**

Add a state variable for the fade-in:
```javascript
const [viewReady, setViewReady] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => setViewReady(true), 50)
  return () => clearTimeout(timer)
}, [])
```

Wrap the entire output view content in a transition container:
```jsx
<div className={`transition-opacity duration-500 ${viewReady ? 'opacity-100' : 'opacity-0'}`}>
  {/* ... all existing output view content ... */}
</div>
```

**2B: One-time orientation banner**

Add a state variable:
```javascript
const [showOrientation, setShowOrientation] = useState(true)
```

Render the banner at the top of the main content area (below the top bar, above the workflow map or step detail). It should appear ONLY when `showOrientation` is true AND `selectedStepKey` is null (the user is on the workflow overview, not a step detail):

```jsx
{showOrientation && !selectedStepKey && (
  <div className="mx-4 mt-4 mb-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3 flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-200">
        Your configured workflow is ready.
      </p>
      {/* Desktop message */}
      <p className="text-xs text-slate-400 mt-1 hidden md:block">
        Click any step below to explore its details. Use the sidebar to adjust your configuration.
      </p>
      {/* Mobile message */}
      <p className="text-xs text-slate-400 mt-1 md:hidden">
        Tap any step below to explore its details. Tap the ⚙ icon to adjust your configuration.
      </p>
    </div>
    <button
      onClick={() => setShowOrientation(false)}
      className="text-slate-400 hover:text-slate-200 ml-4 flex-shrink-0 text-lg"
    >
      ✕
    </button>
  </div>
)}
```

Also auto-dismiss when the user clicks a step:
```javascript
// In the step selection handler (wherever selectedStepKey is set):
const handleStepSelect = (stepKey) => {
  setSelectedStepKey(stepKey)
  setShowOrientation(false) // dismiss orientation on first step click
}
```

Make sure this handler is passed to StepMap and used wherever steps are selected.

---

### Change 3: Workflow overview — interactive step nodes

In `app/src/components/StepMap.jsx` (or wherever the timeline step nodes are rendered in the workflow overview / MODE A view):

**3A: Hover animation on nodes**

Add hover styles to each clickable step node:
```jsx
<div className="... cursor-pointer transition-all duration-200 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] ...">
```

**3B: Subtle pulse on the first active node**

Add a CSS animation to the FIRST active step node only. This draws the eye and suggests interactivity. Ensure the step node has `relative` in its className (needed for the absolute positioning of the pulse ring):

```jsx
{index === 0 && !hasUserClickedStep && (
  <div className="absolute -inset-1 rounded-xl border-2 border-cyan-400/30 animate-pulse pointer-events-none" />
)}
```

The `hasUserClickedStep` can be passed as a prop from OutputView (set to true once any step is clicked). The pulse disappears after the first click.

If adding the pulse ring is complex, a simpler alternative: add `animate-pulse` to the border of the first node only, and remove it once any step is clicked.

**3C: Improve instruction text**

Find the current instruction text "Select a step to view its details, configuration impact, and relevant tools." (or similar).

Replace with a more visually prominent version:
```jsx
<div className="text-center mb-6">
  <p className="text-sm text-slate-300 flex items-center justify-center gap-2">
    <span className="text-cyan-400">↓</span>
    Click a step to see its full details
    <span className="text-cyan-400">↓</span>
  </p>
</div>
```

---

### Change 4: Mobile step selector — look like a control

In `app/src/components/OutputView.jsx`, find the mobile step selector `<select>` element.

Update its styling to look more obviously like a dropdown control:

```jsx
<div className="md:hidden border-b border-slate-800 px-4 py-2 bg-slate-950 flex-shrink-0">
  <label className="text-xs text-slate-500 mb-1 block">Navigate to step</label>
  <select
    value={selectedStepKey}
    onChange={(e) => handleStepSelect(e.target.value)}
    className="w-full bg-slate-700 text-slate-200 text-sm font-medium rounded-lg pl-3 pr-8 py-2.5 border border-slate-600 focus:border-cyan-500 focus:outline-none"
    style={{
      appearance: 'none',
      WebkitAppearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1rem',
    }}
  >
    {Object.keys(spec.workflow_steps).map(key => {
      const stepNum = key.replace('step_', '')
      const active = isStepActive(key, config)
      return (
        <option key={key} value={key} disabled={!active}>
          {stepNum} — {SHORT_STEP_NAMES[key] || spec.workflow_steps[key].step_name}
        </option>
      )
    })}
  </select>
</div>
```

Key changes:
- Added `<label>` text "Navigate to step" above the select
- Background changed from `bg-slate-800` to `bg-slate-700` (more contrast)
- Border changed from `border-slate-700` to `border-slate-600` (more visible)
- Added `font-medium` to the select text

---

### Change 5: Prev/next navigation — step numbers and progress indicator

In `app/src/components/OutputView.jsx`, find the detail panel header where the prev/next buttons are rendered.

**5A: Add step numbers to prev/next labels**

Change the prev/next button text to include step numbers:

```jsx
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
```

This renders as "← 2. Placement & Tiering" and "4. Approvals Gate →".

**5B: Add progress dots**

Below the step name in the detail panel header (or below the prev/next row), add a compact progress indicator showing all active steps as dots:

```jsx
<div className="flex items-center justify-center gap-1.5 py-2">
  {Object.keys(spec.workflow_steps).map(key => {
    const active = isStepActive(key, config)
    if (!active) return null
    const isCurrent = key === selectedStepKey
    return (
      <button
        key={key}
        onClick={() => handleStepSelect(key)}
        className={`w-2 h-2 rounded-full transition-all duration-200 ${
          isCurrent
            ? 'bg-cyan-400 w-3 h-3'
            : 'bg-slate-600 hover:bg-slate-400'
        }`}
        title={`Step ${key.replace('step_', '')}: ${getShortStepName(key)}`}
      />
    )
  })}
</div>
```

Place this BELOW the prev/next row in the sticky header. The current step is a slightly larger cyan dot. Other steps are small gray dots. Hovering shows the step name as a tooltip. Clicking navigates to that step.

---

## PHASE 3: Update version and commit

Update the version from `v1.7.7` to `v1.8.0` (UX improvements are feature-level).

Commit message: `UX improvements — onboarding, discoverability, navigation clarity (Fixes #53)`

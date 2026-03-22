# Mobile Portrait Fix: Flex Direction

Read this entire document before starting. One issue, one structural fix.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #52.

### ISSUE 52

**Title:** Fix mobile portrait step detail — flex direction structural fix
**Label:** bug
**Body:**

The step detail view (VIEW 3) in OutputView.jsx has a flex-row outer container holding three children: mobile dropdown, vertical nav, and detail panel. On portrait phones, the dropdown occupies a horizontal column on the left, pushing the detail panel into a narrow strip on the right.

Fix: change outer container to flex-col, wrap nav + detail panel in a new inner flex-row.

**Close comment:** Fixed — mobile portrait step detail now renders full-width.

---

## PHASE 2: Apply the fix

Open `app/src/components/OutputView.jsx`. Find VIEW 3 (starts around line 229-231).

### Change 1: Outer container — add flex-col

Find:
```jsx
<div className="flex flex-1 min-h-0 overflow-hidden">
```

This is the outermost container of VIEW 3 (the one right after the `/* VIEW 3: Step Detail */` comment). Change to:

```jsx
<div className="flex flex-col flex-1 min-h-0 overflow-hidden">
```

### Change 2: Wrap nav + detail panel in a new inner flex-row

Find the closing `</div>` of the mobile step selector dropdown (the `md:hidden` div that contains the `<select>` element). Immediately after that closing tag, add an opening wrapper div. Then find where both the vertical nav div and the detail panel div end, and close the wrapper.

The result should look like:

```jsx
{/* Mobile step selector — visible below md */}
<div className="md:hidden border-b border-slate-800 px-4 py-2 bg-slate-950 flex-shrink-0">
  <select ...>...</select>
</div>

{/* Inner row: nav + detail panel side by side */}
<div className="flex flex-1 min-h-0 overflow-hidden">

  {/* Desktop vertical nav — hidden below md */}
  <div className="hidden md:block w-48 flex-shrink-0 border-r border-slate-800 overflow-y-auto max-h-[calc(100vh-120px)]">
    <StepMap variant="vertical" ... />
  </div>

  {/* Detail panel — full width below md */}
  <div className="flex-1 overflow-y-auto max-h-[calc(100vh-120px)]">
    ... sticky header and StepCard ...
  </div>

</div>
```

Do NOT change any of the content inside the nav or detail panel divs. Only add the wrapper.

### Verify

Build the app. Open in browser preview. Set viewport to 375px wide. Navigate to output view, select a step. Confirm:
- The step selector dropdown spans full width at top
- The detail panel is full width below the dropdown
- No vertical nav visible
- Text is readable, not squeezed

Then set viewport to 1024px wide. Confirm:
- The dropdown is hidden
- Vertical nav appears on the left (w-48)
- Detail panel fills remaining width
- Layout is unchanged from current desktop behavior

---

## PHASE 3: Update version and commit

Update the version from `v1.7.6` to `v1.7.7`.

Commit message: `Fix mobile portrait step detail flex direction (Fixes #52)`

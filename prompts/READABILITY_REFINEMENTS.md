# Readability & Cleanup Refinements

Read this entire document before starting. There are four phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #41.

### ISSUE 41

**Title:** Readability refinements — scope of work layout, font fixes, DP code cleanup, section repositioning
**Label:** enhancement
**Body:**

Seven refinements:
1. Scope of Work: render items as two-line blocks (label on own line, detail below)
2. Relevant Tools: increase font size and contrast for tool names
3. Handoff: capitalize first character of each clause after semicolon split
4. Decision Rights: apply cleanDPReferences to tie-breaker escalation text, fix when_inactive DP references
5. Go-live Criteria: move from after Inputs to after Completion Criteria
6. Step 4 track configuration_notes: apply cleanDPReferences and fix font contrast
7. Configuration impact: unify card styles (amber for both modifications and config notes)
8. Global: eliminate all remaining text-slate-500 on content text (not labels)

**Close comment:** Fixed — all readability refinements applied.

---

## PHASE 2: Fix DP references in supplementary_content.json

Open `app/public/supplementary_content.json` (or wherever it lives).

### 2A: Fix tie_breaker_escalation when_inactive text

Search for ALL occurrences of `when_inactive` values that contain "DP4", "DP3", "DP2", or "DP1" and replace with plain language:

- "DP4 = no" → "regulated industries is not selected"
- "DP4 = yes" → "regulated industries is selected"  
- "DP3 = neither" → "no certification is required"
- "DP1 = no_integration" → "no technical integration is selected"
- Any other "DPn = value" pattern → translate to the human-readable equivalent

Also search for `active_when` values that contain DP references and leave those UNCHANGED — they are programmatic, not user-facing.

### 2B: Fix configuration_note text in Step 4 track objects

In step_4's `owns` array, each track object may have a `configuration_note` field. Search these for DP references and replace:

- "DP1 = no_integration" → "no technical integration is selected"
- "DP1" → "integration direction"
- "DP2" → "commercial motions"
- "DP3" → "certification requirement"
- "DP4" → "regulated industries"

Also search for field path references (like `partner_profile.entitlements`) in these same fields and replace with plain language.

### 2C: Fix any remaining DP references anywhere in supplementary_content.json

Do a global search for the regex pattern `DP[1-4]` in ALL string values in the file. For each match:
- If it's in a key name (like `when_DP4_yes`) → leave unchanged
- If it's in a user-facing text value → replace with plain language

---

## PHASE 3: Update StepCard.jsx and engine.js

### Change 1: Scope of Work — two-line block layout

Replace the default bullet list rendering for Scope of Work items. When an item contains a colon, render it as a two-line block:

```jsx
// For each item in the default Scope of Work bullet list:
{typeof item === 'string' && item.includes(':') ? (
  <li key={i} className="mb-3">
    <div className="text-sm font-semibold text-slate-200">{item.split(':')[0]}</div>
    <div className="text-sm text-slate-400 mt-0.5 pl-0.5">{item.split(':').slice(1).join(':').trim()}</div>
  </li>
) : (
  <li key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-2">
    <span className="text-slate-500 mt-0.5">•</span>
    <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
  </li>
)}
```

Apply the same two-line rendering to items within Step 4 track bullet lists and Step 9 play bullet lists where the item contains a colon.

### Change 2: Relevant Tools — increase font size and contrast

In the Relevant Tools rendering, change the tool names from `text-xs text-slate-500` to `text-sm text-slate-300`:

```jsx
{tools.map((t, i) => (
  <div key={i} className="border border-slate-800 rounded-lg p-3">
    <div className="text-sm font-semibold text-slate-200">{t.category}</div>
    {t.description && (
      <div className="text-sm text-slate-400 mt-1">{t.description}</div>
    )}
    <div className="text-sm text-slate-300 mt-2">{t.tools}</div>
  </div>
))}
```

### Change 3: Handoff — capitalize first character

After splitting handoff text at semicolons, capitalize the first character of each clause:

```javascript
function capitalizeFirst(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// In the handoff rendering, apply to each clause:
const clauses = stepContent.handoff.split(';').map(c => capitalizeFirst(c.trim())).filter(Boolean)
```

### Change 4: Apply cleanDPReferences and cleanFieldPaths more broadly

In StepCard.jsx, ensure the `cleanText` function (which chains `cleanDPReferences` and `cleanFieldPaths`) is applied to:

1. **Decision Rights & Escalation**: Apply to `item.scope`, `item.when_inactive`, and `item.authority` text when rendering:
```jsx
<div className="text-sm text-slate-400 flex-1">
  {cleanText(item.scope)}
  {isInactive && item.when_inactive && (
    <span className="text-slate-500 italic ml-1">({cleanText(item.when_inactive)})</span>
  )}
</div>
```

2. **Step 4 track configuration_notes**: Apply to the configuration_note text in Scope of Work Step 4 rendering:
```jsx
{track.configuration_note && (
  <p className="text-sm text-slate-400 mt-2 italic">{cleanText(track.configuration_note)}</p>
)}
```
Note: changed from `text-xs text-slate-500` to `text-sm text-slate-400` for readability.

3. **Step 9 play configuration_notes**: Same treatment.

4. **Any other place** where supplementary content text is rendered — add `cleanText()` wrapping if not already present.

If `cleanDPReferences` and `cleanFieldPaths` are defined in engine.js, make sure they are exported and imported in StepCard.jsx. If they are defined in StepCard.jsx, that's fine too. The key requirement: these functions must be applied to ALL user-facing text from supplementary_content.json and structured_specification.json that could contain DP codes or field paths.

### Change 5: Move Go-live Criteria after Completion Criteria

The new section rendering order becomes:

```
1.  Purpose                                    — always, open by default
2.  Inputs                                     — if content exists
3.  Entry Triggers                             — Step 9 ONLY
4.  Minimum to Unblock                         — Step 4 ONLY
5.  Roles & Responsibilities                   — if content exists
6.  Scope of Work                              — if content exists
7.  Decision Rights & Escalation               — if content exists
8.  Outputs                                    — if content exists
9.  Relevant Tools                             — computed
10. Out of Scope                               — if content exists
11. Completion Criteria                        — from spec
12. Go-live Criteria                           — Step 4 ONLY (moved here)
13. Handoff                                    — if content exists
14. Exception Handling                         — if content exists
15. Loop-back Triggers                         — if content exists
16. How Your Configuration Affects This Step   — computed, only if modifications exist
17. Data Schema for This Step                  — computed
```

Move the Go-live Criteria JSX block from position 5 to position 12 (after Completion Criteria).

### Change 6: Unify configuration impact card styles

In the "How Your Configuration Affects This Step" section, change the config notes cards from gray styling to amber styling (matching the modification cards):

```jsx
{configNotes.map((note, i) => (
  <div key={`note-${i}`} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
    <div className="text-xs font-medium text-amber-400 mb-1">{cleanText(note.label)}</div>
    <p className="text-sm text-slate-300">{cleanText(note.text)}</p>
  </div>
))}
```

Previously these used `bg-slate-800/50 border-slate-700/50` with `text-slate-400`. Now they match the modification cards exactly.

### Change 7: Global text-slate-500 audit on content text

Search StepCard.jsx for ALL instances of `text-slate-500` on content text (not on labels, section headers, or decorative elements). Change content text to `text-slate-400` minimum. Specifically check:

- Configuration note text in tracks/plays → `text-slate-400`
- Tool names → `text-slate-300` (done in Change 2)
- Any other body text using `text-slate-500` → `text-slate-400`

Elements that SHOULD remain `text-slate-500`:
- Section header labels (the uppercase accordion titles) — these are tertiary labels
- Step numbers in the vertical nav
- Bullet point markers (•)
- The "Step N" label on timeline nodes

---

## PHASE 4: Update version and commit

Update the version from `v1.6.2` to `v1.6.3`.

Commit message: `Readability refinements — layout, fonts, DP cleanup, section reorder (Fixes #41)`

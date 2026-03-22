# Formatting Fixes: Bullets, Spacing, Deduplication, Bold Labels

Read this entire document before starting. There are three phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #42.

### ISSUE 42

**Title:** Formatting fixes — bullets, spacing, config notes relocation, deduplication, bold outputs
**Label:** enhancement
**Body:**

Five fixes:
1. Scope of Work two-line blocks: restore bullet markers and capitalize detail text
2. Go-live Criteria: move to right before Completion Criteria
3. Step 4/9 track spacing: standardize item margins; move configuration_note from tracks to "How your configuration affects this step"
4. Configuration impact: deduplicate cards where modifications and config notes say the same thing
5. Outputs: bold text before colons

**Close comment:** Fixed — all formatting fixes applied.

---

## PHASE 2: Update StepCard.jsx

### Change 1: Scope of Work — restore bullets and capitalize detail

For the two-line block rendering of items with colons in the default Scope of Work list:

```jsx
{typeof item === 'string' && item.includes(':') ? (
  <li key={i} className="flex items-start gap-2 mb-3">
    <span className="text-slate-500 mt-1 flex-shrink-0">•</span>
    <div>
      <div className="text-sm font-semibold text-slate-200">{item.split(':')[0]}</div>
      <div className="text-sm text-slate-400 mt-0.5">
        {item.split(':').slice(1).join(':').trim().replace(/^./, c => c.toUpperCase())}
      </div>
    </div>
  </li>
) : (
  <li key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-3">
    <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
    <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
  </li>
)}
```

Key changes:
- Bullet `•` added back to two-line items
- Both item types use `mb-3` for consistent spacing
- Detail text after colon is capitalized via `.replace(/^./, c => c.toUpperCase())`

Apply the same rendering pattern inside Step 4 track item lists and Step 9 play item lists.

### Change 2: Go-live Criteria — move before Completion Criteria

The new section rendering order:

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
11. Go-live Criteria                           — Step 4 ONLY (moved here, BEFORE completion)
12. Completion Criteria                        — from spec
13. Handoff                                    — if content exists
14. Exception Handling                         — if content exists
15. Loop-back Triggers                         — if content exists
16. How Your Configuration Affects This Step   — computed, only if modifications exist
17. Data Schema for This Step                  — computed
```

### Change 3: Standardize track/play item spacing and relocate configuration notes

**3a: Standardize spacing within Step 4 tracks and Step 9 plays.**

Ensure all items within each track/play card use consistent `mb-2` spacing (or whatever the standard is). Check that the `<ul>` inside each track uses `space-y-2` and each `<li>` uses the same margin. No items should be closer together or further apart than others.

**3b: Relocate configuration_note from tracks/plays to the configuration impact section.**

In the Scope of Work Step 4 track rendering, REMOVE the configuration_note rendering:

```jsx
// REMOVE this block from each track card:
// {track.configuration_note && (
//   <p className="text-sm text-slate-400 mt-2 italic">{cleanText(track.configuration_note)}</p>
// )}
```

Instead, at the bottom of the ENTIRE Scope of Work section (after all tracks or after all default items), add a single reference line ONLY IF any track/play has a configuration_note:

```jsx
// Add this at the very bottom of the AccordionSection for Scope of Work,
// after all items/tracks/plays have been rendered:
{(() => {
  // Check if any track or play has a configuration_note
  const hasConfigNotes = Array.isArray(stepContent.owns) && stepContent.owns.some(
    item => typeof item === 'object' && item.configuration_note
  )
  if (!hasConfigNotes) return null
  return (
    <p className="text-xs text-slate-500 mt-4 italic">
      Some elements of this scope may vary based on your configuration. See "How your configuration affects this step" below.
    </p>
  )
})()}
```

Now, in the "How Your Configuration Affects This Step" section (Section 16), AFTER the existing mods and configNotes, add the track/play configuration notes as additional cards:

```jsx
{(() => {
  const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
  const configNotes = getApplicableConfigNotes(stepContent.configuration_notes, config)
  
  // Collect track/play configuration_notes from Scope of Work
  const trackNotes = []
  if (Array.isArray(stepContent.owns)) {
    stepContent.owns.forEach(item => {
      if (typeof item === 'object' && item.configuration_note) {
        const trackName = item.track || item.play || 'Scope'
        trackNotes.push({
          label: trackName,
          text: item.configuration_note,
        })
      }
    })
  }
  
  if (mods.length === 0 && configNotes.length === 0 && trackNotes.length === 0) return null

  return (
    <AccordionSection title="How Your Configuration Affects This Step">
      <div className="space-y-2">
        {mods.map((mod, i) => (
          <div key={`mod-${i}`} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
            <div className="text-xs font-medium text-amber-400 mb-1">{cleanText(mod.label)}</div>
            <p className="text-sm text-slate-300">{cleanText(mod.text)}</p>
          </div>
        ))}
        {configNotes.map((note, i) => (
          <div key={`note-${i}`} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
            <div className="text-xs font-medium text-amber-400 mb-1">{cleanText(note.label)}</div>
            <p className="text-sm text-slate-300">{cleanText(note.text)}</p>
          </div>
        ))}
        {trackNotes.map((tn, i) => (
          <div key={`track-${i}`} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
            <div className="text-xs font-medium text-amber-400 mb-1">{cleanText(tn.label)}</div>
            <p className="text-sm text-slate-300">{cleanText(tn.text)}</p>
          </div>
        ))}
      </div>
    </AccordionSection>
  )
})()}
```

Do the same removal and relocation for Step 9 play configuration_notes.

### Change 4: Deduplicate configuration impact cards

After collecting `mods`, `configNotes`, and `trackNotes`, deduplicate before rendering. Compare the first 50 characters of each text (lowercased) to identify duplicates:

```javascript
function deduplicateCards(mods, configNotes, trackNotes) {
  const allCards = [
    ...mods.map(m => ({ ...m, source: 'mod' })),
    ...configNotes.map(n => ({ ...n, source: 'note' })),
    ...trackNotes.map(t => ({ ...t, source: 'track' })),
  ]
  
  const seen = new Set()
  return allCards.filter(card => {
    const key = (card.text || '').toLowerCase().substring(0, 50).trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Use in the rendering:
const allCards = deduplicateCards(mods, configNotes, trackNotes)

// Then render allCards instead of three separate maps:
{allCards.map((card, i) => (
  <div key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
    <div className="text-xs font-medium text-amber-400 mb-1">{cleanText(card.label)}</div>
    <p className="text-sm text-slate-300">{cleanText(card.text)}</p>
  </div>
))}
```

### Change 5: Outputs — bold text before colons

Apply the same colon-split bolding to the Outputs section that Scope of Work now uses. For output items that contain a colon:

```jsx
{stepContent.outputs.map((output, i) => {
  const text = typeof output === 'string' ? output : JSON.stringify(output)
  return text.includes(':') ? (
    <li key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-1.5">
      <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>
      <span>
        <span className="font-semibold text-slate-200">{text.split(':')[0]}:</span>
        {text.split(':').slice(1).join(':')}
      </span>
    </li>
  ) : (
    <li key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-1.5">
      <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>
      <span>{text}</span>
    </li>
  )
})}
```

---

## PHASE 3: Update version and commit

Update the version from `v1.6.3` to `v1.6.4`.

Commit message: `Formatting fixes — bullets, spacing, config note relocation, dedup, bold outputs (Fixes #42)`

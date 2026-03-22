# Config Impact Dedup, Mobile Portrait & Cleanup

Read this entire document before starting. There are four phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #50.

### ISSUE 50

**Title:** Fix config impact duplicates at source, mobile portrait layout, homepage footer cleanup
**Label:** bug
**Body:**

Five fixes:
1. Delete duplicate workflow_modification_rules from structured_specification.json for Steps 4 and 9
2. Rewrite Step 9 config note to plain language
3. Remove "11 steps · 11 objects · 4 approval tracks" from homepage footer
4. Fix mobile portrait step detail layout (change ALL sm: breakpoints to md: in VIEW 3)
5. Fix data schema table gradient bleed

**Close comment:** Fixed — config impact deduplication at source, mobile portrait layout corrected, footer cleaned.

---

## PHASE 2: Fix structured_specification.json

### Fix 1: Delete duplicate modification rules

Open `app/public/structured_specification.json`.

**IMPORTANT: Before deleting anything, first run this audit.**

Print ALL keys under `conditional_logic.workflow_modification_rules` that contain "step9", "step4", or "step2" in the key name. For each key, print the key name and the first 100 characters of each value within it. Review the output before proceeding.

**Step 9 modifications:** From the audit output, identify keys whose values ONLY contain text about expansion plays being absent or "Deeper integration depth" being removed. DELETE those specific keys. Do NOT delete keys that contain unique information about co-sell mechanics, attribution rules, or play-specific activation details.

**Step 4 modifications:** From the audit output, identify keys whose values contain GENERAL summaries like "Security & Privacy track scope significantly reduced" or "Step 5 is skipped" that duplicate what is already in step_4's `configuration_notes` in supplementary_content.json.

IMPORTANT: Each modification rule key may contain MULTIPLE variants (e.g., "when_DP1_no_integration", "when_DP1_entity_to_partner", etc.). Do NOT delete an entire key if only SOME variants duplicate config notes. Instead:
- If ALL variants within a key duplicate config notes → delete the entire key
- If only the "when_DP1_no_integration" or "when_no_integration" variant duplicates a config note but other variants contain unique detail (like "Partner leads implementation. Entity provides access credentials, sandbox, and API documentation") → delete ONLY the duplicating variant, keep the key with remaining variants

**Step 2 modifications:** Do NOT delete any step2 modification rules. These contain per-motion entitlement details that are unique. Only clean the text (the field path references were already cleaned in prior issues — verify they are clean, and if not, clean them).

**CRITICAL: After deleting any key from `workflow_modification_rules`, also check `workflow_steps` for that step.** Each step has a `workflow_modifications` field that contains references (key names) pointing to the rules you may have deleted. If a reference points to a deleted rule key, REMOVE that reference from the step's `workflow_modifications` array. Otherwise the engine will try to look up a key that no longer exists.

After all deletions and reference cleanups are complete, verify the app still builds successfully. Then open the app in the browser preview and test the output view with at least two configurations: one with integration selected and one with no integration. Confirm no blank cards or console errors appear in "How your configuration affects this step."

### Fix 2: Rewrite Step 9 "no technical integration" config note

In `app/public/supplementary_content.json`, find step_9's `configuration_notes`. Find the entry about no technical integration / expansion play. Replace its value with:

```
"When no technical integration is selected, the option to deepen the integration (additional endpoints or modules) is not available. All other growth activities remain active."
```

If there are TWO entries about no technical integration in step_9's config notes, merge them into ONE with the text above and delete the other.

---

## PHASE 3: Fix components

### Fix 3: Remove homepage footer stats

In `app/src/components/LandingPage.jsx`, find the text "11 steps · 11 objects · 4 approval tracks" (or similar dynamic text showing step/object/track counts). Delete this entire element. Keep the builder attribution and the legal disclaimer line.

### Fix 4: Mobile portrait — aggressive breakpoint fix

In `app/src/components/OutputView.jsx`, search for EVERY instance of these patterns in the VIEW 3 (step detail) section:

- `sm:flex-row` → change to `md:flex-row`
- `sm:block` (when used to show the vertical nav) → change to `md:block`
- `hidden sm:block` → change to `hidden md:block`
- `sm:hidden` (when used to hide the mobile selector) → change to `md:hidden`
- `sm:flex-row` → change to `md:flex-row`
- `sm:items-center` → change to `md:items-center`
- `sm:text-left` → change to `md:text-left`
- `sm:w-auto` → change to `md:w-auto`
- `sm:justify-end` → change to `md:justify-end`
- `sm:px-6` → change to `md:px-6`
- `sm:py-4` → change to `md:py-4`

Do this for ALL occurrences in the step detail section. The mobile step selector (the `<select>` dropdown) should be visible on all screens below 768px (md breakpoint), and the vertical nav sidebar should only appear at 768px and above.

**IMPORTANT:** Do NOT change `sm:` breakpoints in other parts of the app (LandingPage, QuestionFlow, StepMap timeline, Sidebar). Only change them in the step detail layout within OutputView.jsx.

**After making the targeted changes above, search the ENTIRE OutputView.jsx file for any remaining `sm:` classes.** For each one, evaluate: is it part of the step detail experience (the panel header, the nav/panel flex layout, the prev/next navigation)? If yes, change to `md:`. If it's part of the top bar, sidebar toggle, or workflow map view, leave it unchanged.

Also check: the detail panel content may have its own `sm:grid-cols-2` for tool grids etc. in StepCard.jsx. Those are fine — they affect content within the panel, not the panel layout itself.

### Fix 5: Data schema table — remove gradient, fix column visibility

In StepCard.jsx and DataModelView.jsx, find the gradient scroll hint element:

```jsx
<div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />
```

**DELETE this gradient element entirely.** It's causing the beginning of column text to appear grayed out. The horizontal scroll (`overflow-x-auto`) is sufficient — users know to scroll on mobile.

If the gradient is in a different form or position, search for any element with `bg-gradient` inside the table container and remove it.

---

## PHASE 4: Update version and commit

Update the version from `v1.7.4` to `v1.7.5`.

Commit message: `Fix config impact duplicates, mobile portrait layout, footer cleanup (Fixes #50)`

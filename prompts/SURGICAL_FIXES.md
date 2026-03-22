# Surgical Fixes: Footer Alignment, Step 4 Dedup, Mobile Portrait

Read this entire document before starting. There are four phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #51.

### ISSUE 51

**Title:** Fix footer alignment, Step 4 config impact duplicate, mobile portrait step detail
**Label:** bug
**Body:**

Three fixes that did not land in Issue #50:
1. Homepage footer: center-align remaining text after stats removal
2. Step 4: merge two "no technical integration" config impact cards into one
3. Mobile portrait: step detail panel must be full-width below 768px

**Close comment:** Fixed — footer aligned, Step 4 config deduped, mobile portrait corrected.

---

## PHASE 2: Fix homepage footer alignment

Open `app/src/components/LandingPage.jsx`.

Find the footer area. The builder attribution ("Built by Nayan Banerjee") and legal disclaimer ("Static site — no data leaves your browser · Portfolio demonstration · Generic framework, not professional advice") should be centered on the page.

Run this command to find the footer:
```bash
grep -n "Built by\|Portfolio demonstration\|Static site\|no data leaves" app/src/components/LandingPage.jsx
```

Whatever container wraps these elements, ensure it has `text-center` and `w-full`. If there are `justify-between` or `justify-end` or `flex` classes causing the off-center positioning, change to `flex flex-col items-center text-center` or simply remove the flex layout and use a centered block.

The footer should be a single centered block at the bottom of the page with all text centered.

---

## PHASE 3: Merge Step 4 "no technical integration" config impact cards

There are TWO sources producing "No technical integration" cards for Step 4:

**Source A:** A workflow modification rule in `app/public/structured_specification.json` that produces "Security & Privacy track scope significantly reduced — limited to data handling obligations in legal agreement only. No data-flow review, auth/encryption controls, or security testing. Step 5 is skipped — handoff goes to Step 6."

**Source B:** A configuration note in `app/public/supplementary_content.json` under step_4's `configuration_notes` that produces "When no technical integration is selected, Step 5 (Implementation) is skipped. Step 4 hands off directly to Step 6 (Launch Readiness). All approval conditions must be met before proceeding to launch."

These need to MERGE into ONE card. The merged text should combine the unique information from both:

**Step 1:** Find Source A. Run:
```bash
grep -r "Security & Privacy track scope significantly reduced" app/public/
```
This will show which file and key contains it. If it's in `structured_specification.json` under a workflow_modification_rules key, find that specific variant (likely "when_DP1_no_integration" or similar within a step4 key). DELETE that specific variant value. If the key has other variants (for other DP1 values like entity_to_partner, partner_to_entity, bidirectional), keep those — only delete the no_integration variant.

If deleting the variant leaves the key empty, delete the key AND remove the reference from `workflow_steps.step_4.workflow_modifications`.

**Step 2:** Find Source B. Run:
```bash
grep -r "Step 5 (Implementation) is skipped" app/public/supplementary_content.json
```
Replace that config note's value with the merged text:

```
"When no technical integration is selected, the Security & Privacy track is reduced to data handling obligations in the legal agreement only (no data-flow review, auth/encryption controls, or security testing). Step 5 (Implementation) is skipped — Step 4 hands off directly to Step 6 (Launch Readiness)."
```

This single card now contains the unique detail from Source A (what happens to Security & Privacy) and the structural information from Source B (Step 5 skip and handoff redirect).

**Step 3:** Verify by running `npm run build` and checking the app. Step 4 with dp1=no_integration should show exactly ONE "No technical integration" card in "How your configuration affects this step."

---

## PHASE 4: Fix mobile portrait step detail layout

This fix has failed twice because not all breakpoints were changed. This time, use a script to find and fix them.

**Step 1:** Run this command to find ALL sm: breakpoints in OutputView.jsx:
```bash
grep -n "sm:" app/src/components/OutputView.jsx
```

Print the output.

**Step 2:** For EACH line in the output, determine if it is part of the step detail layout. The step detail layout includes:
- The flex container that holds the vertical nav and the detail panel side by side
- The mobile step selector dropdown (the `<select>` element)
- The vertical nav container (`hidden sm:block` or similar)
- The detail panel header (step name, prev/next buttons, close button)
- The detail panel content container

It does NOT include:
- The top bar (Home button, flow annotation, attribution, Share Link)
- The sidebar toggle button and sidebar drawer
- The workflow map view (MODE A, before a step is selected)

**Step 3:** For every `sm:` class that IS part of the step detail layout, change `sm:` to `md:`. Specifically:

```bash
# Use sed or manual edits — change ONLY in the step detail section
# These are the patterns to change:
# sm:flex-row → md:flex-row
# sm:block → md:block (when it's the vertical nav)
# hidden sm:block → hidden md:block (when it's the vertical nav)
# sm:hidden → md:hidden (when it's the mobile selector)
# sm:items-center → md:items-center
# sm:text-left → md:text-left
# sm:w-auto → md:w-auto
# sm:w-48 → md:w-48 (if the nav width uses sm:)
# sm:justify-end → md:justify-end
# sm:px-6 → md:px-6
# sm:py-4 → md:py-4
```

**Step 4:** After making changes, run:
```bash
grep -n "sm:" app/src/components/OutputView.jsx
```

Print the output again. Every remaining `sm:` should be in the top bar or sidebar sections, NOT in the step detail section. If any step detail `sm:` remain, fix them.

**Step 5:** Build and verify. Open the app in the browser preview. Use browser dev tools to set viewport to 375px wide (iPhone portrait). Navigate to the output view and select a step. The step detail panel should be FULL WIDTH — no vertical nav sidebar visible, no side-by-side layout. The mobile step selector dropdown should be visible above the detail content.

---

## PHASE 5: Update version and commit

Update the version from `v1.7.5` to `v1.7.6`.

Commit message: `Fix footer alignment, Step 4 config dedup, mobile portrait layout (Fixes #51)`

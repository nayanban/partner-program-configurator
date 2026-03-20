# UI/UX Refinements — Issues and Fixes

Read this entire document before starting. There are two phases: first create 8 GitHub issues, then implement the fixes.

---

## PHASE 1: Create and close GitHub issues

Use the GitHub API with `curl` to create issues and then close them. The user will provide a `GH_TOKEN` environment variable with a fine-grained token that has read/write access to issues.

Create each issue in order (#6 through #13) using:

```bash
curl -X POST https://api.github.com/repos/nayanban/partner-program-configurator/issues \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"title": "...", "labels": ["..."], "body": "..."}'
```

After creating each issue, add a close comment and close it:

```bash
# Add comment
curl -X POST https://api.github.com/repos/nayanban/partner-program-configurator/issues/NUMBER/comments \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"body": "..."}'

# Close issue
curl -X PATCH https://api.github.com/repos/nayanban/partner-program-configurator/issues/NUMBER \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"state": "closed"}'
```

Before creating any issues, first check what the current highest issue number is so we know the numbering. Create the "bug" and "enhancement" labels if they don't already exist.

Here are the 8 issues to create. Create them in this exact order.

---

### ISSUE 6

**Title:** Landing page: "Configure from scratch" should appear above program archetypes
**Label:** enhancement
**Body:**

The landing page currently shows the archetype cards first, with the "Configure from scratch" link below. The order should be reversed: "Configure from scratch" should appear as the primary action above the archetypes, with the archetypes presented below as a quick-start alternative.

**Expected layout:**
1. Header (title, subtitle, credibility line)
2. "Configure from scratch" — presented as the primary action
3. Divider with "OR START WITH AN ARCHETYPE" label
4. Archetype cards row

**Affected file:** `app/src/components/LandingPage.jsx`

**Close comment:** Fixed — landing page reordered with "Configure from scratch" as primary action above archetype cards.

---

### ISSUE 7

**Title:** No builder attribution on the landing page
**Label:** enhancement
**Body:**

The configurator is a portfolio piece, but there is no attribution anywhere in the app — no name, no LinkedIn link, no GitHub link. A visitor has no way to identify who built it or how to contact them.

**Expected behavior:**
Add a footer bar to the landing page with:
- Builder name: "Built by Nayan Banerjee"
- LinkedIn profile link: https://www.linkedin.com/in/banerjee-nayan/
- GitHub profile link: https://github.com/nayanban

Also add a compact attribution line to the output view so the builder identity persists when someone arrives via a shared link.

**Affected files:** `app/src/components/LandingPage.jsx`, `app/src/components/OutputView.jsx` or `app/src/components/Sidebar.jsx`

**Close comment:** Fixed — builder attribution added to landing page footer and output view with LinkedIn and GitHub links.

---

### ISSUE 8

**Title:** Poor text contrast on landing page — credibility line and archetype descriptions barely visible
**Label:** bug
**Body:**

The credibility line ("Built on an 11-step partner lifecycle framework covering intake through renewal.") and the archetype card descriptions use a text color that is nearly invisible against the dark background. These are not decorative — they do persuasion and orientation work and need to be clearly readable.

**Expected behavior:**
Increase contrast for the credibility line, all archetype card descriptions, and any other body text on the landing page that is currently near-invisible. Use `text-slate-400` as a minimum for secondary text.

**Affected file:** `app/src/components/LandingPage.jsx`

**Close comment:** Fixed — text contrast increased for credibility line and archetype descriptions to at least text-slate-400.

---

### ISSUE 9

**Title:** Poor text contrast throughout the output view — annotations, labels, and instructions barely visible
**Label:** bug
**Body:**

Multiple text elements in the output view have insufficient contrast against the dark background:
- The sidebar collapse arrow
- The instruction text "Click any active step to view details"
- The primary owner labels under each step in the step map
- The flow annotation ("This is a 11-step workflow...")
- Various secondary labels and descriptions throughout

These elements provide critical orientation and context. The flow annotation in particular is the single summary that tells the viewer what they are looking at.

**Expected behavior:**
Secondary text should use at least `text-slate-400`. Primary instructional text (flow annotation, click instructions) should use `text-slate-300` or brighter.

**Affected files:** `app/src/components/OutputView.jsx`, `app/src/components/StepMap.jsx`, `app/src/components/Sidebar.jsx`

**Close comment:** Fixed — text contrast improved throughout the output view for annotations, labels, instructions, and owner text.

---

### ISSUE 10

**Title:** Copy JSON button has unnecessary visual prominence
**Label:** enhancement
**Body:**

The "Copy JSON" button in the top-right of the output view has equal visual weight with the "Share Link" button. Copy JSON is a niche feature for technical users who want the raw configuration state. Share Link is the primary export — it lets someone share a configured workflow with a colleague via URL.

**Expected behavior:**
Remove the Copy JSON button entirely. Share Link should be the only prominent export action.

**Affected file:** `app/src/components/OutputView.jsx`

**Close comment:** Fixed — Copy JSON button removed. Share Link is now the sole export action.

---

### ISSUE 11

**Title:** Data Model view lacks framing text — purpose and value are not communicated
**Label:** enhancement
**Body:**

The Data Model tab shows a list of objects with field counts, and expanding an object shows a field-level table. However, there is no explanation of what this view is for or why it matters. A visitor sees "Partner Record — 14/14 fields" and has no context for why this is significant.

**Expected behavior:**
Add framing text at the top of the Data Model view: "The data model behind the workflow — every entity, field, and state a partner operating system needs to track. Fields marked as conditional activate or deactivate based on your configuration. This structured schema is what makes the workflow machine-executable, not just a process document."

Also add a one-line explanation at the top of each expanded object's field table: "Fields your system of record needs for this object. Conditional fields (Cond. = Y) are active only when specific decision points are set."

**Affected file:** `app/src/components/DataModelView.jsx`

**Close comment:** Fixed — framing text added to Data Model view and expanded object field tables explaining purpose and value.

---

### ISSUE 12

**Title:** Tool Recommendations view lacks framing text
**Label:** enhancement
**Body:**

The Tool Recommendations tab shows tool category cards but does not explain how they relate to the configuration. The connection between decision point answers and which categories appear is not made explicit.

**Expected behavior:**
Add framing text at the top of the Tools tab: "Tool categories relevant to your configured workflow. Categories appear or disappear based on your decision point answers — the same conditional logic that drives the workflow also drives these recommendations."

Place this above the existing disclaimer.

**Affected file:** `app/src/components/ToolRecommendations.jsx`

**Close comment:** Fixed — framing text added to Tool Recommendations view explaining configuration-driven activation.

---

### ISSUE 13

**Title:** Version number should reflect current release state
**Label:** enhancement
**Body:**

The nav bar shows `v1.0` but multiple fixes and refinements have been applied since the initial build. The version should follow semantic versioning (MAJOR.MINOR.PATCH) and be updated to reflect the current state. After applying the current round of fixes and enhancements, update to `v1.1.0`.

The version number should be defined in one place so future updates only require a single change.

**Affected file:** `app/src/App.jsx` or whichever file contains the version display

**Close comment:** Fixed — version updated to v1.1.0 and extracted to a single constant.

---

## PHASE 2: Implement the fixes

After all issues are created and closed, implement the following code changes. Make a separate commit for each fix using the exact commit message specified.

### Fix for Issue #6 — Reorder landing page

In LandingPage.jsx, reorder the layout so that:
1. Header section (title, subtitle, credibility line) comes first
2. The "Configure from scratch" call-to-action comes next, presented as the primary action (a prominent button with the accent color, not a muted text link)
3. A divider with text "OR START WITH AN ARCHETYPE" separates it from the archetype cards
4. The archetype cards row comes last

Commit message: `Reorder landing page: configure from scratch above archetypes (Fixes #6)`

### Fix for Issue #7 — Add builder attribution

Add a footer to the landing page with:
- "Built by Nayan Banerjee"
- A LinkedIn icon/link to https://www.linkedin.com/in/banerjee-nayan/
- A GitHub icon/link to https://github.com/nayanban

Use simple inline SVG icons for LinkedIn and GitHub. Style the footer as subtle but legible — text-slate-500 or similar, with links that brighten on hover.

Also add a compact attribution line somewhere persistent in the output view (e.g., bottom of the sidebar or in the nav bar) — a simple "Built by Nayan Banerjee" with the LinkedIn link.

Commit message: `Add builder attribution to landing page and output view (Fixes #7)`

### Fix for Issue #8 — Fix text contrast on landing page

In LandingPage.jsx, find all text elements using colors like text-slate-600, text-slate-700, or darker on the dark background. Update them:
- Credibility line ("Built on an 11-step..."): change to at least text-slate-400
- Archetype card descriptions: change to at least text-slate-400
- Any other secondary text that is barely visible: change to at least text-slate-400 or text-slate-500

Do not change the main title or subtitle — those are already fine.

Commit message: `Fix text contrast on landing page for credibility line and archetype descriptions (Fixes #8)`

### Fix for Issue #9 — Fix text contrast in output view

Audit all text in OutputView.jsx, StepMap.jsx, and Sidebar.jsx. Find text elements using colors like text-slate-600, text-slate-700, or darker. Update:
- Flow annotation ("This is a X-step workflow..."): change to at least text-slate-300
- Instruction text ("Click any active step to view details"): change to at least text-slate-400
- Primary owner labels under step map nodes: change to at least text-slate-500
- Sidebar collapse arrow: ensure sufficient contrast
- Any other instructional or contextual text that is barely visible

Commit message: `Fix text contrast in output view for annotations, labels, and instructions (Fixes #9)`

### Fix for Issue #10 — Remove Copy JSON button

In OutputView.jsx, remove the "Copy JSON" button from the top-right action area. Keep only the "Share Link" button as the primary export action.

Commit message: `Remove Copy JSON button from output view header (Fixes #10)`

### Fix for Issue #11 — Add framing text to Data Model view

In DataModelView.jsx, add explanatory text at the top of the view, before the object list:

"The data model behind the workflow — every entity, field, and state a partner operating system needs to track. Fields marked as conditional activate or deactivate based on your configuration. This structured schema is what makes the workflow machine-executable, not just a process document."

Style as text-slate-400, text-sm, with bottom margin.

Also add a one-line explanation at the top of each expanded object's field table:

"Fields your system of record needs for this object. Conditional fields (Cond. = Y) are active only when specific decision points are set."

Style as text-slate-500, text-xs, with bottom margin.

Commit message: `Add framing text to Data Model view explaining purpose and value (Fixes #11)`

### Fix for Issue #12 — Add framing text to Tool Recommendations view

In ToolRecommendations.jsx, add explanatory text at the top, before the existing disclaimer:

"Tool categories relevant to your configured workflow. Categories appear or disappear based on your decision point answers — the same conditional logic that drives the workflow also drives these recommendations."

Style as text-slate-400, text-sm, with bottom margin. Place above the existing disclaimer.

Commit message: `Add framing text to Tool Recommendations view (Fixes #12)`

### Fix for Issue #13 — Update version to v1.1.0

Find where the version string "v1.0" is defined or rendered. Change it to "v1.1.0". If the version is hardcoded in the JSX, extract it to a constant so future updates only require a single change.

Commit message: `Update version to v1.1.0 (Fixes #13)`

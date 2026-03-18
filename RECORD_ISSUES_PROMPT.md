Create 5 GitHub issues in this repository, then close each one immediately with a resolution comment. Use the `gh` CLI tool. Create them in order (Issue 1 first, then 2 through 5) so the numbering is sequential.

For each issue: create it with `gh issue create`, then close it with `gh issue close` and add a resolution comment with `gh issue comment`.

---

ISSUE 1

Title: Structured specification lacks prose content required for step detail display
Label: enhancement

Body:
**Description**

The output format design specifies that step detail cards should display: purpose, inputs, owns (scope of work), tie-breaker/escalation decision rights, outputs, explicitly-does-not-do boundaries, failure/exception handling paths, and loop-back triggers for each step.

The structured specification JSON (`structured_specification.json`) was designed as the logic layer — it contains objects, fields, states, conditional rules, completion criteria, and workflow modifications. It does not contain the six prose content categories listed above. That content exists only in the v14 workflow document (`partner_lifecycle_workflow.md`), which is a human-readable markdown file, not a structured data source the app can consume.

This creates a content gap: the app has the logic to determine *what is active*, but not the content to *display* for each active element.

**Resolution**

Extract all prose content from the v14 document into a supplementary content JSON file (`supplementary_content.json`), structured by step key (step_0 through step_10) to align with the structured specification. Each step contains: purpose, inputs, owns, tie_breaker_escalation (as authority/scope pairs), outputs, explicitly_does_not_do, handoff, failure_exception_paths (as condition/response pairs), and loop_back_triggers (with target and trigger). Configuration-dependent content is tagged with `configuration_dependent`, `active_when`, and `when_inactive` fields. Steps 4 and 9 receive step-specific structure for parallel approval tracks and growth plays respectively.

The app loads both JSON files at startup. The structured specification drives conditional logic; the supplementary content drives display.

**Affected files**
- `supplementary_content.json` (created)
- `app/src/App.jsx` (imports supplementary content)
- `app/src/components/StepCard.jsx` (renders supplementary content in Layers 1 and 3)
- `app/src/components/OutputView.jsx` (passes supplementary content to child components)

Close comment: Resolved — supplementary_content.json created to provide the content layer alongside the structured specification's logic layer. The app loads both files at startup: the structured specification drives conditional logic, the supplementary content drives display. The rendering engine joins them by step key.

---

ISSUE 2

Title: Step 9 entry triggers render hardcoded placeholders instead of supplementary content
Label: bug

Body:
**Description**

The `Step9EntryTriggers` component in `StepCard.jsx` renders a hardcoded list of five generic trigger descriptions instead of sourcing from `supplementary_content.json`. The supplementary content file contains a structured `entry_triggers` object at `steps.step_9.entry_triggers` with a description, five named activation gates (stability, adoption, revenue/pipeline, strategic, efficiency), and a governance note — none of which are currently displayed.

**Expected behavior**

Step 9's "Entry Triggers" section should display the five activation gates from `supplementary_content.json`, along with the description and governance note.

**Actual behavior**

A static list of five generic placeholders is shown, written directly in the component code. The content does not match the structured data in the supplementary content file.

**Affected file**

`app/src/components/StepCard.jsx` — `Step9EntryTriggers` function

Close comment: Fixed — Step9EntryTriggers component now reads from supplementary_content.json steps.step_9.entry_triggers, rendering the description, five named activation gates, and governance note from the structured data instead of hardcoded placeholders.

---

ISSUE 3

Title: Configuration notes in Layer 2 render as raw JSON instead of filtered, readable text
Label: bug

Body:
**Description**

In the "How your configuration affects this step" section (Layer 2) of each step card, `stepContent.configuration_notes` is an object with keys like `DP1_no_integration`, `DP2`, `DP3_partner_cert`, etc. The current code falls through to `JSON.stringify(stepContent.configuration_notes)` when the value is not a string, which dumps raw JSON into the UI.

**Expected behavior**

The configuration notes object should be iterated, filtered by the current configuration (e.g., only show `DP4_yes` note when dp4 is set to yes), and rendered as individual styled cards — matching the format used for workflow modifications above them.

**Actual behavior**

A block of raw JSON text is displayed inside the configuration note card for any step where `configuration_notes` is an object (which is most steps: Steps 2–10).

**Affected file**

`app/src/components/StepCard.jsx` — Layer 2 rendering block within the expanded card

Close comment: Fixed — configuration_notes object is now iterated and filtered by the current decision point values. Only notes relevant to the active configuration are displayed, each rendered as an individual styled card matching the workflow modification format.

---

ISSUE 4

Title: Configuration-dependent tie-breakers do not gray out when inactive
Label: bug

Body:
**Description**

In Layer 3 (Full Detail), the tie-breaker / escalation decision rights section is supposed to visually gray out configuration-dependent entries when they are not active. Specifically, the Compliance/Risk tie-breaker authority in Steps 3 and 4 should appear at reduced opacity with the `when_inactive` text when dp4 = no.

The current code checks `item.active_when === 'dp4_yes'`, but the actual value in `supplementary_content.json` is `"DP4 == 'yes'"`. The string comparison never matches, so the `isInactive` flag is always false and graying never triggers.

**Expected behavior**

When dp4 = no, the Compliance/Risk tie-breaker entries in Steps 3 and 4 should render at `opacity-40` with the `when_inactive` explanation text (e.g., "This authority is absent when DP4 = no").

**Actual behavior**

All tie-breaker entries render at full opacity regardless of the dp4 setting. The configuration-dependent visual distinction is non-functional.

**Affected file**

`app/src/components/StepCard.jsx` — `FullDetailLayer` function, `isInactive` evaluation

Close comment: Fixed — isInactive evaluation now uses .includes() to match against the actual string format in supplementary_content.json ("DP4 == 'yes'"), correctly triggering the opacity-40 graying and when_inactive text for Compliance/Risk tie-breakers when dp4 = no.

---

ISSUE 5

Title: Workflow modification engine returns only first match per rule, missing multi-DP modifications
Label: bug

Body:
**Description**

The `getActiveWorkflowModifications` function in `engine.js` uses `if/else if` chains when evaluating modification rule variants. This means only the first matching variant per rule key is returned. When a step has modifications triggered by multiple decision points simultaneously, later matches are silently dropped.

**Example scenario**

Step 4 with dp2 including both `reseller_partner` and `marketplace_third_party`: the `step4_legal_agreement_type` rule has variants for both selections, but only the reseller variant is returned because it is checked first in the chain.

Similarly, the `step2_entitlements_by_motion` rule has per-motion variants — if multiple motions are selected, only the first matching motion's entitlement text appears.

**Expected behavior**

All applicable modification variants for the current configuration should be collected and displayed. A step with modifications from DP1, DP2, and DP4 simultaneously should show all three.

**Actual behavior**

Only the first matching variant per rule key is returned. Subsequent matches from other decision points are silently dropped.

**Affected file**

`app/src/engine.js` — `getActiveWorkflowModifications` function

Close comment: Fixed — getActiveWorkflowModifications now uses independent if statements instead of if/else if chains, collecting all matching variants per rule into an array. Steps with modifications from multiple decision points simultaneously now display all applicable modifications.

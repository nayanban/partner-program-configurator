# Partner Program Configurator — Build Prompt

## What to build

A single-page React application that lets users configure a partner program by answering four structured questions, then generates a tailored workflow specification. The app is a portfolio piece for a SaaS partnerships professional, designed to impress both hiring managers (in 30 seconds) and practitioners (in 15 minutes).

Deploy as a static site on GitHub Pages. No backend, no database, no API calls. All logic runs client-side using two JSON data files already in this repository.

## Repository structure

The repository already contains these files at the root:

- `structured_specification.json` — the logic layer (objects, fields, conditional rules, completion criteria, workflow modifications)
- `supplementary_content.json` — the content layer (purpose, inputs, owns, tie-breakers, outputs, exceptions, loop-backs per step)
- `partner_lifecycle_workflow.md` — the original domain document (for reference, not loaded by the app)
- `README.md` — repository description

Build the React app into a `/app` directory (or similar). The app should import the two JSON files as static data.

## Tech stack

- React (with hooks, functional components)
- Tailwind CSS for styling
- No external UI component library needed — build custom components
- Vite as bundler
- Deployable to GitHub Pages as a static build

---

## THE APP

### Architecture overview

The app is a deterministic state machine. It holds one configuration state object:

```json
{
  "dp1": null,
  "dp2": {
    "motions": [],
    "co_sell_direction": null,
    "co_marketing_funding": null
  },
  "dp3": null,
  "dp4": null
}
```

When this state changes, the rendering engine re-evaluates conditional logic from `structured_specification.json` and re-renders. The supplementary content from `supplementary_content.json` provides the display text. Everything is instant and synchronous.

A derived boolean `has_financial_motion` is computed from dp2.motions — it is true when any of these motions are selected: referral_inbound, referral_outbound, reseller_partner, reseller_entity, marketplace_entity, marketplace_partner, marketplace_third_party, co_sell.

---

## SCREEN 1: LANDING PAGE

### Header
- Title: "Partner Program Configurator"
- Subtitle: "Answer a few questions about your partner program. Get a tailored workflow specification."
- Credibility line: "Built on an 11-step partner lifecycle framework covering intake through renewal."

### Fast Path: Program Archetypes

A row of 5 clickable cards. Clicking any card pre-fills all four decision points and jumps directly to the output view. The five archetypes and their pre-filled values:

**1. API / Technology Partner**
- DP1: partner_to_entity
- DP2: motions: [referral_inbound, co_sell], co_sell_direction: jointly_led
- DP3: integration_cert_only
- DP4: no

**2. Reseller / Channel**
- DP1: no_integration
- DP2: motions: [reseller_partner, co_marketing], co_marketing_funding: joint
- DP3: partner_cert_only
- DP4: no

**3. Strategic Alliance**
- DP1: bidirectional
- DP2: motions: [co_sell, co_marketing], co_sell_direction: jointly_led, co_marketing_funding: joint
- DP3: both
- DP4: yes

**4. Marketplace Partner**
- DP1: partner_to_entity
- DP2: motions: [marketplace_entity, referral_inbound]
- DP3: integration_cert_only
- DP4: no

**5. Referral Program**
- DP1: no_integration
- DP2: motions: [referral_inbound, referral_outbound]
- DP3: neither
- DP4: no

Each card shows the archetype name and a short one-line description:
- API / Technology Partner: "Partner builds on your platform via API integration"
- Reseller / Channel: "Partner resells your product through their sales channel"
- Strategic Alliance: "Deep bidirectional integration with joint go-to-market"
- Marketplace Partner: "Partner listed on your marketplace with referral pipeline"
- Referral Program: "Mutual lead sharing with no technical integration"

### Deep Path
Below the archetype cards, a link or secondary button: "Configure from scratch →". Clicking opens the four-question sequential flow.

---

## SCREEN 2: QUESTION FLOW (Deep Path)

Present four questions sequentially. Each question appears as a distinct section. User can navigate back. A progress indicator shows which question they're on (1 of 4, 2 of 4, etc.).

### Question 1 — Integration Direction (DP1)
- Type: Single-select (clickable cards or radio buttons)
- Question: "Is there a technical integration, and if so, in which direction?"
- Options:
  - `no_integration` — "No technical integration — purely commercial relationship"
  - `entity_to_partner` — "Entity integrates into partner's system"
  - `partner_to_entity` — "Partner integrates into entity's system"
  - `bidirectional` — "Bidirectional integration"
- Helper text: "This determines whether your workflow includes technical scoping, implementation, and certification steps."
- After selection, show impact annotation, e.g.: "This removes Steps 3 and 5 (no technical build required)" or "All integration steps active with dual-direction scoping."

### Question 2 — Commercial Motions (DP2)
- Type: Multi-select checkboxes. At least one must be selected.
- Question: "Which commercial motions does your program support? Select all that apply."
- Options:
  - `referral_inbound` — "Referral — partner refers customers to entity"
  - `referral_outbound` — "Referral — entity refers customers to partner"
  - `reseller_partner` — "Reseller — partner resells entity's product"
  - `reseller_entity` — "Reseller — entity resells partner's product"
  - `marketplace_entity` — "Marketplace — listed on entity's own marketplace"
  - `marketplace_partner` — "Marketplace — listed on partner's marketplace"
  - `marketplace_third_party` — "Marketplace — listed on a third-party marketplace"
  - `co_sell` — "Co-sell" → when selected, show sub-choice: "Who leads?" with options: entity_led / partner_led / jointly_led
  - `co_marketing` — "Co-marketing" → when selected, show sub-choice: "Who funds?" with options: entity_mdf / partner_coop / joint
- Sub-choices appear inline immediately below the selected option.
- If co_sell or co_marketing is deselected, their sub-choice resets to null.
- Helper text: "Selected motions determine which commercial terms, attribution mechanics, and growth plays appear in your workflow."

### Question 3 — Certification (DP3)
- Type: Single-select
- Question: "Is certification required, and of what type?"
- Options:
  - `neither` — "No certification required"
  - `integration_cert_only` — "Integration/technical certification only"
  - `partner_cert_only` — "Partner competency certification only"
  - `both` — "Both types of certification required"
- Helper text: "Integration certification gates the technical build. Partner competency certification gates who can sell or implement."

### Question 4 — Regulated Industries (DP4)
- Type: Single-select (binary)
- Question: "Does your program operate in or serve regulated industries?"
- Options:
  - `yes` — "Yes — Compliance/Risk review track required"
  - `no` — "No — Compliance/Risk review track not required"
- Helper text: "Selecting Yes activates a dedicated Compliance/Risk approval track and adds regulatory gating to go-live prerequisites."

### Review & Generate
After Q4, show a summary of all four answers with the ability to edit any. A prominent "Generate your workflow" button applies the logic and transitions to the output view.

---

## SCREEN 3: OUTPUT VIEW

This is the main deliverable. It has four sections with a persistent sidebar.

### 3A. Configuration Panel (Sidebar — left, ~280px, collapsible)

**Archetype label** at top: shows archetype name if arrived via fast path. Changes to "Custom Configuration" if any value is manually changed.

**Current configuration**: Each DP shown as a labeled field with its value. Values are editable inline (dropdowns/checkboxes). Changing any value instantly recalculates the entire output.

**Impact counter**: A compact block showing:
- Active steps: "X of 11 steps active"
- Active objects: "X of 11 objects"
- Approval tracks: "X of 4 tracks"

Compute these from the structured_specification.json:
- Steps: count steps where active_when evaluates to true. Steps 3 and 5 are inactive when dp1 = no_integration. Step 9 is always shown as active for display purposes.
- Objects: count objects where activation_condition evaluates to true.
- Approval tracks: Security & Privacy (always), Compliance/Risk (dp4=yes), Legal (always), Commercial/Finance (has_financial_motion or co_marketing selected).

### 3B. Workflow Overview (Hero Section — full width of main area)

**Step Map**: A visual representation of all 11 steps (Step 0 through Step 10) as connected nodes in a horizontal or wrapped layout. Each node shows:
- Step number and short name
- Primary owner (small text below name)
- Visual status: Active (solid/colored), Removed (grayed out with "Skipped" label), Modified (solid with a small dot/badge indicating modifications apply)

When dp1 = no_integration, Steps 3 and 5 are grayed out/skipped. The visual flow line connects Step 2 directly to Step 4, and Step 4 directly to Step 6.

Step names (short versions for the map):
- Step 0: "Operating System"
- Step 1: "Intake & Routing"
- Step 2: "Placement & Tiering"
- Step 3: "Scoping & Commitment"
- Step 4: "Approvals Gate"
- Step 5: "Implementation"
- Step 6: "Launch Readiness"
- Step 7: "Go-live & Stabilization"
- Step 8: "Operations & Support"
- Step 9: "Growth Motions"
- Step 10: "Review & Renewal"

**Flow annotation**: A single-line summary below the map generated from a template. Example: "This is a 9-step workflow (no technical integration) with referral and reseller motions, partner competency certification, and no regulatory compliance track."

### 3C. Step Detail Cards (Main content — below hero)

Each ACTIVE step rendered as an expandable card. Collapsed by default. Removed steps (3 and 5 when dp1=no_integration) do NOT appear as cards.

**Collapsed state**: Shows step number, name, primary owner, and a modification badge ("2 modifications" if applicable).

**Expanded — Layer 1 (Step Overview)**: Clicking expands to show content from `supplementary_content.json` for that step:
- Purpose (from .purpose)
- Inputs (from .inputs — render as a comma-separated list or short list)
- Owns / Scope of Work (from .owns — render as a list)
  - SPECIAL for Step 4: .owns contains objects with track/items/always_active/configuration_note structure. Render as labeled track sub-sections. Hide Compliance/Risk track when dp4=no. Hide Commercial/Finance track when no financial motion and no co_marketing selected. Show configuration_note for each track.
  - SPECIAL for Step 9: .owns contains objects with play/items/active_when structure. Only show plays that are active under current configuration. For Expansion play, remove "Deeper integration depth" item when dp1=no_integration.
- Outputs (from .outputs)
- Explicitly Does Not Do (from .explicitly_does_not_do — render as a short highlighted list, these are important for the portfolio)
- Completion Criteria (from structured_specification.json .completion_criteria.done_label or .done_label_for_step5_start etc.)
- Handoff (from .handoff)

SPECIAL for Step 4: Also render minimum_to_unblock_criteria and go_live_criteria as distinct sub-sections.
SPECIAL for Step 9: Render entry_triggers as a sub-section at the top titled "Entry Triggers" with the five gates listed.

**Expanded — Layer 2 (Configuration Impact)**: A sub-section titled "How your configuration affects this step". Shows active workflow modifications from structured_specification.json workflow_steps[step].workflow_modifications cross-referenced with conditional_logic.workflow_modification_rules. Also incorporate the configuration_notes from supplementary_content.json for that step. Only show modifications relevant to the current configuration.

**Expanded — Layer 3 (Operational Detail)**: A "Show full detail" toggle reveals:
- Tie-breaker / escalation decision rights (from .tie_breaker_escalation). Render as authority/scope pairs. For entries with configuration_dependent: true, show them grayed out with when_inactive text when not active (e.g., Compliance/Risk authority grayed out when dp4=no).
- Failure/exception handling paths (from .failure_exception_paths). Render as condition/response pairs.
- Loop-back triggers (from .loop_back_triggers). Render with target and trigger text.
- Completion criteria field-level checks (from structured_specification.json .completion_criteria.done_condition). Select the appropriate variant when conditional (e.g., when_DP4_is_yes vs when_DP4_is_no).

### 3D. Data Model View (Tab or toggle alongside step cards)

A secondary view showing active objects from structured_specification.json:
- List each active object with: name, created_at_step, field count (active / total), activation_reason for conditional objects.
- Inactive objects listed at bottom as "Not active in this configuration" with the condition that would activate them.
- Clicking an object expands to show its fields as a table: field name, type, notes, conditional (yes/no), active (yes/no based on current config). Inactive fields shown as visually muted.

### 3E. Tool Recommendations (Below step cards)

A grid of cards for tool categories, only showing categories active under current configuration:

| Category | Active When | Example Tools |
|---|---|---|
| CRM / Partner Management | Always | Salesforce, HubSpot, PartnerStack, Impartner |
| Integration Management | dp1 ≠ no_integration | Pandium, Prismatic, Apigee, Kong |
| Security & Compliance Review | Always | Vanta, Drata, SafeBase, OneTrust |
| Contract & Legal | Always | Ironclad, DocuSign CLM, Juro |
| Attribution & Revenue Ops | has_financial_motion = true | Crossbeam, Reveal, Partnerize, Impact.com |
| Marketplace Management | Any marketplace motion selected | Tackle.io, Clazar, Labra |
| Certification / LMS | dp3 ≠ neither | WorkRamp, Skilljar, Docebo |
| Co-marketing & Campaigns | co_marketing selected | Marketo, HubSpot, ZINFI |
| Deal Registration & Co-sell | co_sell or reseller motion selected | Crossbeam, Reveal, PartnerTap |

Disclaimer at top: "These are representative tools in each category, not recommendations. Your choice depends on existing stack, budget, and scale."

### 3F. Export & Share

Top-right of main content area:
- **Share Link**: Encode configuration state into URL query parameters (dp1, dp2_motions, dp2_co_sell_direction, dp2_co_marketing_funding, dp3, dp4). On page load, parse URL params and if present, set configuration and go directly to output view. This lets users share a configured workflow via link.
- **Copy JSON**: Copy the raw configuration state as JSON to clipboard.

---

## RENDERING ENGINE LOGIC

The rendering engine evaluates these rules from structured_specification.json:

1. **Active steps**: workflow_steps[step].active_when — evaluate against config. Key rule: Steps 3 and 5 are inactive when dp1 = no_integration.

2. **Active objects**: conditional_logic.object_activation_rules — evaluate each. Key rules: integration_plan_spec inactive when dp1=no_integration; certification_record inactive when dp3=neither; growth_plan active when step 9 conditions met.

3. **Active fields**: conditional_logic.field_activation_rules — for each active object, evaluate which fields are active. Key rules: approval_record.compliance_risk fields active only when dp4=yes; approval_record.commercial_finance fields active when financial motions selected.

4. **Workflow modifications**: For each step, read workflow_steps[step].workflow_modifications keys. Look up the matching rule in conditional_logic.workflow_modification_rules. Select the variant that matches the current configuration (e.g., when_DP1_is_entity_to_partner). Merge with supplementary_content.steps[step].configuration_notes.

5. **Completion criteria variants**: Some steps have conditional completion criteria (e.g., step 4 has when_DP4_is_yes and when_DP4_is_no variants). Select the matching variant.

6. **Impact counts**: Count active vs total for steps, objects, and approval tracks.

---

## DESIGN DIRECTION

This is a portfolio piece for a partnerships professional. The design should be:

- **Professional and clean** — this represents someone's career. No playfulness, no gimmicks.
- **Dark mode preferred** — gives the app a tool-like, software-product feel rather than a document feel.
- **Clear visual hierarchy** — the step map is the hero. Step cards use progressive disclosure. The sidebar is secondary.
- **The step map is the money shot** — when a hiring manager toggles dp1 to no_integration and Steps 3 and 5 visually disappear, that's the moment they understand the depth of this project. Make that transition smooth and impressive.
- **Typography**: Use a clean sans-serif. Something like DM Sans or Plus Jakarta Sans for body, with a slightly bolder weight for headings. Not Inter or Arial.
- **Color**: Use a muted dark palette with one accent color for interactive elements and active states. Gray/slate background, with a blue or teal accent. Grayed-out/skipped steps should be clearly distinct from active ones.
- **Animations**: Subtle transitions on card expand/collapse, smooth step map transitions when steps are added/removed. Nothing flashy — this is a professional tool.
- **Responsive**: Desktop-first. The primary viewing context is a hiring manager on a laptop. Mobile is nice-to-have but not critical.

---

## IMPORTANT IMPLEMENTATION NOTES

1. The two JSON files (structured_specification.json and supplementary_content.json) are the complete data source. The app should import them and never hardcode content that exists in these files (except for archetype definitions and tool recommendations, which are defined in this prompt).

2. The configuration state must be the single source of truth. Every piece of the UI derives from: config state + spec JSON + content JSON. No other state needed.

3. URL parameter sharing: When the app loads, check for URL params. If present, parse them into config state and go directly to the output view. This is high-impact for sharing.

4. Layer 3 content can be lazy — don't render it until the user clicks "Show full detail". This keeps initial render fast.

5. The app must work as a static build deployed to GitHub Pages. Configure the build output accordingly.

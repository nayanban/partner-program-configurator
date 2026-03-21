# Content Enhancement: Roles, Exception Ownership, Handoff Formatting

Read this entire document before starting. There are three phases.

---

## PHASE 1: Create and close a GitHub issue

Use `curl` with the `$GH_TOKEN` environment variable. This will be Issue #39.

### ISSUE 39

**Title:** Add roles & responsibilities section, exception ownership, and handoff bullet formatting
**Label:** enhancement
**Body:**

Three content enhancements to step details:
1. New "Roles & Responsibilities" accordion section after Inputs — shows primary owner responsibility and contributor/approver table
2. `likely_owner` field added to each exception in supplementary_content.json — rendered in exception handling cards
3. Handoff text split at semicolons and rendered as bullet points with → prefix

**What changes:**
- `app/public/supplementary_content.json` — new `roles_and_responsibilities` key per step, `likely_owner` added to each exception, handoff text unchanged (rendering change only)
- `app/src/components/StepCard.jsx` — new accordion section, exception rendering updated, handoff rendering updated

**Close comment:** Fixed — roles & responsibilities section added, exception ownership rendered, handoff formatted as bullet points.

---

## PHASE 2: Update supplementary_content.json

Open `app/public/supplementary_content.json` (or wherever it lives in the repo — check `app/src/` and `app/public/`).

For EVERY step (step_0 through step_10), add the following new key: `roles_and_responsibilities`. This is an object with two fields:
- `primary_owner`: an object with `role` (string) and `responsibility` (string)
- `contributors`: an array of objects, each with `role` (string) and `responsibility` (string)

Also, for EVERY exception object in `failure_exception_paths`, add a `likely_owner` field (string).

### STEP 0

Add to step_0:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Partnerships Ops / Partner Programs",
    "responsibility": "Owns the partner operating system (tiers, templates, tooling, governance) and versioned updates"
  },
  "contributors": [
    { "role": "Partnerships leadership", "responsibility": "Strategy and investment choices" },
    { "role": "Product", "responsibility": "Roadmap alignment and integration standards" },
    { "role": "Engineering", "responsibility": "Feasibility/supportability" },
    { "role": "Security & Privacy", "responsibility": "Controls and risk posture" },
    { "role": "Legal", "responsibility": "Templates/positions" },
    { "role": "Finance/RevOps", "responsibility": "Pricing, attribution, reporting" },
    { "role": "Support/CS", "responsibility": "SLAs and escalation design" },
    { "role": "Marketing", "responsibility": "Co-marketing rules" },
    { "role": "Compliance/Risk", "responsibility": "Policy constraints where relevant" }
  ]
}
```

Add `likely_owner` to each exception in step_0's `failure_exception_paths`:
- "Urgent regulatory/security change..." → `"likely_owner": "Security/Privacy identifies → Partnerships Ops executes hotfix"`
- "CRM/PRM is down..." → `"likely_owner": "Partnerships Ops (tooling owner)"`
- "Governance repeatedly deadlocks..." → `"likely_owner": "Partnerships leadership (escalation authority)"`
- "Exception requests spike..." → `"likely_owner": "Partnerships Ops (exception policy owner)"`
- "Metrics are being gamed..." → `"likely_owner": "Partnerships Ops (metrics definition owner)"`
- "Templates/playbooks drift..." → `"likely_owner": "Partnerships Ops (artifact owner)"`
- "Capacity changes make SLAs/tiers infeasible..." → `"likely_owner": "Partnerships Ops coordinates with Support/Engineering"`
- "Repeated out-of-scope requests..." → `"likely_owner": "Partnerships Ops (boundary owner)"`

### STEP 1

Add to step_1:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Partnerships (Partner Development / Partner Ops)",
    "responsibility": "Owns intake, minimum qualification, routing, and creating the system-of-record entry"
  },
  "contributors": [
    { "role": "Marketing", "responsibility": "Source/channel context" },
    { "role": "Sales", "responsibility": "Account ownership conflicts and co-sell fit" },
    { "role": "Product", "responsibility": "Strategic fit" },
    { "role": "Solutions Engineering", "responsibility": "Quick technical sniff test" },
    { "role": "Security/Compliance", "responsibility": "Early red flags" },
    { "role": "Partnerships leadership", "responsibility": "Approve strategic go/no-go for high-impact partners" }
  ]
}
```

Add `likely_owner` to each exception in step_1:
- "Request is spam/low-quality..." → `"likely_owner": "Partnerships (Partner Dev) — intake owner"`
- "Multiple internal teams claim ownership..." → `"likely_owner": "Partnerships (Partner Dev) — system-of-record owner"`
- "High-priority partner requires expedited handling..." → `"likely_owner": "Partnerships (Partner Dev) with leadership approval"`

### STEP 2

Add to step_2:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Partner Programs / Partnerships Ops",
    "responsibility": "Applies tier criteria and assigns entitlements/gates consistently"
  },
  "contributors": [
    { "role": "Support/CS", "responsibility": "Support model, SLAs" },
    { "role": "Product", "responsibility": "Access limits and roadmap commitments" },
    { "role": "Security/Privacy", "responsibility": "Data/access gates" },
    { "role": "Legal", "responsibility": "Contract prerequisites for access" },
    { "role": "Finance/RevOps", "responsibility": "Motion classification and economics guardrails" },
    { "role": "Marketing/Partner Marketing", "responsibility": "Co-marketing eligibility" },
    { "role": "Partnerships leadership", "responsibility": "Approve exceptions" }
  ]
}
```

Add `likely_owner` to each exception in step_2:
- "Partner disputes the assigned tier/entitlements..." → `"likely_owner": "Partner Programs (tier criteria owner)"`
- "Required prerequisites for access not met..." → `"likely_owner": "Partner Programs with relevant gating function (Security/Legal/Compliance)"`
- "Motion classification is ambiguous..." → `"likely_owner": "Finance/RevOps + Partnerships leadership"`

### STEP 3

Add to step_3:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Solutions Engineering / Partner Engineering",
    "responsibility": "Owns integration path selection, deep scoping, and the committed plan/spec"
  },
  "contributors": [
    { "role": "Product", "responsibility": "Approve product dependencies and definition of done" },
    { "role": "Engineering", "responsibility": "Effort/feasibility estimates" },
    { "role": "Partnerships", "responsibility": "Prioritization and expectation-setting" },
    { "role": "Security/Privacy", "responsibility": "Constraints to satisfy" },
    { "role": "Support", "responsibility": "Supportability and escalation readiness" },
    { "role": "Compliance/Risk", "responsibility": "Where regulated requirements affect scope" }
  ]
}
```

Add `likely_owner` to each exception in step_3:
- "Partner goes dark during scoping..." → `"likely_owner": "Solutions Engineering (scoping owner)"`
- "Critical dependencies cannot be met..." → `"likely_owner": "Solutions Engineering with Product/Engineering"`
- "Scoping surfaces a prohibited data use..." → `"likely_owner": "Security/Privacy or Compliance/Risk identifies → Solutions Engineering documents"`

### STEP 4

Add to step_4:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Partnerships Deal Desk / Program Manager",
    "responsibility": "Coordinates parallel approval tracks, tracks conditions, and ensures a single decision record"
  },
  "contributors": [
    { "role": "Security & Privacy", "responsibility": "Approve required controls and evidence" },
    { "role": "Compliance/Risk", "responsibility": "Approve regulatory/policy requirements when applicable" },
    { "role": "Legal", "responsibility": "Approve agreement language and obligations" },
    { "role": "Finance/RevOps", "responsibility": "Approve economics, billing/payout mechanics" },
    { "role": "Product/Engineering", "responsibility": "Consulted on scope/control feasibility" }
  ]
}
```

Add `likely_owner` to each exception in step_4:
- "Security/Privacy or Compliance/Risk review fails..." → `"likely_owner": "Security/Privacy or Compliance/Risk identifies → Deal Desk coordinates response"`
- "Legal negotiation stalls..." → `"likely_owner": "Legal identifies → Deal Desk escalates"`
- "Conditional approvals are not met by deadline..." → `"likely_owner": "Deal Desk (condition tracker)"`

### STEP 5

Add to step_5:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Solutions Engineering / Partner Engineering",
    "responsibility": "Leads implementation coordination and acceptance against the approved spec"
  },
  "contributors": [
    { "role": "Engineering", "responsibility": "Code changes and deployment support" },
    { "role": "Product", "responsibility": "Acceptance of functional outcomes" },
    { "role": "Security/Privacy", "responsibility": "Validation of required controls/evidence" },
    { "role": "Support/CS", "responsibility": "Runbooks and support-readiness inputs" },
    { "role": "Partner engineering team", "responsibility": "Implementation on partner side" }
  ]
}
```

Add `likely_owner` to each exception in step_5:
- "Partner goes dark mid-implementation..." → `"likely_owner": "Solutions Engineering (implementation owner)"`
- "Implementation reveals blockers..." → `"likely_owner": "Solutions Engineering escalates per governance"`
- "Build outcomes cannot satisfy Step 4 conditions..." → `"likely_owner": "Solutions Engineering + Security/Privacy"`

### STEP 6

Add to step_6:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Partnerships (Partner Enablement / Partner Ops)",
    "responsibility": "Owns launch packaging, enablement coordination, and readiness artifacts"
  },
  "contributors": [
    { "role": "Solutions Engineering", "responsibility": "Technical docs accuracy" },
    { "role": "Support/CS", "responsibility": "Playbooks and escalation procedures" },
    { "role": "Sales", "responsibility": "Field enablement needs" },
    { "role": "Marketing/Comms", "responsibility": "Announcements and listing amplification" },
    { "role": "Product Marketing", "responsibility": "Positioning" },
    { "role": "Legal/Compliance", "responsibility": "Approve public-facing assets where required" }
  ]
}
```

Add `likely_owner` to each exception in step_6:
- "Legal/compliance/brand approval blocks assets..." → `"likely_owner": "Legal/Compliance identifies → Partner Enablement revises"`
- "Documentation, runbooks, or enablement incomplete..." → `"likely_owner": "Partner Enablement (deliverable owner)"`
- "Marketplace/listing requirements rejected..." → `"likely_owner": "Partner Enablement with marketplace team"`

### STEP 7

Add to step_7:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Engineering (integration owner / SRE-on-point)",
    "responsibility": "Owns production cutover, monitoring, rollback readiness, and stabilization"
  },
  "contributors": [
    { "role": "Solutions Engineering", "responsibility": "Partner coordination during cutover" },
    { "role": "Support/Operations", "responsibility": "Incident intake and escalation execution" },
    { "role": "Partnerships", "responsibility": "Stakeholder coordination and partner comms" },
    { "role": "Product", "responsibility": "Final go/no-go from a product perspective" },
    { "role": "Security/Privacy", "responsibility": "Confirm control readiness and incident obligations" }
  ]
}
```

Add `likely_owner` to each exception in step_7:
- "Go-live is rolled back..." → `"likely_owner": "Engineering (production owner)"`
- "Sev1/critical incident during hypercare..." → `"likely_owner": "Engineering + Support (incident response)"`
- "Partner cutover activities incomplete..." → `"likely_owner": "Engineering coordinates with partner via Solutions Engineering"`

### STEP 8

Add to step_8:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Support / Operations (Technical Support + Incident Management)",
    "responsibility": "Owns steady-state SLAs, ticket triage, and incident response"
  },
  "contributors": [
    { "role": "Engineering", "responsibility": "Bug fixes and reliability work" },
    { "role": "Product", "responsibility": "Prioritize prevention/backlog" },
    { "role": "Partnerships", "responsibility": "Partner relationship management and expectation-setting" },
    { "role": "Solutions Engineering", "responsibility": "Deep technical troubleshooting" },
    { "role": "Security/Privacy", "responsibility": "Security incidents and response coordination where applicable" }
  ]
}
```

Add `likely_owner` to each exception in step_8:
- "Repeated incidents cross threshold..." → `"likely_owner": "Support/Operations identifies → Engineering remediates"`
- "SLA breaches persist..." → `"likely_owner": "Support/Operations with Partnerships for re-tier recommendation"`
- "Partner repeatedly fails to follow processes..." → `"likely_owner": "Support/Operations enforces → Partnerships escalates"`

### STEP 9

Add to step_9:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Partnerships (Partner GTM / Strategic Partnerships)",
    "responsibility": "Owns selecting and executing growth plays with the partner and tracking outcomes"
  },
  "contributors": [
    { "role": "Sales", "responsibility": "Co-sell execution and forecasting" },
    { "role": "Marketing/Partner Marketing", "responsibility": "Campaign execution" },
    { "role": "Product Marketing", "responsibility": "Messaging/positioning" },
    { "role": "RevOps/Finance", "responsibility": "Attribution, payout/reconciliation" },
    { "role": "Customer Success", "responsibility": "Adoption/expansion motions" },
    { "role": "Product", "responsibility": "Expansion feasibility and roadmap alignment" },
    { "role": "Legal/Compliance", "responsibility": "Approvals for co-marketing or commercial amendments where needed" }
  ]
}
```

Add `likely_owner` to each exception in step_9:
- "Attribution/credit or payout disputed..." → `"likely_owner": "RevOps/Finance (dispute process owner)"`
- "Co-sell motions create account ownership conflict..." → `"likely_owner": "Sales governance resolves → Partnerships (Partner GTM) restarts play"`
- "Growth motions repeatedly fail..." → `"likely_owner": "Partnerships (Partner GTM) — play owner"`

### STEP 10

Add to step_10:
```json
"roles_and_responsibilities": {
  "primary_owner": {
    "role": "Partnerships (Partner Management)",
    "responsibility": "Owns QBR/annual reviews and lifecycle decisions (renew, re-tier, remediate, exit)"
  },
  "contributors": [
    { "role": "Support/Operations", "responsibility": "Health and incident trends" },
    { "role": "Customer Success", "responsibility": "Customer impact and adoption" },
    { "role": "Product/Engineering", "responsibility": "Remediation feasibility and roadmap" },
    { "role": "Legal", "responsibility": "Renewal/termination actions" },
    { "role": "Finance/RevOps", "responsibility": "Economics, invoicing, payout disputes" },
    { "role": "Security/Compliance", "responsibility": "Risk posture" },
    { "role": "Sales/Marketing", "responsibility": "GTM implications and commitments" }
  ]
}
```

Add `likely_owner` to each exception in step_10:
- "Renewal or amendment negotiations stall..." → `"likely_owner": "Partnerships (Partner Management) escalates per governance"`
- "Exit decision creates material risk..." → `"likely_owner": "Partnerships (Partner Management) coordinates migration/contingency"`
- "Partner contests review outcomes..." → `"likely_owner": "Partnerships (Partner Management) documents and offers remediation path"`

---

## PHASE 3: Update StepCard.jsx rendering

Make three changes to `app/src/components/StepCard.jsx`:

### Change 1: Add "Roles & Responsibilities" accordion section

Add a new section AFTER Inputs (Section 2) and BEFORE Scope of Work (Section 3). This becomes the new Section 2.5 in the rendering order.

```jsx
{stepContent.roles_and_responsibilities && (
  <AccordionSection title="Roles & Responsibilities">
    {/* Primary owner */}
    <div className="mb-4">
      <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-3">
        <div className="text-xs font-medium text-cyan-400 mb-1">Primary Owner</div>
        <div className="text-sm font-semibold text-slate-200">
          {stepContent.roles_and_responsibilities.primary_owner.role}
        </div>
        <div className="text-sm text-slate-400 mt-1">
          {stepContent.roles_and_responsibilities.primary_owner.responsibility}
        </div>
      </div>
    </div>
    {/* Contributor table */}
    {stepContent.roles_and_responsibilities.contributors && (
      <div>
        <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Key Contributors & Approvers</div>
        <div className="space-y-1.5">
          {stepContent.roles_and_responsibilities.contributors.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="text-sm font-medium text-slate-300 w-40 flex-shrink-0">{c.role}</div>
              <div className="text-sm text-slate-400">{c.responsibility}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </AccordionSection>
)}
```

### Change 2: Add likely_owner to Exception Handling cards

In the Exception Handling section (Section 14), add the likely_owner below the response text:

```jsx
{stepContent.failure_exception_paths.map((path, i) => (
  <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
    <div className="text-sm font-medium text-red-400/80 mb-1">{path.condition}</div>
    <p className="text-sm text-slate-400">{path.response}</p>
    {path.likely_owner && (
      <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
        <span className="text-slate-500">↳</span>
        <span className="font-medium">Likely owner:</span>
        <span>{path.likely_owner}</span>
      </div>
    )}
  </div>
))}
```

### Change 3: Split handoff text at semicolons and render as bullet points

In the Handoff section (Section 11), split the text at semicolons and render each clause as a bullet point with the → prefix (matching the Outputs style):

```jsx
{(stepContent.handoff || stepContent.handoff_note) && (
  <AccordionSection title="Handoff">
    {stepContent.handoff && (
      <ul className="space-y-1.5">
        {stepContent.handoff.split(';').map((clause, i) => {
          const trimmed = clause.trim()
          if (!trimmed) return null
          return (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-cyan-400 mt-0.5">→</span>
              <span>{trimmed}</span>
            </li>
          )
        })}
      </ul>
    )}
    {stepContent.handoff_note && <p className="text-sm text-slate-400 italic mt-2">{stepContent.handoff_note}</p>}
  </AccordionSection>
)}
```

---

## PHASE 4: Update version and commit

Update the version from `v1.6.0` to `v1.6.1` (this is a content/rendering enhancement, not a structural change).

Commit message: `Add roles & responsibilities, exception ownership, and handoff formatting (Fixes #39)`

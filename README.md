# Partner Program Configurator

**[→ Open the live tool](https://nayanban.github.io/partner-program-configurator/)**

**[→ How I built the configurator](https://github.com/nayanban/partner-program-configurator/blob/main/How_I_Built_the_Partner_Program_Configurator.md/)**

---

## What this is

This is an interactive tool that helps you design a partner program workflow. You answer four questions about your program — what kind of technical integration exists, what commercial arrangements you're using, whether you need certification, and whether you operate in regulated industries — and the tool generates a complete, step-by-step operational workflow tailored to your answers.

The workflow covers everything from the moment a potential partner first reaches out, through contracting, technical build, launch, ongoing operations, and annual renewal. It's the operational backbone of a partner program made visible and configurable.

---

## Who it's for

This tool is useful for anyone responsible for building or running a technology partnership program:

- **Partnerships leaders** designing a new program from scratch or formalizing one that's grown organically
- **Partner managers** who want to understand how different types of partners — resellers, technology integrators, co-sell partners, marketplace partners — are handled differently at each stage
- **Revenue operations and legal teams** who need to understand which approval tracks, contract types, and attribution mechanics apply to a given partner type
- **Hiring managers** evaluating a candidate's depth of knowledge in partnership operations

---

## What the tool actually does

**Start fast or go deep.** You can pick one of five pre-built program archetypes (API/Technology Partner, Reseller, Strategic Alliance, Marketplace Partner, or Referral Program) and jump straight to the output — or walk through four configuration questions to build a custom setup.

**The output is a tailored workflow.** Based on your answers, the tool generates:

- A visual map of all 11 steps in the partner lifecycle, with skipped or modified steps clearly marked
- Expandable detail cards for each active step, showing what happens, who owns it, what it produces, and what can go wrong
- The specific ways your configuration changes each step — for example, a co-sell motion with a jointly-led direction surfaces different account ownership rules than an entity-led one
- An approval tracks summary (Security & Privacy, Legal, Compliance/Risk, Commercial/Finance) showing which are required for your program
- A data model view showing which objects and fields are active in your configuration
- Tool category recommendations filtered to what's relevant for your program type

**Changes are instant.** The sidebar lets you adjust any of your four answers at any time, and every part of the output updates immediately. Toggling from "bidirectional integration" to "no integration" removes Steps 3 and 5 from the workflow in real time.

**Shareable by link.** Your configuration is encoded into the URL, so you can share a link to any specific configuration with a colleague or hiring manager.

---

## The underlying framework

The workflow is built on an original 11-step partner lifecycle framework:

| Step | Name | What it does |
|---|---|---|
| 0 | Operating System | Defines the rules, templates, and infrastructure the rest of the program runs on |
| 1 | Intake & Routing | Qualifies inbound partner interest and routes it to the right track |
| 2 | Placement & Tiering | Assigns the partner to a program tier and sets their entitlements |
| 3 | Scoping & Commitment | Designs the technical integration and locks in build commitments *(skipped if no integration)* |
| 4 | Approvals Gate | Routes the engagement through Security, Legal, Commercial, and Compliance review |
| 5 | Implementation | Executes the technical build *(skipped if no integration)* |
| 6 | Launch Readiness | Packages the partner for go-live: enablement, documentation, support readiness |
| 7 | Go-live & Stabilization | Manages the hypercare period after launch |
| 8 | Operations & Support | Runs ongoing health monitoring, SLA tracking, and continuous improvement |
| 9 | Growth Motions | Activates co-sell, co-marketing, marketplace, and expansion plays once the partner is stable |
| 10 | Review & Renewal | Annual review to renew, re-tier, or exit the partnership |

Four decision points control what the workflow looks like in practice:

1. **Integration direction** — no integration, entity-to-partner, partner-to-entity, or bidirectional
2. **Commercial motions** — referral, reseller, marketplace, co-sell, co-marketing (any combination)
3. **Certification type** — none, integration certification, partner competency certification, or both
4. **Regulated industries** — whether a Compliance/Risk review track is required

---

## Repository contents

- `structured_specification.json` — the logic layer: all objects, fields, conditional rules, completion criteria, and workflow modification rules
- `supplementary_content.json` — the content layer: purpose, scope, outputs, decision rights, exception paths, and loop-back triggers for each step
- `partner_lifecycle_workflow.md` — the original domain document the framework is based on
- `app/` — the React application source code

---

*All rights reserved. This repository is shared for portfolio purposes only.*

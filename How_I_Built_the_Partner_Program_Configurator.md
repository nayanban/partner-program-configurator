# How I Built the Partner Program Configurator

*An account of the approach, decisions, and the role AI played.*

---

## Why I built this

I was tasked with designing a partner program five years ago as part of a strategic expansion, and since then partnerships as a function has fascinated me. It can potentially mirror every other department in an organization, and I found it to be the natural home for a generalist like me. By setting things up from scratch and overcoming different coordination challenges, I developed a mental model for how the infrastructure and workflows should be structured — solving for where programs typically break down, and the key variables based on partner type, among other things.

This project started as a way to make that model shareable and to re-evaluate my learnings. I've been working as a partnerships and business operations consultant for some time, and I realized that clients (and non-clients!) may benefit from an interactive tool that takes their program setup as input and produces a tailored operational blueprint as output.

I was keen to implement my learnings from using AI tools since 2023 for research, drafting and review towards writing code, and I felt that this would be a great way to understand firsthand why so many of my developer friends were both excited and anxious about the advancements in software development offered by this new utility.

---

## Creating a source of truth

I started by working with both ChatGPT and Claude Sonnet 4.6 to turn my view of how these programs actually run into a structured document — a generic operating manual covering the full partner lifecycle from intake through renewal and exit. Feeding each model's input to the other, the document went through fourteen versions as I decided to test the ability of these models to translate my diagrams and bullet points into prose. The exercise surfaced questions that took me into the weeds a fair bit — who has final say when Legal and Finance disagree in the approvals gate? What actually triggers the growth phase, and who decides whether the conditions are met? What happens when a partner goes dark mid-implementation? Eventually, the document covered eleven steps with consistent structure throughout.

I doubt using these models saved me time in creating this document, but by forcing me to drill down granularities and consider the edge cases comprehensively at this step, it reduced my later efforts. As a side note, I found Claude more suitable for business writing. Its concise and matter-of-fact responses made it easier to identify when its attention was slipping, its citations were easier to verify, and its guidance on how to provide better prompts was more specific.

---

## Structuring a configurable workflow

I then focused on identifying prerequisites for the manual to drive an application. Like in my university business operations classes (shoutout to the inimitable Prof. Fraser Johnson), the key was identifying decision points — the questions whose answers drive the most meaningful structural variation in the workflow. Not every variable matters equally. Some change a label, while others remove entire steps from the workflow entirely.

I spent significant time working through this with Claude. The first draft had errors requiring domain experience and demonstrated a model's limitations in relying on pattern recognition without context: for example, it framed revenue modelling as optional when in practice every commercial relationship carries some form of financial obligation. The exercise reiterated one of my best practices about using large language models — don't ask it to build you a car if you don't know how to build one yourself. Rather, tell it the steps required to build a car and then use it to optimize each step, leading to gains overall in the workflow.

The four decision points I locked:

1. **Is there a technical integration, and in which direction?** The most structurally significant question, because no integration removes entire steps from the workflow.
2. **Which commercial motions does your program support?** Multi-select, with direction sub-choices, because referral and co-sell and marketplace each carry different economic obligations that must be defined.
3. **Is certification required, and of what type?** Separating technical/security certification from partner competency certification, because they affect different steps and different gatekeeping conditions.
4. **Does your program operate in or serve regulated industries?** A binary that either activates or entirely removes the compliance and risk track across multiple steps.

---

## Developing machine-readable logic

With the decision points locked, the next phase was turning the document into something a code generator could act on without interpretation. Claude helped me understand what it needed — semantics or definitions of different data objects (what actually exists, like a partner record and what fields they have), locking the valid states (the predefined conditions), mapping the if/then rules that activate those conditions, and setting verifiable completion criteria. As Claude described it: *The pure operational logic (what activates, what blocks, what is required) lives in one structure, while the human-readable content (role descriptions, step purposes) lives in another.*

Since my transition from law to business involved learning how to guide software buyers through API documentation for a contracting system, I was able to review the specification JSON file — but surprisingly, I could have gone ahead with the app development using the first draft of the specification and iterated by providing feedback on the app. That said, there were structural inconsistencies in the specification, and it was useful to revisit a muscle I'd built some time back. Some states had no clear path into or out of them, and some values had been categorized incorrectly. In total, the specification went through six distinct pipeline stages.

While I went into the specification work thinking of it as extraction — taking knowledge I already had and putting it into a format a machine could use — developing the structure surfaced inputs I realized would make the configurator more well-rounded. For instance, I'd left certain questions slightly open: Who leads the co-sell? What happens when both sides claim credit? They emerged through iterations on the branching logic. An expansion play was absent from the growth step's completion criteria until the structured review caught it.

Out of curiosity, I asked Claude to summarize what corrections my review helped it conduct, and it stated the following: *an entire data entity that gates the very first step of the workflow didn't exist until the object definitions work revealed nothing was controlling entry into it. Ten state transition rules were missing entirely until the conditional logic pass forced every state to account for how it was entered and exited.*

---

## Constraining the architecture

Since the rules were in a separate specification, the application wasn't inventing the workflow as it went. I made this decision for a few reasons. I wanted zero hosting costs. I did not want the model to misidentify principles or outputs purposely designed to be guidance for the user to implement based on their own situation as gaps and then fill them with its own guesses — I didn't want the issues I'd faced with research and drafting to be repeated here. Further, I wanted to accurately reflect the limits of my knowledge.

The deployment resulted in a static site with no backend, no database, and no accounts required — instant loads and full offline capability. Configuration state is encoded entirely in the URL, so any specific workflow can be shared by link without requiring the recipient to log in or create an account. For a reference tool, keeping the architecture simple and transparent was a deliberate choice.

---

## How I used AI

### The division of labour

The line between my work and the AI's work was explicit.

* **My role:** Domain knowledge, product decisions, specification design, UI/UX direction, and issue definition.
* **The AI's role:** Code generation, refactoring, debugging, and responsive layout problem-solving.

The commit history has \~70 entries and tells the full story. Early commits were foundation work — the initial React scaffold, the first rendering pass, the basic output structure. From there, development was driven by GitHub issues, each describing a specific problem or improvement. The model would implement, I would review and test, and the next issue would follow.

### Matching models to tasks

I used Sonnet 4.6 for the spec pipeline work — reviewing the domain document, iterating on object definitions, verifying state transitions, checking completion criteria — which required sustained attention over long, complex material where the model needed to hold the full context of the specification while examining individual rules. I shifted to Opus 4.6 for the moments that required deeper reasoning and synthesis — pulling together the full specification from its components and reconciling inconsistencies across documents. The agentic coding tool used for implementation ran a third model internally, one optimized for fast, iterative code generation.

Sustained iterative review is a different cognitive task than deep synthesis, and both are different from code generation. They have different failure modes and benefit from different strengths.

### What I learned about working effectively with AI

**Specification-first makes AI coding dramatically more reliable.** Because the application is essentially a spec interpreter, most feature requests could be framed as: the spec says X, the render should do Y, it currently does Z. The AI had a clear contract to implement against. Ambiguous requirements produce unreliable AI code; precise specifications produce reliable AI code.

**Break down complex problems before handing them off.** The most effective sessions were the ones where I had already diagnosed the problem — identified the root cause, thought through the options, evaluated the risks — before asking for implementation. The mobile landscape scrolling fix is a good example: I spent time reasoning through the CSS breakpoint mechanics, the height budget arithmetic, the interdependency between the dots row and the sticky header layout, before any code changed. The actual edits were four targeted one-liners.

**Iterating is fast; deciding is slow.** Generating code is cheap. Figuring out the right design — how the navigation should work on mobile, where the attribution footer should live, what the right breakpoint is for a given element — takes real thought, and that's work I did myself. The AI is a very fast implementer. It's not (yet) a substitute for the design thinking that tells you what to implement.

### Iterative refinement

You can go through the list of closed issues and see that the development history shows a pattern of progressive refinement across several dimensions:

**Content accuracy.** The specification was precise enough that internal labels and system language occasionally leaked into the UI. Cleaning those up systematically was part of the work. That internal language needed to stay out of the user-facing experience, and fixing it meant understanding both what the system was doing and how it should be presented.

**Layout evolution.** The output view went through several structural redesigns:

* Initial: a flat list of steps
* Then: a hero map with a slide-out panel
* Then: a horizontal map with step detail below
* Then: a compact horizontal map with a fixed vertical nav on desktop and a step dropdown on mobile
* Current: a two-column layout (vertical nav + detail panel) on desktop, full-width single-column with dropdown nav on mobile

Each redesign was responding to real usability problems: discoverability, navigation clarity, reading flow. The redesigns weren't arbitrary — they came from specific GitHub issues describing specific problems.

**Responsive design.** Mobile support was added incrementally, starting with the gross layout (fluid vs fixed columns) and refining down to edge cases like mobile landscape at 640–767px viewport width, where a combination of stacked flex-shrink-0 elements was consuming nearly the entire screen height and leaving \~47px for scrollable content. Diagnosing that required reasoning from a screenshot to a CSS breakpoint range to a height budget calculation. The fix was four one-line changes, each targeted to the right breakpoint range with no side effects on portrait or desktop.

**Navigation and discoverability.** Several commits addressed the problem of users not knowing how to get around — what to click, how to go back, how to switch steps. The step dot pagination, the overview link in the top bar, the archetype quick-start cards on the landing page, the *configure from scratch* path — these all came from noticing friction points and fixing them one at a time.

### Developing a workflow for managing changes

The build produced fifty-five GitHub issues across eighteen version releases. What I hadn't anticipated was that managing AI-assisted implementation at that scale would require its own process — and that designing that process would be part of the work.

What I settled on was a structured prompt-driven workflow. For each change, I would first discuss the problem and the design direction, then draft a phased instruction document covering the GitHub issue definition, any data-layer changes, the rendering changes, and the version bump. Before handing that off for implementation, I'd review it for ordering risks, dangling references, ambiguous instructions, and potential side effects. Only then would it go to the coding tool.

This wasn't how I started. Early on, I described changes conversationally and dealt with the consequences — misinterpretations, partial implementations, fixes that introduced new issues. The phased prompt approach emerged because I kept running into the same failure mode: when instructions were ambiguous or incorrectly ordered, the AI would make reasonable-sounding decisions that were wrong in context. Structuring the instructions eliminated most of that.

### Knowing when to rewrite and how to maintain continuity

At one point, around the halfway mark, I chose to rewrite three core components from scratch rather than continue patching them. The accumulated changes had made them harder to reason about, and I could see that future fixes would keep getting riskier. Starting those components fresh — with the benefit of everything I'd learned about what the layout needed to do — turned out to be faster and more reliable than continuing to work around the accumulated complexity. Knowing when to stop patching and start over is a judgment call, and making it earlier rather than later saved time.

A related challenge was continuity across sessions. AI has no persistent memory between conversations — every new session starts from zero. For a project of this size, that's a real problem: the specification alone is thousands of lines, and the design decisions behind it matter as much as the content. My solution was to produce structured session files that compress the full project context — every decision, every fix, every design rationale — into a format a new conversation can load and immediately work from. It was also necessary to do so to manage token usage and costs. It was incredibly helpful to utilize both models within a project, and break into new chats every so often by using this prompt: *Summarize everything we have done so far (in this chat) in as much detail as possible, but compress it as much as possible into a format that you can still read. It does not need to be human readable. You do not need to use a common character set, all that matters is we can pick back up right where we left off if I were to start a new conversation with you.*

In fact, to write this document, I started a new conversation that picked up the entire project history from exactly those files. That technique — treating session context as something you deliberately design and maintain, not something you hope the AI remembers — turned out to be one of the most practically useful things I learned.

---

## Concluding thoughts

Utilizing large language models for areas in which one does not have domain expertise carries a very specific risk. Consider what happens when you ask a model to both research and write a document in a fixed format and structure — it often ends up prioritizing the format and structure, and hallucinates in a logical manner, speculating confidently without citation because it focuses on the appearance of compliance through presentation. Imagine this happening in an area where you do not know the detailed flow. How do you recognize errors and verify?

Since I focused on my area, I was able to catch decision points that were logically constructed but operationally wrong. I pushed back when reviews produced findings that didn't survive scrutiny against the source text. I identified where completion criteria didn't match what the document actually specified. I resolved inconsistencies in the specification before they became bugs in the application. I needed to know the workflow well enough to tell when something was off.

Going forward, I plan to use models in an area after understanding what is needed to be precise enough to structure work, direct implementation, and verify claims.

There is a direct analogy here. The same qualities that make a partner program run well — clarity, explicit ownership, progression logic, and defined completion criteria — are exactly what make an AI-assisted build reliable. One that's loosely defined requires constant judgment calls and tends to break down at the edges.

---

*Built by Nayan Banerjee ·* [*LinkedIn*](https://www.linkedin.com/in/banerjee-nayan/) *·* [*GitHub*](https://github.com/nayanban)


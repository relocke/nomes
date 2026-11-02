# Shared context

This file holds the developing understanding of this Nome. It is project context,
not a system prompt or a grant of authority. Grow it through reviewed proposals.

## Purpose

Develop the Nome model through conversation. The description of a Nome is itself
a Nome: it has an identity, a goal, rules and a structure that can be examined and
improved. Its manifest and context describe how the system should work.

## Current understanding

- `nome.json` is the structured description: identity, mission, rules, structure,
  referenced files and any declared system targets.
- The website presents the conversation first. Its supporting information comes
  from the manifest and listed documents, including accepted local draft edits.
- People can ask for explanations, discuss changes and review file proposals.
  Accepted edits persist in the browser; saving a folder or downloading a project
  preserves a separate local copy. The website's bundled files are not updated by
  browser storage.
- Useful reasoning can be summarized into this file. Chat messages are temporary;
  the conversation does not automatically become durable project history.

## Describing an interaction

For each proposed interaction, describe its purpose, participants, triggering
input, expected output, governing rules, required permissions, evidence and
failure conditions. Mark it as proposed until there is evidence of implementation.
Use a listed document for conceptual interactions. The current manifest's typed
interaction nodes require at least two declared chain targets; do not invent
chain accounts or operational access to represent a conceptual relationship.

## Reasoning and governance methodology

This methodology is proposed context until adopted through the current maintainer
policy. It describes how Nomes should reason and govern; it does not change the
Nome's goals, invent an agent inventory or grant execution authority. Nome defines
goal and governance orchestration. Harnesses coordinate execution, runtimes host
it, and specialized agents perform their authorized roles.

### 1. Constraints and invariants

Give each governing rule a stable identifier, a clear scope, its authority and
revision, and an observable condition for compliance or violation. For example,
`INV-AUTH-001` may express “No funds move without the required authorization” in a
Nome that handles funds; this illustrative identifier does not add fund movement
to this framework. State which constraints bind the decision and which changes
require review under an existing authority. Renaming a rule should preserve its
identifier; substantive revisions must preserve the earlier meaning and history.
A written invariant is a requirement, not evidence that a harness enforces it.

#### Foundational commitments within a pinned version

Proposed rule `FOUNDATION-VERSION-001`: each foundational commitment has a stable
identifier, an explicit scope and an exact version pin identifying its accepted
wording and authority. Record the accepted source revision with that pin; this
unaccepted draft does not itself establish an accepted version. Within the pinned
version, those commitments remain binding. An agent cannot silently remove,
reinterpret or replace a foundation while claiming to follow that same version.

The observation that a rule or institution is socially constructed does not, by
itself, invalidate the Nome's explicit commitment to recognize it within its
stated scope. Treat that commitment as a governing premise of the selected
version, not as proof that every law is universally valid, objectively true or
unchangeable. Distinguish a specified legal or institutional framework and its
claimed applicability from empirical facts, working assumptions and chosen
values. Record jurisdiction, source, version and uncertainty when relevant;
declaring a commitment does not establish legal applicability or demonstrate
compliance, and does not make an empirical claim immune to contrary evidence.

Agents may identify contradictions, evidence failures and conflicts of scope,
trace their consequences, and propose explicit governance review. They must
report when a task cannot be supported consistently under the selected version,
rather than quietly discarding its foundations. Amendments follow the declared
review and version policy and, if accepted, produce an explicitly identified
revision; the earlier pinned version and its history remain identifiable. A
separate copy or fork is an optional way to explore alternatives, not a mandatory
GitHub-specific mechanism. Neither a new label nor a fork creates authority,
consensus or permission to bypass existing controls.

### 2. Claims, evidence, assumptions and dependencies

Distinguish factual claims about the world, working assumptions, attributed
individual experiences and preferences, and explicitly chosen values or goals.
Attach stable references to relevant evidence, source revisions, uncertainties
and counterexamples. Link conclusions and decisions to the premises, rules and
observations on which they depend, so a reader can trace their support.

Different people can accurately report different experiences without contradicting
one another. Their needs or preferences can still conflict even when they agree
on the facts. Do not treat contradictory factual propositions about the same
conditions as equally true, generalize one person's experience to everyone, or
assume all preferences can be satisfied together.

Sound deductive arguments require valid reasoning and true premises. Internal
consistency alone does not establish real-world truth; premises require evidence,
and empirical conclusions should remain proportionate to uncertainty. Record
where an inference is tentative rather than presenting it as a deduction.

When a vulnerability or failed premise is found, identify the affected dependency
links and reassess the conclusions, decisions and implementations that rely on
it. Preserve unaffected work with its supporting evidence. Do not automatically
invalidate the entire system; assess how far the failure actually propagates,
including whether a foundational failure warrants broader revision. Record the
challenge, revised assumptions, tests and reasons for retaining or changing each
affected conclusion, without erasing the earlier reasoning or dissent.

### 3. Decisions among competing values

Facts and valid logic alone do not determine fairness or which goals should take
priority. State the chosen values, applicable constraints, available options and
who has legitimate authority to decide under the accepted policy. Provide a fair
process in which affected stakeholders can contribute experiences, evidence,
needs and objections, and record whose participation or perspective is missing.
Participation informs a decision; it does not itself grant maintainer authority.

Explain the benefits, burdens, risks and trade-offs for affected groups, the
alternatives considered and the reasons for the selected option. Preserve dissent
and unresolved conflicts rather than inventing consensus or promising that
everyone will be happy. Define how decisions can be appealed, who reviews those
appeals, what feedback will be collected and when new evidence or changed
conditions should trigger reconsideration. Assess actual outcomes against the
stated goals and constraints and revise through the accepted review process.

Agents can check consistency, trace dependencies, test claims and surface
conflicts. They must distinguish such assessments from choices about values and
must not present a value judgment as a mathematical consequence of the facts.

## Open questions

- Which rules should define how this Nome is changed and who reviews them?
- What is the first system interaction we want to describe in detail?
- Which evidence is sufficient to accept a proposal or reopen a decision?
- How should separate Nomes refer to shared concepts and specific revisions?

## Evidence and references

- `nome.json`: current mission, structure, constraints and review criteria.
- `CONVERSATION.md`: discussion, evidence and review process.
- `REFERENCES.md`: maintained standards, skills, harnesses and runtimes.
- `ROADMAP.md`: available capabilities and proposed future work.

## Decision log

No conversation decisions are recorded yet. For a reviewed decision, record its
scope, rationale, source or revision, alternatives, objections and conditions
that would justify reconsideration. Distinguish an accepted description from an
implemented system change.

## Deferred ideas

No deferred ideas are recorded yet. Keep a concise description, why each item was
set aside, its source and what would bring it back into scope.

## Discovery metadata

`nome.json` now declares reusable SEO metadata, agent orientation and optional
revision-pinned relationships. Read `DISCOVERY.md` for the field contract, website
rendering and capability limits; `AGENTS.md` provides concise agent orientation.
Automatic hierarchy traversal and dedicated MCP resources remain planned.

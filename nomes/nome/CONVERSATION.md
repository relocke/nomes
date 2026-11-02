# Conversation and review

This document proposes a process for work on Nome. It is project context, not a
replacement for maintained skills, runtime instructions or access controls.

1. Read the current `nome.json`, its listed documents and the selected question.
2. Identify the goal, problem, affected structure and constraints. Ask for missing
   context rather than inferring capabilities from a URL or model name.
3. Separate claims from evidence. Link to source paths, revisions and unresolved
   assumptions. Multiple model opinions do not establish truth by agreement.
4. Test relevance, reasoning and consequences. A contribution can be in scope
   without being correct. Assess arguments, not a contributor's identity or worth.
5. Propose a concise update to `CONTEXT.md` and, when needed, `nome.json`. Explain
   its effect on the goal, rules and existing reasoning. Keep objections and
   alternatives linked and recoverable. Add the context file to the manifest if
   it is not listed yet. The context file is an evolving summary, not a transcript
   or an automatic record that a decision has been accepted.
6. Review the proposed file changes before accepting them. Use the existing local
   save controls to persist accepted changes. Publication is a separate action.

## Review a reasoning or governance contribution

Apply the three-layer methodology in `CONTEXT.md`. Each contribution should
identify:

- The goal and problem addressed, and the affected scope or dependencies.
- Applicable rules or invariants by stable identifier and revision, their
  authority, and any proposed change to a binding constraint.
- Factual claims, evidence, assumptions, attributed experiences and preferences,
  and chosen values, kept distinct with their sources and uncertainties.
- Affected stakeholders, expected benefits and burdens, missing perspectives,
  alternatives, conflicts and explained trade-offs.
- The decision procedure, authorized decision maker, participation and appeal
  process, objections, feedback and conditions for revision.
- Tests or review criteria, expected outcomes, actual results when available,
  limitations and what evidence would challenge the proposal. Mark tests that
  have not been run and distinguish conceptual examples from execution evidence.

For example, two people reporting different needs is not by itself a factual
contradiction; choosing between competing needs requires an explicit decision
process. If an assumption fails, trace its dependent conclusions and reassess
them before claiming either that nothing changes or that the whole system fails.
A consistent argument with unsupported premises is not established fact, and a
majority preference is not proof of factual truth or unanimous agreement.

For foundational commitments, apply `FOUNDATION-VERSION-001`: identify the exact
version pin and scope, distinguish a challenge to factual support from a proposed
change to a governing commitment, and name the applicable review and version
policy. Social construction alone is not grounds to disregard a commitment.
Record conflicts openly; do not present a silently changed foundation as the
same version. Check both that contrary evidence can be reported and that agents
cannot remove a binding premise without the declared review process.

Keep proposals, published contributions and accepted decisions distinct. Summarize
only the content selected for publication, without copying private conversation.
Publication through ReLocke requires review and passkey authorization; acceptance
requires the currently accepted maintainer policy and successful GitHub validation.
The methodology does not replace those checks or authorize direct repository
publication, signing, deployment or changes to harness machinery.

## Keep the active conversation focused

Summarize repetition and move tangents into clearly labelled context notes when
reviewed. Preserve the original reasoning or a reference to it. Do not silently
delete history, discard a challenge, or treat an AI relevance check as consensus.
New evidence can bring a deferred question back into the active discussion.

## Model handoff

Provide the same manifest revision, selected scope and relevant documents to each
available model. Record the question, model/version when known, evidence cited,
proposal and disagreements. Retrieve missing linked content explicitly. Different
tools may support different context sizes or actions; state omissions and limits.
An automatic comparison or routing service remains future work.

## Human conversation

Answer in concise plain English and cover each point raised. Explain what an idea
means and the practical steps to build it without displaying JSON, schemas, raw
field names, configuration examples or file contents. Show those only when the
current reader explicitly requests a technical format or a specific file.
Mentioning agents, MCP, GitHub or implementation does not itself request JSON.
The same default applies to agent clients; provide machine-readable examples when
explicitly requested. Internal structured responses remain internal.

Describe proposed capabilities with brief, accurate qualifiers. Avoid repeated
caveats, unsolicited source lists and implementation checklists. Keep evidence
available, and supply sources when requested. Public idea summaries and proposed
context additions follow the same plain-English default.

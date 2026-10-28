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

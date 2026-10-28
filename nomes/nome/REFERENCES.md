# Reference map

Paths below are relative to the ReLocke app repository. GitHub links point to the
maintained `master` branch and can change. Pin a commit or record hash when a
decision relies on exact contents. Local edits may be ahead of the published site
or repository; neither a link nor this list proves deployment or tool availability.

## Definition and manifest

- [Nome standard](https://github.com/relocke/app/blob/master/standards/nome/README.md) — `standards/nome/README.md`. Meaning, supported structure and implementation limits. MCP resource: `relocke://standards/nome`.
- [Manifest guide](https://github.com/relocke/app/blob/master/docs/nome-manifest.md) — `docs/nome-manifest.md`. Discovery metadata, local files and compatibility.
- [Public JSON Schema](https://relocke.io/nome.schema.json) — `public/nome.schema.json`. Editor validation.
- [Runtime manifest parser](https://github.com/relocke/app/blob/master/lib/nomos/manifest.ts) — `lib/nomos/manifest.ts`. Authoritative application validation.
- [Nomos implementation](https://github.com/relocke/app/blob/master/docs/nomos.md) — `docs/nomos.md`. Revision-bound discussion, publication and rollout.

## Maintained skills

- [Nomos](https://github.com/relocke/app/blob/master/skills/nomos/SKILL.md) — `skills/nomos/SKILL.md`. Nome goals, scoped reasoning and reviewed proposals. MCP resource: `relocke://skills/nomos`.
- [Nome Forge](https://github.com/relocke/app/blob/master/skills/contract-forge/SKILL.md) — `skills/contract-forge/SKILL.md`. Conversation and supported contract development. MCP resource: `relocke://skills/contract-forge`.
- [Antediluvian](https://github.com/relocke/app/blob/master/skills/antediluvian/SKILL.md) — `skills/antediluvian/SKILL.md`. Evidence, challenges and recoverable routing. MCP resource: `relocke://skills/antediluvian`.
- [ReLockeQL](https://github.com/relocke/app/blob/master/skills/use-relockeql-agent/SKILL.md) — `skills/use-relockeql-agent/SKILL.md`. Supported chain operations and authority boundaries.

## Harnesses, runtimes and access

- [Agent harnesses](https://github.com/relocke/app/blob/master/lib/agent/harnesses.ts) — `lib/agent/harnesses.ts`. Agent scope and tool allowlists.
- [Runtime policy](https://github.com/relocke/app/blob/master/lib/agent/runtime-policy.ts) — `lib/agent/runtime-policy.ts`. Bounded model context and execution policy.
- [Agent runtime guide](https://github.com/relocke/app/blob/master/skills/use-relockeql-agent/references/agent-runtime.md) — `skills/use-relockeql-agent/references/agent-runtime.md`. Website/MCP integration. MCP resource: `relocke://skills/use-relockeql-agent/agent-runtime`.
- [Skill catalog](https://github.com/relocke/app/blob/master/lib/agent/skills/catalog.ts) — `lib/agent/skills/catalog.ts`. Maintained skill loading.
- [MCP resources](https://github.com/relocke/app/blob/master/lib/mcp/resources.ts) — `lib/mcp/resources.ts`. Available resource definitions.
- [MCP tools](https://github.com/relocke/app/blob/master/lib/mcp/tools/index.ts) — `lib/mcp/tools/index.ts`. Registered capabilities.
- [Protected-component policy](https://github.com/relocke/app/blob/master/AGENTS.md) — `AGENTS.md`. Owner authorization requirements.
- [Integrity manifest](https://github.com/relocke/app/blob/master/harness-integrity.json) — `harness-integrity.json`. Protected coverage and authorization records.

MCP resource identifiers are read through the existing `read_relocke_resource`
tool when available. They are not browser URLs. These references grant no tools,
credentials, authority or permission to modify the resources they identify.

## Website entry points

- [Nome project](https://relocke.io/nomes/nome)
- [Explore Nomes](https://relocke.io/nomes)
- [Nome Forge](https://relocke.io/agent/nome-forge?view=conversation)
- [Walkthrough](https://relocke.io/learn/nomes)
- [Nomos architecture](https://relocke.io/governance/architecture)

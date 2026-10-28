# Nome discovery contract

This profile extends `relocke-nome/1` with optional declarations. Existing Nomes
remain valid. It separates project metadata from operational capabilities.

## Manifest structure

- `discovery.description`: concise factual page description.
- `discovery.longDescription`: fuller scope and intended use.
- `discovery.keywords`, `aliases`, `language`: search and orientation hints.
- `discovery.topics`: up to 20 lowercase, hyphenated repository topic suggestions.
- `discovery.audience`: intended readers.
- `discovery.status`: proposed, accepted, implemented, deprecated, archived or
  disputed; describes the project, not the truth of every claim.
- `discovery.indexing`: search indexing preference, agent discovery preference,
  and an optional absolute HTTPS canonical URL.
- `repository`: existing repository URL, branch, directory and publication policy.
  Do not duplicate the repository URL inside discovery metadata.
- `agentContext`: orientation document, ordered reading list, purpose, allowed
  uses, prohibited inferences and evidence policy. Referenced local documents
  must be listed in `files`. Declarations grant no authority.
- `context.skills`, `context.harnesses`, `context.runtimes`: existing titled
  references, optionally pinned to a Git commit. A reference is not installation.
- `relationships`: optional typed, revision-pinned declarations with status,
  scope and evidence. This Nome declares none yet.

All fields are bounded and validated by the published Nome JSON Schema. Optional
fields must survive import, editing and export without rewriting older manifests.

## Search engines and social previews

The public Nome page derives its title, description, canonical link, robots
index preference, Open Graph tags, Twitter summary card and CreativeWork JSON-LD
from the published manifest. JSON-LD carries stable identity and the loaded
revision; user-supplied text is escaped before embedding in HTML.

The current site sitemap already includes this Nome. Future directory-wide
sitemap generation should include only indexable, available public Nomes with
matching canonical URLs. Metadata does not guarantee indexing, rankings or rich
results. Keywords are descriptive context, not a Google ranking mechanism.

GitHub repository descriptions and topics are a separate publication step;
manifest edits do not change repository settings. A multi-Nome repository should
use repository-wide topics rather than replacing them with one Nome's topics.

## Agent and MCP discovery

`nome.json` is the machine-readable entry point; `AGENTS.md` is concise orientation.
Read the listed documents from the same Git commit. The existing project API
returns the loaded revision, manifest and documents. Authenticated Nome chat can
use the same published project context; deployment and tool discovery are required
before clients can use newly added tools.

The page also emits custom `nome:id`, `nome:revision`, `nome:status` and
`nome:agent-discovery` metadata. These are Nome conventions, not standard search
engine or MCP directives. `allowAgentDiscovery` is an advisory preference; it does
not block access, hide public files, disable chat or configure crawler permissions.

Dedicated revision-addressed MCP resources and resource templates remain planned.
A manifest declaration alone does not register an MCP resource or install a skill.
Consumers must discover actual server capabilities before requesting resources.

## Relationships and future traversal

Supported declarations: parent, child, sibling, dependsOn, implements, references,
derivedFrom, related and supersedes. Each identifies another Nome by stable ID,
HTTPS URL and exact 40-character Git commit or 64-character content digest, plus
scope, status and evidence. Local evidence paths must be listed in `files`.

No automatic traversal is implemented. A future reader must enforce a maximum
depth, an explicit relationship-type allowlist, visibility and access checks,
revision pins and cycle detection. It must report missing targets and preserve
proposed or disputed status. Never fetch arbitrary targets merely because a
relationship exists. Pins identify a version; they do not establish acceptance.

## References

- [Google supported metadata](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Google structured data guidance](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [MCP resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)

These references describe external conventions; they grant no operational access.

# Nome

This is the ReLocke project for developing the Nome model itself. A Nome describes
the purpose, rules, governance, reasoning and systems that belong together. This
project gives that work a stable identity and a local home.

## Work on this Nome

The entry point is `nome.json`. It lists the mission, constraints, structure and
its companion documents. Read `CONTEXT.md` for the growing shared understanding,
`REFERENCES.md` to locate the maintained sources,
`CONVERSATION.md` for the proposed discussion process and `ROADMAP.md` for next steps.

On the website, open [Nome](https://relocke.io/nomes/nome) and choose **Start a conversation**.
The site loads a copy into the existing browser workspace. Existing drafts require
a replacement review and can be backed up first. If this Nome is already open,
continue that draft instead of replacing it with the website copy. The page reads
its title, purpose, structure and context from that draft, so accepted changes
appear immediately.

Use **Describe this Nome**, **Propose a change** or **Define an interaction** to
start. **Update context** prepares a request to summarize the discussion into
`CONTEXT.md`; submit it, review the proposed changes and accept what belongs in
the project. Existing drafts without that file can ask the agent to create and
list it in `nome.json`. Chat messages last for the current page session; reviewed
context files preserve the useful reasoning across sessions.

For direct local work, open the `projects/nome` directory using Forge's **Open local
folder**. Review proposed file changes, then use **Save to folder** to write them
back. Browser storage alone does not update your filesystem. Browsers without
folder access can download and import the standard project backup.

## Boundaries

This is a documentation and governance draft with no chain, account, contract or
deployment target. Forge can discuss and edit its files; its contract build
readiness checks will remain incomplete. Do not add dummy source or choose a
chain just to satisfy a build check.

Referenced tools, models and documents are not automatically installed or loaded.
The existing runtime controls available models, authentication, tools and context
limits. Ask for missing evidence before relying on a linked source. No new
multi-model orchestration or automatic conversation deletion is implemented here.

Responsibility, legal acceptance and licensing remain unspecified in the manifest.
Resolve these declarations through review before making claims about them.

## Discovery metadata

`nome.json` now declares reusable SEO metadata, agent orientation and optional
revision-pinned relationships. Read `DISCOVERY.md` for the field contract, website
rendering and capability limits; `AGENTS.md` provides concise agent orientation.
Automatic hierarchy traversal and dedicated MCP resources remain planned.

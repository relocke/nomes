# ReLocke Nomes

Seed contents for the public `relocke/nomes` repository. Copy this directory's
contents to that repository's `main` branch after checking organization access.
The Nome project defines the shared framework for developing other Nomes.

`index.json` lists each stable identity, slug and title. Each entry lives in
`nomes/<slug>/nome.json`, with its declared context documents beside it.
Discussion records and review decisions are written under `discussion/` by
ReLocke's verified contribution publisher. References describe capabilities;
they do not install code, grant permissions or change ReLocke's runtime.

Other Nomes may declare `context.framework` with `slug: "nome"` and an exact
40-character commit from this repository. Adopt new framework revisions through
review, rather than silently tracking the latest branch.

Ordinary questions stay in the visitor's session. Explicitly published questions,
answers, arguments and proposals are public, including their network/account
attribution and authorization receipts. A signature is attribution, not truth.

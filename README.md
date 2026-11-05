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


## Format 2 compatibility

The validator accepts both `relocke-nome/1` and `relocke-nome/2`. Format 2 groups
the document into identity, mission, governance and architecture. Existing Nome
files and signed history remain unchanged by this validator upgrade.

New browser creation payloads explicitly bind `manifestFormat: "relocke-nome/2"`
to their approval signature. Requests without that field retain the original
format-1 creation bytes. The validator also includes the app's existing optional
`nome.skills.json` architecture validation.

Upgrade compatible app readers and this trusted validator before submitting
format-2 manifests through the normal reviewed contribution flow. Existing
maintainers, repository restrictions and signature checks still apply. This
infrastructure update is not a signed Nome contribution and requires repository
maintainer review; it does not alter the signed-contribution workflow.

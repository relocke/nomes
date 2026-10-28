import { z } from "zod";
import { parseNomeManifest } from "../nomos/manifest.ts";
import { permitsIdentity } from "../nomos/authority.ts";
import { verifyConnectionSignature } from "../mcp/oauth/webauthn.ts";
import { digest, validateEdits } from "./policy.ts";
import { creationRecordSchema, creationFiles } from "./creation-policy.ts";
import { parseRecord, decisionSchema } from "./record-policy.ts";
import { reviewInputSchema, identitySchema, commitSchema, slugSchema } from "./schema.ts";

const registry = z.object({ format: z.literal("relocke-nomes/1"), nomes: z.array(z.object({ slug: slugSchema, id: z.string().uuid(), title: z.string().min(1).max(160) }).strict()).max(500) }).strict();
type Identity = z.infer<typeof identitySchema>;
export type RegistrySnapshot = Map<string, string>;
export async function validateRegistryChange(input: {
  base: string; head: string; branch: string; parent: string;
  before: RegistrySnapshot; after: RegistrySnapshot;
  verifyAccount: (identity: Identity, key: string) => Promise<void>;
}) {
  const { before, after, verifyAccount } = input;
  commitSchema.parse(input.base); commitSchema.parse(input.head); commitSchema.parse(input.parent);
  const read = (files: RegistrySnapshot, path: string) => { const text = files.get(path); if (text === undefined) throw new Error(`Missing ${path}`); return text; };
  const json = (files: RegistrySnapshot, path: string) => JSON.parse(read(files, path));
  const changed = [...new Set([...before.keys(), ...after.keys()])].filter(path => before.get(path) !== after.get(path));
  function exact(expected: Map<string, string>) {
    if (changed.length !== expected.size || changed.some(path => !expected.has(path) || after.get(path) !== expected.get(path))) throw new Error("Unexpected or unsigned file changes");
  }
  async function proof(value: { envelope: { origin: string }; digest: string; signature: string; publicKey: string }, identity: Identity) {
    if (value.envelope.origin !== "https://relocke.io" || digest(value.envelope) !== value.digest || !await verifyConnectionSignature(value.signature, value.publicKey, value.digest, "https://relocke.io", "relocke.io")) throw new Error("Invalid passkey proof");
    await verifyAccount(identity, value.publicKey);
  }
  const creation = /^nome-creations\/([a-f0-9]{64})$/.exec(input.branch);
  if (creation) {
    const paths = changed.filter(path => /^nomes\/[a-z0-9-]+\/founding\.json$/.test(path));
    if (paths.length !== 1) throw new Error("Missing unique founding record");
    const record = creationRecordSchema.parse(json(after, paths[0])), payload = record.envelope.payload;
    const slug = payload.draft.slug;
    if (paths[0] !== `nomes/${slug}/founding.json` || payload.base !== input.base || input.parent !== input.base || digest(payload) !== creation[1]) throw new Error("Creation revision or identity mismatch");
    const previous = registry.parse(json(before, "index.json"));
    if (previous.nomes.some(item => item.slug === slug || item.id === payload.id) || [...before.keys()].some(path => path.startsWith(`nomes/${slug}/`))) throw new Error("Cannot replace an existing Nome");
    await proof(record, payload.identity);
    const next = registry.parse({ ...previous, nomes: [...previous.nomes, { slug, id: payload.id, title: payload.draft.title }] });
    exact(new Map([...creationFiles(payload).map(file => [file.path, file.content] as const), [paths[0], read(after, paths[0])], ["index.json", JSON.stringify(next, null, 2) + "\n"]]));
    return;
  }
  const contribution = /^nome-contributions\/([a-f0-9]{64})$/.exec(input.branch);
  if (!contribution) throw new Error("Only signed Nome branches can pass registry validation");
  const id = contribution[1];
  const paths = changed.filter(path => new RegExp(`^nomes/[a-z0-9-]+/discussion/${id}\\.json$`).test(path));
  if (paths.length !== 1 || before.has(paths[0])) throw new Error("Missing unique new contribution record");
  const path = paths[0], slug = path.split("/")[1];
  const record = parseRecord(json(after, path), slug, id);
  if (record.base !== input.base) throw new Error("Contribution base changed");
  const manifest = parseNomeManifest(read(before, `nomes/${slug}/nome.json`));
  if (manifest.id !== record.nomeId) throw new Error("Nome identity mismatch");
  await proof(record.proof, record.identity);
  const documents = manifest.files.map(filename => ({ filename, source: read(before, `nomes/${slug}/${filename}`) }));
  validateEdits(manifest, documents, record.contribution);
  const expected = new Map([[path, read(after, path)]]);
  const decisionPath = `nomes/${slug}/discussion/${id}.decision.json`;
  if (after.has(decisionPath)) {
    const raw = decisionSchema.parse(json(after, decisionPath));
    const decision = reviewInputSchema.parse(Object.fromEntries(Object.entries(raw).filter(([key]) => key !== "proof")));
    if (decision.id !== id || decision.head !== input.parent || !manifest.authority || !permitsIdentity(manifest.authority, decision.identity)) throw new Error("Review is not authorized by the previously accepted policy");
    if (raw.proof?.envelope?.version !== "nome-contribution/1" || raw.proof?.envelope?.purpose !== "review" || raw.proof?.envelope?.slug !== slug || digest(raw.proof.envelope.payload) !== digest(decision)) throw new Error("Decision does not match its proof");
    await proof(raw.proof, decision.identity);
    expected.set(decisionPath, read(after, decisionPath));
    if (decision.outcome === "accepted") for (const edit of record.contribution.edits) expected.set(`nomes/${slug}/${edit.path}`, edit.content);
  }
  exact(expected);
}

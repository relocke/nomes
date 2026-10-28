import { z } from "zod";
import { nomeManifestSchema } from "../nomos/manifest.ts";
import { commitSchema, identitySchema, slugSchema } from "./schema.ts";

export const creationDraftSchema = z.object({
  slug: slugSchema, title: z.string().trim().min(1).max(160),
  purpose: z.string().trim().min(1).max(1000),
  context: z.string().trim().min(1).max(6000),
}).strict();
export const creationInputSchema = z.object({
  id: z.string().uuid(), base: commitSchema, draft: creationDraftSchema, identity: identitySchema,
}).strict();
export type NomeCreation = z.infer<typeof creationDraftSchema> & { id: string; base: string };
export const creationEnvelopeSchema = z.object({
  version: z.literal("nome-creation/1"), repository: z.literal("relocke/nomes"), branch: z.literal("main"),
  origin: z.literal("https://relocke.io"), nonce: z.string().uuid(), expires: z.string().datetime(),
  payload: creationInputSchema,
}).strict();
export const creationRecordSchema = z.object({
  envelope: creationEnvelopeSchema, digest: z.string().regex(/^[a-f0-9]{64}$/),
  publicKey: z.string().min(1).max(512), signature: z.string().min(1).max(8000),
}).strict();
export function creationFiles(input: z.infer<typeof creationInputSchema>) {
  const { draft, identity } = input;
  const manifest = nomeManifestSchema.parse({
    $schema: "https://relocke.io/nome.schema.json", format: "relocke-nome/1", id: input.id, title: draft.title,
    authority: { version: 1, maintainers: [identity] },
    discovery: { description: draft.purpose, keywords: [], language: "en", indexing: { allowSearchIndexing: true, allowAgentDiscovery: true, canonicalUrl: `https://relocke.io/nomes/${draft.slug}` } },
    mission: { objective: draft.purpose, successCriteria: [], constraints: [], failureConditions: [] },
    repository: { url: "https://github.com/relocke/nomes", branch: "main", directory: `nomes/${draft.slug}`, publication: "reviewed_direct" },
    files: ["README.md", "CONTEXT.md"], build: { chain: null, contractName: "", entryPoint: "", defines: [] },
    supportedChains: [identity.chain], targets: [], defaultTarget: null, structure: [], arguments: [], sideEffects: [], criteria: [], antediluvian: null, recognition: { kind: "nome", assessment: null },
  });
  return [
    { path: `nomes/${draft.slug}/nome.json`, content: JSON.stringify(manifest, null, 2) + "\n" },
    { path: `nomes/${draft.slug}/README.md`, content: `# ${draft.title.replace(/[\r\n]/g, " ")}\n\n${draft.purpose}\n` },
    { path: `nomes/${draft.slug}/CONTEXT.md`, content: `# Project context\n\n${draft.context}\n` },
  ];
}

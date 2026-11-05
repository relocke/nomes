import { nomeSkillsSchema, serializeNomeSkills } from "./architecture.ts";
import { z } from "zod";
import { nomeManifestSchema, serializeNomeManifest } from "../nomos/manifest.ts";
import { commitSchema, identitySchema, slugSchema } from "./schema.ts";

export const creationDraftSchema = z.object({
  slug: slugSchema, title: z.string().trim().min(1).max(160),
  purpose: z.string().trim().min(1).max(1000),
  context: z.string().trim().min(1).max(6000),
  architecture: nomeSkillsSchema.optional(),
}).strict();
export const creationInputSchema = z.object({
  id: z.string().uuid(), base: commitSchema, draft: creationDraftSchema, identity: identitySchema,
  manifestFormat: z.literal("relocke-nome/2").optional(),
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
  if (draft.architecture && (draft.architecture.name !== draft.title || draft.architecture.purpose !== draft.purpose || draft.architecture.skills?.some(skill => skill.instructionsFile))) throw new Error("Founding architecture must match the chosen name and purpose and use inline or external skill instructions.");
  const manifest = nomeManifestSchema.parse({
    $schema: "https://relocke.io/nome.schema.json", format: "relocke-nome/1", id: input.id, title: draft.title,
    authority: { version: 1, maintainers: [identity] },
    discovery: { description: draft.purpose, keywords: [], language: "en", indexing: { allowSearchIndexing: true, allowAgentDiscovery: true, canonicalUrl: `https://relocke.io/nomes/${draft.slug}` } },
    mission: { objective: draft.purpose, successCriteria: [], constraints: [], failureConditions: [] },
    repository: { url: "https://github.com/relocke/nomes", branch: "main", directory: `nomes/${draft.slug}`, publication: "reviewed_direct" },
    files: ["README.md", "CONTEXT.md", ...(draft.architecture ? ["nome.skills.json"] : [])], build: { chain: null, contractName: "", entryPoint: "", defines: [] },
    supportedChains: [identity.chain], targets: [], defaultTarget: null, structure: [], arguments: [], sideEffects: [], criteria: [], antediluvian: null, recognition: { kind: "nome", assessment: null },
  });
  return [
    ...(draft.architecture ? [{ path: `nomes/${draft.slug}/nome.skills.json`, content: serializeNomeSkills(draft.architecture) }] : []),
    { path: `nomes/${draft.slug}/nome.json`, content: input.manifestFormat ? serializeNomeManifest(manifest) : JSON.stringify(manifest, null, 2) + "\n" },
    { path: `nomes/${draft.slug}/README.md`, content: `# ${draft.title.replace(/[\r\n]/g, " ")}\n\n${draft.purpose}\n` },
    { path: `nomes/${draft.slug}/CONTEXT.md`, content: `# Project context\n\n${draft.context}\n` },
  ];
}

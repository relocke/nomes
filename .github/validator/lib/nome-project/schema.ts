import { z } from "zod";
import { nomeIdentitySchema } from "../nomos/authority.ts";
import { nomeDocumentPathSchema } from "../nomos/manifest.ts";

export const slugSchema = z.string().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const commitSchema = z.string().regex(/^[a-f0-9]{40}$/);
export const digestSchema = z.string().regex(/^[a-f0-9]{64}$/);
export { nomeIdentitySchema as identitySchema } from "../nomos/authority.ts";
const identitySchema = nomeIdentitySchema;
export const editSchema = z.object({
  path: z.union([z.literal("nome.json"), nomeDocumentPathSchema]),
  content: z.string().max(120_000),
}).strict();
export const contributionSchema = z.object({
  kind: z.enum(["question", "answer", "argument", "evidence", "proposal", "objection"]),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(16000),
  aiAssisted: z.boolean(),
  references: z.array(z.string().url().max(1000).refine(value => value.startsWith("https://"))).max(20).default([]),
  reconsiders: digestSchema.optional(),
  edits: z.array(editSchema).max(12).default([]),
}).strict().refine(value => new TextEncoder().encode(JSON.stringify(value)).length <= 65000, "Contribution exceeds 65 KB. Split it into focused contributions.").refine(value => new Set(value.edits.map(edit => edit.path.toLowerCase())).size === value.edits.length, "Duplicate edit paths.");
export const publishInputSchema = z.object({
  nomeId: z.string().uuid(), base: commitSchema, identity: identitySchema, contribution: contributionSchema,
}).strict();
export const reviewInputSchema = z.object({
  id: digestSchema, head: commitSchema, identity: identitySchema,
  outcome: z.enum(["accepted", "antediluvian", "disputed"]),
  reason: z.string().trim().min(1).max(4000), reconsiderWhen: z.string().max(2000),
}).strict();
export const proofSchema = z.object({ challengeId: z.string().uuid(), signature: z.string().min(1).max(8000) }).strict();
export type Contribution = z.infer<typeof contributionSchema>;
export type AccountIdentity = z.infer<typeof identitySchema>;
export type PublishInput = z.infer<typeof publishInputSchema>;
export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type Source = { id: string; title: string; text: string; url: string; revision: string; status: string };
export class NomeError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) { super(message); this.name = "NomeError"; this.status = status; }
}

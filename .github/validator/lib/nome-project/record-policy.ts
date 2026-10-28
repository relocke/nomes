import { z } from "zod";
import { digest } from "./policy.ts";
import { publishInputSchema, reviewInputSchema, digestSchema, NomeError } from "./schema.ts";
const envelopeSchema = z.object({
  version: z.literal("nome-contribution/1"), purpose: z.enum(["publish", "review"]),
  slug: z.string(), origin: z.string().url(), nonce: z.string().uuid(), expires: z.string().datetime(),
  payload: z.union([publishInputSchema, reviewInputSchema]),
}).strict();
export const recordSchema = publishInputSchema.extend({
  proof: z.object({ envelope: envelopeSchema, digest: digestSchema, signature: z.string().max(8000), publicKey: z.string().min(1).max(512), verifiedAt: z.string().datetime() }).strict(),
}).strict();
export const decisionSchema = reviewInputSchema.extend({ proof: recordSchema.shape.proof.omit({ verifiedAt: true }) }).strict();
export type Envelope = z.infer<typeof envelopeSchema>;
export type RecordEntry = z.infer<typeof recordSchema>;
export function parseRecord(raw: unknown, slug: string, id: string): RecordEntry {
  const record = recordSchema.parse(raw);
  const input = publishInputSchema.parse({ nomeId: record.nomeId, base: record.base, identity: record.identity, contribution: record.contribution });
  const proof = record.proof;
  if (digest({ slug, input }) !== id || proof.envelope.purpose !== "publish" || proof.envelope.slug !== slug || digest(proof.envelope.payload) !== digest(input) || digest(proof.envelope) !== proof.digest) throw new NomeError("Published contribution does not match its signed identity and content.", 409);
  return record;
}
